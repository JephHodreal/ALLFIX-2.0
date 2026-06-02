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
                int available = ((Number) slot.getOrDefault("available_slots", 0)).intValue();
                if (available > 0) {
                    firestoreService.increment("vendor_slots", slotId, "available_slots", -1);
                    System.out.println("[SlotService] Successfully decremented slot using slotId=" + slotId);
                } else {
                    System.out.println("[SlotService] Slot with slotId=" + slotId + " has no available slots left (" + available + ")");
                }
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
            int available = ((Number) targetSlot.getOrDefault("available_slots", 0)).intValue();
            if (available > 0) {
                firestoreService.increment("vendor_slots", targetSlotId, "available_slots", -1);
                System.out.println("[SlotService] Successfully decremented fallback target slotId=" + targetSlotId);
            }
        } else {
            System.out.println("[SlotService] No vendor slots found matching vendorId=" + vendorId + ", date=" + date + ", subService=" + subService);
        }
    }

    public List<Map<String, Object>> getAvailableVendors(String serviceType, String date) throws Exception {
        // Get all vendor slots for the date with available > 0
        List<Map<String, Object>> slots = firestoreService.getWhere("vendor_slots", "slot_date", date);
        List<String> vendorIds = new ArrayList<>();
        for (Map<String, Object> slot : slots) {
            int available = ((Number) slot.getOrDefault("available_slots", 0)).intValue();
            if (available > 0) vendorIds.add((String) slot.get("vendor_id"));
        }

        // Get vendors matching service type and in the available list
        List<Map<String, Object>> vendors = firestoreService.getWhere("vendors", "service_type", serviceType);
        return vendors.stream()
                .filter(v -> Boolean.TRUE.equals(v.get("is_approved")) && vendorIds.contains(v.get("id")))
                .toList();
    }

    public List<Map<String, Object>> getAvailableBySubService(String serviceType, String subService, String date) throws Exception {
        // Get all vendor slots for the date with service/sub-service match and available > 0
        List<Map<String, Object>> slots = firestoreService.getWhere("vendor_slots", "slot_date", date);
        List<String> vendorIds = new ArrayList<>();
        for (Map<String, Object> slot : slots) {
            int available = ((Number) slot.getOrDefault("available_slots", 0)).intValue();
            String slotService = (String) slot.get("service_type");
            String slotSubService = (String) slot.get("sub_service");
            if (available > 0 && serviceType.equals(slotService) && subService.equals(slotSubService)) {
                vendorIds.add((String) slot.get("vendor_id"));
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
            
            // Check availability: use available_slots first, fallback to total_slots
            int available = 0;
            Object availObj = slot.get("available_slots");
            Object totalObj = slot.get("total_slots");
            System.out.println("[SlotService] CAVEMAN:   available_slots raw=" + availObj + " (type=" + (availObj == null ? "null" : availObj.getClass().getName()) + ")");
            System.out.println("[SlotService] CAVEMAN:   total_slots raw=" + totalObj + " (type=" + (totalObj == null ? "null" : totalObj.getClass().getName()) + ")");
            
            if (availObj != null && availObj instanceof Number) {
                available = ((Number) availObj).intValue();
            } else if (totalObj != null && totalObj instanceof Number) {
                // Fallback: if available_slots not set, use total_slots
                available = ((Number) totalObj).intValue();
                System.out.println("[SlotService] CAVEMAN:   FALLBACK: using total_slots=" + available + " since available_slots is missing");
            }
            System.out.println("[SlotService] CAVEMAN:   Effective available=" + available);
            
            if (available <= 0) {
                System.out.println("[SlotService]   SKIP slot (no available) vendor=" + slot.get("vendor_id"));
                continue;
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
                
                int totalSlots = 0;
                if (totalObj != null && totalObj instanceof Number) {
                    totalSlots = ((Number) totalObj).intValue();
                } else {
                    totalSlots = available;
                }
                
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
                                    "active".equalsIgnoreCase(status) ||
                                    "pending".equalsIgnoreCase(status) ||
                                    "confirmed".equalsIgnoreCase(status) ||
                                    "in_progress".equalsIgnoreCase(status) ||
                                    "in-progress".equalsIgnoreCase(status)
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
                    System.out.println("[SlotService] CAVEMAN: Slot validation: vendor=" + slotVendorId + ", date=" + slotDate + ", subService=" + slotSubService + " -> activeBookings=" + activeBookingsCount + ", totalSlots=" + totalSlots + ", available=" + available);
                } catch (Exception e) {
                    System.err.println("[SlotService] CAVEMAN ERROR checking bookings count for slot: " + e.getMessage());
                }
                
                if (activeBookingsCount >= totalSlots) {
                    System.out.println("[SlotService] CAVEMAN:   SKIP slot (fully booked/occupied: bookings=" + activeBookingsCount + " >= total_slots=" + totalSlots + ") vendor=" + slotVendorId);
                    continue;
                }
                
                int effectiveAvailable = Math.min(available, totalSlots - (int) activeBookingsCount);
                if (effectiveAvailable <= 0) {
                    System.out.println("[SlotService] CAVEMAN:   SKIP slot (effective available <= 0) vendor=" + slotVendorId);
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
                    for (Object sObj : servicesList) {
                        if (!(sObj instanceof Map)) continue;
                        Map<?, ?> sMap = (Map<?, ?>) sObj;
                        Object sName = sMap.get("service");
                        if (sName instanceof String) {
                            String sNameStr = (String) sName;
                            boolean matchesService = (serviceName != null && sNameStr.equalsIgnoreCase(serviceName)) ||
                                                     (serviceBrand != null && sNameStr.equalsIgnoreCase(serviceBrand));
                            if (matchesService) {
                                Object workTypesObj = sMap.get("work_types");
                                if (workTypesObj instanceof List) {
                                    List<?> wtList = (List<?>) workTypesObj;
                                    for (Object wtObj : wtList) {
                                        if (!(wtObj instanceof Map)) continue;
                                        Map<?, ?> wtMap = (Map<?, ?>) wtObj;
                                        Object wtName = wtMap.get("name");
                                        Object wtStatus = wtMap.get("status");
                                        Object wtSub = wtMap.get("subService");
                                        if (wtName instanceof String && workType != null &&
                                            ((String) wtName).equalsIgnoreCase(workType) &&
                                            "approved".equalsIgnoreCase(wtStatus instanceof String ? (String) wtStatus : String.valueOf(wtStatus))) {
                                            if (subService != null && !subService.isEmpty() && !"null".equalsIgnoreCase(subService)) {
                                                if (wtSub instanceof String && ((String) wtSub).equalsIgnoreCase(subService)) {
                                                    System.out.println("[SlotService]   VENDOR " + vId + " MATCHED (with sub-service)");
                                                    return true;
                                                }
                                            } else {
                                                System.out.println("[SlotService]   VENDOR " + vId + " MATCHED (no sub filter)");
                                                return true;
                                            }
                                        }
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
}
