package ph.allfix.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.core.env.Environment;
import ph.allfix.service.FirestoreService;
import ph.allfix.service.EmailVerificationService;
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
    private final EmailVerificationService emailVerificationService;

    public AdminController(FirestoreService firestoreService, Environment env, JavaMailSender mailSender, EmailVerificationService emailVerificationService) {
        this.firestoreService = firestoreService;
        this.env = env;
        this.mailSender = mailSender;
        this.emailVerificationService = emailVerificationService;
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

            // Fetch vendor email and send email
            Map<String, Object> vendor = firestoreService.getById("vendors", vendorId);
            if (vendor != null) {
                String email = (String) vendor.get("email");
                if (email != null && !email.isBlank()) {
                    try {
                        emailVerificationService.sendVendorApprovedEmail(email);
                    } catch (Exception ex) {
                        logger.error("Failed to send vendor approved email to: " + email, ex);
                    }
                }
            }

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

        long pendingCancellations = 0;
        try {
            pendingCancellations = firestoreService.getWhere("bookings", "status", "cancellation_requested").size();
        } catch (Exception e) {
            logger.warn("No pending cancellations: " + e.getMessage());
        }

        long pendingBookings = 0;
        try {
            pendingBookings = firestoreService.getWhere("bookings", "status", "pending").size();
        } catch (Exception e) {
            logger.warn("No pending bookings: " + e.getMessage());
        }

        long pendingRefunds = 0;
        try {
            pendingRefunds = firestoreService.getWhere("refunds", "status", "pending").size();
        } catch (Exception e) {
            logger.warn("No pending refunds: " + e.getMessage());
        }

        long pendingVendors = 0;
        try {
            pendingVendors = firestoreService.getWhereMultiple("vendors", Map.of("temp_delete", 0, "acc_approve", "pending")).size();
        } catch (Exception e) {
            logger.warn("No pending vendors: " + e.getMessage());
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCustomers", totalCustomers);
        stats.put("totalVendors", totalVendors);
        stats.put("totalBookings", totalBookings);
        stats.put("pendingPayments", pendingPayments);
        stats.put("pendingMainServices", pendingMainServices);
        stats.put("pendingSubServices", pendingSubServices);
        stats.put("pendingWorkTypes", pendingWorkTypes);
        stats.put("pendingCancellations", pendingCancellations);
        stats.put("pendingBookings", pendingBookings);
        stats.put("pendingRefunds", pendingRefunds);
        stats.put("pendingVendors", pendingVendors);
        return ResponseEntity.ok(stats);
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

    @GetMapping("/revenue-trend")
    public ResponseEntity<List<Map<String, Object>>> getRevenueTrend() {
        System.out.println("AdminController.getRevenueTrend: fetching revenue trend");
        try {
            List<Map<String, Object>> bookings = firestoreService.getWhere("bookings", "status", "completed");
            Map<Date, Double> weeklyValues = new TreeMap<>();
            
            // Populate last 8 weeks (chronologically) with 0.0 to backfill
            Calendar cal = Calendar.getInstance();
            Date currentMonday = getMondayOfWeek(cal.getTime());
            for (int i = 0; i < 8; i++) {
                weeklyValues.put(currentMonday, 0.0);
                Calendar c = Calendar.getInstance();
                c.setTime(currentMonday);
                c.add(Calendar.WEEK_OF_YEAR, -1);
                currentMonday = c.getTime();
            }
            
            for (Map<String, Object> booking : bookings) {
                Date date = getBookingDate(booking, "completed_at");
                if (date == null) {
                    date = getBookingDate(booking, "created_at");
                }
                if (date == null) {
                    continue;
                }
                
                Date bMonday = getMondayOfWeek(date);
                double price = booking.get("price") != null ? ((Number) booking.get("price")).doubleValue() : 0.0;
                double quantity = booking.get("quantity") != null ? ((Number) booking.get("quantity")).doubleValue() : 1.0;
                double totalPayment = booking.get("total_price") != null ? ((Number) booking.get("total_price")).doubleValue() : (price * quantity);
                
                weeklyValues.put(bMonday, weeklyValues.getOrDefault(bMonday, 0.0) + totalPayment);
            }
            
            List<Map<String, Object>> trend = new ArrayList<>();
            java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("MMM dd");
            for (Map.Entry<Date, Double> entry : weeklyValues.entrySet()) {
                Map<String, Object> point = new HashMap<>();
                point.put("week", sdf.format(entry.getKey()));
                point.put("revenue", entry.getValue());
                trend.add(point);
            }
            
            System.out.println("AdminController.getRevenueTrend: returning " + trend.size() + " points");
            return ResponseEntity.ok(trend);
        } catch (Exception e) {
            System.err.println("Error in getRevenueTrend: " + e.getMessage());
            return ResponseEntity.status(500).body(Collections.emptyList());
        }
    }

    @GetMapping("/job-trend")
    public ResponseEntity<List<Map<String, Object>>> getJobTrend() {
        System.out.println("AdminController.getJobTrend: fetching bookings trend");
        try {
            List<Map<String, Object>> bookings = firestoreService.getAll("bookings");
            Map<Date, Double> weeklyValues = new TreeMap<>();
            
            // Populate last 8 weeks (chronologically) with 0.0 to backfill
            Calendar cal = Calendar.getInstance();
            Date currentMonday = getMondayOfWeek(cal.getTime());
            for (int i = 0; i < 8; i++) {
                weeklyValues.put(currentMonday, 0.0);
                Calendar c = Calendar.getInstance();
                c.setTime(currentMonday);
                c.add(Calendar.WEEK_OF_YEAR, -1);
                currentMonday = c.getTime();
            }
            
            for (Map<String, Object> booking : bookings) {
                Date date = getBookingDate(booking, "created_at");
                if (date == null) {
                    date = getBookingDate(booking, "completed_at");
                }
                if (date == null) {
                    continue;
                }
                
                Date bMonday = getMondayOfWeek(date);
                weeklyValues.put(bMonday, weeklyValues.getOrDefault(bMonday, 0.0) + 1.0);
            }
            
            List<Map<String, Object>> trend = new ArrayList<>();
            java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("MMM dd");
            for (Map.Entry<Date, Double> entry : weeklyValues.entrySet()) {
                Map<String, Object> point = new HashMap<>();
                point.put("week", sdf.format(entry.getKey()));
                point.put("bookings", entry.getValue());
                trend.add(point);
            }
            
            System.out.println("AdminController.getJobTrend: returning " + trend.size() + " points");
            return ResponseEntity.ok(trend);
        } catch (Exception e) {
            System.err.println("Error in getJobTrend: " + e.getMessage());
            return ResponseEntity.status(500).body(Collections.emptyList());
        }
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
            String accountName = (String) body.get("accountName");
            if (accountName == null) accountName = (String) body.get("account_name");
            String accountNumber = (String) body.get("accountNumber");
            if (accountNumber == null) accountNumber = (String) body.get("account_number");

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
                profile.put("account_name", accountName != null ? accountName : "");
                profile.put("account_number", accountNumber != null ? accountNumber : "");

                firestoreService.createWithId("vendors", uid, profile);
                logger.info("Successfully saved vendor profile to Firestore with UID: {}", uid);
            } catch (Exception e) {
                logger.error("Firestore document creation failed for vendor ID: " + uid, e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Firestore database save failed: " + e.getMessage()));
            }

            // 3. Send welcome email
            try {
                emailVerificationService.sendAdminCreatedVendorWelcomeEmail(username, email, password);
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

    @GetMapping("/settings/system-fee")
    public ResponseEntity<?> getSystemFee() {
        System.out.println("AdminController.getSystemFee: fetching system fee");
        try {
            Map<String, Object> setting = firestoreService.getById("settings", "system_fee");
            if (setting == null) {
                // If not exists, create a default
                Map<String, Object> defaultSetting = new HashMap<>();
                defaultSetting.put("percentage", 10.0);
                firestoreService.createWithId("settings", "system_fee", defaultSetting);
                System.out.println("AdminController.getSystemFee: created default system fee = 10.0%");
                return ResponseEntity.ok(defaultSetting);
            }
            System.out.println("AdminController.getSystemFee: returning system fee = " + setting.get("percentage") + "%");
            return ResponseEntity.ok(setting);
        } catch (Exception e) {
            System.err.println("Error in getSystemFee: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/settings/system-fee")
    public ResponseEntity<?> updateSystemFee(@RequestBody Map<String, Object> body) {
        Object pct = body.get("percentage");
        System.out.println("AdminController.updateSystemFee: updating to " + pct);
        try {
            double percentage = 10.0;
            if (pct instanceof Number) {
                percentage = ((Number) pct).doubleValue();
            } else if (pct instanceof String) {
                percentage = Double.parseDouble((String) pct);
            }
            
            Map<String, Object> data = new HashMap<>();
            data.put("percentage", percentage);
            firestoreService.createWithId("settings", "system_fee", data);
            System.out.println("AdminController.updateSystemFee: successfully set system fee to " + percentage + "%");
            return ResponseEntity.ok(Map.of("success", true, "percentage", percentage));
        } catch (Exception e) {
            System.err.println("Error in updateSystemFee: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/transactions")
    public ResponseEntity<?> getTransactions() {
        System.out.println("AdminController.getTransactions: fetching all completed transactions");
        try {
            // Get current fee percentage
            double currentPercentage = 10.0;
            try {
                Map<String, Object> setting = firestoreService.getById("settings", "system_fee");
                if (setting != null && setting.get("percentage") != null) {
                    currentPercentage = ((Number) setting.get("percentage")).doubleValue();
                }
            } catch (Exception e) {
                // Ignore
            }

            List<Map<String, Object>> bookings = firestoreService.getWhere("bookings", "status", "completed");
            List<Map<String, Object>> transactions = new ArrayList<>();

            for (Map<String, Object> booking : bookings) {
                double price = booking.get("price") != null ? ((Number) booking.get("price")).doubleValue() : 0.0;
                double quantity = booking.get("quantity") != null ? ((Number) booking.get("quantity")).doubleValue() : 1.0;
                double totalPayment = booking.get("total_price") != null ? ((Number) booking.get("total_price")).doubleValue() : (price * quantity);

                double pct = booking.get("system_fee_percentage") != null ? 
                    ((Number) booking.get("system_fee_percentage")).doubleValue() : currentPercentage;
                
                double systemFee = booking.get("system_fee") != null ? 
                    ((Number) booking.get("system_fee")).doubleValue() : (price * quantity * (pct / 100.0));
                
                double vendorEarnings = booking.get("vendor_earnings") != null ? 
                    ((Number) booking.get("vendor_earnings")).doubleValue() : (totalPayment - systemFee);

                Map<String, Object> tx = new HashMap<>(booking);
                tx.put("system_fee_percentage", pct);
                tx.put("system_fee", systemFee);
                tx.put("vendor_earnings", vendorEarnings);
                tx.put("total_payment", totalPayment);

                // Ensure we have completed_at
                if (booking.get("completed_at") == null) {
                    if (booking.get("created_at") != null) {
                        tx.put("completed_at", booking.get("created_at"));
                    } else {
                        tx.put("completed_at", new Date());
                    }
                }
                
                transactions.add(tx);
            }

            System.out.println("AdminController.getTransactions: found " + transactions.size() + " completed transactions");
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            System.err.println("Error in getTransactions: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/payouts")
    public ResponseEntity<?> getPayouts() {
        System.out.println("AdminController.getPayouts: fetching all payouts");
        try {
            List<Map<String, Object>> payouts = firestoreService.getAll("payouts");
            System.out.println("AdminController.getPayouts: found " + payouts.size() + " payouts");
            return ResponseEntity.ok(payouts);
        } catch (Exception e) {
            System.err.println("Error in getPayouts: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/payouts")
    public ResponseEntity<?> createPayout(@RequestBody Map<String, Object> body) {
        System.out.println("AdminController.createPayout: creating payout with data " + body);
        try {
            // Validate required fields
            if (body.get("vendor_id") == null || body.get("amount") == null || body.get("month") == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "vendor_id, amount, and month are required."));
            }

            // Standardize fields
            Map<String, Object> data = new HashMap<>(body);
            if (data.get("status") == null) {
                data.put("status", "Pending");
            }
            
            // Set payout_date to current if not provided
            if (data.get("payout_date") == null) {
                data.put("payout_date", new Date());
            }

            String id = firestoreService.create("payouts", data);
            System.out.println("AdminController.createPayout: created payout with ID " + id);

            // Synchronize with the linked booking if booking_id is provided
            if (body.get("booking_id") != null) {
                String bookingId = (String) body.get("booking_id");
                System.out.println("AdminController.createPayout: updating booking " + bookingId + " payout_status to Paid");
                firestoreService.updateField("bookings", bookingId, "payout_status", "Paid");
                if (data.get("payout_date") != null) {
                    firestoreService.updateField("bookings", bookingId, "payout_date", data.get("payout_date"));
                }
                if (body.get("check_number") != null) {
                    firestoreService.updateField("bookings", bookingId, "payout_reference", body.get("check_number"));
                }
                if (body.get("account_name") != null) {
                    firestoreService.updateField("bookings", bookingId, "payout_account_name", body.get("account_name"));
                }
                if (body.get("account_number") != null) {
                    firestoreService.updateField("bookings", bookingId, "payout_account_number", body.get("account_number"));
                }
                if (body.get("attachment") != null) {
                    firestoreService.updateField("bookings", bookingId, "payout_attachment", body.get("attachment"));
                }
            }

            return ResponseEntity.ok(Map.of("id", id, "message", "Payout recorded successfully."));
        } catch (Exception e) {
            System.err.println("Error in createPayout: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/payouts/{id}")
    public ResponseEntity<?> updatePayout(@PathVariable String id, @RequestBody Map<String, Object> body) {
        System.out.println("AdminController.updatePayout: updating payout " + id + " with data " + body);
        try {
            firestoreService.update("payouts", id, body);
            System.out.println("AdminController.updatePayout: payout " + id + " updated successfully");
            return ResponseEntity.ok(Map.of("message", "Payout updated successfully."));
        } catch (Exception e) {
            System.err.println("Error in updatePayout: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping("/payouts/{id}/status")
    public ResponseEntity<?> updatePayoutStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        System.out.println("AdminController.updatePayoutStatus: updating payout " + id + " status to " + status);
        try {
            if (status == null || status.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "status is required."));
            }
            firestoreService.updateField("payouts", id, "status", status);
            System.out.println("AdminController.updatePayoutStatus: payout " + id + " status updated successfully");
            return ResponseEntity.ok(Map.of("message", "Payout status updated successfully."));
        } catch (Exception e) {
            System.err.println("Error in updatePayoutStatus: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/payouts/{id}")
    public ResponseEntity<?> deletePayout(@PathVariable String id) {
        System.out.println("AdminController.deletePayout: deleting payout " + id);
        try {
            // Get payout to check for linked booking
            Map<String, Object> payout = firestoreService.getById("payouts", id);
            if (payout != null && payout.get("booking_id") != null) {
                String bookingId = (String) payout.get("booking_id");
                System.out.println("AdminController.deletePayout: resetting booking " + bookingId + " payout fields");
                firestoreService.updateField("bookings", bookingId, "payout_status", "Unpaid");
                firestoreService.updateField("bookings", bookingId, "payout_reference", "");
                firestoreService.updateField("bookings", bookingId, "payout_attachment", "");
            }

            firestoreService.delete("payouts", id);
            System.out.println("AdminController.deletePayout: payout " + id + " deleted");
            return ResponseEntity.ok(Map.of("message", "Payout deleted successfully."));
        } catch (Exception e) {
            System.err.println("Error in deletePayout: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        }
    }
}
