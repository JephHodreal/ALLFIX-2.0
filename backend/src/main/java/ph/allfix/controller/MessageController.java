package ph.allfix.controller;

import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.FieldValue;
import com.google.cloud.firestore.Firestore;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ph.allfix.service.FirestoreService;

import java.util.*;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final FirestoreService firestoreService;

    public MessageController(FirestoreService firestoreService) {
        this.firestoreService = firestoreService;
    }

    @PostMapping
    public ResponseEntity<?> sendMessage(@RequestBody Map<String, Object> body) {
        try {
            String threadId = (String) body.get("thread_id");
            String senderRole = (String) body.get("sender_role");
            String senderId = (String) body.get("sender_id");
            String text = (String) body.get("text");
            Boolean isLogistics = (Boolean) body.get("is_logistics");
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
                String[] parts = threadId.split("_"); // hq_{technicianId}_{vendorId}
                if (parts.length == 3) {
                    Map<String, Object> hqThread = new HashMap<>();
                    hqThread.put("id", threadId);
                    hqThread.put("vendor_id", parts[2]);
                    hqThread.put("technician_id", parts[1]);
                    
                    // Fetch personnel name
                    Map<String, Object> tech = firestoreService.getById("personnel", parts[1]);
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

            DocumentReference msgRef = db.collection("chat_threads").document(threadId).collection("messages").document();
            msgData.put("id", msgRef.getId());
            msgRef.set(msgData).get();

            // Update thread's updated_at
            db.collection("chat_threads").document(threadId).update("updated_at", FieldValue.serverTimestamp()).get();

            return ResponseEntity.ok(Map.of("id", msgRef.getId(), "message", "Message sent successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        }
    }
}
