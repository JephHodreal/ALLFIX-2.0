package ph.allfix.service;

import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class BookingService {

    private final FirestoreService firestoreService;
    private final NotificationService notificationService;
    private final SlotService slotService;
    private final RefundService refundService;
    private final SequenceGeneratorService sequenceGeneratorService;

    public BookingService(FirestoreService firestoreService, NotificationService notificationService, SlotService slotService, RefundService refundService, SequenceGeneratorService sequenceGeneratorService) {
        this.firestoreService = firestoreService;
        this.notificationService = notificationService;
        this.slotService = slotService;
        this.refundService = refundService;
        this.sequenceGeneratorService = sequenceGeneratorService;
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
        String bookingId = sequenceGeneratorService.generateNextId("bookings");
        firestoreService.createWithId("bookings", bookingId, data);
        handleSlotDecrementForBooking(bookingId);

        // Send notifications for new booking
        String customerId = (String) data.get("customer_id");
        String vendorId = (String) data.get("vendor_id");
        String serviceType = (String) data.get("service_type");
        String schedDate = (String) data.get("scheduled_date");
        String schedTime = (String) data.get("scheduled_time");
        String details = "ID: " + bookingId + " - " + serviceType;
        if (vendorId != null) notificationService.notify(vendorId, "vendor", "New Booking Request", "You have a new pending booking request for " + details + ".");

        try {
            List<Map<String, Object>> admins = firestoreService.getAll("admins");
            for (Map<String, Object> admin : admins) {
                String adminId = (String) admin.get("id");
                if (adminId == null) adminId = (String) admin.get("uid");
                if (adminId != null) {
                    notificationService.notify(adminId, "admin", "New Booking",
                        "A new booking request (" + bookingId + ") for " + serviceType + " has been created.");
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to notify admins of new booking: " + e.getMessage());
        }

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
        String serviceType = (String) booking.get("service_type");
        String schedDate = (String) booking.get("scheduled_date");
        String schedTime = (String) booking.get("scheduled_time");
        String details = "ID: " + bookingId + " - " + serviceType;
        if (customerId != null) notificationService.notify(customerId, "customer", "Booking Confirmed", "Your booking for " + details + " has been confirmed!");
        if (vendorId != null) notificationService.notify(vendorId, "vendor", "Booking Confirmed", "New confirmed booking for " + details + " assigned to you.");
        
        // --- PHASE 1 REAL-TIME CHAT INIT ---
        try {
            String vendorName = "Your Provider";
            String vendorAuthUid = vendorId;
            if (vendorId != null && !vendorId.trim().isEmpty()) {
                Map<String, Object> vendor = firestoreService.getById("vendors", vendorId);
                if (vendor != null) {
                    if (vendor.get("company_name") != null) {
                        vendorName = (String) vendor.get("company_name");
                    }
                    if (vendor.get("auth_uid") != null) {
                        vendorAuthUid = (String) vendor.get("auth_uid");
                    }
                }
            }

            String customerAuthUid = customerId;
            if (customerId != null && !customerId.trim().isEmpty()) {
                Map<String, Object> customer = firestoreService.getById("customers", customerId);
                if (customer != null && customer.get("auth_uid") != null) {
                    customerAuthUid = (String) customer.get("auth_uid");
                }
            }
            
            // 1. Create Thread
            Map<String, Object> chatThread = new HashMap<>();
            chatThread.put("booking_id", bookingId);
            chatThread.put("customer_id", customerAuthUid);
            chatThread.put("vendor_id", vendorAuthUid);
            chatThread.put("status", "active");
            chatThread.put("service_type", serviceType);
            chatThread.put("customer_name", booking.get("customer_name"));
            chatThread.put("vendor_name", vendorName);
            chatThread.put("updated_at", new Date());
            firestoreService.createWithId("chat_threads", bookingId, chatThread);

            // 2. Inject System Welcome Message
            Map<String, Object> sysMsg = new HashMap<>();
            sysMsg.put("sender_id", "system");
            sysMsg.put("sender_role", "system");
            sysMsg.put("text", "Booking confirmed! You are now connected with " + vendorName + " for your " + serviceType + " on " + schedDate + " at " + schedTime + ". Feel free to share details or photos of your issue below.");
            sysMsg.put("is_logistics", false);
            firestoreService.create("chat_threads/" + bookingId + "/messages", sysMsg);
            System.out.println("BookingService: Successfully created chat thread " + bookingId);
        } catch (Exception e) {
            System.err.println("BookingService: Failed to initialize chat thread: " + e.getMessage());
        }
    }

    public void assignPersonnel(String bookingId, String personnelId) throws Exception {
        Map<String, Object> personnel = firestoreService.getById("personnel", personnelId);
        String personnelName = "A personnel";
        if (personnel != null) {
            String fName = (String) personnel.get("first_name");
            String lName = (String) personnel.get("last_name");
            personnelName = (fName != null ? fName : "") + (lName != null ? " " + lName : "");
            personnelName = personnelName.trim().isEmpty() ? "A personnel" : personnelName.trim();
        }

        Map<String, Object> updates = new HashMap<>();
        updates.put("personnel_id", personnelId);
        updates.put("personnel_name", personnelName);
        updates.put("status", "in_progress");
        firestoreService.update("bookings", bookingId, updates);

        try {
            Map<String, Object> chatUpdates = new HashMap<>();
            chatUpdates.put("technician_id", personnelId);
            chatUpdates.put("personnel_name", personnelName);
            firestoreService.update("chat_threads", bookingId, chatUpdates);
        } catch (Exception e) {
            System.err.println("BookingService: Failed to update chat thread with personnel details: " + e.getMessage());
        }

        handleSlotDecrementForBooking(bookingId);

        Map<String, Object> booking = firestoreService.getById("bookings", bookingId);
        String customerId = (String) booking.get("customer_id");
        String serviceType = (String) booking.get("service_type");
        String schedDate = (String) booking.get("scheduled_date");
        String schedTime = (String) booking.get("scheduled_time");
        String details = "ID: " + bookingId + " - " + serviceType;
        if (customerId != null) notificationService.notify(customerId, "customer", "Personnel Assigned", personnelName + " has been assigned to your booking for " + details + ".");
        notificationService.notify(personnelId, "personnel", "New Assignment", "You have been assigned a new job for " + details + ".");

        try {
            List<Map<String, Object>> admins = firestoreService.getAll("admins");
            for (Map<String, Object> admin : admins) {
                String adminId = (String) admin.get("id");
                if (adminId == null) adminId = (String) admin.get("uid");
                if (adminId != null) {
                    notificationService.notify(adminId, "admin", "Personnel Assigned", 
                        "Vendor assigned " + personnelName + " to booking " + bookingId + " (" + serviceType + "). Status is now in-progress.");
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to notify admins of personnel assignment: " + e.getMessage());
        }
    }

    public void completeBooking(String bookingId) throws Exception {
        System.out.println("BookingService.completeBooking: completing bookingId=" + bookingId);
        Map<String, Object> booking = firestoreService.getById("bookings", bookingId);
        if (booking == null) throw new RuntimeException("Booking not found: " + bookingId);

        // Fetch current system fee percentage
        double percentage = 10.0; // Default
        try {
            Map<String, Object> setting = firestoreService.getById("settings", "system_fee");
            if (setting != null && setting.get("percentage") != null) {
                percentage = ((Number) setting.get("percentage")).doubleValue();
                System.out.println("BookingService.completeBooking: fetched configured system fee percentage: " + percentage + "%");
            } else {
                System.out.println("BookingService.completeBooking: system fee setting not found, using default 10.0%");
            }
        } catch (Exception e) {
            System.err.println("Error fetching system fee setting, using default 10%: " + e.getMessage());
        }

        double price = booking.get("price") != null ? ((Number) booking.get("price")).doubleValue() : 0.0;
        double quantity = booking.get("quantity") != null ? ((Number) booking.get("quantity")).doubleValue() : 1.0;
        double totalPrice = booking.get("total_price") != null ? ((Number) booking.get("total_price")).doubleValue() : (price * quantity);
        
        double systemFee = price * quantity * (percentage / 100.0);
        double vendorEarnings = totalPrice - systemFee;

        Map<String, Object> updates = new HashMap<>();
        updates.put("status", "completed");
        updates.put("completed_at", new Date());
        updates.put("system_fee_percentage", percentage);
        updates.put("system_fee", systemFee);
        updates.put("vendor_earnings", vendorEarnings);
        
        firestoreService.update("bookings", bookingId, updates);
        System.out.println("BookingService.completeBooking: booking status set to completed, systemFee=" + systemFee + ", vendorEarnings=" + vendorEarnings);

        handleSlotDecrementForBooking(bookingId);

        String customerId = (String) booking.get("customer_id");
        String serviceType = (String) booking.get("service_type");
        String details = "ID: " + bookingId + " - " + serviceType;
        if (customerId != null) notificationService.notify(customerId, "customer", "Booking Completed", "Your booking for \"" + details + "\" has been completed! Please leave a review.");
    }

    public void requestCancellation(String bookingId) throws Exception {
        System.out.println("requestCancellation: bookingId=" + bookingId);
        Map<String, Object> booking = firestoreService.getById("bookings", bookingId);
        if (booking == null) throw new RuntimeException("Booking not found: " + bookingId);

        String currentStatus = (String) booking.get("status");
        boolean isInProgress = "in_progress".equals(currentStatus);

        Map<String, Object> updates = new HashMap<>();
        updates.put("cancellation_requested", true);
        updates.put("cancelled_by", "customer");
        updates.put("status_at_cancellation", currentStatus);

        if (isInProgress) {
            updates.put("status", "cancellation_requested");
            firestoreService.update("bookings", bookingId, updates);
            // DO NOT restore slot yet, wait for Admin resolution
        } else {
            updates.put("status", "cancelled");
            firestoreService.update("bookings", bookingId, updates);
            // Restore slot back to vendor slots
            try {
                slotService.restoreSlotForCancelledBooking(bookingId);
            } catch (Exception e) {
                System.err.println("ERROR: Failed to execute restoreSlotForCancelledBooking in requestCancellation: " + e.getMessage());
            }
        }

        // Notify admin ONLY
        String title = isInProgress ? "[URGENT] Cancellation Request" : "Cancellation Requested";
        String message = "A booking for \"" + booking.get("service_type") + "\" has been cancelled by the customer.";

        try {
            List<Map<String, Object>> admins = firestoreService.getAll("admins");
            for (Map<String, Object> admin : admins) {
                String adminId = (String) admin.get("id");
                if (adminId == null) adminId = (String) admin.get("uid");
                if (adminId != null) {
                    notificationService.notify(adminId, "admin", title, message);
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to notify admins of cancellation request: " + e.getMessage());
        }

        System.out.println("requestCancellation complete: status updated, notifications sent.");
    }

    public void resolveCancellation(String bookingId, String action, Double penaltyAmount) throws Exception {
        Map<String, Object> booking = firestoreService.getById("bookings", bookingId);
        if (booking == null) throw new RuntimeException("Booking not found");

        if ("deny".equals(action)) {
            // Revert back to in_progress
            Map<String, Object> updates = new HashMap<>();
            updates.put("status", "in_progress");
            updates.put("cancellation_requested", false);
            firestoreService.update("bookings", bookingId, updates);
            
            // Notify customer
            String customerId = (String) booking.get("customer_id");
            if (customerId != null) {
                notificationService.notify(customerId, "customer", "Cancellation Denied",
                    "Your cancellation request for \"" + booking.get("service_type") + "\" was denied. The technician is en route.");
            }

            // Notify vendor
            String vendorId = (String) booking.get("vendor_id");
            if (vendorId != null) {
                notificationService.notify(vendorId, "vendor", "Cancellation Denied",
                    "Admin has denied the customer's cancellation request for booking \"" + booking.get("service_type") + "\". Please proceed as scheduled.");
            }
            return;
        }

        // Action is "full_refund" or "penalty"
        Map<String, Object> updates = new HashMap<>();
        updates.put("status", "cancelled");
        firestoreService.update("bookings", bookingId, updates);

        // Restore slot
        try {
            slotService.restoreSlotForCancelledBooking(bookingId);
        } catch (Exception e) {
            System.err.println("ERROR: Failed to restore slot in resolveCancellation: " + e.getMessage());
        }

        // Handle refund logic
        double totalPrice = 0.0;
        if (booking.get("total_price") != null) {
            totalPrice = Double.parseDouble(booking.get("total_price").toString());
        } else if (booking.get("price") != null) {
            totalPrice = Double.parseDouble(booking.get("price").toString()) * 
                         Double.parseDouble(booking.getOrDefault("quantity", "1").toString());
        }

        double refundAmount = totalPrice;
        if ("penalty".equals(action) && penaltyAmount != null) {
            refundAmount = Math.max(0, totalPrice - penaltyAmount);
        }

        Map<String, Object> refundRecord = new HashMap<>();
        refundRecord.put("booking_id", bookingId);
        refundRecord.put("customer_id", booking.get("customer_id"));
        refundRecord.put("vendor_id", booking.get("vendor_id"));
        refundRecord.put("status", "approved"); // Auto-approve the refund portion
        refundRecord.put("amount", String.valueOf(refundAmount));
        refundRecord.put("deduction_amount", "penalty".equals(action) ? String.valueOf(penaltyAmount) : "0");
        refundRecord.put("reason", "Customer Cancellation (Admin Resolved)");
        refundRecord.put("created_at", new java.util.Date());

        firestoreService.create("refunds", refundRecord);

        // Notify customer
        String customerId = (String) booking.get("customer_id");
        if (customerId != null) {
            notificationService.notify(customerId, "customer", "Cancellation Approved",
                "Your cancellation for \"" + booking.get("service_type") + "\" was approved. Refund Amount: ₱" + refundAmount);
        }

        // Notify vendor
        String vendorId = (String) booking.get("vendor_id");
        if (vendorId != null) {
            notificationService.notify(vendorId, "vendor", "Cancellation Approved",
                "Admin has approved the cancellation request for booking \"" + booking.get("service_type") + "\".");
        }
    }

    public void cancelWithRefund(String bookingId, Map<String, Object> refundDetails) throws Exception {
        Map<String, Object> booking = firestoreService.getById("bookings", bookingId);
        if (booking == null) throw new RuntimeException("Booking not found");

        String cancelledBy = (String) refundDetails.getOrDefault("cancelled_by", "admin");
        String statusAtCancellation = (String) booking.get("status");

        // 1. Create a refund record in the refunds collection
        Map<String, Object> refundData = new HashMap<>();
        refundData.put("booking_id", bookingId);
        refundData.put("customer_id", booking.get("customer_id"));
        refundData.put("customer_name", booking.get("customer_name"));
        
        String reason = (String) refundDetails.get("reason");
        if (reason == null || reason.isBlank()) {
            reason = cancelledBy + " Cancelled Booking";
        }
        refundData.put("reason", reason);
        refundData.put("cancelled_by", cancelledBy);
        refundData.put("status_at_cancellation", statusAtCancellation);
        
        // Capture refund amount correctly (handling Double/Integer/String)
        Object amt = refundDetails.get("refund_amount");
        double amount = 0.0;
        if (amt instanceof Number) {
            amount = ((Number) amt).doubleValue();
        } else if (amt instanceof String) {
            amount = Double.parseDouble((String) amt);
        }
        
        // Handle deduction if present in refundDetails
        double deductionAmt = 0.0;
        Object dedAmt = refundDetails.get("deduction_amount");
        if (dedAmt instanceof Number) {
            deductionAmt = ((Number) dedAmt).doubleValue();
        } else if (dedAmt instanceof String) {
            deductionAmt = Double.parseDouble((String) dedAmt);
        }
        
        double dedPercent = 0.0;
        Object dedPct = refundDetails.get("deduction_percentage");
        if (dedPct instanceof Number) {
            dedPercent = ((Number) dedPct).doubleValue();
        } else if (dedPct instanceof String) {
            dedPercent = Double.parseDouble((String) dedPct);
        }

        refundData.put("deduction_amount", deductionAmt);
        refundData.put("deduction_percentage", dedPercent);
        refundData.put("refund_amount", amount);
        
        boolean isVendorCancel = "vendor".equalsIgnoreCase(cancelledBy);
        
        if (isVendorCancel) {
            refundData.put("status", "pending");
            refundData.put("notified", false);
            refundData.put("created_at", new Date());
        } else {
            refundData.put("reference_number", refundDetails.get("reference_number"));
            refundData.put("refund_method", refundDetails.get("refund_method"));
            refundData.put("receiver_gcash_number", refundDetails.get("receiver_gcash_number"));
            if (refundDetails.containsKey("proof_image_url")) {
                refundData.put("proof_image_url", refundDetails.get("proof_image_url"));
            }
            refundData.put("status", "Processed");
            refundData.put("notified", true);
            refundData.put("processed_at", new Date());
        }
        
        String refundId = firestoreService.create("refunds", refundData);

        // 2. Update the booking record
        Map<String, Object> bookingUpdates = new HashMap<>();
        bookingUpdates.put("status", "cancelled");
        bookingUpdates.put("cancellation_requested", true);
        bookingUpdates.put("cancelled_by", cancelledBy);
        bookingUpdates.put("status_at_cancellation", statusAtCancellation);
        bookingUpdates.put("refund_id", refundId);
        bookingUpdates.put("refund_amount", amount);
        
        if (isVendorCancel) {
            bookingUpdates.put("refund_status", "pending");
        } else {
            bookingUpdates.put("refund_deduction_amount", deductionAmt);
            bookingUpdates.put("refund_deduction_percentage", dedPercent);
            bookingUpdates.put("refund_reference_number", refundDetails.get("reference_number"));
            bookingUpdates.put("refund_method", refundDetails.get("refund_method"));
            bookingUpdates.put("refund_receiver_gcash_number", refundDetails.get("receiver_gcash_number"));
            if (refundDetails.containsKey("proof_image_url")) {
                bookingUpdates.put("refund_proof_image_url", refundDetails.get("proof_image_url"));
            }
            bookingUpdates.put("refund_processed_at", new Date());
            bookingUpdates.put("refund_status", "Processed");
        }
        
        firestoreService.update("bookings", bookingId, bookingUpdates);

        // Restore slot back to vendor slots
        try {
            slotService.restoreSlotForCancelledBooking(bookingId);
        } catch (Exception e) {
            System.err.println("ERROR: Failed to execute restoreSlotForCancelledBooking in cancelWithRefund: " + e.getMessage());
        }

        if (!isVendorCancel) {
            // 3. Notify the customer and vendor
            String customerId = (String) booking.get("customer_id");
            String serviceType = (String) booking.get("service_type");
            String details = "ID: " + bookingId + " - " + serviceType;
            if (customerId != null) {
                if (amount > 0) {
                    notificationService.notify(customerId, "customer", "Refund Processed", "Your booking for \"" + details + "\" has been cancelled and a refund of ₱" + amount + " has been processed.");
                } else {
                    notificationService.notify(customerId, "customer", "Booking Cancelled", "Your booking for \"" + details + "\" has been cancelled by the admin.");
                }
            }
            String vendorId = (String) booking.get("vendor_id");
            if (vendorId != null) {
                notificationService.notify(vendorId, "vendor", "Booking Cancelled", "A booking for \"ID: " + bookingId + " - " + booking.get("service_type") + "\" has been cancelled with a refund issued.");
            }

            // Trigger Email Notification
            try {
                refundService.sendRefundEmailNotification(refundId);
            } catch (Exception e) {
                System.err.println("ERROR: Failed to send cancellation refund email: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            // For vendor cancel: notify customer that their refund request has been submitted and is pending admin review.
            String customerId = (String) booking.get("customer_id");
            String serviceType = (String) booking.get("service_type");
            String details = "ID: " + bookingId + " - " + serviceType;
            if (customerId != null) {
                notificationService.notify(customerId, "customer", "Cancellation Requested", "Your booking for \"" + details + "\" has been cancelled by the vendor. A refund request has been submitted and is pending admin review.");
            }
            
            // Notify admins
            try {
                List<Map<String, Object>> admins = firestoreService.getAll("admins");
                for (Map<String, Object> admin : admins) {
                    String adminId = (String) admin.get("id");
                    if (adminId == null) adminId = (String) admin.get("uid");
                    if (adminId != null) {
                        notificationService.notify(adminId, "admin", "Refund Review Pending",
                            "Booking " + bookingId + " cancelled by vendor. A refund request of ₱" + amount + " is pending review.");
                    }
                }
            } catch (Exception e) {
                System.err.println("Failed to notify admins of vendor-cancelled booking refund request: " + e.getMessage());
            }
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
                        System.out.println("Successfully decremented slot for bookingId=" + bookingId);
                    }
                }
            }
        } catch (Exception e) {
             System.err.println("Error in handleSlotDecrementForBooking: " + e.getMessage());
         }
     }
 
     @org.springframework.scheduling.annotation.Scheduled(fixedRate = 60000)
     public void scheduledCheckAndExpireBookings() {
         checkAndExpireBookings();
     }
 
     public synchronized void checkAndExpireBookings() {
         System.out.println("Running checkAndExpireBookings automation...");
         try {
             List<Map<String, Object>> bookings = firestoreService.getAll("bookings");
             if (bookings == null) return;
 
             java.time.ZoneId manilaZone = java.time.ZoneId.of("Asia/Manila");
             java.time.LocalDate today = java.time.LocalDate.now(manilaZone);
             java.time.LocalTime nowTime = java.time.LocalTime.now(manilaZone);
             int nowMinutes = nowTime.getHour() * 60 + nowTime.getMinute();
 
             for (Map<String, Object> booking : bookings) {
                 String bookingId = (String) booking.get("id");
                 if (bookingId == null) continue;
 
                 String status = (String) booking.get("status");
                 if (status == null) continue;
 
                 status = status.trim().toLowerCase();
                 // We only check unconfirmed (pending) or unassigned (confirmed) bookings
                 if (status.equals("pending") || status.equals("confirmed")) {
                     boolean isExpired = false;
                     String slotId = (String) booking.get("slot_id");
                     Map<String, Object> slot = null;
 
                     // 1. Try to fetch by slotId
                     if (slotId != null && !slotId.isBlank()) {
                         try {
                             slot = firestoreService.getById("vendor_slots", slotId);
                         } catch (Exception e) {
                             System.err.println("Error fetching slot by ID: " + slotId + " - " + e.getMessage());
                         }
                     }
 
                     // 2. Fallback to querying slot by vendor, date, sub_service, and time
                     if (slot == null) {
                         try {
                             String vendorId = (String) booking.get("vendor_id");
                             String date = (String) booking.get("scheduled_date");
                             String subService = (String) booking.get("sub_service");
                             String time = (String) booking.get("scheduled_time");
                             if (vendorId != null && date != null) {
                                 Map<String, Object> filters = new HashMap<>();
                                 filters.put("vendor_id", vendorId);
                                 filters.put("slot_date", date);
                                 if (subService != null && !subService.isEmpty()) {
                                     filters.put("sub_service", subService);
                                 }
                                 List<Map<String, Object>> slots = firestoreService.getWhereMultiple("vendor_slots", filters);
                                 if (slots != null && !slots.isEmpty()) {
                                     if (time != null && !time.isEmpty()) {
                                         for (Map<String, Object> s : slots) {
                                             String timeFrom = (String) s.get("time_from");
                                             String timeTo = (String) s.get("time_to");
                                             if (timeFrom != null && timeTo != null) {
                                                 if (isTimeWithinRange(time, timeFrom, timeTo)) {
                                                     slot = s;
                                                     break;
                                                 }
                                             }
                                         }
                                     }
                                     if (slot == null) {
                                         slot = slots.get(0);
                                     }
                                 }
                             }
                         } catch (Exception e) {
                             System.err.println("Error falling back to query slot: " + e.getMessage());
                         }
                     }
 
                     String slotDateStr = null;
                     String timeToStr = null;
 
                     if (slot != null) {
                         slotDateStr = (String) slot.get("slot_date");
                         timeToStr = (String) slot.get("time_to");
                     } else {
                         // Fallback directly to booking fields if no slot could be found at all
                         slotDateStr = (String) booking.get("scheduled_date");
                         timeToStr = (String) booking.get("scheduled_time"); // Use preferred start time as a fallback
                     }
 
                     if (slotDateStr != null && !slotDateStr.isBlank()) {
                         try {
                             java.time.LocalDate slotLocalDate = java.time.LocalDate.parse(slotDateStr.trim());
                             if (slotLocalDate.isBefore(today)) {
                                 isExpired = true;
                                 System.out.println("BookingId=" + bookingId + " expired because slotDate=" + slotDateStr + " is before today=" + today);
                             } else if (slotLocalDate.isEqual(today)) {
                                 if (timeToStr != null && !timeToStr.isBlank()) {
                                     int slotEndTimeMinutes = parseTimeToMinutes(timeToStr);
                                     if (slotEndTimeMinutes > 0 && nowMinutes > slotEndTimeMinutes) {
                                         isExpired = true;
                                         System.out.println("BookingId=" + bookingId + " expired because slotTime=" + timeToStr + " (" + slotEndTimeMinutes + "m) is before nowTime=" + nowMinutes + "m");
                                     }
                                 }
                             }
                         } catch (Exception e) {
                             System.err.println("Error parsing date/time for bookingId=" + bookingId + ": " + e.getMessage());
                         }
                     }
 
                     if (isExpired) {
                         expireBooking(bookingId, booking);
                     }
                 }
             }
         } catch (Exception e) {
             System.err.println("Error in checkAndExpireBookings: " + e.getMessage());
             e.printStackTrace();
         }
     }
 
     public void expireBooking(String bookingId, Map<String, Object> booking) throws Exception {
         System.out.println("expireBooking: automatically expiring bookingId=" + bookingId);
         
         // 1. Calculate full total amount paid
         double price = booking.get("price") != null ? ((Number) booking.get("price")).doubleValue() : 0.0;
         double quantity = booking.get("quantity") != null ? ((Number) booking.get("quantity")).doubleValue() : 1.0;
         double totalPrice = booking.get("total_price") != null ? ((Number) booking.get("total_price")).doubleValue() : (price * quantity);
 
         // 2. Create the refund record in the refunds collection
         Map<String, Object> refundData = new HashMap<>();
         refundData.put("booking_id", bookingId);
         refundData.put("customer_id", booking.get("customer_id"));
         refundData.put("customer_name", booking.get("customer_name"));
         refundData.put("reason", "Missed Confirmation/Assignment Deadline");
         refundData.put("refund_amount", totalPrice);
         refundData.put("deduction_amount", 0.0);
         refundData.put("status", "pending"); // Admin must process it
         refundData.put("notified", false);
         refundData.put("is_automatic_expiration", true);
         refundData.put("cancelled_by", "system");
         refundData.put("status_at_cancellation", booking.get("status") != null ? booking.get("status") : "pending");
         refundData.put("created_at", new Date());
 
         String refundId = firestoreService.create("refunds", refundData);
         System.out.println("expireBooking: Created refund request with ID: " + refundId + " for amount ₱" + totalPrice);
 
         // 3. Update the booking record
         Map<String, Object> updates = new HashMap<>();
         updates.put("status", "cancelled");
         updates.put("cancellation_requested", true);
         updates.put("refund_status", "Refund Required");
         updates.put("refund_id", refundId);
         updates.put("refund_amount", totalPrice);
         updates.put("is_automatic_expiration", true);
         updates.put("cancelled_by", "system");
         updates.put("status_at_cancellation", booking.get("status") != null ? booking.get("status") : "pending");
         updates.put("expired_at", new Date());
         
         firestoreService.update("bookings", bookingId, updates);
         System.out.println("expireBooking: Updated bookingId=" + bookingId + " to cancelled with refund_status='Refund Required'");
 
         // 4. Restore slot back to vendor slots
         try {
             slotService.restoreSlotForCancelledBooking(bookingId);
         } catch (Exception e) {
             System.err.println("ERROR: Failed to execute restoreSlotForCancelledBooking in expireBooking: " + e.getMessage());
         }
 
         // 5. Notify customer
         String customerId = (String) booking.get("customer_id");
         if (customerId != null) {
              notificationService.notify(customerId, "customer", "Booking Expired",
                  "Your booking for \"" + booking.get("service_type") + "\" was automatically cancelled due to missed confirmation deadline. A full refund has been requested.");
         }
 
         // 6. Notify vendor
         String vendorId = (String) booking.get("vendor_id");
         if (vendorId != null) {
              notificationService.notify(vendorId, "vendor", "Booking Expired",
                  "Booking for \"" + booking.get("service_type") + "\" was automatically cancelled due to missed confirmation deadline.");
         }
 
         // 7. Notify admins
         try {
             List<Map<String, Object>> admins = firestoreService.getAll("admins");
             for (Map<String, Object> admin : admins) {
                 String adminId = (String) admin.get("id");
                 if (adminId == null) adminId = (String) admin.get("uid");
                 if (adminId != null) {
                      notificationService.notify(adminId, "admin", "Booking Expired",
                          "Booking " + bookingId + " has been automatically cancelled due to missed deadline. Refund of ₱" + totalPrice + " is required.");
                 }
             }
         } catch (Exception e) {
             System.err.println("Failed to notify admins of automatic booking cancellation: " + e.getMessage());
         }
     }
 
     private boolean isTimeWithinRange(String timeStr, String fromStr, String toStr) {
         if (timeStr == null || timeStr.isBlank() || fromStr == null || fromStr.isBlank() || toStr == null || toStr.isBlank()) {
             return false;
         }
         try {
             int timeMinutes = toMinutesSinceMidnight(timeStr);
             int fromMinutes = toMinutesSinceMidnight(fromStr);
             int toMinutes = toMinutesSinceMidnight(toStr);
             return timeMinutes >= fromMinutes && timeMinutes <= toMinutes;
         } catch (Exception e) {
             return false;
         }
     }
 
     private int toMinutesSinceMidnight(String raw) {
         String timeStr = raw.trim();
         timeStr = timeStr.replaceAll("[^\\dAPMapm: ]", "").trim();
         timeStr = timeStr.replaceAll("\\s+", " ").trim().toUpperCase();
         boolean isPM = timeStr.contains("PM");
         boolean isAM = timeStr.contains("AM");
         timeStr = timeStr.replaceAll("\\s*(AM|PM)", "").trim();
         String[] parts = timeStr.split(":");
         if (parts.length < 2) throw new IllegalArgumentException("Cannot parse time");
         int hour = Integer.parseInt(parts[0].trim());
         int minute = Integer.parseInt(parts[1].trim());
         if (isPM || isAM) {
             if (isPM && hour != 12) hour += 12;
             if (isAM && hour == 12) hour = 0;
         }
         return hour * 60 + minute;
     }
 
     private int parseTimeToMinutes(String timeStr) {
         try {
             return toMinutesSinceMidnight(timeStr);
         } catch (Exception e) {
             return -1;
         }
     }
 }
