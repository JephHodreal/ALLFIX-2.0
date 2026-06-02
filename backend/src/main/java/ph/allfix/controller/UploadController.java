package ph.allfix.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import ph.allfix.service.StorageService;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

    private static final Logger logger = LoggerFactory.getLogger(UploadController.class);
    private final StorageService storageService;

    public UploadController(StorageService storageService) {
        this.storageService = storageService;
    }

    /**
     * Upload a base64-encoded image to Firebase Storage.
     * Expects JSON body: { "image": "data:image/png;base64,...", "folder": "services" }
     * Returns: { "url": "https://storage.googleapis.com/..." }
     */
    @PostMapping("/image")
    public ResponseEntity<?> uploadImage(@RequestBody Map<String, String> body) {
        try {
            String base64Image = body.get("image");
            String folder = body.getOrDefault("folder", "uploads");

            if (base64Image == null || base64Image.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Image data is required."));
            }

            String url = storageService.uploadBase64Image(base64Image, folder);
            logger.info("Image uploaded successfully to folder: {}", folder);
            return ResponseEntity.ok(Map.of("url", url));
        } catch (Exception e) {
            logger.error("Failed to upload image", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Failed to upload image: " + e.getMessage()));
        }
    }
}
