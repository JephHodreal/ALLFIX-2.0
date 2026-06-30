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

    public void notifyMessage(String userId, String userRole, String title, String displayId, String senderName, String latestMsg) {
        try {
            List<Map<String, Object>> existing = firestoreService.getWhere("notifications", "user_id", userId);
            Map<String, Object> target = null;
            for (Map<String, Object> notif : existing) {
                Boolean isRead = (Boolean) notif.get("is_read");
                String notifTitle = (String) notif.get("title");
                
                if (Boolean.FALSE.equals(isRead) && title.equals(notifTitle)) {
                    String relatedId = (String) notif.get("related_id");
                    String notifMsg = (String) notif.get("message");
                    if (displayId.equals(relatedId)) {
                        target = notif;
                        break;
                    } else if (relatedId == null && notifMsg != null && notifMsg.contains(displayId)) {
                        target = notif;
                        break;
                    }
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
                
                String newMsgStr = "💬 " + senderName + " sent you (" + count + ") new messages regarding booking " + displayId;
                
                Map<String, Object> updates = new HashMap<>();
                updates.put("created_at", new java.util.Date());
                updates.put("message", newMsgStr);
                updates.put("msg_count", count);
                updates.put("related_id", displayId);
                
                firestoreService.update("notifications", (String) target.get("id"), updates);
            } else {
                String newMsgStr;
                if (title.contains("Personnel")) {
                    newMsgStr = "💬 " + senderName + " sent a new message: '" + latestMsg + "'";
                } else {
                    newMsgStr = "💬 " + senderName + " sent a new message regarding booking " + displayId;
                }

                Map<String, Object> notif = new HashMap<>();
                notif.put("user_id", userId);
                notif.put("user_role", userRole);
                notif.put("title", title);
                notif.put("message", newMsgStr);
                notif.put("is_read", false);
                notif.put("msg_count", 1);
                notif.put("related_id", displayId);
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
