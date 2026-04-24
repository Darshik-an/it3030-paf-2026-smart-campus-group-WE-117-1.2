package com.example.backend.config;

import com.example.backend.model.auth.User;
import com.example.backend.model.ticketing.HelpdeskTechnician;
import com.example.backend.repository.auth.UserRepository;
import com.example.backend.repository.ticketing.HelpdeskTechnicianRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private static final String ADMIN_EMAIL = "admin@smartcampus.edu";
    private static final String ADMIN_PASSWORD = "Admin@123";
    private static final String ADMIN_NAME = "System Administrator";

    private final UserRepository userRepository;
    private final HelpdeskTechnicianRepository helpdeskTechnicianRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner seedUsers() {
        return args -> {
            seedUserIfNotExists(ADMIN_EMAIL, ADMIN_NAME, ADMIN_PASSWORD, User.Role.ADMIN);
            seedUserIfNotExists("user@smartcampus.edu", "Regular User", "User@123", User.Role.USER);
            seedUserIfNotExists("lecturer@smartcampus.edu", "Lecturer User", "Lecturer@123", User.Role.LECTURER);
            seedUserIfNotExists("instructor@smartcampus.edu", "Instructor User", "Instructor@123", User.Role.INSTRUCTOR);
            seedUserIfNotExists("facility_manager@smartcampus.edu", "Facility Manager", "Manager@123", User.Role.FACILITY_MANAGER);
            seedUserIfNotExists("coordinator@smartcampus.edu", "Coordinator User", "Coordinator@123", User.Role.COORDINATOR);
            seedUserIfNotExists("support@smartcampus.edu", "Student Support", "Support@123", User.Role.STUDENT_SUPPORT);
            seedUserIfNotExists("technician@smartcampus.edu", "Technician User", "Technician@123", User.Role.TECHNICIAN);
            seedHelpdeskTechniciansIfEmpty();
        };
    }

    private void seedHelpdeskTechniciansIfEmpty() {
        if (helpdeskTechnicianRepository.count() > 0) {
            return;
        }
        try {
            helpdeskTechnicianRepository.save(helpdeskTech(
                    "Marcus Thorne", "marcus@campus.com", "+94 77 123 4567",
                    "Hardware", "Projectors & AV Systems"));
            helpdeskTechnicianRepository.save(helpdeskTech(
                    "Sarah Jenkins", "sarah@campus.com", "+94 71 555 7788",
                    "Software", "Network & Systems"));
            helpdeskTechnicianRepository.save(helpdeskTech(
                    "Brian Taylor", "brian@campus.com", "+94 75 888 2222",
                    "Facility", "HVAC & Plumbing"));
            log.info("Seeded sample helpdesk technicians");
        } catch (Exception ex) {
            log.warn("Skipping helpdesk technician seed: {}", ex.getMessage());
        }
    }

    private static HelpdeskTechnician helpdeskTech(
            String name, String email, String phone, String category, String specialization
    ) {
        HelpdeskTechnician t = new HelpdeskTechnician();
        t.setName(name);
        t.setEmail(email);
        t.setPhone(phone);
        t.setCategory(category);
        t.setSpecialization(specialization);
        return t;
    }

    private void seedUserIfNotExists(String email, String name, String password, User.Role role) {
        if (userRepository.findByEmail(email).isPresent()) {
            log.info("{} user already exists: {}", role.name(), email);
            return;
        }

        try {
            User user = new User();
            user.setEmail(email);
            user.setName(name);
            user.setPassword(passwordEncoder.encode(password));
            user.setRole(role);
            user.setLastLoggedIn(LocalDateTime.now());
            userRepository.save(user);

            log.info("{} user seeded: {} / {}", role.name(), email, password);
        } catch (Exception ex) {
            log.warn("Skipping seed for {} because DB rejected role '{}': {}", email, role.name(), ex.getMessage());
        }
    }
}
