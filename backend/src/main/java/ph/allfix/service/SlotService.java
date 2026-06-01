package ph.allfix.service;

import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class SlotService {

    private final FirestoreService firestoreService;

    public SlotService(FirestoreService firestoreService) {
        this.firestoreService = firestoreService;
    }

    public List<Map<String, Object>> getVendorSlots(String vendorId) throws Exception {
        return firestoreService.getWhere("vendor_slots", "vendor_id", vendorId);
    }

    public String createSlot(Map<String, Object> data) throws Exception {
        return firestoreService.create("vendor_slots", data);
    }

    public void decrementSlot(String vendorId, String date) throws Exception {
        decrementSlot(vendorId, date, null, null, null);
    }

    public void decrementSlot(String vendorId, String date, String subService, String time) throws Exception {
        decrementSlot(vendorId, date, subService, time, null);
    }

    public void decrementSlot(String vendorId, String date, String subService, String time, String slotId) throws Exception {
        System.out.println("[SlotService] decrementSlot: vendorId=" + vendorId + ", date=" + date + ", subService=" + subService + ", time=" + time + ", slotId=" + slotId);
        if (slotId != null && !slotId.isEmpty()) {
            Map<String, Object> slot = firestoreService.getById("vendor_slots", slotId);
            if (slot != null) {
                int available = 0;
                Object availObj = slot.get("available_slots");
                Object totalObj = slot.get("total_slots");
                if (availObj != null && availObj instanceof Number) {
                    available = ((Number) availObj).intValue();
                } else if (totalObj != null && totalObj instanceof Number) {
                    available = ((Number) totalObj).intValue();
                }
                int newAvailable = Math.max(0, available - 1);
                firestoreService.updateField("vendor_slots", slotId, "available_slots", newAvailable);
                System.out.println("[SlotService] Successfully decremented slot using slotId=" + slotId + " to newAvailable=" + newAvailable);
                return;
            } else {
                System.out.println("[SlotService] Slot with slotId=" + slotId + " not found in Firestore. Falling back to query filters.");
            }
        }

        Map<String, Object> filters = new HashMap<>();
        filters.put("vendor_id", vendorId);
        filters.put("slot_date", date);
        if (subService != null && !subService.isEmpty()) {
            filters.put("sub_service", subService);
        }
        List<Map<String, Object>> slots = firestoreService.getWhereMultiple("vendor_slots", filters);

        if (!slots.isEmpty()) {
            Map<String, Object> targetSlot = null;
            if (time != null && !time.isEmpty()) {
                for (Map<String, Object> slot : slots) {
                    String timeFrom = (String) slot.get("time_from");
                    String timeTo = (String) slot.get("time_to");
                    if (timeFrom != null && timeTo != null) {
                        if (isTimeWithinRange(time, timeFrom, timeTo)) {
                            targetSlot = slot;
                            break;
                        }
                    }
                }
            }
            if (targetSlot == null) {
                targetSlot = slots.get(0);
            }
            String targetSlotId = (String) targetSlot.get("id");
            int available = 0;
            Object availObj = targetSlot.get("available_slots");
            Object totalObj = targetSlot.get("total_slots");
            if (availObj != null && availObj instanceof Number) {
                available = ((Number) availObj).intValue();
            } else if (totalObj != null && totalObj instanceof Number) {
                available = ((Number) totalObj).intValue();
            }
            int newAvailable = Math.max(0, available - 1);
            firestoreService.updateField("vendor_slots", targetSlotId, "available_slots", newAvailable);
            System.out.println("[SlotService] Successfully decremented fallback target slotId=" + targetSlotId + " to newAvailable=" + newAvailable);
        } else {
            System.out.println("[SlotService] No vendor slots found matching vendorId=" + vendorId + ", date=" + date + ", subService=" + subService);
        }
    }

    public List<Map<String, Object>> getAvailableVendors(String serviceType, String date) throws Exception {
        // Get all vendor slots for the date
        List<Map<String, Object>> slots = firestoreService.getWhere("vendor_slots", "slot_date", date);
        List<String> vendorIds = new ArrayList<>();
        for (Map<String, Object> slot : slots) {
            String slotId = (String) slot.get("id");
            String vendorId = (String) slot.get("vendor_id");
            int totalSlots = ((Number) slot.getOrDefault("total_slots", 0)).intValue();

            // [CAVEMAN] If available_slots field in vendor_slots is explicitly 0 or less, skip
            Object availSlotsFieldObj = slot.get("available_slots");
            if (availSlotsFieldObj != null && availSlotsFieldObj instanceof Number) {
                int availSlotsField = ((Number) availSlotsFieldObj).intValue();
                if (availSlotsField <= 0) {
                    continue;
                }
            }

            // Count bookings for this slot
            List<Map<String, Object>> bookings = firestoreService.getWhere("bookings", "vendor_id", vendorId);
            long activeBookings = bookings.stream()
                    .filter(b -> {
                        String status = objectToString(b.get("status"));
                        boolean isActive = status != null && (
                            "pending".equalsIgnoreCase(status) ||
                            "assigned".equalsIgnoreCase(status) ||
                            "inprogress".equalsIgnoreCase(status) ||
                            "in_progress".equalsIgnoreCase(status) ||
                            "in-progress".equalsIgnoreCase(status) ||
                            "completed".equalsIgnoreCase(status)
                        );
                        if (!isActive) return false;
                        String bookingSlotId = objectToString(b.get("slot_id"));
                        return slotId != null && slotId.equals(bookingSlotId);
                    })
                    .count();
            int available = Math.max(0, totalSlots - (int) activeBookings);
            if (availSlotsFieldObj != null && availSlotsFieldObj instanceof Number) {
                int availSlotsField = ((Number) availSlotsFieldObj).intValue();
                available = Math.min(available, availSlotsField);
            }
            if (available > 0) {
                vendorIds.add(vendorId);
            }
        }

        // Get vendors matching service type and in the available list
        List<Map<String, Object>> vendors = firestoreService.getWhere("vendors", "service_type", serviceType);
        return vendors.stream()
                .filter(v -> Boolean.TRUE.equals(v.get("is_approved")) && vendorIds.contains(v.get("id")))
                .toList();
    }

    public List<Map<String, Object>> getAvailableBySubService(String serviceType, String subService, String date) throws Exception {
        // Get all vendor slots for the date
        List<Map<String, Object>> slots = firestoreService.getWhere("vendor_slots", "slot_date", date);
        List<String> vendorIds = new ArrayList<>();
        for (Map<String, Object> slot : slots) {
            String slotId = (String) slot.get("id");
            String vendorId = (String) slot.get("vendor_id");
            int totalSlots = ((Number) slot.getOrDefault("total_slots", 0)).intValue();
            String slotService = (String) slot.get("service_type");
            String slotSubService = (String) slot.get("sub_service");

            if (serviceType.equals(slotService) && subService.equals(slotSubService)) {
                // [CAVEMAN] If available_slots field in vendor_slots is explicitly 0 or less, skip
                Object availSlotsFieldObj = slot.get("available_slots");
                if (availSlotsFieldObj != null && availSlotsFieldObj instanceof Number) {
                    int availSlotsField = ((Number) availSlotsFieldObj).intValue();
                    if (availSlotsField <= 0) {
                        continue;
                    }
                }

                // Count bookings for this slot
                List<Map<String, Object>> bookings = firestoreService.getWhere("bookings", "vendor_id", vendorId);
                long activeBookings = bookings.stream()
                        .filter(b -> {
                            String status = objectToString(b.get("status"));
                            boolean isActive = status != null && (
                                "pending".equalsIgnoreCase(status) ||
                                "assigned".equalsIgnoreCase(status) ||
                                "inprogress".equalsIgnoreCase(status) ||
                                "in_progress".equalsIgnoreCase(status) ||
                                "in-progress".equalsIgnoreCase(status) ||
                                "completed".equalsIgnoreCase(status)
                            );
                            if (!isActive) return false;
                            String bookingSlotId = objectToString(b.get("slot_id"));
                            return slotId != null && slotId.equals(bookingSlotId);
                        })
                        .count();
                int available = Math.max(0, totalSlots - (int) activeBookings);
                if (availSlotsFieldObj != null && availSlotsFieldObj instanceof Number) {
                    int availSlotsField = ((Number) availSlotsFieldObj).intValue();
                    available = Math.min(available, availSlotsField);
                }
                if (available > 0) {
                    vendorIds.add(vendorId);
                }
            }
        }

        // Get vendors matching service type and in the available list
        List<Map<String, Object>> vendors = firestoreService.getWhere("vendors", "service_type", serviceType);
        return vendors.stream()
                .filter(v -> Boolean.TRUE.equals(v.get("is_approved")) && vendorIds.contains(v.get("id")))
                .toList();
    }

    public List<Map<String, Object>> getAvailableVendorsForSchedule(String serviceName, String serviceBrand, String subService, String workType, String date, String time) throws Exception {
        System.out.println("[SlotService] === getAvailableVendorsForSchedule ===");
        System.out.println("[SlotService] PARAMS: serviceName='" + serviceName + "', brand='" + serviceBrand + "', sub='" + subService + "', workType='" + workType + "', date='" + date + "', time='" + time + "'");
        
        // Get all vendor slots for the date
        List<Map<String, Object>> slots = firestoreService.getWhere("vendor_slots", "slot_date", date);
        System.out.println("[SlotService] Found " + slots.size() + " slot(s) for date " + date);
        
        // CAVEMAN: Also get ALL slots to see what dates exist
        if (slots.isEmpty()) {
            List<Map<String, Object>> allSlots = firestoreService.getAll("vendor_slots");
            System.out.println("[SlotService] CAVEMAN: Total slots in vendor_slots collection: " + allSlots.size());
            for (Map<String, Object> s : allSlots) {
                System.out.println("[SlotService] CAVEMAN:   ALL_SLOT: slot_date='" + s.get("slot_date") + "', vendor_id='" + s.get("vendor_id") + "', service_type='" + s.get("service_type") + "', sub_service='" + s.get("sub_service") + "', time_from='" + s.get("time_from") + "', time_to='" + s.get("time_to") + "', total_slots=" + s.get("total_slots") + ", available_slots=" + s.get("available_slots") + ", id='" + s.get("id") + "'");
            }
        }
        
        List<String> vendorIds = new ArrayList<>();
        Map<String, Integer> vendorAvailableSlotsMap = new HashMap<>();
        Map<String, String> vendorMatchedSlotIdMap = new HashMap<>();
        for (Map<String, Object> slot : slots) {
            System.out.println("[SlotService] CAVEMAN: RAW SLOT: " + slot);
            String slotId = objectToString(slot.get("id"));
            
            Object totalObj = slot.get("total_slots");
            int totalSlots = 5;
            if (totalObj != null && totalObj instanceof Number) {
                totalSlots = ((Number) totalObj).intValue();
            }
            
            // Check that the slot matches the selected subservice and service category
            String slotService = objectToString(slot.get("service_type"));
            String slotSubService = objectToString(slot.get("sub_service"));
            System.out.println("[SlotService] CAVEMAN:   slotService='" + slotService + "', slotSubService='" + slotSubService + "'");
            
            boolean serviceMatches = false;
            if (slotService != null && !slotService.isEmpty()) {
                if (serviceName != null && slotService.equalsIgnoreCase(serviceName)) serviceMatches = true;
                if (serviceBrand != null && slotService.equalsIgnoreCase(serviceBrand)) serviceMatches = true;
            }
            System.out.println("[SlotService] CAVEMAN:   serviceMatches=" + serviceMatches + " (comparing slot='" + slotService + "' vs name='" + serviceName + "' / brand='" + serviceBrand + "')");
            
            boolean subServiceMatches = false;
            if (subService == null || subService.isEmpty() || "null".equalsIgnoreCase(subService)) {
                subServiceMatches = (slotSubService == null || slotSubService.isEmpty());
            } else {
                subServiceMatches = (slotSubService != null && slotSubService.equalsIgnoreCase(subService));
            }
            System.out.println("[SlotService] CAVEMAN:   subServiceMatches=" + subServiceMatches + " (comparing slot='" + slotSubService + "' vs param='" + subService + "')");
            
            if (!serviceMatches || !subServiceMatches) {
                System.out.println("[SlotService]   SKIP slot (service/sub mismatch) vendor=" + slot.get("vendor_id"));
                continue;
            }
            
            // Check time range [time_from, time_to]
            String timeFrom = objectToString(slot.get("time_from"));
            String timeTo = objectToString(slot.get("time_to"));
            System.out.println("[SlotService] CAVEMAN:   time_from='" + timeFrom + "', time_to='" + timeTo + "', customer_time='" + time + "'");
            boolean inRange = isTimeWithinRange(time, timeFrom, timeTo);
            System.out.println("[SlotService]   TIME CHECK vendor=" + slot.get("vendor_id") + " => " + (inRange ? "IN RANGE" : "OUT OF RANGE"));
            if (inRange) {
                String slotVendorId = objectToString(slot.get("vendor_id"));
                String slotDate = objectToString(slot.get("slot_date"));
                
                long activeBookingsCount = 0;
                try {
                    Map<String, Object> bookingFilters = new HashMap<>();
                    bookingFilters.put("vendor_id", slotVendorId);
                    bookingFilters.put("scheduled_date", slotDate);
                    bookingFilters.put("sub_service", slotSubService);
                    List<Map<String, Object>> bookingsForSchedule = firestoreService.getWhereMultiple("bookings", bookingFilters);
                    
                    activeBookingsCount = bookingsForSchedule.stream()
                            .filter(b -> {
                                String status = objectToString(b.get("status"));
                                boolean isActive = status != null && (
                                    "pending".equalsIgnoreCase(status) ||
                                    "assigned".equalsIgnoreCase(status) ||
                                    "inprogress".equalsIgnoreCase(status) ||
                                    "in_progress".equalsIgnoreCase(status) ||
                                    "in-progress".equalsIgnoreCase(status) ||
                                    "completed".equalsIgnoreCase(status)
                                );
                                if (!isActive) return false;

                                String bookingSlotId = objectToString(b.get("slot_id"));
                                String bookingTime = objectToString(b.get("scheduled_time"));
                                
                                if (bookingSlotId != null && !bookingSlotId.isEmpty()) {
                                    return bookingSlotId.equals(slotId);
                                } else {
                                    // Fallback: check if booking's scheduled time is within the slot's time range
                                    return isTimeWithinRange(bookingTime, timeFrom, timeTo);
                                }
                            })
                            .count();
                    System.out.println("[SlotService] CAVEMAN: Slot validation: vendor=" + slotVendorId + ", date=" + slotDate + ", subService=" + slotSubService + " -> activeBookings=" + activeBookingsCount + ", totalSlots=" + totalSlots);
                } catch (Exception e) {
                    System.err.println("[SlotService] CAVEMAN ERROR checking bookings count for slot: " + e.getMessage());
                }
                
                // [CAVEMAN] If available_slots field in vendor_slots is explicitly 0 or less, skip
                Object availSlotsFieldObj = slot.get("available_slots");
                if (availSlotsFieldObj != null && availSlotsFieldObj instanceof Number) {
                    int availSlotsField = ((Number) availSlotsFieldObj).intValue();
                    if (availSlotsField <= 0) {
                        System.out.println("[SlotService] CAVEMAN:   SKIP slot (db available_slots <= 0) vendor=" + slotVendorId);
                        continue;
                    }
                }

                int effectiveAvailable = Math.max(0, totalSlots - (int) activeBookingsCount);
                if (availSlotsFieldObj != null && availSlotsFieldObj instanceof Number) {
                    int availSlotsField = ((Number) availSlotsFieldObj).intValue();
                    effectiveAvailable = Math.min(effectiveAvailable, availSlotsField);
                }
                
                if (effectiveAvailable <= 0) {
                    System.out.println("[SlotService] CAVEMAN:   SKIP slot (fully booked/occupied or db available <= 0: effectiveAvailable=" + effectiveAvailable + ") vendor=" + slotVendorId);
                    continue;
                }
                
                String vId = (String) slot.get("vendor_id");
                vendorIds.add(vId);
                vendorAvailableSlotsMap.put(vId, effectiveAvailable);
                vendorMatchedSlotIdMap.put(vId, slotId);
            }
        }

        if (vendorIds.isEmpty()) {
            System.out.println("[SlotService] No matching vendor slot IDs found, returning empty.");
            return Collections.emptyList();
        }
        System.out.println("[SlotService] Matched vendorIds from slots: " + vendorIds);

        // Get approved vendors — use Long for temp_delete since Firestore stores numbers as Long
        Map<String, Object> vendorFilters = new HashMap<>();
        vendorFilters.put("acc_approve", "approved");
        vendorFilters.put("temp_delete", 0L);
        List<Map<String, Object>> approvedVendors = firestoreService.getWhereMultiple("vendors", vendorFilters);
        System.out.println("[SlotService] Found " + approvedVendors.size() + " approved vendor(s) from DB");

        // If the strict temp_delete=0L query returned nothing, also try with int 0 as fallback
        if (approvedVendors.isEmpty()) {
            Map<String, Object> fallbackFilters = new HashMap<>();
            fallbackFilters.put("acc_approve", "approved");
            fallbackFilters.put("temp_delete", 0);
            approvedVendors = firestoreService.getWhereMultiple("vendors", fallbackFilters);
            System.out.println("[SlotService] Fallback query (int 0) found " + approvedVendors.size() + " vendor(s)");
        }

        // Filter vendors by vendorIds and whether they offer serviceName/serviceBrand and workType
        List<Map<String, Object>> result = approvedVendors.stream()
                .filter(v -> {
                    String vId = (String) v.get("id");
                    if (!vendorIds.contains(vId)) return false;

                    // [CAVEMAN] Check vendor_slots availability limit
                    try {
                        Object vendorSlotsObj = v.get("vendor_slots");
                        if (vendorSlotsObj != null) {
                            int vendorSlots = ((Number) vendorSlotsObj).intValue();
                            List<Map<String, Object>> bookings = firestoreService.getWhere("bookings", "vendor_id", vId);
                            long activeBookingsCount = bookings.stream()
                                    .filter(b -> {
                                        String status = (String) b.get("status");
                                        return status != null && ("confirmed".equalsIgnoreCase(status) || "in_progress".equalsIgnoreCase(status));
                                    })
                                    .count();
                            System.out.println("[SlotService] CAVEMAN: Vendor " + vId + " (" + v.get("company_name") + ") activeBookingsCount: " + activeBookingsCount + " / vendor_slots: " + vendorSlots);
                            if (activeBookingsCount >= vendorSlots) {
                                System.out.println("[SlotService] CAVEMAN: Vendor " + vId + " (" + v.get("company_name") + ") is fully occupied. EXCLUDING from selectable list.");
                                return false;
                            }
                        }
                    } catch (Exception e) {
                        System.err.println("[SlotService] CAVEMAN ERROR checking vendor_slots/bookings for vendor " + vId + ": " + e.getMessage());
                    }
                    
                    Object servicesObj = v.get("services");
                    if (!(servicesObj instanceof List)) {
                        System.out.println("[SlotService]   VENDOR " + vId + " has no services list");
                        return false;
                    }
                    List<?> servicesList = (List<?>) servicesObj;
                    System.out.println("[SlotService] CAVEMAN:   Evaluating Vendor " + vId + " (" + v.get("company_name") + ")");
                    System.out.println("[SlotService] CAVEMAN:     Requested serviceName='" + serviceName + "', serviceBrand='" + serviceBrand + "', subService='" + subService + "', workType='" + workType + "'");
                    System.out.println("[SlotService] CAVEMAN:     Vendor has " + servicesList.size() + " service entries");
                    
                    for (Object sObj : servicesList) {
                        if (!(sObj instanceof Map)) continue;
                        Map<?, ?> sMap = (Map<?, ?>) sObj;
                        Object sName = sMap.get("service");
                        if (sName instanceof String) {
                            String sNameStr = (String) sName;
                            boolean matchesService = cleanAndCompare(sNameStr, serviceName) || cleanAndCompare(sNameStr, serviceBrand);
                            System.out.println("[SlotService] CAVEMAN:       Comparing service: '" + sNameStr + "' vs requested '" + serviceName + "'/'" + serviceBrand + "' -> matchesService=" + matchesService);
                            
                            if (matchesService) {
                                // Check if vendor offers this subService at all
                                Object subServicesObj = sMap.get("sub_services");
                                boolean offersSubService = false;
                                List<?> subsList = subServicesObj instanceof List ? (List<?>) subServicesObj : Collections.emptyList();
                                System.out.println("[SlotService] CAVEMAN:         Vendor sub_services offered: " + subsList);
                                
                                for (Object sub : subsList) {
                                    if (sub instanceof String && cleanAndCompare((String) sub, subService)) {
                                        offersSubService = true;
                                        break;
                                    }
                                }
                                System.out.println("[SlotService] CAVEMAN:         offersSubService=" + offersSubService + " (comparing to subService='" + subService + "')");

                                if (offersSubService) {
                                    // Check if there are any custom work types defined for this sub-service on the vendor's profile
                                    Object workTypesObj = sMap.get("work_types");
                                    boolean hasWorkTypesForSub = false;
                                    boolean hasApprovedWorkTypeForSubAndName = false;
                                    List<?> wtList = workTypesObj instanceof List ? (List<?>) workTypesObj : Collections.emptyList();
                                    System.out.println("[SlotService] CAVEMAN:         Vendor custom work_types in profile: " + wtList);
                                    
                                    for (Object wtObj : wtList) {
                                        if (!(wtObj instanceof Map)) continue;
                                        Map<?, ?> wtMap = (Map<?, ?>) wtObj;
                                        Object wtSub = wtMap.get("subService");
                                        Object wtName = wtMap.get("name");
                                        Object wtStatus = wtMap.get("status");
                                        
                                        String wtSubStr = wtSub instanceof String ? (String) wtSub : "";
                                        String wtNameStr = wtName instanceof String ? (String) wtName : "";
                                        String wtStatusStr = wtStatus instanceof String ? (String) wtStatus : String.valueOf(wtStatus);
                                        
                                        if (cleanAndCompare(wtSubStr, subService)) {
                                            hasWorkTypesForSub = true;
                                            boolean nameMatches = cleanAndCompare(wtNameStr, workType);
                                            boolean isApproved = "approved".equalsIgnoreCase(wtStatusStr);
                                            System.out.println("[SlotService] CAVEMAN:           Checking work_type: name='" + wtNameStr + "', sub='" + wtSubStr + "', status='" + wtStatusStr + "' | vs requested workType='" + workType + "' -> nameMatches=" + nameMatches + ", isApproved=" + isApproved);
                                            
                                            if (nameMatches && isApproved) {
                                                hasApprovedWorkTypeForSubAndName = true;
                                            }
                                        }
                                    }
                                    
                                    // MATCHING LOGIC:
                                    // 1. If this is a base service booking (requested workType is null/empty or is equal to the sub-service name),
                                    //    we match purely on sub-service presence (offersSubService is true).
                                    // 2. If the vendor has custom work types for this sub-service, and this is NOT a base service booking,
                                    //    we strictly match the requested workType and check status.
                                    // 3. If the vendor has no custom work types for this sub-service (Base Price only),
                                    //    we match purely on sub-service presence.
                                    boolean isBaseServiceBooking = workType == null || workType.trim().isEmpty() || cleanAndCompare(workType, subService);
                                    System.out.println("[SlotService] CAVEMAN:         isBaseServiceBooking=" + isBaseServiceBooking + " (workType='" + workType + "' vs subService='" + subService + "')");
                                    System.out.println("[SlotService] CAVEMAN:         hasWorkTypesForSub=" + hasWorkTypesForSub + ", hasApprovedWorkTypeForSubAndName=" + hasApprovedWorkTypeForSubAndName);
                                    
                                    if (isBaseServiceBooking) {
                                        System.out.println("[SlotService]   VENDOR " + vId + " MATCHED (Base/Standard service booking for sub-service: '" + subService + "')");
                                        return true;
                                    } else if (hasWorkTypesForSub) {
                                        if (hasApprovedWorkTypeForSubAndName) {
                                            System.out.println("[SlotService]   VENDOR " + vId + " MATCHED (with strict work-type check)");
                                            return true;
                                        } else {
                                            System.out.println("[SlotService]   VENDOR " + vId + " REJECTED (vendor has custom work-types for '" + subService + "', but none match/approved for '" + workType + "')");
                                        }
                                    } else {
                                        System.out.println("[SlotService]   VENDOR " + vId + " MATCHED (Base Price sub-service, no custom work-types defined in profile)");
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                    System.out.println("[SlotService]   VENDOR " + vId + " REJECTED (service/workType mismatch in profile)");
                    return false;
                })
                .map(v -> {
                    Map<String, Object> newV = new HashMap<>(v);
                    String vId = (String) newV.get("id");
                    int available = vendorAvailableSlotsMap.getOrDefault(vId, 0);
                    newV.put("available_slots", available);
                    String matchedSlotId = vendorMatchedSlotIdMap.get(vId);
                    newV.put("slot_id", matchedSlotId);
                    System.out.println("[SlotService] CAVEMAN: Vendor " + vId + " assigned available_slots=" + available + ", slot_id=" + matchedSlotId);
                    return newV;
                })
                .toList();
        System.out.println("[SlotService] Final result: " + result.size() + " vendor(s)");
        return result;
    }

    /**
     * Safely convert any Firestore value to a String.
     * Handles nulls, Strings, and other object types.
     */
    private String objectToString(Object obj) {
        if (obj == null) return null;
        if (obj instanceof String) return (String) obj;
        return String.valueOf(obj);
    }

    private boolean isTimeWithinRange(String timeStr, String fromStr, String toStr) {
        if (timeStr == null || timeStr.isBlank() || fromStr == null || fromStr.isBlank() || toStr == null || toStr.isBlank()) {
            System.err.println("[SlotService] isTimeWithinRange SKIPPED — null/blank input: time='" + timeStr + "', from='" + fromStr + "', to='" + toStr + "'");
            return false;
        }
        try {
            int timeMinutes = toMinutesSinceMidnight(timeStr);
            int fromMinutes = toMinutesSinceMidnight(fromStr);
            int toMinutes = toMinutesSinceMidnight(toStr);
            System.out.println("[SlotService]   PARSED MINUTES: customer=" + timeMinutes + " (" + timeStr + "), from=" + fromMinutes + " (" + fromStr + "), to=" + toMinutes + " (" + toStr + ")");
            // Customer time must be within the vendor's available slot range (inclusive)
            return timeMinutes >= fromMinutes && timeMinutes <= toMinutes;
        } catch (Exception e) {
            System.err.println("[SlotService] isTimeWithinRange FAILED — time: '" + timeStr + "', from: '" + fromStr + "', to: '" + toStr + "' — " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Convert any common time string to minutes since midnight.
     * Handles: "HH:mm", "HH:mm:ss", "h:mm AM/PM", "hh:mm AM/PM", "HH:mm AM/PM" (invalid but tolerated),
     * and potential whitespace/special characters from URL encoding.
     */
    private int toMinutesSinceMidnight(String raw) {
        String timeStr = raw.trim();

        // Remove any non-printable or special unicode whitespace characters
        timeStr = timeStr.replaceAll("[^\\dAPMapm: ]", "").trim();

        // Normalize whitespace and case
        timeStr = timeStr.replaceAll("\\s+", " ").trim().toUpperCase();

        boolean isPM = timeStr.contains("PM");
        boolean isAM = timeStr.contains("AM");

        // Remove AM/PM suffix
        timeStr = timeStr.replaceAll("\\s*(AM|PM)", "").trim();

        // Split by colon — expected: [hour, minute] or [hour, minute, second]
        String[] parts = timeStr.split(":");
        if (parts.length < 2) throw new IllegalArgumentException("Cannot parse time: '" + raw + "' (cleaned: '" + timeStr + "')");

        int hour = Integer.parseInt(parts[0].trim());
        int minute = Integer.parseInt(parts[1].trim());
        // parts[2] (seconds) is intentionally ignored

        if (isPM || isAM) {
            // 12-hour clock
            if (isPM && hour != 12) hour += 12;
            if (isAM && hour == 12) hour = 0;
        }
        // else: already 24-hour format, no conversion needed

        return hour * 60 + minute;
    }

    /**
     * Clean and compare two strings.
     * Trim whitespace, convert multiple whitespace to single space, and ignore case.
     */
    private boolean cleanAndCompare(String s1, String s2) {
        if (s1 == null && s2 == null) return true;
        if (s1 == null || s2 == null) return false;
        String n1 = s1.trim().replaceAll("\\s+", " ").toLowerCase();
        String n2 = s2.trim().replaceAll("\\s+", " ").toLowerCase();
        return n1.equals(n2);
    }
}
