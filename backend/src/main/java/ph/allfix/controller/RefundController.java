package ph.allfix.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ph.allfix.service.RefundService;
import ph.allfix.service.FirestoreService;
import ph.allfix.service.BookingService;
import java.util.*;

@RestController
@RequestMapping("/api/refunds")
public class RefundController {

    private final RefundService refundService;
    private final FirestoreService firestoreService;
    private final BookingService bookingService;

    public RefundController(RefundService refundService, FirestoreService firestoreService, BookingService bookingService) {
        this.refundService = refundService;
        this.firestoreService = firestoreService;
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) throws Exception {
        String id = refundService.createRefund(body);
        return ResponseEntity.ok(Map.of("id", id, "message", "Refund created"));
    }

    @PostMapping("/direct")
    public ResponseEntity<?> createDirect(@RequestBody Map<String, Object> body) {
        System.out.println("RefundController.createDirect: Received payload to create direct refund: " + body);
        try {
            String id = refundService.createDirectRefund(body);
            System.out.println("RefundController.createDirect: Successfully created direct refund with ID: " + id);
            return ResponseEntity.ok(Map.of("id", id, "message", "Direct refund created"));
        } catch (Exception e) {
            System.out.println("RefundController.createDirect ERROR: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Failed to create direct refund: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAll() throws Exception {
        System.out.println("RefundController.getAll: Fetching all refunds");
        try {
            bookingService.checkAndExpireBookings();
        } catch (Exception e) {
            System.err.println("Error running checkAndExpireBookings in RefundController.getAll: " + e.getMessage());
        }
        return ResponseEntity.ok(firestoreService.getAll("refunds"));
    }

    @GetMapping("/customer/{id}")
    public ResponseEntity<List<Map<String, Object>>> getByCustomer(@PathVariable String id) throws Exception {
        System.out.println("RefundController.getByCustomer: Fetching refunds for customer ID: " + id);
        try {
            bookingService.checkAndExpireBookings();
        } catch (Exception e) {
            System.err.println("Error running checkAndExpireBookings in RefundController.getByCustomer: " + e.getMessage());
        }
        return ResponseEntity.ok(firestoreService.getWhere("refunds", "customer_id", id));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable String id, @RequestBody(required = false) Map<String, Object> body) {
        System.out.println("RefundController.approve: Approving refund ID: " + id + " with details: " + body);
        try {
            refundService.approveRefund(id, body);
            System.out.println("RefundController.approve: Successfully approved refund ID: " + id);
            return ResponseEntity.ok(Map.of("message", "Refund approved"));
        } catch (Exception e) {
            System.out.println("RefundController.approve ERROR: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Failed to approve refund: " + e.getMessage()));
        }
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable String id) {
        System.out.println("RefundController.reject: Rejecting refund ID: " + id);
        try {
            refundService.rejectRefund(id);
            System.out.println("RefundController.reject: Successfully rejected refund ID: " + id);
            return ResponseEntity.ok(Map.of("message", "Refund rejected"));
        } catch (Exception e) {
            System.out.println("RefundController.reject ERROR: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Failed to reject refund: " + e.getMessage()));
        }
    }
}
