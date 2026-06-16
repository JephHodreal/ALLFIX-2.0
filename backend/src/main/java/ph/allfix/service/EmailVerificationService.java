package ph.allfix.service;

import com.google.firebase.auth.ActionCodeSettings;
import com.google.firebase.auth.FirebaseAuth;
import jakarta.mail.internet.MimeMessage;
import org.springframework.core.env.Environment;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailVerificationService {

    private final JavaMailSender mailSender;
    private final Environment env;

    public EmailVerificationService(JavaMailSender mailSender, Environment env) {
        this.mailSender = mailSender;
        this.env = env;
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
        System.out.println("sendVerificationEmail: Generated verification link successfully");

        // Fetch sender credentials
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

        String logoUrl = frontendUrl + "/ALLFIXLOGO.png";

        // Redesigned verification email template
        String htmlBody = "<!DOCTYPE html>\n" +
                "<html lang=\"en\">\n" +
                "<head>\n" +
                "  <meta charset=\"UTF-8\">\n" +
                "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
                "  <title>Verify Your Email</title>\n" +
                "</head>\n" +
                "<body style=\"margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; color: #0f172a;\">\n" +
                "  <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"background-color: #f1f5f9; padding: 40px 0;\">\n" +
                "    <tr>\n" +
                "      <td align=\"center\">\n" +
                "        <table role=\"presentation\" width=\"100%\" style=\"max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; border-collapse: collapse;\">\n" +
                "          <!-- Header (Branding & Logo) -->\n" +
                "          <tr>\n" +
                "            <td align=\"center\" style=\"background-color: #041e41; padding: 40px 40px 35px 40px;\">\n" +
                "              <img src=\"{{logoUrl}}\" alt=\"AllFix Logo\" width=\"70\" height=\"70\" style=\"display: block; width: 70px; height: 70px; object-fit: contain; margin-bottom: 16px;\" />\n" +
                "              <h1 style=\"color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em; font-family: 'Inter', sans-serif;\">AllFix<span style=\"color: #20b759;\">.ph</span></h1>\n" +
                "            </td>\n" +
                "          </tr>\n" +
                "          <!-- Content -->\n" +
                "          <tr>\n" +
                "            <td style=\"padding: 40px 40px 30px 40px;\">\n" +
                "              <h2 style=\"margin-top: 0; margin-bottom: 18px; font-size: 24px; font-weight: 700; color: #041e41; text-align: center;\">Verify Your Email Address</h2>\n" +
                "              <p style=\"font-size: 16px; line-height: 1.6; color: #475569; margin-bottom: 20px; margin-top: 0;\">\n" +
                "                Welcome to AllFix.ph! Thank you for signing up to join our platform.\n" +
                "              </p>\n" +
                "              <p style=\"font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 30px;\">\n" +
                "                To complete your registration and keep your account secure, please verify your email address. By verifying, you ensure that you receive important booking updates, invoices, and support notifications from our service providers.\n" +
                "              </p>\n" +
                "              <!-- Button CTA -->\n" +
                "              <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"margin-bottom: 35px;\">\n" +
                "                <tr>\n" +
                "                  <td align=\"center\">\n" +
                "                    <a href=\"{{verificationLink}}\" target=\"_blank\" style=\"display: inline-block; background-color: #20b759; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 36px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(32, 183, 89, 0.2), 0 2px 4px -1px rgba(32, 183, 89, 0.1);\">Verify Email</a>\n" +
                "                  </td>\n" +
                "                </tr>\n" +
                "              </table>\n" +
                "              <hr style=\"border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 30px;\" />\n" +
                "              <!-- Fallback Link -->\n" +
                "              <p style=\"font-size: 14px; line-height: 1.5; color: #64748b; margin-bottom: 8px; margin-top: 0;\">\n" +
                "                If the button above doesn't work, please copy and paste the link below into your web browser:\n" +
                "              </p>\n" +
                "              <p style=\"font-size: 13px; line-height: 1.5; color: #20b759; word-break: break-all; margin-top: 0; margin-bottom: 0;\">\n" +
                "                <a href=\"{{verificationLink}}\" target=\"_blank\" style=\"color: #20b759; text-decoration: underline;\">{{verificationLink}}</a>\n" +
                "              </p>\n" +
                "            </td>\n" +
                "          </tr>\n" +
                "          <!-- Footer -->\n" +
                "          <tr>\n" +
                "            <td align=\"center\" style=\"background-color: #f8fafc; padding: 24px; border-top: 1px solid #edf2f7; font-size: 12px; color: #94a3b8; line-height: 1.5;\">\n" +
                "              <p style=\"margin-top: 0; margin-bottom: 8px;\">This is an automated verification email. Please do not reply directly to this message.</p>\n" +
                "              <p style=\"margin: 0;\">&copy; 2026 AllFix.ph. All rights reserved.</p>\n" +
                "            </td>\n" +
                "          </tr>\n" +
                "        </table>\n" +
                "      </td>\n" +
                "    </tr>\n" +
                "  </table>\n" +
                "</body>\n" +
                "</html>";

        htmlBody = htmlBody.replace("{{logoUrl}}", logoUrl);
        htmlBody = htmlBody.replace("{{verificationLink}}", link);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(fromEmail);
        helper.setTo(email);
        helper.setSubject("AllFix.ph - Verify Your Email Address");
        helper.setText(htmlBody, true);

        mailSender.send(message);
        System.out.println("sendVerificationEmail: Successfully sent email to " + email);
    }

    public void sendOtpEmail(String email, String otp) throws Exception {
        System.out.println("sendOtpEmail: Sending OTP to " + email);

        String frontendUrl = env.getProperty("frontend.url");
        if (frontendUrl == null || frontendUrl.isBlank()) {
            frontendUrl = "http://localhost:5175";
        }

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

        String logoUrl = frontendUrl + "/ALLFIXLOGO.png";

        String htmlBody = "<!DOCTYPE html>\n" +
                "<html lang=\"en\">\n" +
                "<head>\n" +
                "  <meta charset=\"UTF-8\">\n" +
                "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
                "  <title>Your Verification Code</title>\n" +
                "</head>\n" +
                "<body style=\"margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; color: #0f172a;\">\n" +
                "  <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"background-color: #f1f5f9; padding: 40px 0;\">\n" +
                "    <tr>\n" +
                "      <td align=\"center\">\n" +
                "        <table role=\"presentation\" width=\"100%\" style=\"max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; border-collapse: collapse;\">\n" +
                "          <tr>\n" +
                "            <td align=\"center\" style=\"background-color: #041e41; padding: 40px 40px 35px 40px;\">\n" +
                "              <img src=\"" + logoUrl + "\" alt=\"AllFix Logo\" width=\"70\" height=\"70\" style=\"display: block; width: 70px; height: 70px; object-fit: contain; margin-bottom: 16px;\" />\n" +
                "              <h1 style=\"color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em; font-family: 'Inter', sans-serif;\">AllFix<span style=\"color: #20b759;\">.ph</span></h1>\n" +
                "            </td>\n" +
                "          </tr>\n" +
                "          <tr>\n" +
                "            <td style=\"padding: 40px 40px 30px 40px; text-align: center;\">\n" +
                "              <h2 style=\"margin-top: 0; margin-bottom: 18px; font-size: 24px; font-weight: 700; color: #041e41;\">Your Verification Code</h2>\n" +
                "              <p style=\"font-size: 16px; line-height: 1.6; color: #475569; margin-bottom: 20px; margin-top: 0;\">\n" +
                "                Please use the following 6-digit code to verify your account registration.\n" +
                "              </p>\n" +
                "              <div style=\"background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 20px; margin: 30px auto; max-width: 300px;\">\n" +
                "                <span style=\"font-size: 32px; font-weight: 800; color: #20b759; letter-spacing: 0.2em;\">" + otp + "</span>\n" +
                "              </div>\n" +
                "              <p style=\"font-size: 14px; line-height: 1.5; color: #64748b; margin-bottom: 8px; margin-top: 0;\">\n" +
                "                This code will expire in 10 minutes. If you did not request this, please ignore this email.\n" +
                "              </p>\n" +
                "            </td>\n" +
                "          </tr>\n" +
                "          <tr>\n" +
                "            <td align=\"center\" style=\"background-color: #f8fafc; padding: 24px; border-top: 1px solid #edf2f7; font-size: 12px; color: #94a3b8; line-height: 1.5;\">\n" +
                "              <p style=\"margin-top: 0; margin-bottom: 8px;\">This is an automated verification email. Please do not reply directly to this message.</p>\n" +
                "              <p style=\"margin: 0;\">&copy; 2026 AllFix.ph. All rights reserved.</p>\n" +
                "            </td>\n" +
                "          </tr>\n" +
                "        </table>\n" +
                "      </td>\n" +
                "    </tr>\n" +
                "  </table>\n" +
                "</body>\n" +
                "</html>";

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(fromEmail);
        helper.setTo(email);
        helper.setSubject("AllFix.ph - Your Verification Code: " + otp);
        helper.setText(htmlBody, true);

        mailSender.send(message);
        System.out.println("sendOtpEmail: Successfully sent OTP email to " + email);
    }
}
