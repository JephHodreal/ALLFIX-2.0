package ph.allfix.service;

import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class ChatArchiverService {

    private final FirestoreService firestoreService;

    public ChatArchiverService(FirestoreService firestoreService) {
        this.firestoreService = firestoreService;
    }

    // Run every hour
    @Scheduled(cron = "0 0 * * * *")
    public void archiveOldThreads() {
        try {
            Firestore db = firestoreService.firestore();
            
            // Query for completed bookings
            var querySnapshot = db.collection("bookings")
                    .whereEqualTo("status", "completed")
                    .get().get();

            long fortyEightHoursInMillis = 48L * 60 * 60 * 1000;
            long now = System.currentTimeMillis();

            for (QueryDocumentSnapshot doc : querySnapshot.getDocuments()) {
                String bookingId = doc.getId();
                Object completedAtObj = doc.get("completed_at");
                if (completedAtObj != null) {
                    long completedTime = 0;
                    if (completedAtObj instanceof com.google.cloud.Timestamp) {
                        completedTime = ((com.google.cloud.Timestamp) completedAtObj).toDate().getTime();
                    } else if (completedAtObj instanceof String) {
                        completedTime = Instant.parse((String) completedAtObj).toEpochMilli();
                    } else if (completedAtObj instanceof Date) {
                        completedTime = ((Date) completedAtObj).getTime();
                    }

                    if (completedTime > 0 && (now - completedTime) > fortyEightHoursInMillis) {
                        // Find the chat thread for this booking
                        var threadQuery = db.collection("chat_threads")
                                .whereEqualTo("booking_id", bookingId)
                                .get().get();
                                
                        for (QueryDocumentSnapshot threadDoc : threadQuery.getDocuments()) {
                            String currentStatus = threadDoc.getString("status");
                            if (!"archived".equals(currentStatus)) {
                                Map<String, Object> update = new HashMap<>();
                                update.put("status", "archived");
                                db.collection("chat_threads").document(threadDoc.getId()).update(update);
                                System.out.println("Archived thread " + threadDoc.getId() + " for booking " + bookingId);
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error archiving old threads: " + e.getMessage());
        }
    }
}
