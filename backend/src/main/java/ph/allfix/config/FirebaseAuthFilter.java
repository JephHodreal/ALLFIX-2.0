package ph.allfix.config;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import ph.allfix.service.FirestoreService;

import java.io.IOException;
import java.util.Collections;
import java.util.Map;

@Component
public class FirebaseAuthFilter extends OncePerRequestFilter {

    private final FirestoreService firestoreService;

    public FirebaseAuthFilter(FirestoreService firestoreService) {
        this.firestoreService = firestoreService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);
                String uid = decodedToken.getUid();

                // Determine role from custom claims (default to customer)
                Map<String, Object> claims = decodedToken.getClaims();
                String role = (String) claims.getOrDefault("role", "customer");

                // Map role to collection name
                String collection = switch (role) {
                    case "vendor" -> "vendors";
                    case "admin" -> "admins";
                    case "personnel" -> "personnel";
                    default -> "customers";
                };

                boolean allow = true;
                try {
                    String firestoreId = (String) claims.get("firestore_id");
                    String targetId = (firestoreId != null) ? firestoreId : uid;
                    Map<String, Object> profile = firestoreService.getById(collection, targetId);

                    if (profile == null && targetId.equals(uid) && !"customers".equals(collection)) {
                        java.util.List<Map<String, Object>> list = firestoreService.getWhere(collection, "auth_uid", uid);
                        if (!list.isEmpty()) {
                            profile = list.get(0);
                        }
                    }

                    // Fallback: check all other collections in case custom claims are out of sync
                    if (profile == null) {
                        String[] collections = {"admins", "vendors", "personnel", "customers"};
                        for (String col : collections) {
                            if (col.equals(collection)) continue;
                            if (col.equals("customers")) {
                                profile = firestoreService.getById(col, uid);
                            } else {
                                if (firestoreId != null) {
                                    profile = firestoreService.getById(col, firestoreId);
                                }
                                if (profile == null) {
                                    java.util.List<Map<String, Object>> list = firestoreService.getWhere(col, "auth_uid", uid);
                                    if (!list.isEmpty()) {
                                        profile = list.get(0);
                                    }
                                }
                            }
                            if (profile != null) {
                                break;
                            }
                        }
                    }

                    if (profile == null) {
                        allow = false;
                    } else {
                        // Block if soft-deleted
                        Object tempDelete = profile.get("temp_delete");
                        if (tempDelete instanceof Number && ((Number) tempDelete).intValue() == 1) {
                            allow = false;
                        }

                        // Block if acc_approve indicates rejected ("rejected" or 1)
                        Object accApprove = profile.get("acc_approve");
                        if ("rejected".equals(accApprove) || (accApprove instanceof Number && ((Number) accApprove).intValue() == 1)) {
                            allow = false;
                        }

                        // Backwards-compat: block if `is_approved` exists and is false
                        Object isApproved = profile.get("is_approved");
                        if (isApproved instanceof Boolean && !((Boolean) isApproved)) {
                            allow = false;
                        }
                    }
                } catch (Exception e) {
                    logger.debug("Error checking profile for auth guard: " + e.getMessage());
                    allow = false;
                }

                if (allow) {
                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(uid, decodedToken, Collections.emptyList());
                    SecurityContextHolder.getContext().setAuthentication(auth);
                } else {
                    logger.debug("Authentication blocked by account guard for uid=" + uid);
                }
            } catch (Exception e) {
                // Invalid token — continue without auth (will be blocked by security rules)
                logger.debug("Invalid Firebase token: " + e.getMessage());
            }
        }
        chain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        if (path.startsWith("/uploads/")) return true;
        return path.equals("/api/auth/register") || path.equals("/api/auth/verify") || path.equals("/api/auth/me") || path.equals("/api/health") || path.equals("/api/auth/send-verification") || path.equals("/api/support/contact") || path.equals("/api/upload/image") || path.equals("/api/partner-logos") || path.equals("/api/auth/send-otp") || path.equals("/api/auth/verify-otp") || path.equals("/api/bookings/debug-data");
    }
}
