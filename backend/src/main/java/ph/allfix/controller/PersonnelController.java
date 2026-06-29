package ph.allfix.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.core.env.Environment;
import ph.allfix.service.FirestoreService;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.UserRecord;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import jakarta.mail.internet.MimeMessage;

@RestController
@RequestMapping("/api/personnel")
public class PersonnelController {

    private static final Logger logger = LoggerFactory.getLogger(PersonnelController.class);

    private final FirestoreService firestoreService;
    private final Environment env;
    private final JavaMailSender mailSender;
    private final ph.allfix.service.EmailVerificationService emailVerificationService;

    public PersonnelController(FirestoreService firestoreService, Environment env, JavaMailSender mailSender, ph.allfix.service.EmailVerificationService emailVerificationService) {
        this.firestoreService = firestoreService;
        this.env = env;
        this.mailSender = mailSender;
        this.emailVerificationService = emailVerificationService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAll(@RequestParam(required = false) String vendor_id) throws Exception {
        if (vendor_id != null) {
            return ResponseEntity.ok(firestoreService.getWhere("personnel", "vendor_id", vendor_id).stream().filter(p -> p.get("temp_delete") == null || ((Number) p.get("temp_delete")).intValue() != 1).collect(java.util.stream.Collectors.toList()));
        }
        return ResponseEntity.ok(firestoreService.getAll("personnel").stream().filter(p -> p.get("temp_delete") == null || ((Number) p.get("temp_delete")).intValue() != 1).collect(java.util.stream.Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) throws Exception {
        Map<String, Object> p = firestoreService.getById("personnel", id);
        return p != null ? ResponseEntity.ok(p) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) throws Exception {
        String id = firestoreService.create("personnel", body);
        return ResponseEntity.ok(Map.of("id", id, "message", "Personnel created"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody Map<String, Object> body) throws Exception {
        firestoreService.update("personnel", id, body);
        
        // If avatar_url was updated, sync to bookings
        if (body.containsKey("avatar_url")) {
            String avatarUrl = (String) body.get("avatar_url");
            try {
                List<Map<String, Object>> activeBookings = firestoreService.getWhere("bookings", "personnel_id", id);
                for (Map<String, Object> booking : activeBookings) {
                    String status = (String) booking.get("status");
                    if (status != null && !status.equals("completed") && !status.equals("cancelled") && !status.equals("archived")) {
                        firestoreService.updateField("bookings", (String) booking.get("id"), "personnel_avatar", avatarUrl);
                    }
                }
            } catch (Exception e) {
                logger.error("Failed to sync personnel avatar to bookings for personnel {}", id, e);
            }
        }

        return ResponseEntity.ok(Map.of("message", "Updated"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) throws Exception {
        firestoreService.softDelete("personnel", id);
        return ResponseEntity.ok(Map.of("message", "Soft deleted"));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable String id) {
        try {
            firestoreService.updateField("personnel", id, "acc_approve", "approved");
            firestoreService.updateField("personnel", id, "temp_delete", 0);
            return ResponseEntity.ok(Map.of("message", "Personnel approved"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable String id) {
        try {
            firestoreService.updateField("personnel", id, "acc_approve", "rejected");
            firestoreService.updateField("personnel", id, "temp_delete", 0);
            return ResponseEntity.ok(Map.of("message", "Personnel rejected"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/create-by-vendor")
    public ResponseEntity<?> createByVendor(@RequestBody Map<String, Object> body) {
        logger.info("Received personnel creation request with payload keys: {}", body.keySet());

        try {
            String vendorId = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (vendorId == null || vendorId.isBlank()) {
                logger.warn("Unauthorized request: vendorId is null or empty");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Unauthorized. Please log in again."));
            }

            Map<String, Object> vendorProfile = firestoreService.getById("vendors", vendorId);
            if (vendorProfile == null) {
                java.util.List<Map<String, Object>> list = firestoreService.getWhere("vendors", "auth_uid", vendorId);
                if (!list.isEmpty()) {
                    vendorProfile = list.get(0);
                    vendorId = (String) vendorProfile.get("id"); // update vendorId to the actual document ID
                }
            }

            if (vendorProfile == null) {
                logger.warn("Forbidden request: Vendor profile not found for ID {}", vendorId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "message", "Only registered vendors can perform this action."));
            }

            // Extract fields
            String firstName = (String) body.get("firstName");
            if (firstName == null) firstName = (String) body.get("first_name");
            String lastName = (String) body.get("lastName");
            if (lastName == null) lastName = (String) body.get("last_name");
            String username = (String) body.get("username");
            String email = (String) body.get("email");
            String phone = (String) body.get("phone");
            String password = (String) body.get("password");
            String confirmPassword = (String) body.get("confirmPassword");

            // Extract and normalize selected services list (supports single fields fallback)
            List<Map<String, Object>> selectedServices = new ArrayList<>();
            Object selectedServicesObj = body.get("services");
            if (selectedServicesObj instanceof List) {
                List<?> list = (List<?>) selectedServicesObj;
                for (Object item : list) {
                    if (item instanceof Map) {
                        Map<String, Object> m = new HashMap<>();
                        Map<?, ?> map = (Map<?, ?>) item;
                        m.put("service", map.get("service"));
                        m.put("sub_services", map.get("sub_services"));
                        selectedServices.add(m);
                    }
                }
            } else {
                String selectedService = (String) body.get("service");
                String selectedSubService = (String) body.get("subService");
                if (selectedSubService == null) selectedSubService = (String) body.get("sub_service");
                
                if (selectedService != null && !selectedService.isBlank()) {
                    Map<String, Object> m = new HashMap<>();
                    m.put("service", selectedService);
                    if (selectedSubService != null && !selectedSubService.isBlank()) {
                        m.put("sub_services", List.of(selectedSubService));
                    } else {
                        m.put("sub_services", Collections.emptyList());
                    }
                    selectedServices.add(m);
                }
            }

            // Validation
            if (firstName == null || firstName.isBlank() ||
                lastName == null || lastName.isBlank() ||
                username == null || username.isBlank() ||
                email == null || email.isBlank() ||
                phone == null || phone.isBlank() ||
                password == null || password.isBlank() ||
                confirmPassword == null || confirmPassword.isBlank() ||
                selectedServices.isEmpty()) {
                logger.warn("Validation failed: Some required fields are empty or no services selected");
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "All fields are required and at least one service must be selected."));
            }

            if (!email.matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$")) {
                logger.warn("Validation failed: Invalid email format '{}'", email);
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Invalid email format."));
            }

            if (!phone.matches("^\\d{11}$")) {
                logger.warn("Validation failed: Invalid phone format '{}'", phone);
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Phone number must be exactly 11 digits."));
            }

            if (!password.equals(confirmPassword)) {
                logger.warn("Validation failed: Passwords do not match");
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Passwords do not match."));
            }

            // Validate that all selected services and sub-services belong to the vendor's assigned services
            Object servicesObj = vendorProfile.get("services");
            boolean allServicesValid = true;

            for (Map<String, Object> selSvc : selectedServices) {
                String selSvcName = (String) selSvc.get("service");
                List<?> selSubs = (List<?>) selSvc.get("sub_services");
                
                boolean singleSvcValid = false;
                if (servicesObj instanceof List) {
                    List<?> servicesList = (List<?>) servicesObj;
                    for (Object sObj : servicesList) {
                        if (sObj instanceof Map) {
                            Map<?, ?> sMap = (Map<?, ?>) sObj;
                            Object serviceName = sMap.get("service");
                            if (serviceName instanceof String && ((String) serviceName).equalsIgnoreCase(selSvcName)) {
                                Object subServicesObj = sMap.get("sub_services");
                                if (subServicesObj instanceof List) {
                                    List<?> subServicesList = (List<?>) subServicesObj;
                                    if (selSubs == null || selSubs.isEmpty()) {
                                        if (subServicesList.isEmpty()) {
                                            singleSvcValid = true;
                                        }
                                    } else {
                                        boolean allSubsValid = true;
                                        for (Object selSub : selSubs) {
                                            boolean subMatch = false;
                                            for (Object vendorSub : subServicesList) {
                                                if (selSub instanceof String && vendorSub instanceof String &&
                                                    ((String) selSub).equalsIgnoreCase((String) vendorSub)) {
                                                    subMatch = true;
                                                    break;
                                                }
                                            }
                                            if (!subMatch) {
                                                allSubsValid = false;
                                                break;
                                            }
                                        }
                                        if (allSubsValid) {
                                            singleSvcValid = true;
                                        }
                                    }
                                } else {
                                    if (selSubs == null || selSubs.isEmpty()) {
                                        singleSvcValid = true;
                                    }
                                }
                                break;
                            }
                        }
                    }
                }
                if (!singleSvcValid) {
                    allServicesValid = false;
                    break;
                }
            }

            if (!allServicesValid) {
                logger.warn("Validation failed: Some selected services or sub-services do not belong to the vendor's profile");
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Some selected services/sub-services do not belong to your vendor profile."));
            }

            // Check if username is already taken in the system
            for (String collection : List.of("customers", "vendors", "admins", "personnel")) {
                try {
                    if (!firestoreService.getWhere(collection, "username", username).isEmpty()) {
                        logger.warn("Validation failed: Username '{}' already taken in collection '{}'", username, collection);
                        return ResponseEntity.badRequest()
                            .body(Map.of("success", false, "message", "Username is already taken."));
                    }
                } catch (Exception e) {
                    logger.error("Error checking username uniqueness in collection " + collection, e);
                }
            }

            // Check if email already exists in Firestore personnel collection (No Firebase Auth lookup!)
            try {
                if (!firestoreService.getWhere("personnel", "email", email).isEmpty()) {
                    logger.warn("Validation failed: Email '{}' already exists in personnel database", email);
                    return ResponseEntity.badRequest()
                        .body(Map.of("success", false, "message", "Email is already registered."));
                }
            } catch (Exception e) {
                logger.error("Error checking email uniqueness in Firestore personnel collection", e);
            }

            // 1. Get or create Firebase Auth user with emailVerified = true
            UserRecord firebaseUser = null;
            try {
                firebaseUser = FirebaseAuth.getInstance().getUserByEmail(email);
                // If user exists, ensure they are emailVerified in Firebase Auth
                if (!firebaseUser.isEmailVerified()) {
                    UserRecord.UpdateRequest updateReq = new UserRecord.UpdateRequest(firebaseUser.getUid())
                        .setEmailVerified(true);
                    firebaseUser = FirebaseAuth.getInstance().updateUser(updateReq);
                }
            } catch (com.google.firebase.auth.FirebaseAuthException e) {
                // user doesn't exist, so create new one as emailVerified=true
                try {
                    UserRecord.CreateRequest createReq = new UserRecord.CreateRequest()
                        .setEmail(email)
                        .setPassword(password)
                        .setDisplayName(firstName + " " + lastName)
                        .setEmailVerified(true);
                    firebaseUser = FirebaseAuth.getInstance().createUser(createReq);
                } catch (Exception ex) {
                    logger.error("Failed to create Firebase Auth user for email: " + email, ex);
                    return ResponseEntity.badRequest()
                        .body(Map.of("success", false, "message", "Failed to create authentication account: " + ex.getMessage()));
                }
            }

            if (firebaseUser == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Failed to initialize authentication account."));
            }

            String uid = firebaseUser.getUid();

            // Set role claims to "personnel"
            try {
                Map<String, Object> claims = new HashMap<>();
                claims.put("role", "personnel");
                FirebaseAuth.getInstance().setCustomUserClaims(uid, claims);
            } catch (Exception e) {
                logger.error("Failed to set custom role claims for personnel " + uid, e);
            }

            // 2. Save to Firestore personnel collection (No password, email_verified, verification_token, or verification_token_expiry in DB)
            try {
                Map<String, Object> profile = new HashMap<>();
                profile.put("id", uid);
                profile.put("uid", uid);
                profile.put("username", username);
                profile.put("email", email);
                profile.put("phone", phone);
                profile.put("first_name", firstName);
                profile.put("last_name", lastName);
                profile.put("role", "personnel");
                profile.put("vendor_id", vendorId);
                profile.put("acc_approve", "approved");
                profile.put("acc_created", "vendor");
                profile.put("temp_delete", 0);
                profile.put("requires_password_reset", true);

                profile.put("services", selectedServices);

                firestoreService.createWithId("personnel", uid, profile);
                logger.info("Successfully saved personnel profile to Firestore with UID: {}", uid);
            } catch (Exception e) {
                logger.error("Firestore document creation failed for personnel ID: " + uid, e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Firestore database save failed: " + e.getMessage()));
            }

            // 3. Send standard welcome email via SMTP using EmailVerificationService
            try {
                String companyName = (String) vendorProfile.get("company_name");
                if (companyName == null || companyName.isBlank()) {
                    companyName = (String) vendorProfile.get("name");
                }
                if (companyName == null || companyName.isBlank()) {
                    String vFirstName = (String) vendorProfile.get("first_name");
                    String vLastName = (String) vendorProfile.get("last_name");
                    if (vFirstName != null && vLastName != null) {
                        companyName = vFirstName + " " + vLastName;
                    } else {
                        companyName = "Your Employer";
                    }
                }

                emailVerificationService.sendPersonnelWelcomeEmail(email, username, password, companyName);
                logger.info("Successfully sent welcome email to {}", email);
            } catch (Exception e) {
                // Log SMTP error properly with stack trace but DO NOT stop personnel creation
                logger.error("Welcome email transmission failed for email: " + email, e);
            }

            return ResponseEntity.ok(Map.of("success", true, "message", "Personnel account created successfully.", "id", uid));

        } catch (Exception e) {
            logger.error("Unexpected error in createByVendor handler", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Internal server error: " + e.getMessage()));
        }
    }

    private Date getBookingDate(Map<String, Object> booking, String fieldName) {
        Object val = booking.get(fieldName);
        if (val == null) {
            return null;
        }
        if (val instanceof Date) {
            return (Date) val;
        }
        if (val.getClass().getName().contains("Timestamp")) {
            try {
                java.lang.reflect.Method method = val.getClass().getMethod("toDate");
                return (Date) method.invoke(val);
            } catch (Exception e) {
                // Ignore
            }
        }
        if (val instanceof Map) {
            Map<?, ?> map = (Map<?, ?>) val;
            if (map.containsKey("seconds")) {
                long seconds = ((Number) map.get("seconds")).longValue();
                return new Date(seconds * 1000L);
            }
        }
        if (val instanceof Long || val instanceof Integer) {
            long ms = ((Number) val).longValue();
            if (ms < 100000000000L) {
                return new Date(ms * 1000L);
            } else {
                return new Date(ms);
            }
        }
        if (val instanceof String) {
            try {
                return Date.from(java.time.Instant.parse((String) val));
            } catch (Exception e) {
                // Ignore
            }
        }
        return null;
    }

    private Date getMondayOfWeek(Date date) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(date);
        cal.set(Calendar.HOUR_OF_DAY, 0);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        cal.set(Calendar.DAY_OF_WEEK, Calendar.MONDAY);
        if (cal.getTime().after(date)) {
            cal.add(Calendar.WEEK_OF_YEAR, -1);
        }
        return cal.getTime();
    }

    @GetMapping("/{id}/dashboard-stats")
    public ResponseEntity<?> getDashboardStats(@PathVariable String id) {
        System.out.println("PersonnelController.getDashboardStats: fetching stats for personnel " + id);
        try {
            List<Map<String, Object>> bookings = firestoreService.getWhere("bookings", "personnel_id", id);
            
            Map<Date, Integer> weeklyTotal = new TreeMap<>();
            Map<Date, Integer> weeklyCompleted = new TreeMap<>();
            
            // Populate last 8 weeks with 0
            Calendar cal = Calendar.getInstance();
            Date currentMonday = getMondayOfWeek(cal.getTime());
            for (int i = 0; i < 8; i++) {
                weeklyTotal.put(currentMonday, 0);
                weeklyCompleted.put(currentMonday, 0);
                
                Calendar c = Calendar.getInstance();
                c.setTime(currentMonday);
                c.add(Calendar.WEEK_OF_YEAR, -1);
                currentMonday = c.getTime();
            }
            
            for (Map<String, Object> booking : bookings) {
                String status = (String) booking.get("status");
                if (status == null) continue;
                status = status.trim().toLowerCase();
                
                Date completedDate = getBookingDate(booking, "completed_at");
                Date createdDate = getBookingDate(booking, "created_at");
                Date bDate = (completedDate != null) ? completedDate : createdDate;
                if (bDate == null) continue;
                
                Date bMonday = getMondayOfWeek(bDate);
                
                weeklyTotal.put(bMonday, weeklyTotal.getOrDefault(bMonday, 0) + 1);
                if (status.equals("completed")) {
                    weeklyCompleted.put(bMonday, weeklyCompleted.getOrDefault(bMonday, 0) + 1);
                }
            }
            
            List<Map<String, Object>> totalJobsTrend = new ArrayList<>();
            List<Map<String, Object>> completedJobsTrend = new ArrayList<>();
            java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("MMM dd");
            
            for (Map.Entry<Date, Integer> entry : weeklyTotal.entrySet()) {
                Map<String, Object> point = new HashMap<>();
                point.put("week", sdf.format(entry.getKey()));
                point.put("jobs", entry.getValue());
                totalJobsTrend.add(point);
            }
            
            for (Map.Entry<Date, Integer> entry : weeklyCompleted.entrySet()) {
                Map<String, Object> point = new HashMap<>();
                point.put("week", sdf.format(entry.getKey()));
                point.put("completed", entry.getValue());
                completedJobsTrend.add(point);
            }
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalJobsTrend", totalJobsTrend);
            stats.put("completedJobsTrend", completedJobsTrend);
            
            System.out.println("PersonnelController.getDashboardStats: successfully calculated stats for personnel " + id);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            System.err.println("Error in getDashboardStats: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        }
    }
}
