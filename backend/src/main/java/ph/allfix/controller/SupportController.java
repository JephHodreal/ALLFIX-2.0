package ph.allfix.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ph.allfix.service.FirestoreService;
import java.util.*;

@RestController
@RequestMapping("/api/support")
public class SupportController {

    private final FirestoreService firestoreService;

    public SupportController(FirestoreService firestoreService) {
        this.firestoreService = firestoreService;
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) throws Exception {
        body.put("status", "open");
        String id = firestoreService.create("support_tickets", body);
        return ResponseEntity.ok(Map.of("id", id, "message", "Ticket submitted"));
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAll() throws Exception {
        return ResponseEntity.ok(firestoreService.getAll("support_tickets"));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String id, @RequestBody Map<String, String> body) throws Exception {
        firestoreService.updateField("support_tickets", id, "status", body.get("status"));
        return ResponseEntity.ok(Map.of("message", "Status updated"));
    }
}
