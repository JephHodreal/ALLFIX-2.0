package ph.allfix.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ph.allfix.service.FirestoreService;

import java.util.Map;
import java.util.List;
import java.util.HashMap;

@RestController
public class PartnerLogoController {

    private final FirestoreService firestoreService;

    public PartnerLogoController(FirestoreService firestoreService) {
        this.firestoreService = firestoreService;
    }

    // Public endpoint to get all partner logos
    @GetMapping("/api/partner-logos")
    public ResponseEntity<?> getAllPartnerLogos() {
        try {
            List<Map<String, Object>> logos = firestoreService.getAll("partner_logos");
            // Sort logos by 'order' field, treating missing 'order' as 0
            logos.sort((a, b) -> {
                Number orderA = (Number) a.getOrDefault("order", 999);
                Number orderB = (Number) b.getOrDefault("order", 999);
                return Integer.compare(orderA.intValue(), orderB.intValue());
            });
            return ResponseEntity.ok(logos);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", e.getMessage()));
        }
    }

    // Admin endpoint to add a partner logo
    @PostMapping("/api/admin/partner-logos")
    public ResponseEntity<?> addPartnerLogo(@RequestBody Map<String, Object> body) {
        try {
            String name = (String) body.get("name");
            String url = (String) body.get("url");
            
            if (name == null || name.isBlank() || url == null || url.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Name and URL are required."));
            }

            Map<String, Object> logoData = new HashMap<>();
            logoData.put("name", name);
            logoData.put("url", url);
            logoData.put("order", 999); // Put at the end by default

            String id = firestoreService.create("partner_logos", logoData);
            return ResponseEntity.ok(Map.of("id", id, "name", name, "url", url, "message", "Partner logo added successfully."));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", e.getMessage()));
        }
    }

    // Admin endpoint to delete a partner logo
    @DeleteMapping("/api/admin/partner-logos/{id}")
    public ResponseEntity<?> deletePartnerLogo(@PathVariable String id) {
        try {
            firestoreService.delete("partner_logos", id);
            return ResponseEntity.ok(Map.of("message", "Partner logo deleted successfully."));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", e.getMessage()));
        }
    }

    // Admin endpoint to reorder partner logos
    @PostMapping("/api/admin/partner-logos/reorder")
    public ResponseEntity<?> reorderPartnerLogos(@RequestBody List<String> ids) {
        try {
            for (int i = 0; i < ids.size(); i++) {
                String id = ids.get(i);
                Map<String, Object> updateData = new HashMap<>();
                updateData.put("order", i);
                firestoreService.update("partner_logos", id, updateData);
            }
            return ResponseEntity.ok(Map.of("message", "Partner logos reordered successfully."));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", e.getMessage()));
        }
    }

    // Admin endpoint to update a partner logo
    @PutMapping("/api/admin/partner-logos/{id}")
    public ResponseEntity<?> updatePartnerLogo(@PathVariable String id, @RequestBody Map<String, Object> body) {
        try {
            String name = (String) body.get("name");
            String url = (String) body.get("url");

            if (name == null || name.isBlank() || url == null || url.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Name and URL are required."));
            }

            Map<String, Object> logoData = new HashMap<>();
            logoData.put("name", name);
            logoData.put("url", url);

            firestoreService.update("partner_logos", id, logoData);
            return ResponseEntity.ok(Map.of("message", "Partner logo updated successfully."));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", e.getMessage()));
        }
    }
}
