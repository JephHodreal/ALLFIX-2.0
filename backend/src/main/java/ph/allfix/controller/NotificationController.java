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
        System.out.println("Security check: principalUid=" + principalUid + ", requested userId=" + userId);
        
        if (principalUid == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Not authenticated"));
        }
        
        // Note: userId may be profile.id while principalUid is Firebase uid.
        // We fetch using the provided userId which is tied to the customer document.
        
        return ResponseEntity.ok(notificationService.getForUser(userId));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<?> markRead(@PathVariable String id) throws Exception {
        String principalUid = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        System.out.println("Security check: principalUid=" + principalUid + " wants to read notification=" + id);
        
        Map<String, Object> notification = notificationService.getById(id);
        if (notification == null) {
            System.err.println("Notification not found: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Notification not found."));
        }
        
        String notifUserId = (String) notification.get("user_id");
        if (principalUid == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Not authenticated"));
        }
        
        notificationService.markRead(id);
        return ResponseEntity.ok(Map.of("message", "Marked as read"));
    }

    @PatchMapping("/{id}/unread")
    public ResponseEntity<?> markUnread(@PathVariable String id) throws Exception {
        String principalUid = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        System.out.println("Security check: principalUid=" + principalUid + " wants to mark unread notification=" + id);
        
        Map<String, Object> notification = notificationService.getById(id);
        if (notification == null) {
            System.err.println("Notification not found: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Notification not found."));
        }
        
        if (principalUid == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Not authenticated"));
        }
        
        notificationService.markUnread(id);
        return ResponseEntity.ok(Map.of("message", "Marked as unread"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable String id) throws Exception {
        String principalUid = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principalUid == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Not authenticated"));
        }
        
        Map<String, Object> notification = notificationService.getById(id);
        if (notification == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Notification not found."));
        }

        notificationService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Notification deleted"));
    }
}
