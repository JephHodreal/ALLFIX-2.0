package ph.allfix.service;

import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class NotificationService {

    private final FirestoreService firestoreService;

    public NotificationService(FirestoreService firestoreService) {
        this.firestoreService = firestoreService;
    }

    public void notify(String userId, String userRole, String title, String message) {
        try {
            Map<String, Object> notif = new HashMap<>();
            notif.put("user_id", userId);
            notif.put("user_role", userRole);
            notif.put("title", title);
            notif.put("message", message);
            notif.put("is_read", false);
            notif.put("created_at", new java.util.Date());
            firestoreService.create("notifications", notif);
        } catch (Exception e) {
            // Log but don't fail the parent operation
            System.err.println("Failed to send notification: " + e.getMessage());
        }
    }

    public List<Map<String, Object>> getForUser(String userId) throws Exception {
        System.out.println("Fetching notifications for user: " + userId);
        return firestoreService.getWhere("notifications", "user_id", userId);
    }

    public Map<String, Object> getById(String id) throws Exception {
        return firestoreService.getById("notifications", id);
    }

    public void markRead(String notificationId) throws Exception {
        System.out.println("Marking notification " + notificationId + " as read (is_read = true)");
        firestoreService.updateField("notifications", notificationId, "is_read", true);
    }
}
