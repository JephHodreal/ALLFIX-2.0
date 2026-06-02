package ph.allfix.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ph.allfix.service.RefundService;
import ph.allfix.service.FirestoreService;
import java.util.*;

@RestController
@RequestMapping("/api/refunds")
public class RefundController {

    private final RefundService refundService;
    private final FirestoreService firestoreService;

    public RefundController(RefundService refundService, FirestoreService firestoreService) {
        this.refundService = refundService;
        this.firestoreService = firestoreService;
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) throws Exception {
        String id = refundService.createRefund(body);
        return ResponseEntity.ok(Map.of("id", id, "message", "Refund created"));
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAll() throws Exception {
        return ResponseEntity.ok(firestoreService.getAll("refunds"));
    }

    @GetMapping("/customer/{id}")
    public ResponseEntity<List<Map<String, Object>>> getByCustomer(@PathVariable String id) throws Exception {
        return ResponseEntity.ok(firestoreService.getWhere("refunds", "customer_id", id));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable String id) throws Exception {
        refundService.approveRefund(id);
        return ResponseEntity.ok(Map.of("message", "Refund approved"));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable String id) throws Exception {
        refundService.rejectRefund(id);
        return ResponseEntity.ok(Map.of("message", "Refund rejected"));
    }
}
