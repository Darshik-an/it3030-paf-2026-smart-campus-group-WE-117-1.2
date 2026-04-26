package com.example.backend.security;

import com.example.backend.model.auth.User;
import com.example.backend.repository.auth.UserRepository;
import com.example.backend.service.FileStorageService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final FileStorageService fileStorageService;

    @Value("${app.frontend.url:http://localhost:5174}")
    private String frontendUrl;

    private String downloadAndStoreProfilePicture(String pictureUrl, String email) {
        if (pictureUrl == null || pictureUrl.trim().isEmpty()) {
            return null;
        }
        
        try {
            // Download the image from Google
            URL url = new URL(pictureUrl);
            String fileExtension = pictureUrl.contains(".jpg") ? ".jpg" : 
                                  pictureUrl.contains(".jpeg") ? ".jpeg" : 
                                  pictureUrl.contains(".png") ? ".png" : ".jpg";
            
            String fileName = "google-avatar-" + email.replaceAll("[^a-zA-Z0-9]", "_") + "-" + UUID.randomUUID().toString().substring(0, 8) + fileExtension;
            
            Path uploadPath = Paths.get("uploads/avatars");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(url.openStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            return "/uploads/avatars/" + fileName;
        } catch (Exception e) {
            System.err.println("Failed to download profile picture: " + e.getMessage());
            return pictureUrl; // Fallback to original URL if download fails
        }
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");

        Optional<User> existingUser = userRepository.findByEmail(email);
        User user;

        if (existingUser.isEmpty()) {
            user = new User();
            user.setEmail(email);
            user.setName(name);
            user.setProfilePicture(downloadAndStoreProfilePicture(picture, email));
            user.setLastLoggedIn(java.time.LocalDateTime.now());
            // First user could be ADMIN or standard logic. Defaulting to USER
            user.setRole(User.Role.USER); 
            userRepository.save(user);
        } else {
            user = existingUser.get();
            user.setName(name);
            // Only update profile picture if it's different or doesn't exist
            String newProfilePicture = downloadAndStoreProfilePicture(picture, email);
            if (newProfilePicture != null && !newProfilePicture.equals(user.getProfilePicture())) {
                user.setProfilePicture(newProfilePicture);
            }
            user.setLastLoggedIn(java.time.LocalDateTime.now());
            userRepository.save(user);
        }

        String token = jwtUtil.generateToken(user.getEmail());

        String targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/oauth2/callback")
                .queryParam("token", token)
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}