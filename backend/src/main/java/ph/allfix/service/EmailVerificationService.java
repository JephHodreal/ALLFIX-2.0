package ph.allfix.service;

import com.google.firebase.auth.ActionCodeSettings;
import com.google.firebase.auth.FirebaseAuth;
import jakarta.mail.internet.MimeMessage;
import org.springframework.core.env.Environment;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.FileSystemResource;

import java.io.File;

@Service
public class EmailVerificationService {

    private final JavaMailSender mailSender;
    private final Environment env;

    public EmailVerificationService(JavaMailSender mailSender, Environment env) {
        this.mailSender = mailSender;
        this.env = env;
    }

    private void configureSender(MimeMessageHelper helper, org.springframework.mail.javamail.JavaMailSenderImpl impl) throws Exception {
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

        if (impl != null) {
            impl.setUsername(fromEmail);
            impl.setPassword(appPassword);
        }
        helper.setFrom(fromEmail);
    }

    private void attachLogo(MimeMessageHelper helper) {
        try {
            ClassPathResource res = new ClassPathResource("ALLFIXLOGO.png");
            if (res.exists()) {
                helper.addInline("allfixLogo", res);
                return;
            }
            File file = new File(System.getProperty("user.dir") + "/src/main/resources/ALLFIXLOGO.png");
            if (file.exists()) {
                helper.addInline("allfixLogo", new FileSystemResource(file));
                return;
            }
            File rootFile = new File(System.getProperty("user.dir") + "/../frontend/public/ALLFIXLOGO.png");
            if (rootFile.exists()) {
                 helper.addInline("allfixLogo", new FileSystemResource(rootFile));
            }
        } catch (Exception e) {
            System.err.println("Failed to attach logo inline: " + e.getMessage());
        }
    }

    private String getBaseEmailTemplate(String contentHtml) {
        return "<!DOCTYPE html>\n" +
                "<html lang=\"en\">\n" +
                "<head>\n" +
                "  <meta charset=\"UTF-8\">\n" +
                "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
                "</head>\n" +
                "<body style=\"margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #334155;\">\n" +
                "  <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"background-color: #f8fafc; padding: 40px 0;\">\n" +
                "    <tr>\n" +
                "      <td align=\"center\">\n" +
                "        <table role=\"presentation\" width=\"100%\" style=\"max-width: 600px; width: 100%;\">\n" +
                "          <tr>\n" +
                "            <td align=\"center\" style=\"padding-bottom: 24px;\">\n" +
                "              <table role=\"presentation\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"margin: 0 auto;\">\n" +
                "                <tr>\n" +
                "                  <td align=\"center\" valign=\"middle\">\n" +
                "                    <img src=\"cid:allfixLogo\" alt=\"AllFix Logo\" width=\"64\" style=\"display: block; width: 64px; height: auto; object-fit: contain;\" />\n" +
                "                  </td>\n" +
                "                  <td align=\"left\" valign=\"middle\" style=\"padding-left: 12px; line-height: 1.1;\">\n" +
                "                    <div style=\"font-size: 32px; font-weight: 800; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; letter-spacing: -1px; margin-bottom: 2px;\">\n" +
                "                      <span style=\"color: #0f172a;\">All</span><span style=\"color: #16a34a;\">F</span><span style=\"color: #eab308;\">i</span><span style=\"color: #dc2626;\">x</span><span style=\"color: #0f172a;\">.ph</span>\n" +
                "                    </div>\n" +
                "                    <div style=\"font-size: 10px; font-weight: 700; color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; letter-spacing: 0.5px;\">\n" +
                "                      YOUR PERSONAL CONCIERGE\n" +
                "                    </div>\n" +
                "                  </td>\n" +
                "                </tr>\n" +
                "              </table>\n" +
                "            </td>\n" +
                "          </tr>\n" +
                "        </table>\n" +
                "        <table role=\"presentation\" width=\"100%\" style=\"max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); border: 1px solid #e2e8f0; border-collapse: collapse;\">\n" +
                "          <tr>\n" +
                "            <td style=\"padding: 48px 48px;\">\n" +
                contentHtml +
                "            </td>\n" +
                "          </tr>\n" +
                "        </table>\n" +
                "        <table role=\"presentation\" width=\"100%\" style=\"max-width: 600px; width: 100%;\">\n" +
                "          <tr>\n" +
                "            <td align=\"center\" style=\"padding: 24px 0; font-size: 13px; color: #94a3b8; line-height: 1.5;\">\n" +
                "              <p style=\"margin-top: 0; margin-bottom: 8px;\">This is an automated message. Please do not reply to this email.</p>\n" +
                "              <p style=\"margin: 0;\">&copy; 2026 AllFix.ph. All rights reserved.</p>\n" +
                "            </td>\n" +
                "          </tr>\n" +
                "        </table>\n" +
                "      </td>\n" +
                "    </tr>\n" +
                "  </table>\n" +
                "</body>\n" +
                "</html>";
    }

    public void sendVerificationEmail(String email) throws Exception {
        System.out.println("sendVerificationEmail: Generating verification link for " + email);

        String frontendUrl = env.getProperty("frontend.url");
        if (frontendUrl == null || frontendUrl.isBlank()) {
            frontendUrl = "http://localhost:5175";
        }
        
        String continueUrl = frontendUrl + "/verify-email";

        ActionCodeSettings settings = ActionCodeSettings.builder()
                .setUrl(continueUrl)
                .setHandleCodeInApp(true)
                .build();

        String link = FirebaseAuth.getInstance().generateEmailVerificationLink(email, settings);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        
        if (mailSender instanceof org.springframework.mail.javamail.JavaMailSenderImpl) {
            configureSender(helper, (org.springframework.mail.javamail.JavaMailSenderImpl) mailSender);
        } else {
            configureSender(helper, null);
        }

        helper.setTo(email);
        helper.setSubject("Verify Your Email Address");

        String contentHtml = 
                "              <h2 style=\"margin-top: 0; margin-bottom: 16px; font-size: 24px; font-weight: 700; color: #0f172a; text-align: center;\">Verify Your Email Address</h2>\n" +
                "              <p style=\"font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 32px; margin-top: 0; text-align: center;\">\n" +
                "                Welcome to AllFix.ph! Please verify your email address to complete your registration and secure your account.\n" +
                "              </p>\n" +
                "              <div style=\"text-align: center; margin-bottom: 32px;\">\n" +
                "                <a href=\"" + link + "\" style=\"display: inline-block; background-color: #20b759; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 36px; border-radius: 8px;\">Verify Email</a>\n" +
                "              </div>\n" +
                "              <div style=\"border-top: 1px solid #e2e8f0; padding-top: 24px;\">\n" +
                "                <p style=\"font-size: 13px; line-height: 1.5; color: #64748b; margin-bottom: 8px; margin-top: 0;\">\n" +
                "                  If the button above doesn't work, copy and paste this link into your browser:\n" +
                "                </p>\n" +
                "                <p style=\"font-size: 13px; line-height: 1.5; color: #20b759; word-break: break-all; margin: 0;\">\n" +
                "                  <a href=\"" + link + "\" style=\"color: #20b759; text-decoration: underline;\">" + link + "</a>\n" +
                "                </p>\n" +
                "              </div>";

        helper.setText(getBaseEmailTemplate(contentHtml), true);
        attachLogo(helper);

        mailSender.send(message);
        System.out.println("sendVerificationEmail: Successfully sent email to " + email);
    }

    public void sendOtpEmail(String email, String otp) throws Exception {
        System.out.println("sendOtpEmail: Sending OTP to " + email);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        
        if (mailSender instanceof org.springframework.mail.javamail.JavaMailSenderImpl) {
            configureSender(helper, (org.springframework.mail.javamail.JavaMailSenderImpl) mailSender);
        } else {
            configureSender(helper, null);
        }

        helper.setTo(email);
        helper.setSubject("Your Verification Code: " + otp);

        String contentHtml = 
                "              <h2 style=\"margin-top: 0; margin-bottom: 16px; font-size: 24px; font-weight: 700; color: #0f172a; text-align: center;\">Your Verification Code</h2>\n" +
                "              <p style=\"font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 24px; margin-top: 0; text-align: center;\">\n" +
                "                Please use the following 6-digit code to verify your account registration.\n" +
                "              </p>\n" +
                "              <div style=\"background-color: #f1f5f9; border-radius: 8px; padding: 24px; margin: 0 auto 24px auto; max-width: 240px; text-align: center;\">\n" +
                "                <span style=\"font-size: 32px; font-weight: 700; color: #20b759; letter-spacing: 0.15em;\">" + otp + "</span>\n" +
                "              </div>\n" +
                "              <p style=\"font-size: 14px; line-height: 1.5; color: #64748b; margin-bottom: 0; margin-top: 0; text-align: center;\">\n" +
                "                This code will expire in 10 minutes. If you did not request this, please ignore this email.\n" +
                "              </p>";

        helper.setText(getBaseEmailTemplate(contentHtml), true);
        attachLogo(helper);

        mailSender.send(message);
        System.out.println("sendOtpEmail: Successfully sent OTP email to " + email);
    }

    public void sendVendorPendingReviewEmail(String email) throws Exception {
        System.out.println("sendVendorPendingReviewEmail: Sending to " + email);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        
        if (mailSender instanceof org.springframework.mail.javamail.JavaMailSenderImpl) {
            configureSender(helper, (org.springframework.mail.javamail.JavaMailSenderImpl) mailSender);
        } else {
            configureSender(helper, null);
        }

        helper.setTo(email);
        helper.setSubject("Vendor Registration Pending Review");

        String contentHtml = 
                "              <h2 style=\"margin-top: 0; margin-bottom: 16px; font-size: 24px; font-weight: 700; color: #0f172a; text-align: center;\">Registration Pending Review</h2>\n" +
                "              <p style=\"font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 20px; margin-top: 0; text-align: center;\">\n" +
                "                Thank you for registering as a vendor. Your account will now be reviewed by the admin.\n" +
                "              </p>\n" +
                "              <div style=\"background-color: #f1f5f9; border-radius: 8px; padding: 20px; text-align: center;\">\n" +
                "                <p style=\"font-size: 14px; line-height: 1.6; color: #334155; margin: 0;\">\n" +
                "                  It will be accepted after passing the requirement. If the registration passes, you will receive an email to verify within 1-2 working days.\n" +
                "                </p>\n" +
                "              </div>";

        helper.setText(getBaseEmailTemplate(contentHtml), true);
        attachLogo(helper);

        mailSender.send(message);
        System.out.println("sendVendorPendingReviewEmail: Successfully sent email to " + email);
    }

    public void sendVendorApprovedEmail(String email) throws Exception {
        System.out.println("sendVendorApprovedEmail: Sending to " + email);

        String frontendUrl = env.getProperty("frontend.url");
        if (frontendUrl == null || frontendUrl.isBlank()) {
            frontendUrl = "http://localhost:5175";
        }
        String loginUrl = frontendUrl + "/login";

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        
        if (mailSender instanceof org.springframework.mail.javamail.JavaMailSenderImpl) {
            configureSender(helper, (org.springframework.mail.javamail.JavaMailSenderImpl) mailSender);
        } else {
            configureSender(helper, null);
        }

        helper.setTo(email);
        helper.setSubject("Your Vendor Account is Approved!");

        String contentHtml = 
                "              <h2 style=\"margin-top: 0; margin-bottom: 16px; font-size: 24px; font-weight: 700; color: #0f172a; text-align: center;\">Account Approved!</h2>\n" +
                "              <p style=\"font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 20px; margin-top: 0; text-align: center;\">\n" +
                "                Congratulations! You are now an official partner of AllFix.ph.\n" +
                "              </p>\n" +
                "              <p style=\"font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 32px; margin-top: 0; text-align: center;\">\n" +
                "                You can now log in to your vendor dashboard to start accepting service requests, managing your profile, and growing your business.\n" +
                "              </p>\n" +
                "              <div style=\"text-align: center;\">\n" +
                "                <a href=\"" + loginUrl + "\" style=\"display: inline-block; background-color: #20b759; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 36px; border-radius: 8px;\">Log In to Dashboard</a>\n" +
                "              </div>";

        helper.setText(getBaseEmailTemplate(contentHtml), true);
        attachLogo(helper);

        mailSender.send(message);
        System.out.println("sendVendorApprovedEmail: Successfully sent email to " + email);
    }

    public void sendAdminCreatedVendorWelcomeEmail(String username, String email, String password) throws Exception {
        System.out.println("sendAdminCreatedVendorWelcomeEmail: Sending to " + email);

        String frontendUrl = env.getProperty("frontend.url");
        if (frontendUrl == null || frontendUrl.isBlank()) {
            frontendUrl = "http://localhost:5175";
        }
        String loginUrl = frontendUrl + "/login";

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        
        if (mailSender instanceof org.springframework.mail.javamail.JavaMailSenderImpl) {
            configureSender(helper, (org.springframework.mail.javamail.JavaMailSenderImpl) mailSender);
        } else {
            configureSender(helper, null);
        }

        helper.setTo(email);
        helper.setSubject("Welcome to AllFix - Your Vendor Account is Ready!");

        String contentHtml = 
                "              <h2 style=\"margin-top: 0; margin-bottom: 16px; font-size: 24px; font-weight: 700; color: #0f172a; text-align: center;\">Welcome to AllFix!</h2>\n" +
                "              <p style=\"font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 24px; margin-top: 0; text-align: center;\">\n" +
                "                An account has been created for you as a vendor. Please keep these credentials secure.\n" +
                "              </p>\n" +
                "              <div style=\"background-color: #f1f5f9; border-radius: 8px; padding: 24px; margin: 0 auto 24px auto; max-width: 400px; text-align: left;\">\n" +
                "                <p style=\"font-size: 15px; color: #334155; margin: 0 0 12px 0;\"><strong>Username:</strong> " + username + "</p>\n" +
                "                <p style=\"font-size: 15px; color: #334155; margin: 0 0 12px 0;\"><strong>Email:</strong> " + email + "</p>\n" +
                "                <p style=\"font-size: 15px; color: #334155; margin: 0;\"><strong>Temporary Password:</strong> <span style=\"font-family: monospace; background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px;\">" + password + "</span></p>\n" +
                "              </div>\n" +
                "              <div style=\"text-align: center;\">\n" +
                "                <a href=\"" + loginUrl + "\" style=\"display: inline-block; background-color: #20b759; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 36px; border-radius: 8px;\">Log In to Dashboard</a>\n" +
                "              </div>";

        helper.setText(getBaseEmailTemplate(contentHtml), true);
        attachLogo(helper);

        mailSender.send(message);
        System.out.println("sendAdminCreatedVendorWelcomeEmail: Successfully sent email to " + email);
    }

    public void sendPersonnelWelcomeEmail(String email, String username, String password, String companyName) throws Exception {
        System.out.println("sendPersonnelWelcomeEmail: Sending to " + email);

        String frontendUrl = env.getProperty("frontend.url");
        if (frontendUrl == null || frontendUrl.isBlank()) {
            frontendUrl = "http://localhost:5175";
        }
        String loginUrl = frontendUrl + "/login";

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        
        if (mailSender instanceof org.springframework.mail.javamail.JavaMailSenderImpl) {
            configureSender(helper, (org.springframework.mail.javamail.JavaMailSenderImpl) mailSender);
        } else {
            configureSender(helper, null);
        }

        helper.setTo(email);
        helper.setSubject("Welcome to AllFix - Your Personnel Account is Ready!");

        String contentHtml = 
                "              <h2 style=\"margin-top: 0; margin-bottom: 16px; font-size: 24px; font-weight: 700; color: #0f172a; text-align: center;\">Welcome to AllFix!</h2>\n" +
                "              <p style=\"font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 24px; margin-top: 0; text-align: center;\">\n" +
                "                Congratulations, your account is created by the company: <strong>" + companyName + "</strong><br/>\n" +
                "                You are now a partner of AllFix.\n" +
                "              </p>\n" +
                "              <div style=\"background-color: #f1f5f9; border-radius: 8px; padding: 24px; margin: 0 auto 24px auto; max-width: 400px; text-align: left;\">\n" +
                "                <p style=\"font-size: 15px; color: #334155; margin: 0 0 12px 0;\"><strong>Username:</strong> " + username + "</p>\n" +
                "                <p style=\"font-size: 15px; color: #334155; margin: 0;\"><strong>Temporary Password:</strong> <span style=\"font-family: monospace; background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px;\">" + password + "</span></p>\n" +
                "              </div>\n" +
                "              <p style=\"font-size: 14px; line-height: 1.5; color: #64748b; margin-bottom: 24px; text-align: center; max-width: 400px; margin-left: auto; margin-right: auto;\">\n" +
                "                Please use the credentials above to log in to the AllFix platform. Once logged in, we highly recommend changing your temporary password immediately for security purposes.\n" +
                "              </p>\n" +
                "              <div style=\"text-align: center;\">\n" +
                "                <a href=\"" + loginUrl + "\" style=\"display: inline-block; background-color: #20b759; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 36px; border-radius: 8px;\">Proceed to Login</a>\n" +
                "              </div>";

        helper.setText(getBaseEmailTemplate(contentHtml), true);
        attachLogo(helper);

        mailSender.send(message);
        System.out.println("sendPersonnelWelcomeEmail: Successfully sent email to " + email);
    }
}
