package com.example.backend.controller.auth;

import com.example.backend.model.auth.User;
import com.example.backend.repository.auth.UserRepository;
import com.example.backend.security.JwtUtil;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final com.example.backend.service.FileStorageService fileStorageService;
    private final com.example.backend.repository.ticketing.TicketRepository ticketRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already exists"));
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName());
        user.setRole(User.Role.USER);
        user.setLastLoggedIn(java.time.LocalDateTime.now());

        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail());
        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        String rawPassword = request.getPassword();
        if (normalizedEmail == null || normalizedEmail.isBlank() || rawPassword == null || rawPassword.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid email or password"));
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(normalizedEmail, rawPassword)
            );
        } catch (BadCredentialsException e) {
            if (!tryUpgradeLegacyPassword(normalizedEmail, rawPassword)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid email or password"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid email or password"));
        }

        User user = userRepository.findByEmail(normalizedEmail).orElseThrow();
        user.setLastLoggedIn(java.time.LocalDateTime.now());
        userRepository.save(user);

        String token = jwtUtil.generateToken(normalizedEmail);

        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof User) {
            User user = (User) principal;
            return ResponseEntity.ok(user);
        }

        return ResponseEntity.status(401).body("Unauthorized");
    }

    @PatchMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody UpdateProfileRequest request) {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof User) {
            User authenticatedUser = (User) principal;
            User user = userRepository.findByEmail(authenticatedUser.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (request.getName() != null && !request.getName().isBlank()) {
                user.setName(request.getName());
            }
            if (request.getPhone() != null && !request.getPhone().isBlank()) {
                user.setPhoneNumber(request.getPhone());
            }
            if (request.getPassword() != null && !request.getPassword().isBlank()) {
                if (request.getCurrentPassword() == null || request.getCurrentPassword().isBlank()) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Current password is required to set a new password"));
                }
                if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Incorrect current password"));
                }
                user.setPassword(passwordEncoder.encode(request.getPassword()));
            }

            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
        }

        return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
    }

    @PostMapping("/profile/picture")
    public ResponseEntity<?> uploadProfilePicture(@RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof User)) return ResponseEntity.status(401).body("Unauthorized");

        User authenticatedUser = (User) principal;
        User user = userRepository.findByEmail(authenticatedUser.getEmail()).orElseThrow();

        // Delete old picture if exists
        if (user.getProfilePicture() != null) {
            fileStorageService.deleteFile(user.getProfilePicture());
        }

        String fileName = fileStorageService.saveAvatar(file);
        user.setProfilePicture(fileName);
        userRepository.save(user);

        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/profile/picture")
    public ResponseEntity<?> deleteProfilePicture() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof User)) return ResponseEntity.status(401).body("Unauthorized");

        User authenticatedUser = (User) principal;
        User user = userRepository.findByEmail(authenticatedUser.getEmail()).orElseThrow();

        if (user.getProfilePicture() != null) {
            fileStorageService.deleteFile(user.getProfilePicture());
            user.setProfilePicture(null);
            userRepository.save(user);
        }

        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/profile")
    @Transactional
    public ResponseEntity<?> deleteAccount() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof User)) return ResponseEntity.status(401).body("Unauthorized");

        User authenticatedUser = (User) principal;
        User user = userRepository.findByEmail(authenticatedUser.getEmail()).orElseThrow();

        // Cleanup profile picture
        if (user.getProfilePicture() != null) {
            fileStorageService.deleteFile(user.getProfilePicture());
        }

        // Cleanup user tickets
        ticketRepository.deleteByUser(user);

        // Finally delete the user
        userRepository.delete(user);

        return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
    }

    @Data
    static class UpdateProfileRequest {
        private String name;
        private String phone;
        private String currentPassword;
        private String password;
    }

    @Data
    static class RegisterRequest {
        private String name;
        private String email;
        private String password;
    }

    @Data
    static class AuthRequest {
        private String email;
        private String password;
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    private boolean tryUpgradeLegacyPassword(String email, String rawPassword) {
        return userRepository.findByEmail(email)
                .map(user -> {
                    String storedPassword = user.getPassword();
                    if (storedPassword == null || storedPassword.isBlank()) return false;
                    if (looksLikeBcrypt(storedPassword)) return false;
                    if (!storedPassword.equals(rawPassword)) return false;
                    user.setPassword(passwordEncoder.encode(rawPassword));
                    userRepository.save(user);
                    return true;
                })
                .orElse(false);
    }

    private boolean looksLikeBcrypt(String password) {
        return password.startsWith("$2a$")
                || password.startsWith("$2b$")
                || password.startsWith("$2y$");
    }
}