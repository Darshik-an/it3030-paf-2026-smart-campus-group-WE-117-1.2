package com.example.backend.config;

import com.example.backend.model.auth.User;
import com.example.backend.model.Resource;
import com.example.backend.model.ticketing.HelpdeskTechnician;
import com.example.backend.repository.auth.UserRepository;
import com.example.backend.repository.ResourceRepository;
import com.example.backend.repository.ticketing.HelpdeskTechnicianRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.jdbc.core.JdbcTemplate;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.UUID;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private static final String ADMIN_EMAIL = "admin@smartcampus.edu";
    private static final String LEGACY_ADMIN_EMAIL = "admin@campus.lk";
    private static final String ADMIN_PASSWORD = "Admin@123";
    private static final String ADMIN_NAME = "System Administrator";

    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final HelpdeskTechnicianRepository helpdeskTechnicianRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @Bean
    public CommandLineRunner seedUsers() {
        return args -> {
            dropLegacyTechnicianActiveTicketsTable();
            normalizeLegacyEnumColumns();
            purgeRetiredRoleUsers();
            migrateEquipmentFacilitiesToAuditorium();
            backfillMissingResourceCodes();
            repairSeedUserCredentialsIfLegacy(ADMIN_EMAIL, ADMIN_PASSWORD, User.Role.ADMIN);
            repairSeedUserCredentialsIfLegacy("user@smartcampus.edu", "User@123", User.Role.USER);
            repairSeedUserCredentialsIfLegacy("facility_manager@smartcampus.edu", "Manager@123", User.Role.FACILITY_MANAGER);
            repairSeedUserCredentialsIfLegacy("support@smartcampus.edu", "Support@123", User.Role.STUDENT_SUPPORT);
            repairSeedUserCredentialsIfLegacy("technician@smartcampus.edu", "Technician@123", User.Role.TECHNICIAN);
            ensureAdminUser(ADMIN_EMAIL, ADMIN_NAME, ADMIN_PASSWORD);
            ensureAdminUser(LEGACY_ADMIN_EMAIL, ADMIN_NAME, ADMIN_PASSWORD);
            seedUserIfNotExists("fmanager@campus.lk", "Bandara lokuge", "Manager@123", User.Role.FACILITY_MANAGER);
            seedUserIfNotExists("support@campus.lk", "Kumari Perera", "Support@123", User.Role.STUDENT_SUPPORT);
            seedUserIfNotExists("tech@campus.lk", "Saman Kumara", "Tech@123", User.Role.TECHNICIAN);
            seedHelpdeskTechniciansIfEmpty();
            seedTechnicianUsersFromHelpdeskRoster();
        };
    }

    private void purgeRetiredRoleUsers() {
        try {
            int removed = jdbcTemplate.update(
                    "DELETE FROM users WHERE role IN ('LECTURER','INSTRUCTOR','COORDINATOR')"
            );
            if (removed > 0) {
                log.info("Purged {} user(s) with retired roles (LECTURER/INSTRUCTOR/COORDINATOR)", removed);
            }
        } catch (Exception ex) {
            log.warn("Could not purge retired-role users: {}", ex.getMessage());
        }
    }

    private void dropLegacyTechnicianActiveTicketsTable() {
        try {
            jdbcTemplate.execute("DROP TABLE IF EXISTS helpdesk_technician_active_tickets");
        } catch (Exception ex) {
            log.warn("Could not drop legacy table helpdesk_technician_active_tickets: {}", ex.getMessage());
        }
    }

    private void normalizeLegacyEnumColumns() {
        try {
            jdbcTemplate.execute("ALTER TABLE resources ALTER COLUMN type VARCHAR(64)");
        } catch (Exception ex) {
            log.debug("resources.type enum normalization skipped: {}", ex.getMessage());
        }

        try {
            jdbcTemplate.execute("ALTER TABLE users ALTER COLUMN role VARCHAR(64)");
        } catch (Exception ex) {
            log.debug("users.role enum normalization skipped: {}", ex.getMessage());
        }
    }

    private void migrateEquipmentFacilitiesToAuditorium() {
        try {
            int updated = jdbcTemplate.update(
                    "UPDATE resources SET type = 'AUDITORIUM' WHERE type = 'EQUIPMENT'"
            );
            if (updated > 0) {
                log.info("Migrated {} facility record(s) from EQUIPMENT to AUDITORIUM", updated);
            }
        } catch (Exception ex) {
            log.warn("Could not migrate EQUIPMENT facilities to AUDITORIUM: {}", ex.getMessage());
        }
    }

    private void backfillMissingResourceCodes() {
        try {
            var resources = resourceRepository.findByResourceCodeIsNull();
            int updated = 0;
            for (Resource resource : resources) {
                String code = generateUniqueResourceCode();
                resource.setResourceCode(code);
                resourceRepository.save(resource);
                updated++;
            }
            if (updated > 0) {
                log.info("Backfilled resourceCode for {} facility record(s)", updated);
            }
        } catch (Exception ex) {
            log.warn("Could not backfill resource codes: {}", ex.getMessage());
        }
    }

    private String generateUniqueResourceCode() {
        String code;
        do {
            code = "FAC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);
        } while (resourceRepository.existsByResourceCode(code));
        return code;
    }

    private void seedHelpdeskTechniciansIfEmpty() {
        if (helpdeskTechnicianRepository.count() > 0) {
            return;
        }
        try {
            helpdeskTechnicianRepository.save(helpdeskTech(
                    "Marcus Thorne", "marcus@campus.lk", "+94 77 123 4567",
                    "Hardware", "Projectors & AV Systems"));
            helpdeskTechnicianRepository.save(helpdeskTech(
                    "Sarah Jenkins", "sarah@campus.lk", "+94 71 555 7788",
                    "Software", "Network & Systems"));
            helpdeskTechnicianRepository.save(helpdeskTech(
                    "Brian Taylor", "brian@campus.lk", "+94 75 888 2222",
                    "Facility", "HVAC & Plumbing"));
            log.info("Seeded sample helpdesk technicians");
        } catch (Exception ex) {
            log.warn("Skipping helpdesk technician seed: {}", ex.getMessage());
        }
    }

    private void seedTechnicianUsersFromHelpdeskRoster() {
        final String defaultPassword = "Technician@123";
        helpdeskTechnicianRepository.findAll().forEach(t -> {
            String email = t.getEmail() != null ? t.getEmail().trim().toLowerCase(Locale.ROOT) : "";
            if (email.isBlank()) return;
            if (userRepository.findByEmail(email).isPresent()) return;

            try {
                User user = new User();
                user.setEmail(email);
                user.setName(t.getName() != null ? t.getName().trim() : "Technician");
                user.setPassword(passwordEncoder.encode(defaultPassword));
                user.setRole(User.Role.TECHNICIAN);
                user.setLastLoggedIn(LocalDateTime.now());
                userRepository.save(user);
                log.info("TECHNICIAN user seeded from helpdesk roster: {} / {}", email, defaultPassword);
            } catch (Exception ex) {
                log.warn("Skipping technician user seed for {}: {}", email, ex.getMessage());
            }
        });
    }

    private void repairSeedUserCredentialsIfLegacy(String email, String expectedPassword, User.Role expectedRole) {
        userRepository.findByEmail(email).ifPresent(user -> {
            if (user.getRole() != expectedRole) {
                return;
            }
            String storedPassword = user.getPassword();
            if (storedPassword == null || storedPassword.isBlank()) {
                return;
            }
            if (looksLikeBcrypt(storedPassword)) {
                return;
            }
            if (!storedPassword.equals(expectedPassword)) {
                return;
            }
            user.setPassword(passwordEncoder.encode(expectedPassword));
            userRepository.save(user);
            log.info("Upgraded legacy plain-text password for seed user {}", email);
        });
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

    private void ensureAdminUser(String email, String name, String password) {
        try {
            User user = userRepository.findByEmail(email).orElseGet(User::new);
            boolean isNew = user.getId() == null;
            user.setEmail(email);
            user.setName(name);
            user.setPassword(passwordEncoder.encode(password));
            user.setRole(User.Role.ADMIN);
            user.setLastLoggedIn(LocalDateTime.now());
            userRepository.save(user);
            if (isNew) {
                log.info("ADMIN user seeded: {} / {}", email, password);
            } else {
                log.info("ADMIN user refreshed: {} / {}", email, password);
            }
        } catch (Exception ex) {
            log.warn("Skipping admin seed for {}: {}", email, ex.getMessage());
        }
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

    private boolean looksLikeBcrypt(String password) {
        return password.startsWith("$2a$")
                || password.startsWith("$2b$")
                || password.startsWith("$2y$");
    }
}
