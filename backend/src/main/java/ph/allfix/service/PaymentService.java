package ph.allfix.service;

import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class PaymentService {

    private final FirestoreService firestoreService;
    private final BookingService bookingService;

    public PaymentService(FirestoreService firestoreService, BookingService bookingService) {
        this.firestoreService = firestoreService;
        this.bookingService = bookingService;
    }

    public void uploadProof(String bookingId, String reference, String proofUrl) throws Exception {
        Map<String, Object> updates = new HashMap<>();
        updates.put("payment_reference", reference);
        if (proofUrl != null) updates.put("payment_proof_url", proofUrl);
        firestoreService.update("bookings", bookingId, updates);
    }

    public List<Map<String, Object>> getPendingPayments() throws Exception {
        return firestoreService.getWhere("bookings", "payment_confirmed", false)
                .stream()
                .filter(b -> b.get("payment_reference") != null)
                .toList();
    }

    public void confirmPayment(String bookingId, boolean confirmed) throws Exception {
        if (confirmed) {
            bookingService.confirmPayment(bookingId);
        }
        // If rejected, booking stays pending
    }
}
