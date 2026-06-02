package ph.allfix.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ph.allfix.service.FirestoreService;
import java.util.*;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final FirestoreService firestoreService;

    public ReviewController(FirestoreService firestoreService) {
        this.firestoreService = firestoreService;
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) throws Exception {
        String id = firestoreService.create("reviews", body);
        // Update vendor rating
        String vendorId = (String) body.get("vendor_id");
        if (vendorId != null) {
            List<Map<String, Object>> reviews = firestoreService.getWhere("reviews", "vendor_id", vendorId);
            double avg = reviews.stream().mapToInt(r -> ((Number) r.getOrDefault("rating", 0)).intValue()).average().orElse(0);
            firestoreService.updateField("vendors", vendorId, "rating", avg);
        }
        return ResponseEntity.ok(Map.of("id", id, "message", "Review submitted"));
    }

    @GetMapping("/vendor/{id}")
    public ResponseEntity<List<Map<String, Object>>> getByVendor(@PathVariable String id) throws Exception {
        return ResponseEntity.ok(firestoreService.getWhere("reviews", "vendor_id", id));
    }
}
