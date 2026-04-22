package com.example.backend.config;

import com.example.backend.model.auth.User;
import com.example.backend.repository.auth.UserRepository;
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
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner seedAdmin() {
        return args -> {
            if (userRepository.findByEmail(ADMIN_EMAIL).isPresent()) {
                log.info("Admin user already exists: {}", ADMIN_EMAIL);
                return;
            }

            User admin = new User();
            admin.setEmail(ADMIN_EMAIL);
            admin.setName(ADMIN_NAME);
            admin.setPassword(passwordEncoder.encode(ADMIN_PASSWORD));
            admin.setRole(User.Role.ADMIN);
            admin.setLastLoggedIn(LocalDateTime.now());
            userRepository.save(admin);

            log.info("Admin user seeded: {} / {}", ADMIN_EMAIL, ADMIN_PASSWORD);
        };
    }
}
