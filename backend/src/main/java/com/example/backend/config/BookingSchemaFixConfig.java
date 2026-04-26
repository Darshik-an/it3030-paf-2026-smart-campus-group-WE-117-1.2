package com.example.backend.config;

import java.sql.Connection;
import java.util.List;
import java.util.Map;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class BookingSchemaFixConfig {

    private final JdbcTemplate jdbcTemplate;

    @Bean
    public CommandLineRunner cleanupLegacyBookingResourceForeignKey() {
        return args -> {
            try {
                String databaseProduct = "unknown";
                try (Connection connection = jdbcTemplate.getDataSource().getConnection()) {
                    databaseProduct = connection.getMetaData().getDatabaseProductName();
                }

                if (databaseProduct == null || !databaseProduct.toLowerCase().contains("mysql")) {
                    log.debug("Skipping legacy bookings/resource foreign key cleanup for database: {}", databaseProduct);
                    return;
                }

                List<Map<String, Object>> legacyConstraints = jdbcTemplate.queryForList(
                    "SELECT CONSTRAINT_NAME " +
                    "FROM information_schema.KEY_COLUMN_USAGE " +
                    "WHERE TABLE_SCHEMA = DATABASE() " +
                    "AND TABLE_NAME = 'bookings' " +
                    "AND COLUMN_NAME = 'resource_id' " +
                    "AND REFERENCED_TABLE_NAME = 'resource'"
                );

                for (Map<String, Object> row : legacyConstraints) {
                    String constraintName = String.valueOf(row.get("CONSTRAINT_NAME"));
                    jdbcTemplate.execute("ALTER TABLE bookings DROP FOREIGN KEY `" + constraintName + "`");
                    log.info("Dropped legacy foreign key '{}' from bookings.resource_id -> resource.id", constraintName);
                }

                if (legacyConstraints.isEmpty()) {
                    log.debug("No legacy bookings.resource_id -> resource.id foreign key found");
                }
            } catch (Exception ex) {
                // Keep app startup resilient if schema cleanup cannot run.
                log.warn("Could not clean legacy bookings/resource foreign key: {}", ex.getMessage());
            }
        };
    }
}