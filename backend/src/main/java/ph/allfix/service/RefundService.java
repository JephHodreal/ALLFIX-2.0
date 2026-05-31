package ph.allfix.service;

import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class RefundService {

    private final FirestoreService firestoreService;
    private final NotificationService notificationService;

    public RefundService(FirestoreService firestoreService, NotificationService notificationService) {
        this.firestoreService = firestoreService;
        this.notificationService = notificationService;
    }

    public String createRefund(Map<String, Object> data) throws Exception {
        data.put("status", "pending");
        data.put("notified", false);
        String id = firestoreService.create("refunds", data);

        String customerName = (String) data.get("customer_name");
        if (customerName == null || customerName.isBlank()) customerName = "A customer";
        String serviceType = (String) data.get("booking_id");

        // Notify the customer that their refund request was received
        String customerId = (String) data.get("customer_id");
        if (customerId != null) {
            notificationService.notify(customerId, "customer",
                "Your cancellation and refund request has been submitted and is pending admin review.");
        }

        // Notify all admins so they can review and process the refund request
        System.out.println("[CAVEMAN] RefundService.createRefund: notifying all admins of new refund request ID=" + id);
        try {
            java.util.List<java.util.Map<String, Object>> admins = firestoreService.getAll("admins");
            System.out.println("[CAVEMAN] Found " + admins.size() + " admin(s) to notify.");
            for (java.util.Map<String, Object> admin : admins) {
                String adminId = (String) admin.get("id");
                if (adminId == null) adminId = (String) admin.get("uid");
                if (adminId != null) {
                    notificationService.notify(adminId, "admin",
                        customerName + " has submitted a cancellation and refund request. Please review it in the Refunds section.");
                    System.out.println("[CAVEMAN] Admin notified: " + adminId);
                }
            }
        } catch (Exception e) {
            System.err.println("[CAVEMAN] Failed to notify admins of new refund request: " + e.getMessage());
        }

        return id;
    }

    public void approveRefund(String refundId) throws Exception {
        Map<String, Object> updates = new HashMap<>();
        updates.put("status", "approved");
        updates.put("notified", true);
        firestoreService.update("refunds", refundId, updates);

        Map<String, Object> refund = firestoreService.getById("refunds", refundId);
        String customerId = (String) refund.get("customer_id");
        if (customerId != null) notificationService.notify(customerId, "customer", "Your refund has been approved.");
    }

    public void rejectRefund(String refundId) throws Exception {
        firestoreService.updateField("refunds", refundId, "status", "rejected");
    }
}
