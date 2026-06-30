package ph.allfix.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ph.allfix.service.BookingService;
import ph.allfix.service.FirestoreService;
import java.util.*;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final FirestoreService firestoreService;
    private final BookingService bookingService;

    public BookingController(FirestoreService firestoreService, BookingService bookingService) {
        this.firestoreService = firestoreService;
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        try {
            String id = bookingService.createBooking(body);
            return ResponseEntity.ok(Map.of("id", id, "message", "Booking created"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAll() throws Exception {
        bookingService.checkAndExpireBookings();
        return ResponseEntity.ok(firestoreService.getAll("bookings"));
    }

    @GetMapping("/customer/{id}")
    public ResponseEntity<List<Map<String, Object>>> getByCustomer(@PathVariable String id) throws Exception {
        bookingService.checkAndExpireBookings();
        return ResponseEntity.ok(firestoreService.getWhere("bookings", "customer_id", id));
    }

    @GetMapping("/vendor/{id}")
    public ResponseEntity<List<Map<String, Object>>> getByVendor(@PathVariable String id) throws Exception {
        bookingService.checkAndExpireBookings();
        return ResponseEntity.ok(firestoreService.getWhere("bookings", "vendor_id", id));
    }

    @GetMapping("/personnel/{id}")
    public ResponseEntity<List<Map<String, Object>>> getByPersonnel(@PathVariable String id) throws Exception {
        bookingService.checkAndExpireBookings();
        return ResponseEntity.ok(firestoreService.getWhere("bookings", "personnel_id", id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) throws Exception {
        bookingService.checkAndExpireBookings();
        Map<String, Object> booking = firestoreService.getById("bookings", id);
        return booking != null ? ResponseEntity.ok(booking) : ResponseEntity.notFound().build();
    }

    @PatchMapping("/{id}/confirm-payment")
    public ResponseEntity<?> confirmPayment(@PathVariable String id) throws Exception {
        bookingService.confirmPayment(id);
        return ResponseEntity.ok(Map.of("message", "Payment confirmed"));
    }

    @PatchMapping("/{id}/assign-personnel")
    public ResponseEntity<?> assignPersonnel(@PathVariable String id, @RequestBody Map<String, String> body) throws Exception {
        bookingService.assignPersonnel(id, body.get("personnel_id"));
        return ResponseEntity.ok(Map.of("message", "Personnel assigned"));
    }

    @PostMapping("/{id}/addons")
    public ResponseEntity<?> requestAddon(@PathVariable String id, @RequestBody Map<String, Object> body) {
        try {
            bookingService.requestAddon(id, body);
            return ResponseEntity.ok(Map.of("message", "Add-on requested successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}/addons/{addonId}")
    public ResponseEntity<?> deleteAddon(@PathVariable String id, @PathVariable String addonId) {
        try {
            bookingService.deleteAddon(id, addonId);
            return ResponseEntity.ok(Map.of("message", "Add-on cancelled successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/addons/{addonId}/pay")
    public ResponseEntity<?> payAddon(@PathVariable String id, @PathVariable String addonId, @RequestBody Map<String, Object> body) {
        try {
            bookingService.payAddon(id, addonId, body);
            return ResponseEntity.ok(Map.of("message", "Add-on payment submitted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/addons/{addonId}/verify")
    public ResponseEntity<?> verifyAddon(@PathVariable String id, @PathVariable String addonId) {
        try {
            bookingService.verifyAddon(id, addonId);
            return ResponseEntity.ok(Map.of("message", "Add-on payment verified successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<?> complete(@PathVariable String id) throws Exception {
        bookingService.completeBooking(id);
        return ResponseEntity.ok(Map.of("message", "Booking completed"));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<?> cancel(@PathVariable String id) throws Exception {
        bookingService.requestCancellation(id);
        return ResponseEntity.ok(Map.of("message", "Cancellation requested"));
    }

    @PostMapping("/{id}/cancel-with-refund")
    public ResponseEntity<?> cancelWithRefund(@PathVariable String id, @RequestBody Map<String, Object> body) {
        try {
            bookingService.cancelWithRefund(id, body);
            return ResponseEntity.ok(Map.of("message", "Booking cancelled and refund processed successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/resolve-cancellation")
    public ResponseEntity<?> resolveCancellation(@PathVariable String id, @RequestBody Map<String, Object> body) {
        try {
            String action = (String) body.get("action");
            Double penaltyAmount = null;
            if (body.get("penalty_amount") != null) {
                penaltyAmount = Double.valueOf(body.get("penalty_amount").toString());
            }
            bookingService.resolveCancellation(id, action, penaltyAmount);
            return ResponseEntity.ok(Map.of("message", "Cancellation resolved"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        }
    }
    @GetMapping("/debug-data")
    public ResponseEntity<?> debugData() throws Exception {
        Map<String, Object> data = new HashMap<>();
        data.put("threads", firestoreService.getAll("chat_threads"));
        data.put("customers", firestoreService.getAll("customers"));
        data.put("vendors", firestoreService.getAll("vendors"));
        return ResponseEntity.ok(data);
    }
}
