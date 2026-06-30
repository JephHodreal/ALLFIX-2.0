package ph.allfix.controller;

import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.FieldValue;
import com.google.cloud.firestore.Firestore;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ph.allfix.service.FirestoreService;

import ph.allfix.service.NotificationService;

import java.util.*;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final FirestoreService firestoreService;
    private final NotificationService notificationService;

    public MessageController(FirestoreService firestoreService, NotificationService notificationService) {
        this.firestoreService = firestoreService;
        this.notificationService = notificationService;
    }

    @PostMapping
    public ResponseEntity<?> sendMessage(@RequestBody Map<String, Object> body) {
        try {
            String threadId = (String) body.get("thread_id");
            String senderRole = (String) body.get("sender_role");
            String senderId = (String) body.get("sender_id");
            String text = (String) body.get("text");
            Boolean isLogistics = (Boolean) body.get("is_logistics");
            String senderAvatar = (String) body.get("sender_avatar");
            if (isLogistics == null) isLogistics = false;

            if (threadId == null || text == null || senderId == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Missing required fields"));
            }

            Firestore db = firestoreService.firestore();

            // Enforce API-level validation for Customer-Tech/Logistics route
            if (!threadId.startsWith("hq_") && isLogistics) {
                Map<String, Object> booking = firestoreService.getById("bookings", threadId);
                if (booking != null) {
                    String status = (String) booking.get("status");
                    if (status == null || (!status.equalsIgnoreCase("assigned") && !status.equalsIgnoreCase("in_progress") && !status.equalsIgnoreCase("dispatched") && !status.equalsIgnoreCase("in-transit"))) {
                        return ResponseEntity.status(403).body(Map.of("message", "Booking is not in active dispatch. Messaging technician is locked."));
                    }
                }
            }

            // HQ Thread auto-creation
            if (threadId.startsWith("hq_")) {
                String rest = threadId.substring(3);
                String technicianId = null;
                String vendorId = null;
                
                int firstUnderscore = rest.indexOf('_');
                if (firstUnderscore != -1) {
                    technicianId = rest.substring(0, firstUnderscore);
                    vendorId = rest.substring(firstUnderscore + 1);
                    
                    // Fallback for legacy ID formats like PER_123
                    if (technicianId.equals("PER") || technicianId.equals("TECH") || technicianId.equals("VEN") || technicianId.equals("CL")) {
                        int secondUnderscore = rest.indexOf('_', firstUnderscore + 1);
                        if (secondUnderscore != -1) {
                            technicianId = rest.substring(0, secondUnderscore);
                            vendorId = rest.substring(secondUnderscore + 1);
                        }
                    }
                }

                if (technicianId != null && vendorId != null) {
                    Map<String, Object> hqThread = new HashMap<>();
                    hqThread.put("id", threadId);
                    hqThread.put("vendor_id", vendorId);
                    hqThread.put("technician_id", technicianId);
                    
                    // Fetch personnel name
                    Map<String, Object> tech = firestoreService.getById("personnel", technicianId);
                    if (tech != null) {
                        hqThread.put("personnel_name", tech.get("first_name") + " " + tech.get("last_name"));
                    }

                    hqThread.put("status", "active");
                    hqThread.put("updated_at", FieldValue.serverTimestamp());
                    db.collection("chat_threads").document(threadId).set(hqThread, com.google.cloud.firestore.SetOptions.merge()).get();
                }
            }

            Map<String, Object> msgData = new HashMap<>();
            msgData.put("sender_id", senderId);
            msgData.put("sender_role", senderRole);
            msgData.put("text", text.trim());
            msgData.put("created_at", FieldValue.serverTimestamp());
            msgData.put("is_logistics", isLogistics);

            if (senderAvatar != null && !senderAvatar.trim().isEmpty()) {
                msgData.put("sender_avatar", senderAvatar);
            } else {
                String collectionName = "";
                if ("customer".equalsIgnoreCase(senderRole)) collectionName = "customers";
                else if ("vendor".equalsIgnoreCase(senderRole)) collectionName = "vendors";
                else if ("technician".equalsIgnoreCase(senderRole)) collectionName = "personnel";

                if (!collectionName.isEmpty()) {
                    Map<String, Object> senderUser = firestoreService.getById(collectionName, senderId);
                    if (senderUser != null && senderUser.get("avatar_url") != null) {
                        msgData.put("sender_avatar", senderUser.get("avatar_url"));
                    }
                }
            }

            DocumentReference msgRef = db.collection("chat_threads").document(threadId).collection("messages").document();
            msgData.put("id", msgRef.getId());
            msgRef.set(msgData).get();

            // Update thread's updated_at (using merge to avoid NOT_FOUND if document was somehow not created)
            db.collection("chat_threads").document(threadId)
                .set(Map.of("updated_at", FieldValue.serverTimestamp()), com.google.cloud.firestore.SetOptions.merge()).get();

            // --- Notifications ---
            try {
                // Proceed with notifications regardless of chat_threads document existence
                String customerId = null;
                String vendorId = null;
                String technicianId = null;

                if (threadId.startsWith("hq_")) {
                    String rest = threadId.substring(3);
                    int firstUnderscore = rest.indexOf('_');
                    if (firstUnderscore != -1) {
                        technicianId = rest.substring(0, firstUnderscore);
                        vendorId = rest.substring(firstUnderscore + 1);
                        
                        // Fallback for legacy ID formats
                        if (technicianId.equals("PER") || technicianId.equals("TECH") || technicianId.equals("VEN") || technicianId.equals("CL")) {
                            int secondUnderscore = rest.indexOf('_', firstUnderscore + 1);
                            if (secondUnderscore != -1) {
                                technicianId = rest.substring(0, secondUnderscore);
                                vendorId = rest.substring(secondUnderscore + 1);
                            }
                        }
                    }
                } else {
                    // Customer thread (threadId is bookingId)
                    Map<String, Object> booking = firestoreService.getById("bookings", threadId);
                    if (booking != null) {
                        customerId = (String) booking.get("customer_id"); // CUS-xxx
                        vendorId = (String) booking.get("vendor_id");     // VEN-xxx
                        technicianId = (String) booking.get("personnel_id"); // PER-xxx (if assigned)
                    }
                }

                String senderName = "User";
                if ("customer".equalsIgnoreCase(senderRole)) {
                    Map<String, Object> customer = customerId != null ? firestoreService.getById("customers", customerId) : null;
                    if (customer != null && customer.get("first_name") != null) {
                        senderName = (String) customer.get("first_name");
                        if (customer.get("last_name") != null) senderName += " " + customer.get("last_name");
                    } else senderName = "Customer";
                } else if ("vendor".equalsIgnoreCase(senderRole)) {
                    Map<String, Object> vendor = vendorId != null ? firestoreService.getById("vendors", vendorId) : null;
                    if (vendor != null && vendor.get("company_name") != null) senderName = (String) vendor.get("company_name");
                    else senderName = "Vendor";
                } else if ("technician".equalsIgnoreCase(senderRole) || "personnel".equalsIgnoreCase(senderRole)) {
                    Map<String, Object> personnel = technicianId != null ? firestoreService.getById("personnel", technicianId) : null;
                    if (personnel != null && personnel.get("first_name") != null) {
                        senderName = (String) personnel.get("first_name");
                        if (personnel.get("last_name") != null) senderName += " " + personnel.get("last_name");
                        senderName += " (Technician)";
                    } else senderName = "Assigned Personnel";
                }

                String displayId = threadId.startsWith("hq_") ? "HQ Chat" : threadId;
                String title = "New Message";
                String actualMsg = (String) msgData.get("text");

                if ("customer".equalsIgnoreCase(senderRole)) {
                    title = "New Message from Customer";
                    if (vendorId != null && !isLogistics) notificationService.notifyMessage(vendorId, "vendor", title, displayId, senderName, actualMsg);
                    if (isLogistics && technicianId != null) notificationService.notifyMessage(technicianId, "personnel", title, displayId, senderName, actualMsg);
                } else if ("vendor".equalsIgnoreCase(senderRole)) {
                    title = "New Message from Vendor";
                    if (customerId != null && !isLogistics) notificationService.notifyMessage(customerId, "customer", title, displayId, senderName, actualMsg);
                    if (technicianId != null && isLogistics) notificationService.notifyMessage(technicianId, "personnel", title, displayId, senderName, actualMsg);
                } else if ("technician".equalsIgnoreCase(senderRole)) {
                    title = "New Message from Personnel";
                    if (vendorId != null && threadId.startsWith("hq_")) {
                        notificationService.notifyMessage(vendorId, "vendor", title, displayId, senderName, actualMsg);
                    } else {
                        if (customerId != null) notificationService.notifyMessage(customerId, "customer", title, displayId, senderName, actualMsg);
                    }
                }
            } catch (Exception ex) {
                System.err.println("MessageController: Failed to send notifications: " + ex.getMessage());
            }

            return ResponseEntity.ok(Map.of("id", msgRef.getId(), "message", "Message sent successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        }
    }
}
