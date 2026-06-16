package ph.allfix.service;

import com.google.firebase.FirebaseApp;
import com.google.firebase.cloud.StorageClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Handles uploading images to Firebase Storage.
 * Accepts base64-encoded image data, uploads to Cloud Storage,
 * and returns a public download URL.
 */
@Service
public class StorageService {

    private static final Logger logger = LoggerFactory.getLogger(StorageService.class);

    @Value("${firebase.storage-bucket:}")
    private String storageBucket;

    /**
     * Upload a base64-encoded image to Firebase Storage.
     *
     * @param base64Data  Full data URL (e.g. "data:image/png;base64,iVBOR...") or raw base64 string
     * @param folder      Storage folder path (e.g. "services", "subservices")
     * @return Public download URL for the uploaded image
     */
    public String uploadBase64Image(String base64Data, String folder) {
        if (base64Data == null || base64Data.isBlank()) {
            return "";
        }

        try {
            // Parse the base64 data URL
            String contentType = "image/png"; // default
            String rawBase64 = base64Data;

            if (base64Data.startsWith("data:")) {
                // Extract content type from data URL: "data:image/png;base64,..."
                String[] parts = base64Data.split(",", 2);
                if (parts.length == 2) {
                    String header = parts[0]; // "data:image/png;base64"
                    rawBase64 = parts[1];
                    if (header.contains("image/jpeg") || header.contains("image/jpg")) {
                        contentType = "image/jpeg";
                    } else if (header.contains("image/png")) {
                        contentType = "image/png";
                    } else if (header.contains("image/webp")) {
                        contentType = "image/webp";
                    } else if (header.contains("application/pdf")) {
                        contentType = "application/pdf";
                    }
                }
            }

            byte[] imageBytes = Base64.getDecoder().decode(rawBase64);

            // Determine file extension
            String extension = contentType.equals("image/jpeg") ? ".jpg"
                             : contentType.equals("image/webp") ? ".webp"
                             : contentType.equals("application/pdf") ? ".pdf"
                             : ".png";

            String fileName = folder + "/" + UUID.randomUUID() + extension;

            // LOCAL STORAGE FALLBACK TO AVOID FIREBASE BLAZE PLAN BILLING
            try {
                java.nio.file.Path uploadDir = java.nio.file.Paths.get("uploads", folder);
                if (!java.nio.file.Files.exists(uploadDir)) {
                    java.nio.file.Files.createDirectories(uploadDir);
                }
                
                String generatedFileName = UUID.randomUUID().toString() + extension;
                java.nio.file.Path filePath = uploadDir.resolve(generatedFileName);
                java.nio.file.Files.write(filePath, imageBytes);
                
                String publicUrl = "http://localhost:8080/uploads/" + folder + "/" + generatedFileName;
                logger.info("Saved image locally to bypass Firebase Storage: {}", publicUrl);
                return publicUrl;
                
            } catch (Exception ex) {
                logger.error("Local upload failed", ex);
                throw new RuntimeException("Failed to save image locally", ex);
            }
            
        } catch (Exception e) {
            logger.error("Failed to process image upload", e);
            throw new RuntimeException("Failed to upload image: " + e.getMessage(), e);
        }
    }

    private String getBucketName() {
        if (storageBucket != null && !storageBucket.isBlank()) {
            return storageBucket;
        }
        // Fallback: derive from Firebase project ID
        if (!FirebaseApp.getApps().isEmpty()) {
            String projectId = FirebaseApp.getInstance().getOptions().getProjectId();
            if (projectId != null) {
                return projectId + ".appspot.com";
            }
        }
        throw new RuntimeException("Firebase Storage bucket not configured. Set firebase.storage-bucket in application.properties.");
    }
}
