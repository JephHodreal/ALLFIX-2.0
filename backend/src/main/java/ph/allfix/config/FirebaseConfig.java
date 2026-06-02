package ph.allfix.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Configuration
public class FirebaseConfig {

    private static final Logger logger = LoggerFactory.getLogger(FirebaseConfig.class);

    @Value("${firebase.project-id:}")
    private String projectId;

    @Value("${firebase.service-account-path:./serviceAccountKey.json}")
    private String serviceAccountPath;

    @Value("${firebase.storage-bucket:}")
    private String storageBucket;

    @PostConstruct
    public void init() throws IOException {
        if (FirebaseApp.getApps().isEmpty()) {
            try {
                GoogleCredentials credentials = loadCredentials(serviceAccountPath);
                FirebaseOptions.Builder builder = FirebaseOptions.builder().setCredentials(credentials);
                if (projectId != null && !projectId.isBlank()) {
                    builder.setProjectId(projectId);
                }
                // Set storage bucket (derived from project ID if not explicitly set)
                String bucket = (storageBucket != null && !storageBucket.isBlank())
                    ? storageBucket
                    : (projectId != null && !projectId.isBlank() ? projectId + ".firebasestorage.app" : null);
                if (bucket != null) {
                    builder.setStorageBucket(bucket);
                }
                FirebaseApp.initializeApp(builder.build());
                logger.info("Firebase initialized successfully{}", (projectId == null || projectId.isBlank()) ? "" : " with project: " + projectId);
            } catch (IOException e) {
                logger.warn("Firebase initialization skipped (credentials not configured/invalid).");
                logger.debug("Firebase init failure details", e);
            }
        }
    }

    private GoogleCredentials loadCredentials(String serviceAccountPathOrJson) throws IOException {
        if (serviceAccountPathOrJson == null || serviceAccountPathOrJson.isBlank()) {
            throw new IOException("Firebase service account not provided.");
        }

        String trimmed = serviceAccountPathOrJson.trim();
        if (trimmed.startsWith("{") && trimmed.contains("\"type\"") && trimmed.contains("service_account")) {
            try (ByteArrayInputStream in = new ByteArrayInputStream(trimmed.getBytes(StandardCharsets.UTF_8))) {
                return GoogleCredentials.fromStream(in);
            }
        }

        File serviceAccountFile = new File(trimmed);
        if (!serviceAccountFile.exists()) {
            throw new IOException("Firebase service account file not found at: " + trimmed);
        }
        try (FileInputStream in = new FileInputStream(serviceAccountFile)) {
            return GoogleCredentials.fromStream(in);
        }
    }

    // Firestore is obtained lazily by services to allow the app
    // to start even when Firebase credentials are not configured.
}
