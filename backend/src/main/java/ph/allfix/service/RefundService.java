package ph.allfix.service;

import org.springframework.stereotype.Service;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import jakarta.mail.internet.MimeMessage;
import org.springframework.core.env.Environment;
import java.util.*;

@Service
public class RefundService {

    private final FirestoreService firestoreService;
    private final NotificationService notificationService;
    private final JavaMailSender mailSender;
    private final Environment env;
    private final SlotService slotService;

    public RefundService(FirestoreService firestoreService, NotificationService notificationService, JavaMailSender mailSender, Environment env, SlotService slotService) {
        this.firestoreService = firestoreService;
        this.notificationService = notificationService;
        this.mailSender = mailSender;
        this.env = env;
        this.slotService = slotService;
    }

    public String createRefund(Map<String, Object> data) throws Exception {
        data.put("status", "pending");
        data.put("notified", false);
        String id = firestoreService.create("refunds", data);

        String customerName = (String) data.get("customer_name");
        if (customerName == null || customerName.isBlank()) customerName = "A customer";
        String serviceType = (String) data.get("booking_id");

        // Notify the customer that their refund request was received
        String customerId = (String) data.get("customer_id");
        if (customerId != null) {
            notificationService.notify(customerId, "customer",
                "Your cancellation and refund request has been submitted and is pending admin review.");
        }

        // Notify all admins so they can review and process the refund request
        System.out.println("[CAVEMAN] RefundService.createRefund: notifying all admins of new refund request ID=" + id);
        try {
            java.util.List<java.util.Map<String, Object>> admins = firestoreService.getAll("admins");
            System.out.println("[CAVEMAN] Found " + admins.size() + " admin(s) to notify.");
            for (java.util.Map<String, Object> admin : admins) {
                String adminId = (String) admin.get("id");
                if (adminId == null) adminId = (String) admin.get("uid");
                if (adminId != null) {
                    notificationService.notify(adminId, "admin",
                        customerName + " has submitted a cancellation and refund request. Please review it in the Refunds section.");
                    System.out.println("[CAVEMAN] Admin notified: " + adminId);
                }
            }
        } catch (Exception e) {
            System.err.println("[CAVEMAN] Failed to notify admins of new refund request: " + e.getMessage());
        }

        return id;
    }

    public void approveRefund(String refundId, Map<String, Object> details) throws Exception {
        System.out.println("[CAVEMAN] RefundService.approveRefund: Called for ID: " + refundId + " with details: " + details);
        Map<String, Object> updates = new HashMap<>();
        updates.put("status", "Processed");
        updates.put("notified", true);
        updates.put("processed_at", new Date());
        
        if (details != null) {
            if (details.containsKey("reference_number")) updates.put("reference_number", details.get("reference_number"));
            if (details.containsKey("account_number")) updates.put("account_number", details.get("account_number"));
            if (details.containsKey("proof_image_url")) updates.put("proof_image_url", details.get("proof_image_url"));
        }
        
        firestoreService.update("refunds", refundId, updates);
        System.out.println("[CAVEMAN] RefundService.approveRefund: Updated refund document " + refundId + " with: " + updates);

        Map<String, Object> refund = firestoreService.getById("refunds", refundId);
        String bookingId = (String) refund.get("booking_id");
        if (bookingId != null) {
            System.out.println("[CAVEMAN] RefundService.approveRefund: Found linked booking: " + bookingId + ". Updating booking record.");
            Map<String, Object> bookingUpdates = new HashMap<>();
            bookingUpdates.put("status", "cancelled");
            bookingUpdates.put("cancellation_requested", true);
            bookingUpdates.put("refund_id", refundId);
            bookingUpdates.put("refund_status", "Processed");
            if (updates.containsKey("reference_number")) bookingUpdates.put("refund_reference_number", updates.get("reference_number"));
            if (updates.containsKey("account_number")) bookingUpdates.put("refund_account_number", updates.get("account_number"));
            if (updates.containsKey("proof_image_url")) bookingUpdates.put("refund_proof_image_url", updates.get("proof_image_url"));
            
            Object amtObj = refund.get("refund_amount");
            if (amtObj != null) {
                bookingUpdates.put("refund_amount", amtObj);
            }
            
            firestoreService.update("bookings", bookingId, bookingUpdates);
            System.out.println("[CAVEMAN] RefundService.approveRefund: Successfully updated booking ID: " + bookingId + " with updates: " + bookingUpdates);
            
            // Restore slot back to vendor slots
            try {
                slotService.restoreSlotForCancelledBooking(bookingId);
            } catch (Exception e) {
                System.err.println("[CAVEMAN] ERROR: Failed to execute restoreSlotForCancelledBooking in approveRefund: " + e.getMessage());
            }
        } else {
            System.out.println("[CAVEMAN] RefundService.approveRefund WARNING: No bookingId linked to refund ID: " + refundId);
        }

        String customerId = (String) refund.get("customer_id");
        if (customerId != null) {
            notificationService.notify(customerId, "customer", "Your refund has been approved.");
            System.out.println("[CAVEMAN] RefundService.approveRefund: Notified customer: " + customerId);
        }

        // Send Email Notification
        try {
            sendRefundEmailNotification(refundId);
        } catch (Exception e) {
            System.err.println("[CAVEMAN] ERROR: Failed to send refund email: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public String createDirectRefund(Map<String, Object> data) throws Exception {
        System.out.println("[CAVEMAN] RefundService.createDirectRefund: Creating direct refund with: " + data);
        data.put("status", "Processed");
        data.put("notified", true);
        data.put("processed_at", new Date());
        
        String bookingId = (String) data.get("booking_id");
        if (bookingId != null) {
            System.out.println("[CAVEMAN] RefundService.createDirectRefund: Fetching booking to populate details: " + bookingId);
            Map<String, Object> booking = firestoreService.getById("bookings", bookingId);
            if (booking != null) {
                if (!data.containsKey("customer_id")) data.put("customer_id", booking.get("customer_id"));
                if (!data.containsKey("customer_name")) data.put("customer_name", booking.get("customer_name"));
                if (!data.containsKey("refund_amount")) {
                    Object total = booking.get("total_price");
                    if (total != null) {
                        data.put("refund_amount", total);
                    } else {
                        // Fallback to unit price * quantity
                        Object priceObj = booking.get("price");
                        Object qtyObj = booking.get("quantity");
                        double price = priceObj instanceof Number ? ((Number) priceObj).doubleValue() : 0.0;
                        int qty = qtyObj instanceof Number ? ((Number) qtyObj).intValue() : 1;
                        data.put("refund_amount", price * qty);
                    }
                }
                System.out.println("[CAVEMAN] RefundService.createDirectRefund: Populated from booking: customer_name=" + data.get("customer_name") + ", refund_amount=" + data.get("refund_amount"));
            }
        }
        
        String refundId = firestoreService.create("refunds", data);
        System.out.println("[CAVEMAN] RefundService.createDirectRefund: Created refund document ID: " + refundId);
        
        if (bookingId != null) {
            System.out.println("[CAVEMAN] RefundService.createDirectRefund: Updating booking: " + bookingId);
            Map<String, Object> bookingUpdates = new HashMap<>();
            bookingUpdates.put("status", "cancelled");
            bookingUpdates.put("cancellation_requested", true);
            bookingUpdates.put("refund_id", refundId);
            bookingUpdates.put("refund_status", "Processed");
            if (data.containsKey("reference_number")) bookingUpdates.put("refund_reference_number", data.get("reference_number"));
            if (data.containsKey("account_number")) bookingUpdates.put("refund_account_number", data.get("account_number"));
            if (data.containsKey("proof_image_url")) bookingUpdates.put("refund_proof_image_url", data.get("proof_image_url"));
            if (data.get("refund_amount") != null) bookingUpdates.put("refund_amount", data.get("refund_amount"));
            
            firestoreService.update("bookings", bookingId, bookingUpdates);
            System.out.println("[CAVEMAN] RefundService.createDirectRefund: Successfully updated booking ID: " + bookingId + " with updates: " + bookingUpdates);
            
            // Restore slot back to vendor slots
            try {
                slotService.restoreSlotForCancelledBooking(bookingId);
            } catch (Exception e) {
                System.err.println("[CAVEMAN] ERROR: Failed to execute restoreSlotForCancelledBooking in createDirectRefund: " + e.getMessage());
            }
        }
        
        String customerId = (String) data.get("customer_id");
        if (customerId != null) {
            notificationService.notify(customerId, "customer", "A refund of ₱" + data.get("refund_amount") + " has been issued for your booking.");
            System.out.println("[CAVEMAN] RefundService.createDirectRefund: Notified customer: " + customerId);
        }

        // Send Email Notification
        try {
            sendRefundEmailNotification(refundId);
        } catch (Exception e) {
            System.err.println("[CAVEMAN] ERROR: Failed to send direct refund email: " + e.getMessage());
            e.printStackTrace();
        }
        
        return refundId;
    }

    public void rejectRefund(String refundId) throws Exception {
        System.out.println("[CAVEMAN] RefundService.rejectRefund: Rejecting refund ID: " + refundId);
        firestoreService.updateField("refunds", refundId, "status", "rejected");
        
        Map<String, Object> refund = firestoreService.getById("refunds", refundId);
        String bookingId = (String) refund.get("booking_id");
        if (bookingId != null) {
            Map<String, Object> bookingUpdates = new HashMap<>();
            bookingUpdates.put("refund_status", "rejected");
            firestoreService.update("bookings", bookingId, bookingUpdates);
            System.out.println("[CAVEMAN] RefundService.rejectRefund: Updated booking refund_status to rejected for ID=" + bookingId);
        }
    }

    public void sendRefundEmailNotification(String refundId) throws Exception {
        System.out.println("[CAVEMAN] sendRefundEmailNotification: Starting email process for Refund ID: " + refundId);
        
        Map<String, Object> refund = firestoreService.getById("refunds", refundId);
        if (refund == null) {
            System.out.println("[CAVEMAN] ERROR: Refund record not found for ID: " + refundId);
            return;
        }
        
        String id = refundId;
        String bookingId = (String) refund.get("booking_id");
        String customerId = (String) refund.get("customer_id");
        String customerName = (String) refund.get("customer_name");
        String status = (String) refund.get("status");
        String reason = (String) refund.get("reason");
        
        Object amtObj = refund.get("refund_amount");
        double refundAmountValue = 0.0;
        if (amtObj instanceof Number) {
            refundAmountValue = ((Number) amtObj).doubleValue();
        } else if (amtObj instanceof String) {
            try {
                refundAmountValue = Double.parseDouble((String) amtObj);
            } catch (Exception e) {
                System.out.println("[CAVEMAN] WARNING: Could not parse refund amount string: " + amtObj);
            }
        }
        
        String paymentMethod = (String) refund.get("payment_method");
        if (paymentMethod == null) {
            paymentMethod = (String) refund.get("refund_method");
        }
        if (paymentMethod == null) {
            paymentMethod = "GCash"; // Default to GCash since AllFix exclusively supports GCash now
        }
        
        String paymentReference = (String) refund.get("payment_reference");
        if (paymentReference == null) {
            paymentReference = (String) refund.get("reference_number");
        }
        if (paymentReference == null) {
            paymentReference = (String) refund.get("refund_reference_number");
        }
        if (paymentReference == null) {
            paymentReference = "—";
        }
        
        // Processing Date
        String processingDateStr = "—";
        Object procAt = refund.get("processed_at");
        if (procAt instanceof com.google.cloud.Timestamp) {
            java.util.Date d = ((com.google.cloud.Timestamp) procAt).toDate();
            java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            sdf.setTimeZone(java.util.TimeZone.getTimeZone("Asia/Manila"));
            processingDateStr = sdf.format(d);
        } else if (procAt instanceof java.util.Date) {
            java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            sdf.setTimeZone(java.util.TimeZone.getTimeZone("Asia/Manila"));
            processingDateStr = sdf.format((java.util.Date) procAt);
        } else {
            java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            sdf.setTimeZone(java.util.TimeZone.getTimeZone("Asia/Manila"));
            processingDateStr = sdf.format(new java.util.Date());
        }

        System.out.println("[CAVEMAN] sendRefundEmailNotification: Retrieved details from DB:");
        System.out.println("[CAVEMAN]   - Refund ID: " + id);
        System.out.println("[CAVEMAN]   - Booking ID: " + bookingId);
        System.out.println("[CAVEMAN]   - Customer ID: " + customerId);
        System.out.println("[CAVEMAN]   - Customer Name: " + customerName);
        System.out.println("[CAVEMAN]   - Payment Method: " + paymentMethod);
        System.out.println("[CAVEMAN]   - Payment Reference: " + paymentReference);
        System.out.println("[CAVEMAN]   - Refund Reason: " + reason);
        System.out.println("[CAVEMAN]   - Refund Amount: " + refundAmountValue);
        System.out.println("[CAVEMAN]   - Refund Processing Date: " + processingDateStr);
        System.out.println("[CAVEMAN]   - Refund Status: " + status);

        // Fetch customer email address
        String customerEmail = null;
        if (customerId != null) {
            Map<String, Object> customer = firestoreService.getById("customers", customerId);
            if (customer != null) {
                customerEmail = (String) customer.get("email");
            }
        }
        
        if (customerEmail == null || customerEmail.isBlank()) {
            System.out.println("[CAVEMAN] ERROR: Registered email not found for Customer ID: " + customerId);
            return;
        }

        System.out.println("[CAVEMAN] sendRefundEmailNotification: Sending email to: " + customerEmail);

        // Send Email
        String appPassword = env.getProperty("spring.mail.password");
        if (appPassword == null || appPassword.isBlank() || "your-app-password".equalsIgnoreCase(appPassword.trim())) {
            appPassword = env.getProperty("APP_PASSWORD");
        }
        if (appPassword == null || appPassword.isBlank() || "your-app-password".equalsIgnoreCase(appPassword.trim())) {
            appPassword = System.getenv("APP_PASSWORD");
        }

        String fromEmail = env.getProperty("spring.mail.username");
        if (fromEmail == null || fromEmail.isBlank()) {
            fromEmail = env.getProperty("EMAIL_USERNAME");
        }
        if (fromEmail == null || fromEmail.isBlank()) {
            fromEmail = System.getenv("EMAIL_USERNAME");
        }
        if (fromEmail == null || fromEmail.isBlank()) {
            fromEmail = "allfix.ph@gmail.com";
        }

        if (mailSender instanceof org.springframework.mail.javamail.JavaMailSenderImpl) {
            org.springframework.mail.javamail.JavaMailSenderImpl impl = (org.springframework.mail.javamail.JavaMailSenderImpl) mailSender;
            impl.setUsername(fromEmail);
            impl.setPassword(appPassword);
        }

        // Build premium-looking email body
        String htmlBody = String.format(
            "<html>" +
            "<body style=\"font-family: Arial, sans-serif; color: #333333; line-height: 1.6; margin: 0; padding: 0;\">" +
            "  <div style=\"max-width: 600px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);\">" +
            "    <div style=\"background-color: #0c1a30; padding: 24px; text-align: center; color: #ffffff;\">" +
            "      <h2 style=\"margin: 0; font-size: 24px; font-weight: bold;\">Refund Processed Successfully</h2>" +
            "      <p style=\"margin: 4px 0 0 0; font-size: 14px; opacity: 0.85;\">Your refund transaction details</p>" +
            "    </div>" +
            "    <div style=\"padding: 30px; background-color: #ffffff;\">" +
            "      <p style=\"font-size: 16px; margin-top: 0;\">Dear <strong>%s</strong>,</p>" +
            "      <p style=\"font-size: 15px;\">We would like to inform you that your refund has been successfully processed by the administrator. Below are the specific details of your refund:</p>" +
            "      " +
            "      <div style=\"background-color: #f7f9fc; border-radius: 8px; padding: 20px; margin: 24px 0; border: 1px solid #edf2f7;\">" +
            "        <table style=\"width: 100%%; border-collapse: collapse;\">" +
            "          <tr>" +
            "            <td style=\"padding: 8px 0; font-size: 14px; color: #718096; width: 40%%;\"><strong>Refund ID</strong></td>" +
            "            <td style=\"padding: 8px 0; font-size: 14px; color: #2d3748;\"><code>%s</code></td>" +
            "          </tr>" +
            "          <tr>" +
            "            <td style=\"padding: 8px 0; font-size: 14px; color: #718096;\"><strong>Booking ID</strong></td>" +
            "            <td style=\"padding: 8px 0; font-size: 14px; color: #2d3748;\"><code>%s</code></td>" +
            "          </tr>" +
            "          <tr>" +
            "            <td style=\"padding: 8px 0; font-size: 14px; color: #718096;\"><strong>Customer ID</strong></td>" +
            "            <td style=\"padding: 8px 0; font-size: 14px; color: #2d3748;\"><code>%s</code></td>" +
            "          </tr>" +
            "          <tr>" +
            "            <td style=\"padding: 8px 0; font-size: 14px; color: #718096;\"><strong>Customer Name</strong></td>" +
            "            <td style=\"padding: 8px 0; font-size: 14px; color: #2d3748; font-weight: bold;\">%s</td>" +
            "          </tr>" +
            "          <tr>" +
            "            <td style=\"padding: 8px 0; font-size: 14px; color: #718096;\"><strong>Payment Method</strong></td>" +
            "            <td style=\"padding: 8px 0; font-size: 14px; color: #2d3748;\">%s</td>" +
            "          </tr>" +
            "          <tr>" +
            "            <td style=\"padding: 8px 0; font-size: 14px; color: #718096;\"><strong>Payment Reference Number</strong></td>" +
            "            <td style=\"padding: 8px 0; font-size: 14px; color: #2d3748; font-weight: bold;\">%s</td>" +
            "          </tr>" +
            "          <tr>" +
            "            <td style=\"padding: 8px 0; font-size: 14px; color: #718096;\"><strong>Refund Reason</strong></td>" +
            "            <td style=\"padding: 8px 0; font-size: 14px; color: #2d3748;\">%s</td>" +
            "          </tr>" +
            "          <tr>" +
            "            <td style=\"padding: 8px 0; font-size: 14px; color: #718096;\"><strong>Refund Amount</strong></td>" +
            "            <td style=\"padding: 8px 0; font-size: 16px; color: #38a169; font-weight: bold;\">₱%.2f</td>" +
            "          </tr>" +
            "          <tr>" +
            "            <td style=\"padding: 8px 0; font-size: 14px; color: #718096;\"><strong>Refund Processing Date</strong></td>" +
            "            <td style=\"padding: 8px 0; font-size: 14px; color: #2d3748;\">%s</td>" +
            "          </tr>" +
            "          <tr>" +
            "            <td style=\"padding: 8px 0; font-size: 14px; color: #718096;\"><strong>Refund Status</strong></td>" +
            "            <td style=\"padding: 8px 0; font-size: 14px;\">" +
            "              <span style=\"background-color: #c6f6d5; color: #22543d; padding: 4px 8px; border-radius: 9999px; font-size: 12px; font-weight: bold; text-transform: uppercase;\">%s</span>" +
            "            </td>" +
            "          </tr>" +
            "        </table>" +
            "      </div>" +
            "      " +
            "      <p style=\"font-size: 14px; color: #718096; margin-bottom: 0;\">If you have any questions regarding this transaction, please do not hesitate to contact our support team.</p>" +
            "    </div>" +
            "    <div style=\"background-color: #f7f9fc; padding: 16px; text-align: center; border-top: 1px solid #edf2f7; font-size: 12px; color: #a0aec0;\">" +
            "      This is an automated notification. Please do not reply directly to this email.<br/>" +
            "      &copy; 2026 AllFix.ph. All rights reserved." +
            "    </div>" +
            "  </div>" +
            "</body>" +
            "</html>",
            customerName,
            id,
            bookingId != null ? bookingId : "—",
            customerId != null ? customerId : "—",
            customerName,
            paymentMethod,
            paymentReference,
            reason != null ? reason : "—",
            refundAmountValue,
            processingDateStr,
            status
        );

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(fromEmail);
        helper.setTo(customerEmail);
        helper.setSubject("AllFix.ph - Refund Request Has Been Processed Successfully!");
        helper.setText(htmlBody, true);

        mailSender.send(message);
        System.out.println("[CAVEMAN] sendRefundEmailNotification: Successfully sent email to " + customerEmail);
    }
}

