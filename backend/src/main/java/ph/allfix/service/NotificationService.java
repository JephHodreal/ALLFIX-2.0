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

    public void notifyMessage(String userId, String userRole, String title, String message, String displayId) {
        try {
            List<Map<String, Object>> existing = firestoreService.getWhere("notifications", "user_id", userId);
            Map<String, Object> target = null;
            for (Map<String, Object> notif : existing) {
                Boolean isRead = (Boolean) notif.get("is_read");
                String notifTitle = (String) notif.get("title");
                String notifMsg = (String) notif.get("message");
                
                if (Boolean.FALSE.equals(isRead) && title.equals(notifTitle) && notifMsg != null && notifMsg.contains(displayId)) {
                    target = notif;
                    break;
                }
            }
            
            if (target != null) {
                int count = 1;
                if (target.containsKey("msg_count")) {
                    Object countObj = target.get("msg_count");
                    if (countObj instanceof Number) {
                        count = ((Number) countObj).intValue();
                    }
                }
                count++;
                
                String senderRoleStr = "Vendor";
                if (title.contains("Customer")) senderRoleStr = "Customer";
                else if (title.contains("Personnel")) senderRoleStr = "Assigned personnel";
                
                String newMsgStr = "You have (" + count + ") new messages from " + senderRoleStr + " on " + displayId;
                
                Map<String, Object> updates = new HashMap<>();
                updates.put("created_at", new java.util.Date());
                updates.put("message", newMsgStr);
                updates.put("msg_count", count);
                
                firestoreService.update("notifications", (String) target.get("id"), updates);
            } else {
                String senderRoleStr = "Vendor";
                if (title.contains("Customer")) senderRoleStr = "Customer";
                else if (title.contains("Personnel")) senderRoleStr = "Assigned personnel";
                
                String newMsgStr = "You have (1) new message from " + senderRoleStr + " on " + displayId;

                Map<String, Object> notif = new HashMap<>();
                notif.put("user_id", userId);
                notif.put("user_role", userRole);
                notif.put("title", title);
                notif.put("message", newMsgStr);
                notif.put("is_read", false);
                notif.put("msg_count", 1);
                notif.put("created_at", new java.util.Date());
                firestoreService.create("notifications", notif);
            }
        } catch (Exception e) {
            System.err.println("Failed to send/update message notification: " + e.getMessage());
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

    public void markUnread(String notificationId) throws Exception {
        System.out.println("Marking notification " + notificationId + " as unread (is_read = false)");
        firestoreService.updateField("notifications", notificationId, "is_read", false);
    }

    public void delete(String notificationId) throws Exception {
        System.out.println("Deleting notification: " + notificationId);
        firestoreService.delete("notifications", notificationId);
    }
}
