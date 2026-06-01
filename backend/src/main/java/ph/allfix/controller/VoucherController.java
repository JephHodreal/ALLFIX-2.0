package ph.allfix.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ph.allfix.service.FirestoreService;

import java.util.*;

@RestController
@RequestMapping("/api/vouchers")
public class VoucherController {

    private final FirestoreService firestoreService;

    public VoucherController(FirestoreService firestoreService) {
        this.firestoreService = firestoreService;
    }

    @PostMapping
    public ResponseEntity<?> createVoucher(@RequestBody Map<String, Object> body) {
        try {
            String code = ((String) body.get("code")).toUpperCase().trim();
            String discountType = (String) body.get("discountType");
            Object discVal = body.get("discountValue");
            double discountValue = 0.0;
            if (discVal instanceof Number) {
                discountValue = ((Number) discVal).doubleValue();
            } else if (discVal instanceof String) {
                discountValue = Double.parseDouble((String) discVal);
            }

            String customerId = (String) body.get("customerId");
            String customerName = (String) body.get("customerName");

            // 1. Create the Voucher document
            Map<String, Object> voucherData = new HashMap<>();
            voucherData.put("code", code);
            voucherData.put("discount_type", discountType);
            voucherData.put("discount_value", discountValue);
            voucherData.put("customer_id", customerId);
            voucherData.put("customer_name", customerName);
            voucherData.put("status", "unused");
            voucherData.put("temp_delete", 0);

            String voucherId = firestoreService.create("vouchers", voucherData);

            // 2. Associate with Customer account document
            Map<String, Object> customer = firestoreService.getById("customers", customerId);
            if (customer != null) {
                List<Map<String, Object>> customerVouchers = (List<Map<String, Object>>) customer.get("vouchers");
                if (customerVouchers == null) {
                    customerVouchers = new ArrayList<>();
                }
                
                Map<String, Object> customerVoucher = new HashMap<>();
                customerVoucher.put("voucher_id", voucherId);
                customerVoucher.put("code", code);
                customerVoucher.put("discount_type", discountType);
                customerVoucher.put("discount_value", discountValue);
                customerVoucher.put("status", "unused");
                customerVoucher.put("created_at", new Date());

                customerVouchers.add(customerVoucher);

                Map<String, Object> customerUpdates = new HashMap<>();
                customerUpdates.put("vouchers", customerVouchers);
                firestoreService.update("customers", customerId, customerUpdates);
            }

            return ResponseEntity.ok(Map.of("id", voucherId, "message", "Voucher created and associated successfully."));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAll() throws Exception {
        return ResponseEntity.ok(firestoreService.getAllActive("vouchers"));
    }

    @PatchMapping("/{id}/use")
    public ResponseEntity<?> useVoucher(@PathVariable String id) throws Exception {
        Map<String, Object> voucher = firestoreService.getById("vouchers", id);
        if (voucher == null) {
            return ResponseEntity.notFound().build();
        }
        
        firestoreService.updateField("vouchers", id, "status", "used");
        
        String customerId = (String) voucher.get("customer_id");
        String code = (String) voucher.get("code");
        if (customerId != null) {
            Map<String, Object> customer = firestoreService.getById("customers", customerId);
            if (customer != null) {
                List<Map<String, Object>> customerVouchers = (List<Map<String, Object>>) customer.get("vouchers");
                if (customerVouchers != null) {
                    for (Map<String, Object> cv : customerVouchers) {
                        if (id.equals(cv.get("voucher_id")) || (code != null && code.equals(cv.get("code")))) {
                            cv.put("status", "used");
                            cv.put("used_at", new Date());
                        }
                    }
                    Map<String, Object> customerUpdates = new HashMap<>();
                    customerUpdates.put("vouchers", customerVouchers);
                    firestoreService.update("customers", customerId, customerUpdates);
                }
            }
        }
        return ResponseEntity.ok(Map.of("message", "Voucher marked as used successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVoucher(@PathVariable String id) throws Exception {
        Map<String, Object> voucher = firestoreService.getById("vouchers", id);
        if (voucher != null) {
            String customerId = (String) voucher.get("customer_id");
            String code = (String) voucher.get("code");
            if (customerId != null) {
                Map<String, Object> customer = firestoreService.getById("customers", customerId);
                if (customer != null) {
                    List<Map<String, Object>> customerVouchers = (List<Map<String, Object>>) customer.get("vouchers");
                    if (customerVouchers != null) {
                        customerVouchers.removeIf(cv -> id.equals(cv.get("voucher_id")) || (code != null && code.equals(cv.get("code"))));
                        Map<String, Object> customerUpdates = new HashMap<>();
                        customerUpdates.put("vouchers", customerVouchers);
                        firestoreService.update("customers", customerId, customerUpdates);
                    }
                }
            }
        }
        firestoreService.softDelete("vouchers", id);
        return ResponseEntity.ok(Map.of("message", "Voucher deleted successfully"));
    }
}
