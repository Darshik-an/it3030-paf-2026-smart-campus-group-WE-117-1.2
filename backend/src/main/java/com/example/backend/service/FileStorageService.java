package com.example.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path root = Paths.get("uploads");
    private final Path avatars = root.resolve("avatars");

    public FileStorageService() {
        try {
            Files.createDirectories(avatars);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage", e);
        }
    }

    public String saveAvatar(MultipartFile file) {
        try {
            if (file.isEmpty()) {
                throw new RuntimeException("Failed to store empty file.");
            }
            
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new RuntimeException("Only image files are allowed.");
            }

            String extension = "";
            String originalFilename = file.getOriginalFilename();
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            } else {
                extension = ".jpg"; // Default
            }

            String fileName = UUID.randomUUID().toString() + extension;
            Files.copy(file.getInputStream(), this.avatars.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);
            
            return "/uploads/avatars/" + fileName;
        } catch (Exception e) {
            throw new RuntimeException("Could not store the file. Error: " + e.getMessage());
        }
    }

    public void deleteFile(String filePath) {
        try {
            // filePath expected as "/uploads/avatars/filename.jpg"
            if (filePath == null || !filePath.startsWith("/uploads/")) return;
            
            String relativePath = filePath.substring(1); // remove leading slash
            Path path = Paths.get(relativePath);
            Files.deleteIfExists(path);
        } catch (IOException e) {
            throw new RuntimeException("Error deleting file: " + filePath, e);
        }
    }
}
