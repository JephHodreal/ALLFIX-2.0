package ph.allfix.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ph.allfix.service.FirestoreService;
import ph.allfix.service.NotificationService;
import java.util.*;

@RestController
@RequestMapping("/api/vendors")
public class VendorController {

    private final FirestoreService firestoreService;
    private final NotificationService notificationService;

    public VendorController(FirestoreService firestoreService, NotificationService notificationService) {
        this.firestoreService = firestoreService;
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAll() throws Exception {
        return ResponseEntity.ok(firestoreService.getAllActive("vendors"));
    }

    @GetMapping("/approved")
    public ResponseEntity<List<Map<String, Object>>> getApproved(@RequestParam(required = false) String service_type) throws Exception {
        List<Map<String, Object>> vendors = firestoreService.getWhereMultiple("vendors", Map.of("acc_approve", "approved", "temp_delete", 0));
        if (service_type != null) {
            vendors = vendors.stream().filter(v -> service_type.equals(v.get("service_type"))).toList();
        }
        return ResponseEntity.ok(vendors);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) throws Exception {
        Map<String, Object> vendor = firestoreService.getById("vendors", id);
        return vendor != null ? ResponseEntity.ok(vendor) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody Map<String, Object> body) throws Exception {
        firestoreService.update("vendors", id, body);
        return ResponseEntity.ok(Map.of("message", "Updated"));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable String id) throws Exception {
        firestoreService.updateField("vendors", id, "is_approved", true);
        notificationService.notify(id, "vendor", "Your vendor application has been approved! You can now receive bookings.");
        return ResponseEntity.ok(Map.of("message", "Approved"));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable String id) throws Exception {
        firestoreService.updateField("vendors", id, "is_approved", false);
        return ResponseEntity.ok(Map.of("message", "Rejected"));
    }

    @GetMapping("/{id}/personnels")
    public ResponseEntity<List<Map<String, Object>>> getPersonnels(@PathVariable String id) throws Exception {
        List<Map<String, Object>> approved = firestoreService.getWhereMultiple("personnel", Map.of(
            "vendor_id", id,
            "acc_approve", "approved",
            "temp_delete", 0
        ));
        return ResponseEntity.ok(approved);
    }

    @GetMapping("/{id}/personnel-count")
    public ResponseEntity<?> getPersonnelCount(@PathVariable String id) throws Exception {
        long count = firestoreService.getWhereMultiple("personnel", Map.of(
            "vendor_id", id,
            "acc_approve", "approved",
            "temp_delete", 0
        )).size();
        return ResponseEntity.ok(Map.of("vendor_id", id, "personnel_count", count));
    }

    private Date getBookingDate(Map<String, Object> booking, String fieldName) {
        Object val = booking.get(fieldName);
        if (val == null) {
            return null;
        }
        if (val instanceof Date) {
            return (Date) val;
        }
        if (val.getClass().getName().contains("Timestamp")) {
            try {
                java.lang.reflect.Method method = val.getClass().getMethod("toDate");
                return (Date) method.invoke(val);
            } catch (Exception e) {
                // Ignore
            }
        }
        if (val instanceof Map) {
            Map<?, ?> map = (Map<?, ?>) val;
            if (map.containsKey("seconds")) {
                long seconds = ((Number) map.get("seconds")).longValue();
                return new Date(seconds * 1000L);
            }
        }
        if (val instanceof Long || val instanceof Integer) {
            long ms = ((Number) val).longValue();
            if (ms < 100000000000L) {
                return new Date(ms * 1000L);
            } else {
                return new Date(ms);
            }
        }
        if (val instanceof String) {
            try {
                return Date.from(java.time.Instant.parse((String) val));
            } catch (Exception e) {
                // Ignore
            }
        }
        return null;
    }

    private Date getMondayOfWeek(Date date) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(date);
        cal.set(Calendar.HOUR_OF_DAY, 0);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        cal.set(Calendar.DAY_OF_WEEK, Calendar.MONDAY);
        if (cal.getTime().after(date)) {
            cal.add(Calendar.WEEK_OF_YEAR, -1);
        }
        return cal.getTime();
    }

    @GetMapping("/{id}/dashboard-stats")
    public ResponseEntity<?> getDashboardStats(@PathVariable String id) {
        System.out.println("VendorController.getDashboardStats: fetching stats for vendor " + id);
        try {
            List<Map<String, Object>> bookings = firestoreService.getWhere("bookings", "vendor_id", id);
            
            double totalIncome = 0.0;
            int totalJobs = bookings.size();
            int completedJobs = 0;
            int cancelledJobs = 0;
            
            Map<Date, Double> weeklyIncome = new TreeMap<>();
            Map<Date, Integer> weeklyCompleted = new TreeMap<>();
            Map<Date, Integer> weeklyTotal = new TreeMap<>();
            
            // Populate last 8 weeks with 0.0 / 0
            Calendar cal = Calendar.getInstance();
            Date currentMonday = getMondayOfWeek(cal.getTime());
            for (int i = 0; i < 8; i++) {
                weeklyIncome.put(currentMonday, 0.0);
                weeklyCompleted.put(currentMonday, 0);
                weeklyTotal.put(currentMonday, 0);
                
                Calendar c = Calendar.getInstance();
                c.setTime(currentMonday);
                c.add(Calendar.WEEK_OF_YEAR, -1);
                currentMonday = c.getTime();
            }
            
            for (Map<String, Object> booking : bookings) {
                String status = (String) booking.get("status");
                if (status == null) continue;
                status = status.trim().toLowerCase();
                
                Date completedDate = getBookingDate(booking, "completed_at");
                Date createdDate = getBookingDate(booking, "created_at");
                Date bDate = (completedDate != null) ? completedDate : createdDate;
                if (bDate == null) continue;
                
                Date bMonday = getMondayOfWeek(bDate);
                
                weeklyTotal.put(bMonday, weeklyTotal.getOrDefault(bMonday, 0) + 1);
                
                if (status.equals("completed")) {
                    completedJobs++;
                    
                    double price = booking.get("price") != null ? ((Number) booking.get("price")).doubleValue() : 0.0;
                    double quantity = booking.get("quantity") != null ? ((Number) booking.get("quantity")).doubleValue() : 1.0;
                    double totalPayment = booking.get("total_price") != null ? ((Number) booking.get("total_price")).doubleValue() : (price * quantity);
                    
                    double systemFeePct = 10.0;
                    try {
                        Map<String, Object> setting = firestoreService.getById("settings", "system_fee");
                        if (setting != null && setting.get("percentage") != null) {
                            systemFeePct = ((Number) setting.get("percentage")).doubleValue();
                        }
                    } catch (Exception e) {
                        // ignore
                    }
                    
                    double systemFee = booking.get("system_fee") != null ? 
                        ((Number) booking.get("system_fee")).doubleValue() : (price * quantity * (systemFeePct / 100.0));
                    
                    double earnings = booking.get("vendor_earnings") != null ? 
                        ((Number) booking.get("vendor_earnings")).doubleValue() : (totalPayment - systemFee);
                    
                    totalIncome += earnings;
                    weeklyIncome.put(bMonday, weeklyIncome.getOrDefault(bMonday, 0.0) + earnings);
                    weeklyCompleted.put(bMonday, weeklyCompleted.getOrDefault(bMonday, 0) + 1);
                } else if (status.equals("cancelled")) {
                    cancelledJobs++;
                }
            }
            
            double completionRate = 0.0;
            if (completedJobs + cancelledJobs > 0) {
                completionRate = ((double) completedJobs / (completedJobs + cancelledJobs)) * 100.0;
            } else if (totalJobs > 0) {
                completionRate = ((double) completedJobs / totalJobs) * 100.0;
            }
            
            List<Map<String, Object>> incomeTrend = new ArrayList<>();
            java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("MMM dd");
            for (Map.Entry<Date, Double> entry : weeklyIncome.entrySet()) {
                Map<String, Object> point = new HashMap<>();
                point.put("week", sdf.format(entry.getKey()));
                point.put("income", entry.getValue());
                incomeTrend.add(point);
            }
            
            List<Map<String, Object>> completionTrend = new ArrayList<>();
            for (Map.Entry<Date, Integer> entry : weeklyCompleted.entrySet()) {
                Date weekStart = entry.getKey();
                int comp = entry.getValue();
                int tot = weeklyTotal.getOrDefault(weekStart, 0);
                double rate = 0.0;
                if (tot > 0) {
                    rate = ((double) comp / tot) * 100.0;
                }
                Map<String, Object> point = new HashMap<>();
                point.put("week", sdf.format(weekStart));
                point.put("rate", Math.round(rate * 10.0) / 10.0);
                completionTrend.add(point);
            }
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalIncome", totalIncome);
            stats.put("totalJobs", totalJobs);
            stats.put("completionRate", Math.round(completionRate * 10.0) / 10.0);
            stats.put("incomeTrend", incomeTrend);
            stats.put("completionTrend", completionTrend);
            
            System.out.println("VendorController.getDashboardStats: successfully calculated stats for vendor " + id);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            System.err.println("Error in getDashboardStats: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> softDelete(@PathVariable String id) throws Exception {
        firestoreService.softDelete("vendors", id);
        return ResponseEntity.ok(Map.of("message", "Soft deleted"));
    }
}
