package ph.allfix.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import ph.allfix.service.NotificationService;
import java.util.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getForUser(@PathVariable String userId) throws Exception {
        String principalUid = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        System.out.println("[CAVEMAN] Security check: principalUid=" + principalUid + ", requested userId=" + userId);
        
        if (principalUid == null || !principalUid.equals(userId)) {
            System.err.println("[CAVEMAN] Security alert! Unauthorized access attempt by " + principalUid + " to view notifications of " + userId);
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied. You can only access your own notifications."));
        }
        
        return ResponseEntity.ok(notificationService.getForUser(userId));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<?> markRead(@PathVariable String id) throws Exception {
        String principalUid = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        System.out.println("[CAVEMAN] Security check: principalUid=" + principalUid + " wants to read notification=" + id);
        
        Map<String, Object> notification = notificationService.getById(id);
        if (notification == null) {
            System.err.println("[CAVEMAN] Notification not found: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Notification not found."));
        }
        
        String notifUserId = (String) notification.get("user_id");
        if (principalUid == null || !principalUid.equals(notifUserId)) {
            System.err.println("[CAVEMAN] Security alert! Unauthorized access attempt by " + principalUid + " to read notification of " + notifUserId);
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied. You can only read your own notifications."));
        }
        
        notificationService.markRead(id);
        return ResponseEntity.ok(Map.of("message", "Marked as read and deleted"));
    }
}
