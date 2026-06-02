package ph.allfix.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import ph.allfix.service.FirestoreService;

import java.util.*;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/services")
public class ServiceController {

    private static final Logger logger = LoggerFactory.getLogger(ServiceController.class);
    private final FirestoreService firestoreService;

    public ServiceController(FirestoreService firestoreService) {
        this.firestoreService = firestoreService;
    }

    /**
     * Strip non-serializable Firestore types (FieldValue, Timestamp) from maps
     * so Jackson can serialize the response.
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> sanitize(Map<String, Object> raw) {
        if (raw == null) return null;
        Map<String, Object> clean = new HashMap<>();
        for (Map.Entry<String, Object> entry : raw.entrySet()) {
            Object val = entry.getValue();
            if (val == null) {
                clean.put(entry.getKey(), null);
            } else if (val instanceof com.google.cloud.Timestamp) {
                clean.put(entry.getKey(), ((com.google.cloud.Timestamp) val).toDate().toString());
            } else if (val instanceof com.google.cloud.firestore.FieldValue) {
                // Skip FieldValue sentinel objects — they aren't real data
                continue;
            } else if (val instanceof Map) {
                clean.put(entry.getKey(), sanitize((Map<String, Object>) val));
            } else if (val instanceof List) {
                clean.put(entry.getKey(), sanitizeList((List<?>) val));
            } else {
                clean.put(entry.getKey(), val);
            }
        }
        return clean;
    }

    @SuppressWarnings("unchecked")
    private List<Object> sanitizeList(List<?> raw) {
        return raw.stream().map(item -> {
            if (item instanceof Map) return sanitize((Map<String, Object>) item);
            if (item instanceof com.google.cloud.Timestamp) return ((com.google.cloud.Timestamp) item).toDate().toString();
            if (item instanceof com.google.cloud.firestore.FieldValue) return null;
            return item;
        }).filter(Objects::nonNull).collect(Collectors.toList());
    }

    // ─── Get All Services ───────────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<?> getAllServices() {
        try {
            List<Map<String, Object>> services = firestoreService.getAll("services");
            List<Map<String, Object>> cleaned = services.stream().map(this::sanitize).collect(Collectors.toList());
            return ResponseEntity.ok(cleaned);
        } catch (Exception e) {
            logger.error("Failed to fetch services", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Failed to fetch services: " + e.getMessage()));
        }
    }

    // ─── Get Single Service ─────────────────────────────────────────────────
    @GetMapping("/{serviceId}")
    public ResponseEntity<?> getService(@PathVariable String serviceId) {
        try {
            Map<String, Object> service = firestoreService.getById("services", serviceId);
            if (service == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(sanitize(service));
        } catch (Exception e) {
            logger.error("Failed to fetch service: " + serviceId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Failed to fetch service: " + e.getMessage()));
        }
    }

    // ─── Create Service ─────────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<?> createService(@RequestBody Map<String, Object> body) {
        try {
            String name = (String) body.get("name");
            String description = (String) body.get("description");
            String tagline = (String) body.get("tagline");
            String imageUrl = (String) body.get("imageUrl");

            if (name == null || name.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Service name is required."));
            }
            if (description == null || description.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Service description is required."));
            }
            if (tagline == null || tagline.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Service tagline is required."));
            }

            Map<String, Object> serviceData = new HashMap<>();
            serviceData.put("name", name.trim());
            serviceData.put("description", description.trim());
            serviceData.put("tagline", tagline.trim());
            serviceData.put("imageUrl", imageUrl != null ? imageUrl.trim() : "");
            serviceData.put("subServices", new ArrayList<>());

            String id = firestoreService.create("services", serviceData);

            // Return clean response — don't return serviceData which now has FieldValue.serverTimestamp()
            logger.info("Created service: {} with id: {}", name, id);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Service created successfully.",
                "id", id,
                "name", name.trim(),
                "description", description.trim(),
                "tagline", tagline.trim()
            ));
        } catch (Exception e) {
            logger.error("Failed to create service", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Failed to create service: " + e.getMessage()));
        }
    }

    // ─── Update Service ─────────────────────────────────────────────────────
    @PutMapping("/{serviceId}")
    public ResponseEntity<?> updateService(@PathVariable String serviceId, @RequestBody Map<String, Object> body) {
        try {
            Map<String, Object> existing = firestoreService.getById("services", serviceId);

            Map<String, Object> updates = new HashMap<>();
            if (body.containsKey("name")) updates.put("name", body.get("name"));
            if (body.containsKey("description")) updates.put("description", body.get("description"));
            if (body.containsKey("tagline")) updates.put("tagline", body.get("tagline"));
            if (body.containsKey("imageUrl")) updates.put("imageUrl", body.get("imageUrl"));
            if (body.containsKey("subServices")) updates.put("subServices", body.get("subServices"));

            if (existing == null) {
                // If it doesn't exist, create it with this ID on-demand!
                firestoreService.createWithId("services", serviceId, updates);
                logger.info("Created service on-demand during update: {}", serviceId);
            } else {
                firestoreService.update("services", serviceId, updates);
                logger.info("Updated service: {}", serviceId);
            }
            return ResponseEntity.ok(Map.of("success", true, "message", "Service updated successfully."));
        } catch (Exception e) {
            logger.error("Failed to update service: " + serviceId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Failed to update service: " + e.getMessage()));
        }
    }

    // ─── Delete Service ─────────────────────────────────────────────────────
    @DeleteMapping("/{serviceId}")
    public ResponseEntity<?> deleteService(@PathVariable String serviceId) {
        try {
            firestoreService.delete("services", serviceId);
            logger.info("Deleted service: {}", serviceId);
            return ResponseEntity.ok(Map.of("success", true, "message", "Service deleted successfully."));
        } catch (Exception e) {
            logger.error("Failed to delete service: " + serviceId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Failed to delete service: " + e.getMessage()));
        }
    }

    // ─── Add Subservice ─────────────────────────────────────────────────────
    @PostMapping("/{serviceId}/subservices")
    public ResponseEntity<?> addSubservice(@PathVariable String serviceId, @RequestBody Map<String, Object> body) {
        try {
            Map<String, Object> service = firestoreService.getById("services", serviceId);
            if (service == null) {
                // Create parent service document on the fly!
                Map<String, Object> newService = new HashMap<>();
                newService.put("name", serviceId.substring(0, 1).toUpperCase() + serviceId.substring(1));
                newService.put("description", "Premium services");
                newService.put("tagline", "Specialized Services");
                newService.put("imageUrl", "");
                newService.put("subServices", new ArrayList<>());
                
                firestoreService.createWithId("services", serviceId, newService);
                service = newService;
            }

            String name = (String) body.get("name");
            String description = (String) body.get("description");
            String imageUrl = (String) body.get("imageUrl");
            List<?> workTypes = (List<?>) body.get("workTypes");
            Map<?, ?> prices = (Map<?, ?>) body.get("prices");

            if (name == null || name.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Subservice name is required."));
            }
            if (description == null || description.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Subservice description is required."));
            }

            Map<String, Object> subservice = new HashMap<>();
            subservice.put("id", UUID.randomUUID().toString());
            subservice.put("name", name.trim());
            subservice.put("description", description.trim());
            subservice.put("imageUrl", imageUrl != null ? imageUrl.trim() : "");
            subservice.put("workTypes", workTypes != null ? workTypes : new ArrayList<>());
            subservice.put("prices", prices != null ? prices : new HashMap<>());

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> subServices = (List<Map<String, Object>>) service.getOrDefault("subServices", new ArrayList<>());
            if (subServices == null) subServices = new ArrayList<>();
            subServices.add(subservice);

            firestoreService.updateField("services", serviceId, "subServices", subServices);
            logger.info("Added subservice '{}' to service '{}'", name, serviceId);
            return ResponseEntity.ok(Map.of("success", true, "message", "Subservice added successfully.", "subservice", subservice));
        } catch (Exception e) {
            logger.error("Failed to add subservice to service: " + serviceId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Failed to add subservice: " + e.getMessage()));
        }
    }

    // ─── Update Subservice ──────────────────────────────────────────────────
    @PutMapping("/{serviceId}/subservices/{subserviceId}")
    public ResponseEntity<?> updateSubservice(@PathVariable String serviceId, @PathVariable String subserviceId, @RequestBody Map<String, Object> body) {
        try {
            Map<String, Object> service = firestoreService.getById("services", serviceId);
            if (service == null) {
                // Create parent service document on the fly!
                Map<String, Object> newService = new HashMap<>();
                newService.put("name", serviceId.substring(0, 1).toUpperCase() + serviceId.substring(1));
                newService.put("description", "Premium services");
                newService.put("tagline", "Specialized Services");
                newService.put("imageUrl", "");
                newService.put("subServices", new ArrayList<>());
                
                firestoreService.createWithId("services", serviceId, newService);
                service = newService;
            }

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> subServices = (List<Map<String, Object>>) service.getOrDefault("subServices", new ArrayList<>());
            boolean found = false;
            for (int i = 0; i < subServices.size(); i++) {
                Map<String, Object> sub = subServices.get(i);
                if (subserviceId.equals(sub.get("id"))) {
                    if (body.containsKey("name")) sub.put("name", body.get("name"));
                    if (body.containsKey("description")) sub.put("description", body.get("description"));
                    if (body.containsKey("imageUrl")) sub.put("imageUrl", body.get("imageUrl"));
                    if (body.containsKey("workTypes")) sub.put("workTypes", body.get("workTypes"));
                    if (body.containsKey("prices")) sub.put("prices", body.get("prices"));
                    subServices.set(i, sub);
                    found = true;
                    break;
                }
            }

            if (!found) {
                // If it was not found, let's append it to the list as a new subservice!
                Map<String, Object> sub = new HashMap<>();
                sub.put("id", subserviceId);
                sub.put("name", body.getOrDefault("name", "New Subservice"));
                sub.put("description", body.getOrDefault("description", ""));
                sub.put("imageUrl", body.getOrDefault("imageUrl", ""));
                sub.put("workTypes", body.getOrDefault("workTypes", new ArrayList<>()));
                sub.put("prices", body.getOrDefault("prices", new HashMap<>()));
                subServices.add(sub);
            }

            firestoreService.updateField("services", serviceId, "subServices", subServices);
            logger.info("Updated/Added subservice '{}' in service '{}'", subserviceId, serviceId);
            return ResponseEntity.ok(Map.of("success", true, "message", "Subservice updated successfully."));
        } catch (Exception e) {
            logger.error("Failed to update subservice: " + subserviceId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Failed to update subservice: " + e.getMessage()));
        }
    }

    // ─── Delete Subservice ──────────────────────────────────────────────────
    @DeleteMapping("/{serviceId}/subservices/{subserviceId}")
    public ResponseEntity<?> deleteSubservice(@PathVariable String serviceId, @PathVariable String subserviceId) {
        try {
            Map<String, Object> service = firestoreService.getById("services", serviceId);
            if (service == null) {
                return ResponseEntity.notFound().build();
            }

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> subServices = (List<Map<String, Object>>) service.getOrDefault("subServices", new ArrayList<>());
            subServices.removeIf(sub -> subserviceId.equals(sub.get("id")));

            firestoreService.updateField("services", serviceId, "subServices", subServices);
            logger.info("Deleted subservice '{}' from service '{}'", subserviceId, serviceId);
            return ResponseEntity.ok(Map.of("success", true, "message", "Subservice deleted successfully."));
        } catch (Exception e) {
            logger.error("Failed to delete subservice: " + subserviceId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Failed to delete subservice: " + e.getMessage()));
        }
    }

    // ─── Work Type Requests ─────────────────────────────────────────────────
    @PostMapping("/requests/work-type")
    public ResponseEntity<?> createWorkTypeRequest(@RequestBody Map<String, Object> body) {
        try {
            String vendorId = (String) body.get("vendorId");
            String vendorName = (String) body.get("vendorName");
            String serviceId = (String) body.get("serviceId");
            String serviceName = (String) body.get("serviceName");
            String subServiceId = (String) body.get("subServiceId");
            String subServiceName = (String) body.get("subServiceName");
            String name = (String) body.get("name");
            String restrictions = (String) body.get("restrictions");

            if (vendorId == null || serviceId == null || subServiceId == null || name == null || name.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "All fields are required."));
            }

            Map<String, Object> requestData = new HashMap<>();
            requestData.put("vendorId", vendorId);
            requestData.put("vendorName", vendorName != null ? vendorName : "Vendor");
            requestData.put("serviceId", serviceId);
            requestData.put("serviceName", serviceName != null ? serviceName : serviceId);
            requestData.put("subServiceId", subServiceId);
            requestData.put("subServiceName", subServiceName != null ? subServiceName : subServiceId);
            requestData.put("name", name.trim());
            requestData.put("restrictions", restrictions != null ? restrictions.trim() : "");
            requestData.put("status", "pending");
            requestData.put("price", null);
            requestData.put("temp_delete", 0);

            String requestId = firestoreService.create("work_type_requests", requestData);
            logger.info("Created Work Type Request: {} from vendor: {}", name, vendorId);

            // Save pending work type into the vendor's profile services list
            try {
                Map<String, Object> vendor = firestoreService.getById("vendors", vendorId);
                if (vendor != null) {
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> vendorSvcs = (List<Map<String, Object>>) vendor.get("services");
                    if (vendorSvcs == null) {
                        vendorSvcs = new ArrayList<>();
                    }
                    
                    boolean vendorSvcFound = false;
                    for (Map<String, Object> vSvc : vendorSvcs) {
                        String vSvcName = (String) vSvc.get("service");
                        if (serviceName != null && serviceName.equalsIgnoreCase(vSvcName)) {
                            @SuppressWarnings("unchecked")
                            List<Map<String, Object>> vWorkTypes = (List<Map<String, Object>>) vSvc.get("work_types");
                            if (vWorkTypes == null) {
                                vWorkTypes = new ArrayList<>();
                            }
                            
                            boolean wtFound = false;
                            for (Map<String, Object> vWt : vWorkTypes) {
                                String vWtName = (String) vWt.get("name");
                                String vWtSub = (String) vWt.get("subService");
                                if (name.equalsIgnoreCase(vWtName) && subServiceName.equalsIgnoreCase(vWtSub)) {
                                    vWt.put("status", "pending");
                                    vWt.put("restrictions", restrictions != null ? restrictions.trim() : "");
                                    wtFound = true;
                                    break;
                                }
                            }
                            
                            if (!wtFound) {
                                Map<String, Object> newWt = new HashMap<>();
                                newWt.put("name", name.trim());
                                newWt.put("subService", subServiceName);
                                newWt.put("price", "TBD");
                                newWt.put("status", "pending");
                                newWt.put("restrictions", restrictions != null ? restrictions.trim() : "");
                                vWorkTypes.add(newWt);
                            }
                            
                            vSvc.put("work_types", vWorkTypes);
                            vendorSvcFound = true;
                            break;
                        }
                    }
                    
                    if (!vendorSvcFound) {
                        Map<String, Object> newVSvc = new HashMap<>();
                        newVSvc.put("service", serviceName != null ? serviceName : serviceId);
                        
                        List<String> subList = new ArrayList<>();
                        subList.add(subServiceName);
                        newVSvc.put("sub_services", subList);
                        
                        List<Map<String, Object>> vWorkTypes = new ArrayList<>();
                        Map<String, Object> newWt = new HashMap<>();
                        newWt.put("name", name.trim());
                        newWt.put("subService", subServiceName);
                        newWt.put("price", "TBD");
                        newWt.put("status", "pending");
                        newWt.put("restrictions", restrictions != null ? restrictions.trim() : "");
                        vWorkTypes.add(newWt);
                        newVSvc.put("work_types", vWorkTypes);
                        
                        vendorSvcs.add(newVSvc);
                    }
                    
                    firestoreService.updateField("vendors", vendorId, "services", vendorSvcs);
                    logger.info("Successfully updated vendor {}'s services list with pending work type {}", vendorId, name);
                }
            } catch (Exception ex) {
                logger.error("Failed to update vendor's service catalog during work type request creation", ex);
            }

            return ResponseEntity.ok(Map.of("success", true, "id", requestId));
        } catch (Exception e) {
            logger.error("Failed to create work type request", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Failed to create request: " + e.getMessage()));
        }
    }

    @GetMapping("/requests/work-type/vendor/{vendorId}")
    public ResponseEntity<?> getVendorWorkTypeRequests(@PathVariable String vendorId) {
        try {
            List<Map<String, Object>> requests = firestoreService.getWhereMultiple("work_type_requests", Map.of("vendorId", vendorId, "temp_delete", 0));
            List<Map<String, Object>> cleaned = requests.stream().map(this::sanitize).collect(Collectors.toList());
            return ResponseEntity.ok(cleaned);
        } catch (Exception e) {
            logger.error("Failed to fetch vendor work type requests", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Failed to fetch requests: " + e.getMessage()));
        }
    }

    @GetMapping("/requests/work-type/pending")
    public ResponseEntity<?> getPendingWorkTypeRequests() {
        try {
            List<Map<String, Object>> requests = firestoreService.getWhereMultiple("work_type_requests", Map.of("status", "pending", "temp_delete", 0));
            List<Map<String, Object>> cleaned = requests.stream().map(this::sanitize).collect(Collectors.toList());
            return ResponseEntity.ok(cleaned);
        } catch (Exception e) {
            logger.error("Failed to fetch pending work type requests", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Failed to fetch pending requests: " + e.getMessage()));
        }
    }

    @SuppressWarnings("unchecked")
    @PostMapping("/requests/work-type/{requestId}/approve")
    public ResponseEntity<?> approveWorkTypeRequest(@PathVariable String requestId, @RequestBody Map<String, Object> body) {
        try {
            String price = (String) body.get("price");
            if (price == null || price.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Price is required to approve work type."));
            }

            Map<String, Object> request = firestoreService.getById("work_type_requests", requestId);
            if (request == null) {
                return ResponseEntity.notFound().build();
            }

            String serviceId = (String) request.get("serviceId");
            String serviceName = (String) request.get("serviceName");
            String subServiceId = (String) request.get("subServiceId");
            String subServiceName = (String) request.get("subServiceName");
            String name = (String) request.get("name");
            String vendorId = (String) request.get("vendorId");

            Map<String, Object> service = firestoreService.getById("services", serviceId);
            if (service == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Parent service category not found."));
            }

            List<Map<String, Object>> subServices = (List<Map<String, Object>>) service.get("subServices");
            if (subServices == null) {
                subServices = new ArrayList<>();
            }

            boolean subFound = false;
            for (Map<String, Object> sub : subServices) {
                if (subServiceId.equals(sub.get("id")) || subServiceId.equalsIgnoreCase((String) sub.get("name"))) {
                    List<String> workTypes = (List<String>) sub.get("workTypes");
                    if (workTypes == null) {
                        workTypes = new ArrayList<>();
                    }
                    if (!workTypes.contains(name)) {
                        workTypes.add(name);
                    }
                    sub.put("workTypes", workTypes);

                    Map<String, Object> prices = (Map<String, Object>) sub.get("prices");
                    if (prices == null) {
                        prices = new HashMap<>();
                    }
                    prices.put(name, price);
                    sub.put("prices", prices);

                    subFound = true;
                    break;
                }
            }

            if (!subFound) {
                return ResponseEntity.badRequest().body(Map.of("message", "Sub service not found in service category."));
            }

            // Update main service
            firestoreService.updateField("services", serviceId, "subServices", subServices);

            // Update request
            Map<String, Object> updates = new HashMap<>();
            updates.put("status", "approved");
            updates.put("price", price);
            firestoreService.update("work_type_requests", requestId, updates);

            // Also update the vendor's services list to set status to approved and store pricing/restrictions
            try {
                Map<String, Object> vendor = firestoreService.getById("vendors", vendorId);
                if (vendor != null) {
                    List<Map<String, Object>> vendorSvcs = (List<Map<String, Object>>) vendor.get("services");
                    if (vendorSvcs == null) {
                        vendorSvcs = new ArrayList<>();
                    }
                    
                    boolean vendorSvcFound = false;
                    for (Map<String, Object> vSvc : vendorSvcs) {
                        String vSvcName = (String) vSvc.get("service");
                        if (serviceName != null && serviceName.equalsIgnoreCase(vSvcName)) {
                            List<Map<String, Object>> vWorkTypes = (List<Map<String, Object>>) vSvc.get("work_types");
                            if (vWorkTypes == null) {
                                vWorkTypes = new ArrayList<>();
                            }
                            
                            boolean wtFound = false;
                            for (Map<String, Object> vWt : vWorkTypes) {
                                String vWtName = (String) vWt.get("name");
                                String vWtSub = (String) vWt.get("subService");
                                if (name.equalsIgnoreCase(vWtName) && subServiceName.equalsIgnoreCase(vWtSub)) {
                                    vWt.put("price", price);
                                    vWt.put("status", "approved");
                                    vWt.put("restrictions", request.getOrDefault("restrictions", ""));
                                    wtFound = true;
                                    break;
                                }
                            }
                            
                            if (!wtFound) {
                                Map<String, Object> newWt = new HashMap<>();
                                newWt.put("name", name);
                                newWt.put("subService", subServiceName);
                                newWt.put("price", price);
                                newWt.put("status", "approved");
                                newWt.put("restrictions", request.getOrDefault("restrictions", ""));
                                vWorkTypes.add(newWt);
                            }
                            
                            vSvc.put("work_types", vWorkTypes);
                            vendorSvcFound = true;
                            break;
                        }
                    }
                    
                    if (!vendorSvcFound) {
                        Map<String, Object> newVSvc = new HashMap<>();
                        newVSvc.put("service", serviceName != null ? serviceName : serviceId);
                        
                        List<String> subList = new ArrayList<>();
                        subList.add(subServiceName);
                        newVSvc.put("sub_services", subList);
                        
                        List<Map<String, Object>> vWorkTypes = new ArrayList<>();
                        Map<String, Object> newWt = new HashMap<>();
                        newWt.put("name", name);
                        newWt.put("subService", subServiceName);
                        newWt.put("price", price);
                        newWt.put("status", "approved");
                        newWt.put("restrictions", request.getOrDefault("restrictions", ""));
                        vWorkTypes.add(newWt);
                        newVSvc.put("work_types", vWorkTypes);
                        
                        vendorSvcs.add(newVSvc);
                    }
                    
                    firestoreService.updateField("vendors", vendorId, "services", vendorSvcs);
                    logger.info("Successfully updated vendor {}'s services list with approved work type {}", vendorId, name);
                }
            } catch (Exception ex) {
                logger.error("Failed to update vendor's service catalog during work type approval", ex);
            }

            logger.info("Approved Work Type Request: {} and added to service: {}", requestId, serviceId);
            return ResponseEntity.ok(Map.of("success", true, "message", "Work Type request approved successfully."));
        } catch (Exception e) {
            logger.error("Failed to approve work type request", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Failed to approve request: " + e.getMessage()));
        }
    }

    @PostMapping("/requests/work-type/{requestId}/reject")
    public ResponseEntity<?> rejectWorkTypeRequest(@PathVariable String requestId) {
        try {
            Map<String, Object> request = firestoreService.getById("work_type_requests", requestId);
            if (request == null) {
                return ResponseEntity.notFound().build();
            }

            firestoreService.updateField("work_type_requests", requestId, "status", "rejected");

            // Also update the status inside the vendor's services array!
            try {
                String vendorId = (String) request.get("vendorId");
                String serviceName = (String) request.get("serviceName");
                String subServiceName = (String) request.get("subServiceName");
                String name = (String) request.get("name");
                
                Map<String, Object> vendor = firestoreService.getById("vendors", vendorId);
                if (vendor != null) {
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> vendorSvcs = (List<Map<String, Object>>) vendor.get("services");
                    if (vendorSvcs != null) {
                        for (Map<String, Object> vSvc : vendorSvcs) {
                            String vSvcName = (String) vSvc.get("service");
                            if (serviceName != null && serviceName.equalsIgnoreCase(vSvcName)) {
                                @SuppressWarnings("unchecked")
                                List<Map<String, Object>> vWorkTypes = (List<Map<String, Object>>) vSvc.get("work_types");
                                if (vWorkTypes != null) {
                                    for (Map<String, Object> vWt : vWorkTypes) {
                                        String vWtName = (String) vWt.get("name");
                                        String vWtSub = (String) vWt.get("subService");
                                        if (name.equalsIgnoreCase(vWtName) && subServiceName.equalsIgnoreCase(vWtSub)) {
                                            vWt.put("status", "rejected");
                                            break;
                                        }
                                    }
                                    vSvc.put("work_types", vWorkTypes);
                                }
                                break;
                            }
                        }
                        firestoreService.updateField("vendors", vendorId, "services", vendorSvcs);
                    }
                }
            } catch (Exception ex) {
                logger.error("Failed to update vendor's services list on work type rejection", ex);
            }

            logger.info("Rejected Work Type Request: {}", requestId);
            return ResponseEntity.ok(Map.of("success", true, "message", "Work Type request rejected."));
        } catch (Exception e) {
            logger.error("Failed to reject work type request", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Failed to reject request: " + e.getMessage()));
        }
    }

    // ─── Main Service Requests ──────────────────────────────────────────────
    @PostMapping("/requests/main-service")
    public ResponseEntity<?> createMainServiceRequest(@RequestBody Map<String, Object> body) {
        try {
            String vendorId = (String) body.get("vendorId");
            String vendorName = (String) body.get("vendorName");
            String name = (String) body.get("name");
            String tagline = (String) body.get("tagline");
            String description = (String) body.get("description");

            if (vendorId == null || name == null || name.isBlank() || tagline == null || tagline.isBlank() || description == null || description.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "All fields are required."));
            }

            Map<String, Object> requestData = new HashMap<>();
            requestData.put("vendorId", vendorId);
            requestData.put("vendorName", vendorName != null ? vendorName : "Vendor");
            requestData.put("name", name.trim());
            requestData.put("tagline", tagline.trim());
            requestData.put("description", description.trim());
            requestData.put("status", "pending");
            requestData.put("temp_delete", 0);

            String requestId = firestoreService.create("main_service_requests", requestData);
            logger.info("Created Main Service Request: {} from vendor: {}", name, vendorId);
            return ResponseEntity.ok(Map.of("success", true, "id", requestId));
        } catch (Exception e) {
            logger.error("Failed to create main service request", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Failed to create request: " + e.getMessage()));
        }
    }

    @GetMapping("/requests/main-service/pending")
    public ResponseEntity<?> getPendingMainServiceRequests() {
        try {
            List<Map<String, Object>> requests = firestoreService.getWhereMultiple("main_service_requests", Map.of("status", "pending", "temp_delete", 0));
            List<Map<String, Object>> cleaned = requests.stream().map(this::sanitize).collect(Collectors.toList());
            return ResponseEntity.ok(cleaned);
        } catch (Exception e) {
            logger.error("Failed to fetch pending main service requests", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Failed to fetch pending requests: " + e.getMessage()));
        }
    }

    @GetMapping("/requests/main-service/vendor/{vendorId}")
    public ResponseEntity<?> getVendorMainServiceRequests(@PathVariable String vendorId) {
        try {
            List<Map<String, Object>> requests = firestoreService.getWhereMultiple("main_service_requests", Map.of("vendorId", vendorId, "temp_delete", 0));
            List<Map<String, Object>> cleaned = requests.stream().map(this::sanitize).collect(Collectors.toList());
            return ResponseEntity.ok(cleaned);
        } catch (Exception e) {
            logger.error("Failed to fetch vendor main service requests", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Failed to fetch requests: " + e.getMessage()));
        }
    }

    @PostMapping("/requests/main-service/{requestId}/approve")
    public ResponseEntity<?> approveMainServiceRequest(@PathVariable String requestId) {
        try {
            Map<String, Object> request = firestoreService.getById("main_service_requests", requestId);
            if (request == null) {
                return ResponseEntity.notFound().build();
            }

            String name = (String) request.get("name");
            String tagline = (String) request.get("tagline");
            String description = (String) request.get("description");

            // Create service category officially
            Map<String, Object> serviceData = new HashMap<>();
            serviceData.put("name", name);
            serviceData.put("tagline", tagline);
            serviceData.put("description", description);
            serviceData.put("imageUrl", "");
            serviceData.put("subServices", new ArrayList<>());

            String serviceId = firestoreService.create("services", serviceData);

            // Update request
            firestoreService.updateField("main_service_requests", requestId, "status", "approved");

            logger.info("Approved Main Service Request: {} -> Official Service ID: {}", requestId, serviceId);
            return ResponseEntity.ok(Map.of("success", true, "message", "Main Service request approved and created."));
        } catch (Exception e) {
            logger.error("Failed to approve main service request", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Failed to approve request: " + e.getMessage()));
        }
    }

    @PostMapping("/requests/main-service/{requestId}/reject")
    public ResponseEntity<?> rejectMainServiceRequest(@PathVariable String requestId) {
        try {
            Map<String, Object> request = firestoreService.getById("main_service_requests", requestId);
            if (request == null) {
                return ResponseEntity.notFound().build();
            }

            firestoreService.updateField("main_service_requests", requestId, "status", "rejected");
            logger.info("Rejected Main Service Request: {}", requestId);
            return ResponseEntity.ok(Map.of("success", true, "message", "Main Service request rejected."));
        } catch (Exception e) {
            logger.error("Failed to reject main service request", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Failed to reject request: " + e.getMessage()));
        }
    }

    // ─── Sub Service Requests ───────────────────────────────────────────────
    @PostMapping("/requests/sub-service")
    public ResponseEntity<?> createSubServiceRequest(@RequestBody Map<String, Object> body) {
        try {
            String vendorId = (String) body.get("vendorId");
            String vendorName = (String) body.get("vendorName");
            String serviceId = (String) body.get("serviceId");
            String serviceName = (String) body.get("serviceName");
            String name = (String) body.get("name");
            String description = (String) body.get("description");

            if (vendorId == null || serviceId == null || name == null || name.isBlank() || description == null || description.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "All fields are required."));
            }

            Map<String, Object> requestData = new HashMap<>();
            requestData.put("vendorId", vendorId);
            requestData.put("vendorName", vendorName != null ? vendorName : "Vendor");
            requestData.put("serviceId", serviceId);
            requestData.put("serviceName", serviceName != null ? serviceName : serviceId);
            requestData.put("name", name.trim());
            requestData.put("description", description.trim());
            requestData.put("status", "pending");
            requestData.put("temp_delete", 0);

            String requestId = firestoreService.create("sub_service_requests", requestData);
            logger.info("Created Sub Service Request: {} from vendor: {}", name, vendorId);
            return ResponseEntity.ok(Map.of("success", true, "id", requestId));
        } catch (Exception e) {
            logger.error("Failed to create sub service request", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Failed to create request: " + e.getMessage()));
        }
    }

    @GetMapping("/requests/sub-service/pending")
    public ResponseEntity<?> getPendingSubServiceRequests() {
        try {
            List<Map<String, Object>> requests = firestoreService.getWhereMultiple("sub_service_requests", Map.of("status", "pending", "temp_delete", 0));
            List<Map<String, Object>> cleaned = requests.stream().map(this::sanitize).collect(Collectors.toList());
            return ResponseEntity.ok(cleaned);
        } catch (Exception e) {
            logger.error("Failed to fetch pending sub service requests", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Failed to fetch pending requests: " + e.getMessage()));
        }
    }

    @GetMapping("/requests/sub-service/vendor/{vendorId}")
    public ResponseEntity<?> getVendorSubServiceRequests(@PathVariable String vendorId) {
        try {
            List<Map<String, Object>> requests = firestoreService.getWhereMultiple("sub_service_requests", Map.of("vendorId", vendorId, "temp_delete", 0));
            List<Map<String, Object>> cleaned = requests.stream().map(this::sanitize).collect(Collectors.toList());
            return ResponseEntity.ok(cleaned);
        } catch (Exception e) {
            logger.error("Failed to fetch vendor sub service requests", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Failed to fetch requests: " + e.getMessage()));
        }
    }

    @SuppressWarnings("unchecked")
    @PostMapping("/requests/sub-service/{requestId}/approve")
    public ResponseEntity<?> approveSubServiceRequest(@PathVariable String requestId) {
        try {
            Map<String, Object> request = firestoreService.getById("sub_service_requests", requestId);
            if (request == null) {
                return ResponseEntity.notFound().build();
            }

            String serviceId = (String) request.get("serviceId");
            String name = (String) request.get("name");
            String description = (String) request.get("description");

            Map<String, Object> service = firestoreService.getById("services", serviceId);
            if (service == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Parent service category not found."));
            }

            List<Map<String, Object>> subServices = (List<Map<String, Object>>) service.get("subServices");
            if (subServices == null) {
                subServices = new ArrayList<>();
            }

            // Create subservice map
            Map<String, Object> subservice = new HashMap<>();
            subservice.put("id", UUID.randomUUID().toString());
            subservice.put("name", name);
            subservice.put("description", description);
            subservice.put("imageUrl", "");
            subservice.put("workTypes", new ArrayList<>());
            subservice.put("prices", new HashMap<>());

            subServices.add(subservice);

            // Update main service
            firestoreService.updateField("services", serviceId, "subServices", subServices);

            // Update request
            firestoreService.updateField("sub_service_requests", requestId, "status", "approved");

            logger.info("Approved Sub Service Request: {} -> Added to service category: {}", requestId, serviceId);
            return ResponseEntity.ok(Map.of("success", true, "message", "Sub Service request approved and added."));
        } catch (Exception e) {
            logger.error("Failed to approve sub service request", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Failed to approve request: " + e.getMessage()));
        }
    }

    @PostMapping("/requests/sub-service/{requestId}/reject")
    public ResponseEntity<?> rejectSubServiceRequest(@PathVariable String requestId) {
        try {
            Map<String, Object> request = firestoreService.getById("sub_service_requests", requestId);
            if (request == null) {
                return ResponseEntity.notFound().build();
            }

            firestoreService.updateField("sub_service_requests", requestId, "status", "rejected");
            logger.info("Rejected Sub Service Request: {}", requestId);
            return ResponseEntity.ok(Map.of("success", true, "message", "Sub Service request rejected."));
        } catch (Exception e) {
            logger.error("Failed to reject sub service request", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Failed to reject request: " + e.getMessage()));
        }
    }
}
