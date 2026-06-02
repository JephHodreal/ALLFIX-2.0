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
        String customerId = (String) data.get("customer_id");
        if (customerId != null) {
            notificationService.notify(customerId, "customer", "A refund has been initiated for your booking.");
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
