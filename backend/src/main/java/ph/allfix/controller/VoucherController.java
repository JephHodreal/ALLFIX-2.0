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

    @GetMapping("/validate")
    public ResponseEntity<?> validateVoucher(@RequestParam String code, @RequestParam String customerId) {
        try {
            String normalizedCode = code.toUpperCase().trim();
            System.out.println("[CAVEMAN] validateVoucher: code='" + normalizedCode + "', customerId='" + customerId + "'");

            // 1. Fetch all active (non-deleted) vouchers from the vouchers collection
            List<Map<String, Object>> allVouchers = firestoreService.getAllActive("vouchers");
            System.out.println("[CAVEMAN] validateVoucher: Total active vouchers in collection: " + allVouchers.size());

            // 2. Find voucher by code
            Map<String, Object> matchedVoucher = null;
            for (Map<String, Object> v : allVouchers) {
                String vCode = v.get("code") != null ? v.get("code").toString().toUpperCase().trim() : "";
                System.out.println("[CAVEMAN] validateVoucher: Checking voucher code='" + vCode + "' (id=" + v.get("id") + ")");
                if (vCode.equals(normalizedCode)) {
                    matchedVoucher = v;
                    break;
                }
            }

            // 3. If voucher code does not exist
            if (matchedVoucher == null) {
                System.out.println("[CAVEMAN] validateVoucher: INVALID — voucher code '" + normalizedCode + "' does NOT exist in the vouchers collection.");
                return ResponseEntity.ok(Map.of(
                    "valid", false,
                    "message", "Voucher code does not exist."
                ));
            }

            System.out.println("[CAVEMAN] validateVoucher: Voucher FOUND — id='" + matchedVoucher.get("id") + "', customer_id='" + matchedVoucher.get("customer_id") + "', status='" + matchedVoucher.get("status") + "', discount_type='" + matchedVoucher.get("discount_type") + "', discount_value='" + matchedVoucher.get("discount_value") + "'");

            // 4. Check if the voucher is already used
            String status = matchedVoucher.get("status") != null ? matchedVoucher.get("status").toString() : "";
            if ("used".equalsIgnoreCase(status)) {
                System.out.println("[CAVEMAN] validateVoucher: INVALID — voucher '" + normalizedCode + "' has already been used.");
                return ResponseEntity.ok(Map.of(
                    "valid", false,
                    "message", "This voucher has already been used."
                ));
            }

            // 5. Check if the voucher's customer_id matches the current customer's ID
            String voucherCustomerId = matchedVoucher.get("customer_id") != null ? matchedVoucher.get("customer_id").toString() : "";
            System.out.println("[CAVEMAN] validateVoucher: Comparing voucher customer_id='" + voucherCustomerId + "' vs requestedCustomerId='" + customerId + "'");

            if (!voucherCustomerId.equals(customerId)) {
                System.out.println("[CAVEMAN] validateVoucher: INVALID — customer_id MISMATCH. Voucher belongs to '" + voucherCustomerId + "' but requester is '" + customerId + "'.");
                return ResponseEntity.ok(Map.of(
                    "valid", false,
                    "message", "This voucher is not assigned to your account."
                ));
            }

            // 6. All checks passed — voucher is valid and assigned to this customer
            System.out.println("[CAVEMAN] validateVoucher: VALID — voucher '" + normalizedCode + "' is valid and assigned to customer '" + customerId + "'.");

            Map<String, Object> result = new HashMap<>();
            result.put("valid", true);
            result.put("message", "Voucher is valid!");
            result.put("voucher_id", matchedVoucher.get("id"));
            result.put("code", matchedVoucher.get("code"));
            result.put("discount_type", matchedVoucher.get("discount_type"));
            result.put("discount_value", matchedVoucher.get("discount_value"));
            result.put("customer_id", matchedVoucher.get("customer_id"));
            result.put("status", matchedVoucher.get("status"));

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("[CAVEMAN] validateVoucher: ERROR — " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("valid", false, "message", "Server error validating voucher."));
        }
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAll() throws Exception {
        return ResponseEntity.ok(firestoreService.getAllActive("vouchers"));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Map<String, Object>>> getByCustomer(@PathVariable String customerId) throws Exception {
        List<Map<String, Object>> allVouchers = firestoreService.getAllActive("vouchers");
        List<Map<String, Object>> customerVouchers = new ArrayList<>();
        for (Map<String, Object> v : allVouchers) {
            if (customerId.equals(v.get("customer_id"))) {
                customerVouchers.add(v);
            }
        }
        // Sort by created_at descending (newest first)
        customerVouchers.sort((a, b) -> {
            Object aTime = a.get("created_at");
            Object bTime = b.get("created_at");
            if (aTime == null && bTime == null) return 0;
            if (aTime == null) return 1;
            if (bTime == null) return -1;
            return bTime.toString().compareTo(aTime.toString());
        });
        return ResponseEntity.ok(customerVouchers);
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
