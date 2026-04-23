package com.example.backend.controller.auth;

import com.example.backend.dto.auth.CreateStaffRequest;
import com.example.backend.model.auth.User;
import com.example.backend.repository.auth.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/staff")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllStaff() {
        return ResponseEntity.ok(userRepository.findByRoleNot(User.Role.USER));
    }

    @PostMapping("/staff")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createStaff(@RequestBody CreateStaffRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }
        if (request.getName() == null || request.getName().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Name is required"));
        }
        if (request.getPassword() == null || request.getPassword().length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password must be at least 6 characters"));
        }
        if (request.getRole() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Role is required"));
        }
        if (request.getRole() == User.Role.USER) {
            return ResponseEntity.badRequest().body(Map.of("message", "Cannot create a staff member with USER role. Use /api/auth/register for student accounts."));
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already exists"));
        }

        User staff = new User();
        staff.setEmail(request.getEmail().trim().toLowerCase());
        staff.setName(request.getName().trim());
        staff.setPhoneNumber(request.getPhoneNumber());
        staff.setPassword(passwordEncoder.encode(request.getPassword()));
        staff.setRole(request.getRole());
        staff.setLastLoggedIn(LocalDateTime.now());

        User saved = userRepository.save(staff);
        saved.setPassword(null);
        return ResponseEntity.ok(saved);
    }

    @PatchMapping("/users/{userId}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserRole(@PathVariable Long userId,
                                            @RequestBody Map<String, String> body) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        String newRole = body.get("role");
        try {
            user.setRole(User.Role.valueOf(newRole.toUpperCase()));
        } catch (IllegalArgumentException | NullPointerException e) {
            String validRoles = Arrays.stream(User.Role.values())
                    .map(Enum::name)
                    .collect(Collectors.joining(", "));
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid role. Must be one of: " + validRoles));
        }
        userRepository.save(user);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/users/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        if (!userRepository.existsById(userId)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(userId);
        return ResponseEntity.noContent().build();
    }
}
