package ph.allfix.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.core.env.Environment;
import ph.allfix.service.FirestoreService;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.UserRecord;

import java.util.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import jakarta.mail.internet.MimeMessage;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);

    private final FirestoreService firestoreService;
    private final Environment env;
    private final JavaMailSender mailSender;

    public AdminController(FirestoreService firestoreService, Environment env, JavaMailSender mailSender) {
        this.firestoreService = firestoreService;
        this.env = env;
        this.mailSender = mailSender;
    }

    @GetMapping("/vendors/pending")
    public ResponseEntity<?> getPendingVendors() throws Exception {
        // pending: temp_delete == 0 and acc_approve == "pending"
        var pending = firestoreService.getWhereMultiple("vendors", Map.of("temp_delete", 0, "acc_approve", "pending"));
        return ResponseEntity.ok(pending);
    }

    @PostMapping("/vendors/{vendorId}/reject")
    public ResponseEntity<?> rejectVendor(@PathVariable String vendorId) {
        try {
            // Set acc_approve = "rejected" and is_approved = false to mark rejected and prevent login
            firestoreService.updateField("vendors", vendorId, "acc_approve", "rejected");
            firestoreService.updateField("vendors", vendorId, "is_approved", false);
            return ResponseEntity.ok(Map.of("message", "Vendor rejected"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/vendors/{vendorId}/approve")
    public ResponseEntity<?> approveVendor(@PathVariable String vendorId) {
        try {
            // Set acc_approve = "approved" and ensure temp_delete = 0; set is_approved for backwards-compat
            firestoreService.updateField("vendors", vendorId, "acc_approve", "approved");
            firestoreService.updateField("vendors", vendorId, "temp_delete", 0);
            firestoreService.updateField("vendors", vendorId, "is_approved", true);
            return ResponseEntity.ok(Map.of("message", "Vendor approved"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() throws Exception {
        long totalCustomers = firestoreService.getAllActive("customers").size();
        long totalVendors = firestoreService.getWhereMultiple("vendors", Map.of("is_approved", true, "temp_delete", 0)).size();
        long totalBookings = firestoreService.getAll("bookings").size();
        long pendingPayments = firestoreService.getWhere("bookings", "payment_confirmed", false)
                .stream().filter(b -> b.get("payment_reference") != null).count();

        long pendingMainServices = 0;
        try {
            pendingMainServices = firestoreService.getWhereMultiple("main_service_requests", Map.of("status", "pending", "temp_delete", 0)).size();
        } catch (Exception e) {
            logger.warn("No pending main service requests collection: " + e.getMessage());
        }

        long pendingSubServices = 0;
        try {
            pendingSubServices = firestoreService.getWhereMultiple("sub_service_requests", Map.of("status", "pending", "temp_delete", 0)).size();
        } catch (Exception e) {
            logger.warn("No pending sub service requests collection: " + e.getMessage());
        }

        long pendingWorkTypes = 0;
        try {
            pendingWorkTypes = firestoreService.getWhereMultiple("work_type_requests", Map.of("status", "pending", "temp_delete", 0)).size();
        } catch (Exception e) {
            logger.warn("No pending work type requests collection: " + e.getMessage());
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCustomers", totalCustomers);
        stats.put("totalVendors", totalVendors);
        stats.put("totalBookings", totalBookings);
        stats.put("pendingPayments", pendingPayments);
        stats.put("pendingMainServices", pendingMainServices);
        stats.put("pendingSubServices", pendingSubServices);
        stats.put("pendingWorkTypes", pendingWorkTypes);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/revenue-trend")
    public ResponseEntity<List<Map<String, Object>>> getRevenueTrend() {
        // Returns empty array — populated once real bookings exist
        return ResponseEntity.ok(Collections.emptyList());
    }

    @GetMapping("/job-trend")
    public ResponseEntity<List<Map<String, Object>>> getJobTrend() {
        return ResponseEntity.ok(Collections.emptyList());
    }

    @PostMapping("/vendors/create")
    public ResponseEntity<?> createVendor(@RequestBody Map<String, Object> body) {
        logger.info("Received vendor creation request from admin with payload keys: {}", body.keySet());

        try {
            String adminId = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (adminId == null || adminId.isBlank()) {
                logger.warn("Unauthorized request: adminId is null or empty");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Unauthorized. Please log in again."));
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
            String companyName = (String) body.get("companyName");
            if (companyName == null) companyName = (String) body.get("company_name");
            String city = (String) body.get("city");
            List<?> services = (List<?>) body.get("services");

            // Validation
            if (firstName == null || firstName.isBlank() ||
                lastName == null || lastName.isBlank() ||
                username == null || username.isBlank() ||
                email == null || email.isBlank() ||
                phone == null || phone.isBlank() ||
                password == null || password.isBlank() ||
                confirmPassword == null || confirmPassword.isBlank() ||
                companyName == null || companyName.isBlank() ||
                city == null || city.isBlank() ||
                services == null || services.isEmpty()) {
                logger.warn("Validation failed: Some required fields are empty");
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "All fields are required."));
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

            // Check if email already exists in Firestore vendors collection
            try {
                if (!firestoreService.getWhere("vendors", "email", email).isEmpty()) {
                    logger.warn("Validation failed: Email '{}' already exists in vendors database", email);
                    return ResponseEntity.badRequest()
                        .body(Map.of("success", false, "message", "Email is already registered."));
                }
            } catch (Exception e) {
                logger.error("Error checking email uniqueness in Firestore vendors collection", e);
            }

            // 1. Get or create Firebase Auth user with emailVerified = true
            UserRecord firebaseUser = null;
            try {
                firebaseUser = FirebaseAuth.getInstance().getUserByEmail(email);
                if (!firebaseUser.isEmailVerified()) {
                    UserRecord.UpdateRequest updateReq = new UserRecord.UpdateRequest(firebaseUser.getUid())
                        .setEmailVerified(true);
                    firebaseUser = FirebaseAuth.getInstance().updateUser(updateReq);
                }
            } catch (com.google.firebase.auth.FirebaseAuthException e) {
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

            // Set role claims to "vendor"
            try {
                Map<String, Object> claims = new HashMap<>();
                claims.put("role", "vendor");
                FirebaseAuth.getInstance().setCustomUserClaims(uid, claims);
            } catch (Exception e) {
                logger.error("Failed to set custom role claims for vendor " + uid, e);
            }

            // 2. Save to Firestore vendors collection
            try {
                Map<String, Object> profile = new HashMap<>();
                profile.put("id", uid);
                profile.put("uid", uid);
                profile.put("username", username);
                profile.put("email", email);
                profile.put("phone", phone);
                profile.put("first_name", firstName);
                profile.put("last_name", lastName);
                profile.put("role", "vendor");
                profile.put("acc_approve", "approved");
                profile.put("is_approved", true);
                profile.put("acc_created", "admin");
                profile.put("temp_delete", 0);
                profile.put("requires_password_reset", true);
                profile.put("company_name", companyName);
                profile.put("city", city);
                profile.put("region", "National Capital Region");
                profile.put("contact_person", firstName + " " + lastName);
                profile.put("rating", 0);
                profile.put("total_jobs", 0);
                profile.put("completion_rate", 0);
                profile.put("earnings_month", 0);
                profile.put("earnings_total", 0);
                profile.put("available_slots", 0);
                profile.put("services", services);

                firestoreService.createWithId("vendors", uid, profile);
                logger.info("Successfully saved vendor profile to Firestore with UID: {}", uid);
            } catch (Exception e) {
                logger.error("Firestore document creation failed for vendor ID: " + uid, e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Firestore database save failed: " + e.getMessage()));
            }

            // 3. Send welcome email
            try {
                String appPassword = env.getProperty("spring.mail.password");
                if (appPassword == null || appPassword.isBlank() || "your-app-password".equalsIgnoreCase(appPassword.trim())) {
                    appPassword = env.getProperty("APP_PASSWORD");
                }
                if (appPassword == null || appPassword.isBlank() || "your-app-password".equalsIgnoreCase(appPassword.trim())) {
                    appPassword = System.getenv("APP_PASSWORD");
                }

                String fromEmail = env.getProperty("spring.mail.username");
                if (fromEmail == null || fromEmail.isBlank()) {
                    fromEmail = env.getProperty("EMAIL_USERNAME");
                }
                if (fromEmail == null || fromEmail.isBlank()) {
                    fromEmail = System.getenv("EMAIL_USERNAME");
                }
                if (fromEmail == null || fromEmail.isBlank()) {
                    fromEmail = "allfix.ph@gmail.com";
                }

                if (mailSender instanceof org.springframework.mail.javamail.JavaMailSenderImpl) {
                    org.springframework.mail.javamail.JavaMailSenderImpl impl = (org.springframework.mail.javamail.JavaMailSenderImpl) mailSender;
                    impl.setUsername(fromEmail);
                    impl.setPassword(appPassword);
                }

                String htmlBody = String.format(
                    "<h3>Welcome to AllFix!</h3>" +
                    "<p>An account has been created for you as vendor.</p>" +
                    "<p><strong>Username:</strong> %s</p>" +
                    "<p><strong>Email:</strong> %s</p>" +
                    "<p><strong>Temporary Password:</strong> %s</p>" +
                    "<br/>" +
                    "<p>Best regards,<br/>AllFix Team</p>",
                    username,
                    email,
                    password
                );

                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(fromEmail);
                helper.setTo(email);
                helper.setSubject("Welcome to AllFix - Your Vendor Account is Ready!");
                helper.setText(htmlBody, true);

                mailSender.send(message);
                logger.info("Successfully sent welcome email via SMTP to {}", email);
            } catch (Exception e) {
                logger.error("Welcome email transmission failed for email: " + email, e);
            }

            return ResponseEntity.ok(Map.of("success", true, "message", "Vendor account created successfully.", "id", uid));

        } catch (Exception e) {
            logger.error("Unexpected error in createVendor handler", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Internal server error: " + e.getMessage()));
        }
    }
}
