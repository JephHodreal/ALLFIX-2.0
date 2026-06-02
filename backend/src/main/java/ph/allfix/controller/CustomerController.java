package ph.allfix.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ph.allfix.service.FirestoreService;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final FirestoreService firestoreService;

    public CustomerController(FirestoreService firestoreService) {
        this.firestoreService = firestoreService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAll() throws Exception {
        return ResponseEntity.ok(firestoreService.getAllActive("customers"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) throws Exception {
        Map<String, Object> customer = firestoreService.getById("customers", id);
        return customer != null ? ResponseEntity.ok(customer) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody Map<String, Object> body) throws Exception {
        firestoreService.update("customers", id, body);
        return ResponseEntity.ok(Map.of("message", "Updated"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> softDelete(@PathVariable String id) throws Exception {
        firestoreService.softDelete("customers", id);
        return ResponseEntity.ok(Map.of("message", "Soft deleted"));
    }
}
