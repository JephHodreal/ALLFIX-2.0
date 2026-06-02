package ph.allfix.service;

import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class BookingService {

    private final FirestoreService firestoreService;
    private final NotificationService notificationService;
    private final SlotService slotService;

    public BookingService(FirestoreService firestoreService, NotificationService notificationService, SlotService slotService) {
        this.firestoreService = firestoreService;
        this.notificationService = notificationService;
        this.slotService = slotService;
    }

    public String createBooking(Map<String, Object> data) throws Exception {
        String scheduledDate = (String) data.get("scheduled_date");
        String scheduledTime = (String) data.get("scheduled_time");
        if (scheduledDate != null && scheduledTime != null) {
            try {
                java.time.LocalDate today = java.time.LocalDate.now(java.time.ZoneId.of("Asia/Manila"));
                java.time.LocalDate selDate = java.time.LocalDate.parse(scheduledDate);
                if (selDate.isBefore(today)) {
                    throw new IllegalArgumentException("The selected preferred date must be today or in the future.");
                }
                if (selDate.equals(today)) {
                    java.time.LocalTime nowTime = java.time.LocalTime.now(java.time.ZoneId.of("Asia/Manila"));
                    java.time.LocalTime selTime = java.time.LocalTime.parse(scheduledTime);
                    if (selTime.isBefore(nowTime)) {
                        throw new IllegalArgumentException("The selected preferred start time has already passed for today.");
                    }
                }
            } catch (java.time.format.DateTimeParseException e) {
                // Ignore parsing errors for non-standard formats
            }
        }

        data.put("status", "pending");
        data.put("payment_confirmed", false);
        data.put("cancellation_requested", false);
        data.put("refund_requested", false);
        data.put("refund_status", "none");
        return firestoreService.create("bookings", data);
    }

    public void confirmPayment(String bookingId) throws Exception {
        Map<String, Object> booking = firestoreService.getById("bookings", bookingId);
        if (booking == null) throw new RuntimeException("Booking not found");

        Map<String, Object> updates = new HashMap<>();
        updates.put("status", "confirmed");
        updates.put("payment_confirmed", true);
        firestoreService.update("bookings", bookingId, updates);

        // Deduct vendor slot
        String vendorId = (String) booking.get("vendor_id");
        String date = (String) booking.get("scheduled_date");
        String subService = (String) booking.get("sub_service");
        String time = (String) booking.get("scheduled_time");
        String slotId = (String) booking.get("slot_id");
        if (vendorId != null && date != null) {
            slotService.decrementSlot(vendorId, date, subService, time, slotId);
        }

        // Notify customer + vendor
        String customerId = (String) booking.get("customer_id");
        if (customerId != null) notificationService.notify(customerId, "customer", "Your booking has been confirmed!");
        if (vendorId != null) notificationService.notify(vendorId, "vendor", "New confirmed booking assigned to you.");
    }

    public void assignPersonnel(String bookingId, String personnelId) throws Exception {
        Map<String, Object> updates = new HashMap<>();
        updates.put("personnel_id", personnelId);
        updates.put("status", "in_progress");
        firestoreService.update("bookings", bookingId, updates);

        Map<String, Object> booking = firestoreService.getById("bookings", bookingId);
        String customerId = (String) booking.get("customer_id");
        if (customerId != null) notificationService.notify(customerId, "customer", "A personnel has been assigned to your booking.");
        notificationService.notify(personnelId, "personnel", "You have been assigned a new job.");
    }

    public void completeBooking(String bookingId) throws Exception {
        firestoreService.updateField("bookings", bookingId, "status", "completed");
        Map<String, Object> booking = firestoreService.getById("bookings", bookingId);
        String customerId = (String) booking.get("customer_id");
        if (customerId != null) notificationService.notify(customerId, "customer", "Your booking has been completed! Please leave a review.");
    }

    public void requestCancellation(String bookingId) throws Exception {
        firestoreService.updateField("bookings", bookingId, "cancellation_requested", true);
    }
}
