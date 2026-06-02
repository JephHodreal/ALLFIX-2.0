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
        return ResponseEntity.ok(firestoreService.getAll("bookings"));
    }

    @GetMapping("/customer/{id}")
    public ResponseEntity<List<Map<String, Object>>> getByCustomer(@PathVariable String id) throws Exception {
        return ResponseEntity.ok(firestoreService.getWhere("bookings", "customer_id", id));
    }

    @GetMapping("/vendor/{id}")
    public ResponseEntity<List<Map<String, Object>>> getByVendor(@PathVariable String id) throws Exception {
        return ResponseEntity.ok(firestoreService.getWhere("bookings", "vendor_id", id));
    }

    @GetMapping("/personnel/{id}")
    public ResponseEntity<List<Map<String, Object>>> getByPersonnel(@PathVariable String id) throws Exception {
        return ResponseEntity.ok(firestoreService.getWhere("bookings", "personnel_id", id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) throws Exception {
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
}
