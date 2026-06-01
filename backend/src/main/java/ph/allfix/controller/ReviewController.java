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

    @jakarta.annotation.PostConstruct
    public void seedReviews() {
        try {
            List<Map<String, Object>> existing = firestoreService.getAll("reviews");
            if (existing == null || existing.isEmpty()) {
                System.out.println("[CAVEMAN] Reviews collection is empty. Seeding initial featured reviews...");
                
                Map<String, Object> r1 = new HashMap<>();
                r1.put("customer_name", "Maria Santos");
                r1.put("rating", 5);
                r1.put("feedback", "Napakaayos ng trabaho! The CoolFix technician arrived exactly on time, wore PPE, and cleaned our 3 aircon units thoroughly. The apartment feels so much cooler now. Highly recommend!");
                r1.put("service_type", "CoolFix – AC Cleaning");
                r1.put("vendor_name", "CoolFix Partners");
                r1.put("featured", true);
                r1.put("created_at", new Date());
                firestoreService.create("reviews", r1);
                
                Map<String, Object> r2 = new HashMap<>();
                r2.put("customer_name", "Engr. Roberto Cruz");
                r2.put("rating", 5);
                r2.put("feedback", "We've been managing commercial properties for 10 years, and AllFix SaniFix is the most reliable, professional deep cleaning team we've worked with. Highly recommended for offices!");
                r2.put("service_type", "SaniFix – Deep Cleaning");
                r2.put("vendor_name", "SaniFix Professionals");
                r2.put("featured", true);
                r2.put("created_at", new Date());
                firestoreService.create("reviews", r2);
                
                Map<String, Object> r3 = new HashMap<>();
                r3.put("customer_name", "Anna Reyes");
                r3.put("rating", 4);
                r3.put("feedback", "TechFix set up our entire CCTV and network infrastructure in one day. The technician was knowledgeable, courteous, and double-checked everything before leaving. Will book again!");
                r3.put("service_type", "TechFix – IT Support");
                r3.put("vendor_name", "TechFix Experts");
                r3.put("featured", true);
                r3.put("created_at", new Date());
                firestoreService.create("reviews", r3);
                
                Map<String, Object> r4 = new HashMap<>();
                r4.put("customer_name", "Mark Gonzales");
                r4.put("rating", 5);
                r4.put("feedback", "HomeFix transformed our bathroom in just 4 days. The tiling was perfect, no leaks, and the team cleaned up after. Excellent work by AllFix!");
                r4.put("service_type", "HomeFix – Renovation");
                r4.put("vendor_name", "HomeFix Builders");
                r4.put("featured", true);
                r4.put("created_at", new Date());
                firestoreService.create("reviews", r4);

                System.out.println("[CAVEMAN] Seeding completed successfully!");
            }
        } catch (Exception e) {
            System.err.println("[CAVEMAN] Error seeding reviews: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) throws Exception {
        String id = firestoreService.create("reviews", body);
        
        // Update booking reviewed status
        String bookingId = (String) body.get("booking_id");
        if (bookingId != null) {
            firestoreService.updateField("bookings", bookingId, "reviewed", true);
        }
        
        // Update vendor rating
        String vendorId = (String) body.get("vendor_id");
        if (vendorId != null) {
            List<Map<String, Object>> reviews = firestoreService.getWhere("reviews", "vendor_id", vendorId);
            double avg = reviews.stream().mapToInt(r -> ((Number) r.getOrDefault("rating", 0)).intValue()).average().orElse(0);
            firestoreService.updateField("vendors", vendorId, "rating", avg);
        }
        return ResponseEntity.ok(Map.of("id", id, "message", "Review submitted"));
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAll() throws Exception {
        return ResponseEntity.ok(firestoreService.getAll("reviews"));
    }

    @GetMapping("/featured")
    public ResponseEntity<List<Map<String, Object>>> getFeatured() throws Exception {
        System.out.println("[CAVEMAN] Fetching featured reviews from Firestore...");
        List<Map<String, Object>> featuredBools = firestoreService.getWhere("reviews", "featured", true);
        List<Map<String, Object>> featuredStrings = firestoreService.getWhere("reviews", "featured", "true");
        
        List<Map<String, Object>> allFeatured = new ArrayList<>();
        if (featuredBools != null) allFeatured.addAll(featuredBools);
        if (featuredStrings != null) {
            for (Map<String, Object> r : featuredStrings) {
                if (allFeatured.stream().noneMatch(existing -> existing.get("id").equals(r.get("id")))) {
                    allFeatured.add(r);
                }
            }
        }
        System.out.println("[CAVEMAN] Found " + allFeatured.size() + " featured reviews.");
        return ResponseEntity.ok(allFeatured);
    }

    @GetMapping("/vendor/{id}")
    public ResponseEntity<List<Map<String, Object>>> getByVendor(@PathVariable String id) throws Exception {
        return ResponseEntity.ok(firestoreService.getWhere("reviews", "vendor_id", id));
    }

    @PatchMapping("/{id}/featured")
    public ResponseEntity<?> updateFeatured(@PathVariable String id, @RequestBody Map<String, Object> body) throws Exception {
        Object val = body.get("featured");
        boolean featured = false;
        if (val instanceof Boolean) {
            featured = (Boolean) val;
        } else if (val instanceof String) {
            featured = Boolean.parseBoolean((String) val);
        }
        System.out.println("[CAVEMAN] Admin updating featured status for review: " + id + " to: " + featured);
        firestoreService.updateField("reviews", id, "featured", featured);
        return ResponseEntity.ok(Map.of("message", "Featured status updated", "featured", featured));
    }
}
