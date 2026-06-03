package ph.allfix.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ph.allfix.service.FirestoreService;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import jakarta.mail.internet.MimeMessage;
import org.springframework.core.env.Environment;
import java.util.*;

@RestController
@RequestMapping("/api/support")
public class SupportController {

    private final FirestoreService firestoreService;
    private final JavaMailSender mailSender;
    private final Environment env;

    public SupportController(FirestoreService firestoreService, JavaMailSender mailSender, Environment env) {
        this.firestoreService = firestoreService;
        this.mailSender = mailSender;
        this.env = env;
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) throws Exception {
        body.put("status", "open");
        String id = firestoreService.create("support_tickets", body);
        return ResponseEntity.ok(Map.of("id", id, "message", "Ticket submitted"));
    }

    @PostMapping("/contact")
    public ResponseEntity<?> submitContactForm(@RequestBody Map<String, String> body) {
        try {
            String name = body.get("name");
            String email = body.get("email");
            String messageText = body.get("message");

            // Input Validation
            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Name is required"));
            }
            if (email == null || email.trim().isEmpty() || !email.contains("@")) {
                return ResponseEntity.badRequest().body(Map.of("message", "A valid email is required"));
            }
            if (messageText == null || messageText.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Message is required"));
            }

            // Fetch SMTP/Email credentials from environment
            String appPassword = env.getProperty("spring.mail.password");
            if (appPassword == null || appPassword.isBlank() || "your-app-password".equalsIgnoreCase(appPassword.trim())) {
                appPassword = env.getProperty("APP_PASSWORD");
            }
            if (appPassword == null || appPassword.isBlank() || "your-app-password".equalsIgnoreCase(appPassword.trim())) {
                appPassword = System.getenv("APP_PASSWORD");
            }

            String emailUsername = env.getProperty("spring.mail.username");
            if (emailUsername == null || emailUsername.isBlank()) {
                emailUsername = env.getProperty("EMAIL_USERNAME");
            }
            if (emailUsername == null || emailUsername.isBlank()) {
                emailUsername = System.getenv("EMAIL_USERNAME");
            }
            if (emailUsername == null || emailUsername.isBlank()) {
                emailUsername = "allfix.ph@gmail.com";
            }

            // Configure SMTP sender credentials if JavaMailSenderImpl
            if (mailSender instanceof org.springframework.mail.javamail.JavaMailSenderImpl) {
                org.springframework.mail.javamail.JavaMailSenderImpl impl = (org.springframework.mail.javamail.JavaMailSenderImpl) mailSender;
                impl.setUsername(emailUsername);
                impl.setPassword(appPassword);
            }

            // Construct email message
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(emailUsername);
            helper.setTo(emailUsername); // Send to EMAIL_USERNAME
            helper.setSubject("AllFix Landing Page - New Direct Message from " + name);

            String htmlBody = "<h3>New Direct Message Received</h3>" +
                    "<p><strong>Name:</strong> " + name + "</p>" +
                    "<p><strong>Email:</strong> " + email + "</p>" +
                    "<p><strong>Message:</strong></p>" +
                    "<p>" + messageText.replace("\n", "<br/>") + "</p>";
            
            helper.setText(htmlBody, true);

            mailSender.send(message);
            System.out.println("[CAVEMAN] Contact form direct message sent successfully from " + email);

            // Also store in firestore as a support contact ticket
            Map<String, Object> ticket = new HashMap<>();
            ticket.put("name", name);
            ticket.put("email", email);
            ticket.put("message", messageText);
            ticket.put("type", "contact_form");
            ticket.put("status", "open");
            ticket.put("created_at", new Date().toString());
            firestoreService.create("support_tickets", ticket);

            return ResponseEntity.ok(Map.of("message", "Your message has been sent successfully!"));
        } catch (Exception e) {
            System.err.println("[CAVEMAN] Error sending contact message: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Failed to send message: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAll() throws Exception {
        return ResponseEntity.ok(firestoreService.getAll("support_tickets"));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String id, @RequestBody Map<String, String> body) throws Exception {
        firestoreService.updateField("support_tickets", id, "status", body.get("status"));
        return ResponseEntity.ok(Map.of("message", "Status updated"));
    }
}
