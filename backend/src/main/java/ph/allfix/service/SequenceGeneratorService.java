package ph.allfix.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@Service
public class SequenceGeneratorService {

    private final FirestoreService firestoreService;

    @Autowired
    public SequenceGeneratorService(FirestoreService firestoreService) {
        this.firestoreService = firestoreService;
    }

    /**
     * Generates a sequential ID transactionally for the given collection.
     */
    public String generateNextId(String collectionName) throws ExecutionException, InterruptedException {
        Firestore firestore = firestoreService.firestore();
        DocumentReference counterRef = firestore.collection("system_counters").document(collectionName + "_seq");

        ApiFuture<String> transaction = firestore.runTransaction(t -> {
            DocumentSnapshot snapshot = t.get(counterRef).get();
            long currentSeq = 1;
            if (snapshot.exists() && snapshot.contains("current_value")) {
                Long val = snapshot.getLong("current_value");
                if (val != null) {
                    currentSeq = val + 1;
                }
            }

            Map<String, Object> updateData = new HashMap<>();
            updateData.put("current_value", currentSeq);
            t.set(counterRef, updateData);

            return formatId(collectionName, currentSeq);
        });

        return transaction.get();
    }

    private String formatId(String collectionName, long seq) {
        switch (collectionName) {
            case "admins":
                return String.format("AD_%06d", seq);
            case "vendors":
                return String.format("VN_%06d", seq);
            case "personnel":
                return String.format("PR_%06d", seq);
            case "customers":
                return String.format("CL_%06d", seq);
            case "bookings":
                return String.format("BK_%05d", seq);
            case "notifications":
                return String.format("NT_%06d", seq);
            case "payment_methods":
                return String.format("PM_%05d", seq);
            case "payouts":
                return String.format("PT_%05d", seq);
            case "refunds":
                return String.format("RF_%05d", seq);
            case "services":
                return String.format("SR_%05d", seq);
            case "vendor_slots":
                return String.format("VS_%05d", seq);
            default:
                throw new IllegalArgumentException("Unknown collection name for sequence generation: " + collectionName);
        }
    }
}
