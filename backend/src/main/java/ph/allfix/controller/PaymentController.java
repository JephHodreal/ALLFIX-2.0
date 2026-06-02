package ph.allfix.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ph.allfix.service.PaymentService;
import java.util.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/upload-proof")
    public ResponseEntity<?> uploadProof(@RequestBody Map<String, String> body) throws Exception {
        paymentService.uploadProof(body.get("bookingId"), body.get("paymentReference"), body.get("proofUrl"));
        return ResponseEntity.ok(Map.of("message", "Payment proof uploaded"));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<Map<String, Object>>> getPending() throws Exception {
        return ResponseEntity.ok(paymentService.getPendingPayments());
    }

    @PatchMapping("/{bookingId}/confirm")
    public ResponseEntity<?> confirm(@PathVariable String bookingId, @RequestBody(required = false) Map<String, Object> body) throws Exception {
        boolean confirmed = body == null || !Boolean.FALSE.equals(body.get("confirmed"));
        paymentService.confirmPayment(bookingId, confirmed);
        return ResponseEntity.ok(Map.of("message", confirmed ? "Payment confirmed" : "Payment rejected"));
    }
}
