package ph.allfix.service;

import com.google.cloud.firestore.*;
import com.google.firebase.FirebaseApp;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

/**
 * Generic Firestore CRUD service.
 * All collections: customers, vendors, admins, personnel, bookings, messages,
 * reviews, support_tickets, refunds, vendor_slots, notifications
 */
@Service
public class FirestoreService {

    private Firestore firestore() {
        if (FirebaseApp.getApps().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Firebase/Firestore is not configured. Provide firebase.service-account-path and firebase.project-id."
            );
        }
        return FirestoreClient.getFirestore();
    }

    // ─── Create ─────────────────────────────────────────────────────────────

    public String create(String collection, Map<String, Object> data) throws ExecutionException, InterruptedException {
        DocumentReference ref = firestore().collection(collection).document();
        data.put("id", ref.getId());
        data.put("created_at", FieldValue.serverTimestamp());
        ref.set(data).get();
        return ref.getId();
    }

    public void createWithId(String collection, String docId, Map<String, Object> data) throws ExecutionException, InterruptedException {
        data.put("id", docId);
        data.put("created_at", FieldValue.serverTimestamp());
        firestore().collection(collection).document(docId).set(data).get();
    }

    // ─── Read ───────────────────────────────────────────────────────────────

    public Map<String, Object> getById(String collection, String docId) throws ExecutionException, InterruptedException {
        DocumentSnapshot doc = firestore().collection(collection).document(docId).get().get();
        if (!doc.exists()) return null;
        return doc.getData();
    }

    public List<Map<String, Object>> getAll(String collection) throws ExecutionException, InterruptedException {
        return firestore().collection(collection).get().get().getDocuments().stream()
                .map(DocumentSnapshot::getData)
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getWhere(String collection, String field, Object value) throws ExecutionException, InterruptedException {
        return firestore().collection(collection).whereEqualTo(field, value).get().get().getDocuments().stream()
                .map(DocumentSnapshot::getData)
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getWhereNot(String collection, String field, Object value) throws ExecutionException, InterruptedException {
        return firestore().collection(collection).whereNotEqualTo(field, value).get().get().getDocuments().stream()
                .map(DocumentSnapshot::getData)
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getWhereMultiple(String collection, Map<String, Object> filters) throws ExecutionException, InterruptedException {
        Query query = firestore().collection(collection);
        for (Map.Entry<String, Object> entry : filters.entrySet()) {
            query = query.whereEqualTo(entry.getKey(), entry.getValue());
        }
        return query.get().get().getDocuments().stream()
                .map(DocumentSnapshot::getData)
                .collect(Collectors.toList());
    }

    // ─── Update ─────────────────────────────────────────────────────────────

    public void update(String collection, String docId, Map<String, Object> data) throws ExecutionException, InterruptedException {
        firestore().collection(collection).document(docId).update(data).get();
    }

    public void updateField(String collection, String docId, String field, Object value) throws ExecutionException, InterruptedException {
        firestore().collection(collection).document(docId).update(field, value).get();
    }

    public void increment(String collection, String docId, String field, int amount) throws ExecutionException, InterruptedException {
        firestore().collection(collection).document(docId).update(field, FieldValue.increment(amount)).get();
    }

    // ─── Delete ─────────────────────────────────────────────────────────────

    public void delete(String collection, String docId) throws ExecutionException, InterruptedException {
        firestore().collection(collection).document(docId).delete().get();
    }

    // ─── Soft Delete ────────────────────────────────────────────────────────

    public void softDelete(String collection, String docId) throws ExecutionException, InterruptedException {
        updateField(collection, docId, "temp_delete", 1);
    }

    public List<Map<String, Object>> getAllActive(String collection) throws ExecutionException, InterruptedException {
        return firestore().collection(collection).whereEqualTo("temp_delete", 0).get().get().getDocuments().stream()
                .map(DocumentSnapshot::getData)
                .collect(Collectors.toList());
    }
}
