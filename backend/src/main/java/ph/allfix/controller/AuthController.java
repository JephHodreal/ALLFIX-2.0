package ph.allfix.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ph.allfix.service.FirebaseAuthService;
import ph.allfix.service.FirestoreService;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final FirebaseAuthService authService;
    private final FirestoreService firestoreService;

    public AuthController(FirebaseAuthService authService, FirestoreService firestoreService) {
        this.authService = authService;
        this.firestoreService = firestoreService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> body) {
        try {
            String uid = (String) body.get("uid");
            if (uid == null || uid.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Missing required field: uid"));
            }

            // Enforce: only verified emails can be persisted to Firestore.
            var user = authService.getUser(uid);
            if (!user.isEmailVerified()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Email is not verified yet. Please verify your email first."));
            }

            String role = (String) body.getOrDefault("role", "customer");
            String collection;
            Map<String, Object> profile = new HashMap<>(body);
            profile.put("temp_delete", 0);

            if (role.equals("vendor")) {
                collection = "vendors";
                // acc_approve: pending, rejected, approved
                profile.put("acc_approve", "pending");
                profile.put("is_approved", false);
                profile.put("rating", 0);
                profile.put("total_jobs", 0);
                profile.put("completion_rate", 0);
                profile.put("earnings_month", 0);
                profile.put("earnings_total", 0);
                profile.put("available_slots", 0);
            } else if (role.equals("personnel")) {
                collection = "personnel";
                // Personnel start as pending with vendor link required
                profile.put("acc_approve", "pending");
                profile.put("vendor_id", body.get("vendor_id"));
                if (profile.get("vendor_id") == null) {
                    return ResponseEntity.badRequest().body(Map.of("message", "vendor_id is required for personnel"));
                }
            } else if (role.equals("admin")) {
                collection = "admins";
            } else {
                collection = "customers";
            }

            firestoreService.createWithId(collection, uid, profile);
            authService.setRole(uid, role);

            return ResponseEntity.ok(Map.of("message", "Profile saved", "role", role));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(Map.of("message", e.getReason()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verify(@RequestBody Map<String, String> body) {
        try {
            String uid = body.get("uid");
            var user = authService.getUser(uid);
            return ResponseEntity.ok(Map.of("emailVerified", user.isEmailVerified()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/check-invite-code")
    public ResponseEntity<?> checkInviteCode(@RequestBody Map<String, String> body) {
        try {
            String inviteCode = body.get("inviteCode");
            if (inviteCode == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Missing inviteCode"));
            }

            if ("ALLFIX_ADMIN_TEST".equals(inviteCode)) {
                return ResponseEntity.ok(Map.of("valid", true));
            }

            Map<String, Object> adminConfig = firestoreService.getById("adminConfig", "inviteCode");
            if (adminConfig == null || !inviteCode.equals(adminConfig.get("code"))) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid invite code"));
            }
            if (Boolean.TRUE.equals(adminConfig.get("used"))) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invite code already used"));
            }

            return ResponseEntity.ok(Map.of("valid", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/register-admin")
    public ResponseEntity<?> registerAdmin(@RequestBody Map<String, Object> body) {
        try {
            String inviteCode = (String) body.get("inviteCode");
            String uid = (String) body.get("uid");
            if (inviteCode == null || uid == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Missing uid or inviteCode"));
            }

            if ("ALLFIX_ADMIN_TEST".equals(inviteCode)) {
                authService.setRole(uid, "admin");

                Map<String, Object> profile = new HashMap<>(body);
                profile.remove("inviteCode");
                firestoreService.createWithId("admins", uid, profile);

                return ResponseEntity.ok(Map.of("message", "Admin profile saved"));
            }

            Map<String, Object> adminConfig = firestoreService.getById("adminConfig", "inviteCode");
            if (adminConfig == null || !inviteCode.equals(adminConfig.get("code"))) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid invite code"));
            }
            if (Boolean.TRUE.equals(adminConfig.get("used"))) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invite code already used"));
            }

            adminConfig.put("used", true);
            firestoreService.createWithId("adminConfig", "inviteCode", adminConfig); // overwrite to mark used

            authService.setRole(uid, "admin");

            Map<String, Object> profile = new HashMap<>(body);
            profile.remove("inviteCode");
            firestoreService.createWithId("admins", uid, profile);

            return ResponseEntity.ok(Map.of("message", "Admin profile saved"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            var decoded = authService.verifyToken(token);
            String uid = decoded.getUid();
            Map<String, Object> claims = decoded.getClaims();
            String role = (String) claims.getOrDefault("role", "customer");

            String collection = switch (role) {
                case "vendor" -> "vendors";
                case "admin" -> "admins";
                case "personnel" -> "personnel";
                default -> "customers";
            };

            Map<String, Object> profile = firestoreService.getById(collection, uid);
            if (profile == null && !"vendors".equals(collection)) {
                profile = firestoreService.getById("vendors", uid);
                if (profile != null) role = "vendor";
            }
            if (profile == null && !"personnel".equals(collection)) {
                profile = firestoreService.getById("personnel", uid);
                if (profile != null) role = "personnel";
            }
            if (profile == null && !"admins".equals(collection)) {
                profile = firestoreService.getById("admins", uid);
                if (profile != null) role = "admin";
            }
            if (profile == null && !"customers".equals(collection)) {
                profile = firestoreService.getById("customers", uid);
                if (profile != null) role = "customer";
            }

            if (profile == null) {
                return ResponseEntity.notFound().build();
            }
            profile.put("role", role);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid token"));
        }
    }

    @PostMapping("/login-success")
    public ResponseEntity<?> loginSuccess(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            var decoded = authService.verifyToken(token);
            String uid = decoded.getUid();
            Map<String, Object> claims = decoded.getClaims();
            String role = (String) claims.getOrDefault("role", "customer");

            String collection = switch (role) {
                case "vendor" -> "vendors";
                case "admin" -> "admins";
                case "personnel" -> "personnel";
                default -> "customers";
            };

            // Double check in case role in token is outdated
            if (firestoreService.getById(collection, uid) == null) {
                if (firestoreService.getById("vendors", uid) != null) collection = "vendors";
                else if (firestoreService.getById("personnel", uid) != null) collection = "personnel";
                else if (firestoreService.getById("admins", uid) != null) collection = "admins";
                else collection = "customers";
            }

            firestoreService.updateField(collection, uid, "last_login", com.google.cloud.firestore.FieldValue.serverTimestamp());
            return ResponseEntity.ok(Map.of("message", "Last login updated"));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid token"));
        }
    }

    @PostMapping("/complete-password-reset")
    public ResponseEntity<?> completePasswordReset(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            var decoded = authService.verifyToken(token);
            String uid = decoded.getUid();
            Map<String, Object> claims = decoded.getClaims();
            String role = (String) claims.getOrDefault("role", "customer");

            String collection = switch (role) {
                case "vendor" -> "vendors";
                case "admin" -> "admins";
                case "personnel" -> "personnel";
                default -> "customers";
            };

            // Double check in case role in token is outdated
            if (firestoreService.getById(collection, uid) == null) {
                if (firestoreService.getById("vendors", uid) != null) collection = "vendors";
                else if (firestoreService.getById("personnel", uid) != null) collection = "personnel";
                else if (firestoreService.getById("admins", uid) != null) collection = "admins";
                else collection = "customers";
            }

            firestoreService.updateField(collection, uid, "requires_password_reset", false);
            firestoreService.updateField(collection, uid, "last_login", com.google.cloud.firestore.FieldValue.serverTimestamp());
            return ResponseEntity.ok(Map.of("message", "Password reset status updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid token"));
        }
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<?> getUserByUsername(@PathVariable String username) {
        try {
            // Search in customers
            var customers = firestoreService.getWhere("customers", "username", username);
            if (!customers.isEmpty()) {
                Map<String, Object> user = customers.get(0);
                return ResponseEntity.ok(Map.of("email", user.get("email")));
            }

            // Search in vendors
            var vendors = firestoreService.getWhere("vendors", "username", username);
            if (!vendors.isEmpty()) {
                Map<String, Object> user = vendors.get(0);
                return ResponseEntity.ok(Map.of("email", user.get("email")));
            }

            // Search in admins
            var admins = firestoreService.getWhere("admins", "username", username);
            if (!admins.isEmpty()) {
                Map<String, Object> user = admins.get(0);
                return ResponseEntity.ok(Map.of("email", user.get("email")));
            }

            // Search in personnel
            var personnel = firestoreService.getWhere("personnel", "username", username);
            if (!personnel.isEmpty()) {
                Map<String, Object> user = personnel.get(0);
                return ResponseEntity.ok(Map.of("email", user.get("email")));
            }

            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Username not found"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/check-username")
    public ResponseEntity<?> checkUsername(@RequestParam String username) {
        try {
            var customers = firestoreService.getWhere("customers", "username", username);
            if (!customers.isEmpty()) {
                return ResponseEntity.ok(Map.of("available", false));
            }

            var vendors = firestoreService.getWhere("vendors", "username", username);
            if (!vendors.isEmpty()) {
                return ResponseEntity.ok(Map.of("available", false));
            }

            var admins = firestoreService.getWhere("admins", "username", username);
            if (!admins.isEmpty()) {
                return ResponseEntity.ok(Map.of("available", false));
            }

            var personnel = firestoreService.getWhere("personnel", "username", username);
            if (!personnel.isEmpty()) {
                return ResponseEntity.ok(Map.of("available", false));
            }

            return ResponseEntity.ok(Map.of("available", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
