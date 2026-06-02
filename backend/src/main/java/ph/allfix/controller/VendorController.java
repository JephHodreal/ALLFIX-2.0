package ph.allfix.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ph.allfix.service.FirestoreService;
import ph.allfix.service.NotificationService;
import java.util.*;

@RestController
@RequestMapping("/api/vendors")
public class VendorController {

    private final FirestoreService firestoreService;
    private final NotificationService notificationService;

    public VendorController(FirestoreService firestoreService, NotificationService notificationService) {
        this.firestoreService = firestoreService;
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAll() throws Exception {
        return ResponseEntity.ok(firestoreService.getAllActive("vendors"));
    }

    @GetMapping("/approved")
    public ResponseEntity<List<Map<String, Object>>> getApproved(@RequestParam(required = false) String service_type) throws Exception {
        List<Map<String, Object>> vendors = firestoreService.getWhereMultiple("vendors", Map.of("acc_approve", "approved", "temp_delete", 0));
        if (service_type != null) {
            vendors = vendors.stream().filter(v -> service_type.equals(v.get("service_type"))).toList();
        }
        return ResponseEntity.ok(vendors);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) throws Exception {
        Map<String, Object> vendor = firestoreService.getById("vendors", id);
        return vendor != null ? ResponseEntity.ok(vendor) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody Map<String, Object> body) throws Exception {
        firestoreService.update("vendors", id, body);
        return ResponseEntity.ok(Map.of("message", "Updated"));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable String id) throws Exception {
        firestoreService.updateField("vendors", id, "is_approved", true);
        notificationService.notify(id, "vendor", "Your vendor application has been approved! You can now receive bookings.");
        return ResponseEntity.ok(Map.of("message", "Approved"));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable String id) throws Exception {
        firestoreService.updateField("vendors", id, "is_approved", false);
        return ResponseEntity.ok(Map.of("message", "Rejected"));
    }

    @GetMapping("/{id}/personnels")
    public ResponseEntity<List<Map<String, Object>>> getPersonnels(@PathVariable String id) throws Exception {
        List<Map<String, Object>> approved = firestoreService.getWhereMultiple("personnel", Map.of(
            "vendor_id", id,
            "acc_approve", "approved",
            "temp_delete", 0
        ));
        return ResponseEntity.ok(approved);
    }

    @GetMapping("/{id}/personnel-count")
    public ResponseEntity<?> getPersonnelCount(@PathVariable String id) throws Exception {
        long count = firestoreService.getWhereMultiple("personnel", Map.of(
            "vendor_id", id,
            "acc_approve", "approved",
            "temp_delete", 0
        )).size();
        return ResponseEntity.ok(Map.of("vendor_id", id, "personnel_count", count));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> softDelete(@PathVariable String id) throws Exception {
        firestoreService.softDelete("vendors", id);
        return ResponseEntity.ok(Map.of("message", "Soft deleted"));
    }
}
