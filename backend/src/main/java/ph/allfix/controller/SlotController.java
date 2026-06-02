package ph.allfix.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ph.allfix.service.SlotService;
import java.util.*;

@RestController
@RequestMapping("/api/slots")
public class SlotController {

    private final SlotService slotService;

    public SlotController(SlotService slotService) {
        this.slotService = slotService;
    }

    @GetMapping("/vendor/{id}")
    public ResponseEntity<List<Map<String, Object>>> getVendorSlots(@PathVariable String id) throws Exception {
        return ResponseEntity.ok(slotService.getVendorSlots(id));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) throws Exception {
        body.put("available_slots", body.getOrDefault("total_slots", 0));
        String id = slotService.createSlot(body);
        return ResponseEntity.ok(Map.of("id", id, "message", "Slot created"));
    }

    @PatchMapping("/{id}/decrement")
    public ResponseEntity<?> decrement(@PathVariable String id, @RequestBody Map<String, String> body) throws Exception {
        slotService.decrementSlot(
            body.get("vendor_id"),
            body.get("date"),
            body.get("sub_service"),
            body.get("time")
        );
        return ResponseEntity.ok(Map.of("message", "Slot decremented"));
    }

    @GetMapping("/available")
    public ResponseEntity<List<Map<String, Object>>> getAvailable(@RequestParam String service_type, @RequestParam String date) throws Exception {
        return ResponseEntity.ok(slotService.getAvailableVendors(service_type, date));
    }

    @GetMapping("/available-by-subservice")
    public ResponseEntity<List<Map<String, Object>>> getAvailableBySubService(@RequestParam String service_type, @RequestParam String sub_service, @RequestParam String date) throws Exception {
        return ResponseEntity.ok(slotService.getAvailableBySubService(service_type, sub_service, date));
    }

    @GetMapping("/available-vendors-schedule")
    public ResponseEntity<List<Map<String, Object>>> getAvailableVendorsForSchedule(
            @RequestParam(required = false) String service_name,
            @RequestParam(required = false) String service_brand,
            @RequestParam(required = false) String sub_service,
            @RequestParam String work_type,
            @RequestParam String date,
            @RequestParam String time) throws Exception {
        return ResponseEntity.ok(slotService.getAvailableVendorsForSchedule(service_name, service_brand, sub_service, work_type, date, time));
    }
}
