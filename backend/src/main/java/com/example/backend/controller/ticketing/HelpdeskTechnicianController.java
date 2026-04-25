package com.example.backend.controller.ticketing;

import com.example.backend.model.auth.User;
import com.example.backend.repository.auth.UserRepository;
import com.example.backend.service.ticketing.HelpdeskTechnicianService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/helpdesk/technicians")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class HelpdeskTechnicianController {

    private final HelpdeskTechnicianService helpdeskTechnicianService;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private boolean canManageHelpdesk(User user) {
        return user.getRole() == User.Role.ADMIN || user.getRole() == User.Role.STUDENT_SUPPORT;
    }

    @GetMapping
    public ResponseEntity<?> list() {
        try {
            User user = getCurrentUser();
            if (!canManageHelpdesk(user)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
            }
            List<HelpdeskTechnicianResponse> list = helpdeskTechnicianService.findAllForRoster();
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody CreateHelpdeskTechnicianRequest request) {
        try {
            User user = getCurrentUser();
            if (!canManageHelpdesk(user)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
            }
            HelpdeskTechnicianResponse created = helpdeskTechnicianService.create(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @Valid @RequestBody CreateHelpdeskTechnicianRequest request
    ) {
        try {
            User user = getCurrentUser();
            if (!canManageHelpdesk(user)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
            }
            HelpdeskTechnicianResponse updated = helpdeskTechnicianService.update(id, request);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            if ("Technician not found.".equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
            }
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            User user = getCurrentUser();
            if (!canManageHelpdesk(user)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
            }
            helpdeskTechnicianService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            if ("Technician not found.".equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
            }
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }
}
