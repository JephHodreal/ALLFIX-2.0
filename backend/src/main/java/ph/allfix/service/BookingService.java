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
        String bookingId = firestoreService.create("bookings", data);
        handleSlotDecrementForBooking(bookingId);
        return bookingId;
    }

    public void confirmPayment(String bookingId) throws Exception {
        Map<String, Object> booking = firestoreService.getById("bookings", bookingId);
        if (booking == null) throw new RuntimeException("Booking not found");

        Map<String, Object> updates = new HashMap<>();
        updates.put("status", "confirmed");
        updates.put("payment_confirmed", true);
        firestoreService.update("bookings", bookingId, updates);

        // Deduct vendor slot
        handleSlotDecrementForBooking(bookingId);

        // Notify customer + vendor
        String customerId = (String) booking.get("customer_id");
        String vendorId = (String) booking.get("vendor_id");
        if (customerId != null) notificationService.notify(customerId, "customer", "Your booking has been confirmed!");
        if (vendorId != null) notificationService.notify(vendorId, "vendor", "New confirmed booking assigned to you.");
    }

    public void assignPersonnel(String bookingId, String personnelId) throws Exception {
        Map<String, Object> updates = new HashMap<>();
        updates.put("personnel_id", personnelId);
        updates.put("status", "in_progress");
        firestoreService.update("bookings", bookingId, updates);

        handleSlotDecrementForBooking(bookingId);

        Map<String, Object> booking = firestoreService.getById("bookings", bookingId);
        String customerId = (String) booking.get("customer_id");
        if (customerId != null) notificationService.notify(customerId, "customer", "A personnel has been assigned to your booking.");
        notificationService.notify(personnelId, "personnel", "You have been assigned a new job.");
    }

    public void completeBooking(String bookingId) throws Exception {
        firestoreService.updateField("bookings", bookingId, "status", "completed");
        
        handleSlotDecrementForBooking(bookingId);

        Map<String, Object> booking = firestoreService.getById("bookings", bookingId);
        String customerId = (String) booking.get("customer_id");
        if (customerId != null) notificationService.notify(customerId, "customer", "Your booking has been completed! Please leave a review.");
    }

    public void requestCancellation(String bookingId) throws Exception {
        System.out.println("[CAVEMAN] requestCancellation: bookingId=" + bookingId);
        Map<String, Object> booking = firestoreService.getById("bookings", bookingId);
        if (booking == null) throw new RuntimeException("Booking not found: " + bookingId);

        // Update booking status to cancelled AND mark cancellation_requested
        Map<String, Object> updates = new HashMap<>();
        updates.put("status", "cancelled");
        updates.put("cancellation_requested", true);
        firestoreService.update("bookings", bookingId, updates);

        // Notify customer
        String customerId = (String) booking.get("customer_id");
        if (customerId != null) {
            notificationService.notify(customerId, "customer",
                "Your booking for \"" + booking.get("service_type") + "\" has been cancelled. A refund request has been submitted for admin review.");
        }

        // Notify vendor
        String vendorId = (String) booking.get("vendor_id");
        if (vendorId != null) {
            notificationService.notify(vendorId, "vendor",
                "A booking for \"" + booking.get("service_type") + "\" has been cancelled by the customer.");
        }

        System.out.println("[CAVEMAN] requestCancellation complete: status set to cancelled, notifications sent.");
    }

    public void cancelWithRefund(String bookingId, Map<String, Object> refundDetails) throws Exception {
        Map<String, Object> booking = firestoreService.getById("bookings", bookingId);
        if (booking == null) throw new RuntimeException("Booking not found");

        // 1. Create a refund record in the refunds collection
        Map<String, Object> refundData = new HashMap<>();
        refundData.put("booking_id", bookingId);
        refundData.put("customer_id", booking.get("customer_id"));
        refundData.put("customer_name", booking.get("customer_name"));
        refundData.put("reason", "Admin Cancelled Booking");
        
        // Capture refund amount correctly (handling Double/Integer/String)
        Object amt = refundDetails.get("refund_amount");
        double amount = 0.0;
        if (amt instanceof Number) {
            amount = ((Number) amt).doubleValue();
        } else if (amt instanceof String) {
            amount = Double.parseDouble((String) amt);
        }
        refundData.put("deduction_amount", 0.0); // No deduction since it is a full refund or direct refund
        refundData.put("refund_amount", amount);
        refundData.put("reference_number", refundDetails.get("reference_number"));
        refundData.put("refund_method", refundDetails.get("refund_method"));
        refundData.put("receiver_gcash_number", refundDetails.get("receiver_gcash_number"));
        refundData.put("status", "approved");
        refundData.put("notified", true);
        
        String refundId = firestoreService.create("refunds", refundData);

        // 2. Update the booking record
        Map<String, Object> bookingUpdates = new HashMap<>();
        bookingUpdates.put("status", "cancelled");
        bookingUpdates.put("cancellation_requested", true);
        bookingUpdates.put("refund_id", refundId);
        bookingUpdates.put("refund_amount", amount);
        bookingUpdates.put("refund_reference_number", refundDetails.get("reference_number"));
        bookingUpdates.put("refund_method", refundDetails.get("refund_method"));
        bookingUpdates.put("refund_receiver_gcash_number", refundDetails.get("receiver_gcash_number"));
        bookingUpdates.put("refund_processed_at", new Date());
        
        firestoreService.update("bookings", bookingId, bookingUpdates);

        // 3. Notify the customer and vendor
        String customerId = (String) booking.get("customer_id");
        if (customerId != null) {
            notificationService.notify(customerId, "customer", "Your booking has been cancelled and a refund of ₱" + amount + " has been processed.");
        }
        String vendorId = (String) booking.get("vendor_id");
        if (vendorId != null) {
            notificationService.notify(vendorId, "vendor", "A booking for \"" + booking.get("service_type") + "\" has been cancelled with a refund issued.");
        }
    }

    public void handleSlotDecrementForBooking(String bookingId) {
        try {
            Map<String, Object> booking = firestoreService.getById("bookings", bookingId);
            if (booking == null) return;

            String status = (String) booking.get("status");
            if (status == null) return;

            String lowerStatus = status.toLowerCase();
            boolean isQualifying = lowerStatus.equals("pending") || 
                                  lowerStatus.equals("assigned") || 
                                  lowerStatus.equals("in_progress") || 
                                  lowerStatus.equals("inprogress") ||
                                  lowerStatus.equals("in-progress") ||
                                  lowerStatus.equals("completed") ||
                                  lowerStatus.equals("confirmed");

            if (isQualifying) {
                Object decremented = booking.get("slot_decremented");
                if (decremented == null || !((Boolean) decremented)) {
                    String vendorId = (String) booking.get("vendor_id");
                    String date = (String) booking.get("scheduled_date");
                    String subService = (String) booking.get("sub_service");
                    String time = (String) booking.get("scheduled_time");
                    String slotId = (String) booking.get("slot_id");

                    if (vendorId != null && date != null) {
                        slotService.decrementSlot(vendorId, date, subService, time, slotId);
                        firestoreService.updateField("bookings", bookingId, "slot_decremented", true);
                        System.out.println("[CAVEMAN] Successfully decremented slot for bookingId=" + bookingId);
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("[CAVEMAN] Error in handleSlotDecrementForBooking: " + e.getMessage());
        }
    }
}
