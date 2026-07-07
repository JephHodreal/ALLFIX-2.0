package ph.allfix.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ph.allfix.service.FirestoreService;
import java.util.*;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    private final FirestoreService firestoreService;

    public AddressController(FirestoreService firestoreService) {
        this.firestoreService = firestoreService;
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Map<String, Object>>> getCustomerAddresses(@PathVariable String customerId) {
        try {
            List<Map<String, Object>> addresses = firestoreService.getWhere("addresses", "user_id", customerId);
            return ResponseEntity.ok(addresses);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Collections.emptyList());
        }
    }

    @PostMapping
    public ResponseEntity<?> createAddress(@RequestBody Map<String, Object> body) {
        try {
            String customerId = (String) body.get("user_id");
            if (customerId == null || customerId.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "user_id is required"));
            }

            // Enforce max 3 addresses
            List<Map<String, Object>> existing = firestoreService.getWhere("addresses", "user_id", customerId);
            if (existing.size() >= 3) {
                return ResponseEntity.badRequest().body(Map.of("message", "Maximum of 3 addresses allowed. Please delete an existing address first."));
            }

            // Auto-set as default if it's the first address, or if explicitly requested
            boolean isDefault = existing.isEmpty();
            if (body.get("is_default") != null && Boolean.TRUE.equals(body.get("is_default"))) {
                isDefault = true;
            }
            body.put("is_default", isDefault);
            body.put("created_at", new Date());

            String id = firestoreService.create("addresses", body);
            
            // If it's the first address, or requested as default, sync with customer profile
            if (isDefault) {
                // To ensure others are not default, we can just call our logic
                if (!existing.isEmpty()) {
                    for (Map<String, Object> addr : existing) {
                        String addrId = (String) addr.get("id");
                        if (addrId == null) addrId = (String) addr.get("uid");
                        if (addrId != null) firestoreService.updateField("addresses", addrId, "is_default", false);
                    }
                }
                syncWithCustomerProfile(customerId, body);
            }

            return ResponseEntity.ok(Map.of("id", id, "message", "Address created successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAddress(@PathVariable String id, @RequestBody Map<String, Object> body) {
        try {
            // Protect is_default from being changed directly via simple update
            body.remove("is_default");
            
            firestoreService.update("addresses", id, body);
            
            // Re-sync if this address is currently the default
            Map<String, Object> updatedAddress = firestoreService.getById("addresses", id);
            if (updatedAddress != null && Boolean.TRUE.equals(updatedAddress.get("is_default"))) {
                String customerId = (String) updatedAddress.get("user_id");
                syncWithCustomerProfile(customerId, updatedAddress);
            }

            return ResponseEntity.ok(Map.of("message", "Address updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAddress(@PathVariable String id) {
        try {
            Map<String, Object> address = firestoreService.getById("addresses", id);
            if (address != null) {
                String customerId = (String) address.get("user_id");
                boolean wasDefault = Boolean.TRUE.equals(address.get("is_default"));
                
                firestoreService.delete("addresses", id);
                
                // If the deleted address was default, set the oldest remaining one as default
                if (wasDefault) {
                    List<Map<String, Object>> remaining = firestoreService.getWhere("addresses", "user_id", customerId);
                    if (!remaining.isEmpty()) {
                        Map<String, Object> newDefault = remaining.get(0);
                        String newDefaultId = (String) newDefault.get("id");
                        if (newDefaultId == null) {
                            newDefaultId = (String) newDefault.get("uid"); // Fallback
                        }
                        
                        if (newDefaultId != null) {
                            firestoreService.updateField("addresses", newDefaultId, "is_default", true);
                            syncWithCustomerProfile(customerId, newDefault);
                        }
                    } else {
                        // Cleared all addresses, optionally clear customer profile city/barangay
                        Map<String, Object> emptyData = new HashMap<>();
                        emptyData.put("city", "");
                        emptyData.put("barangay", "");
                        firestoreService.update("customers", customerId, emptyData);
                    }
                }
            }
            return ResponseEntity.ok(Map.of("message", "Address deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/set-default")
    public ResponseEntity<?> setDefaultAddress(@PathVariable String id) {
        try {
            Map<String, Object> targetAddress = firestoreService.getById("addresses", id);
            if (targetAddress == null) {
                return ResponseEntity.notFound().build();
            }

            String customerId = (String) targetAddress.get("user_id");
            if (customerId == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid address data"));
            }

            // Set all user addresses to is_default = false
            List<Map<String, Object>> allAddresses = firestoreService.getWhere("addresses", "user_id", customerId);
            for (Map<String, Object> address : allAddresses) {
                String addrId = (String) address.get("id");
                if (addrId == null) addrId = (String) address.get("uid");
                if (addrId != null) {
                    firestoreService.updateField("addresses", addrId, "is_default", false);
                }
            }

            // Set target to true
            firestoreService.updateField("addresses", id, "is_default", true);
            targetAddress.put("is_default", true);

            // Sync with customer profile
            syncWithCustomerProfile(customerId, targetAddress);

            return ResponseEntity.ok(Map.of("message", "Default address updated"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        }
    }

    private void syncWithCustomerProfile(String customerId, Map<String, Object> address) {
        try {
            Map<String, Object> updateData = new HashMap<>();
            
            Object city = address.get("city");
            if (city != null) {
                updateData.put("city", city);
            }
            
            Object barangay = address.get("barangay");
            if (barangay != null) {
                updateData.put("barangay", barangay);
            }
            
            Object unitHouseNo = address.get("unit_house_no");
            if (unitHouseNo != null) {
                updateData.put("unit_house_no", unitHouseNo);
            }

            Object street = address.get("street");
            Object addressLine = address.get("address_line");
            if (street != null) {
                updateData.put("street", street);
            } else if (addressLine != null) {
                String addrStr = addressLine.toString().trim();
                if (unitHouseNo != null) {
                    String uStr = unitHouseNo.toString().trim();
                    if (!uStr.isEmpty()) {
                        if (addrStr.toLowerCase().startsWith(uStr.toLowerCase() + " ")) {
                            addrStr = addrStr.substring(uStr.length() + 1).trim();
                        } else if (addrStr.toLowerCase().startsWith(uStr.toLowerCase() + ", ")) {
                            addrStr = addrStr.substring(uStr.length() + 2).trim();
                        }
                    }
                }
                updateData.put("street", addrStr);
            }
            
            if (!updateData.isEmpty()) {
                firestoreService.update("customers", customerId, updateData);
            }
        } catch (Exception e) {
            System.err.println("Error syncing address with customer profile: " + e.getMessage());
        }
    }
}
