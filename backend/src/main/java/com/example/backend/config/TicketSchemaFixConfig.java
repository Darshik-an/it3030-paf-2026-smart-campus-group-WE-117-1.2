package com.example.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * One-time schema migration: ensures the tickets.status column is a VARCHAR(20)
 * so all TicketStatus enum values (OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED)
 * can be stored without "Data truncated" errors.
 *
 * This is needed because Hibernate ddl-auto=update does not alter an existing
 * column type once created — if the column was initially created as a MySQL
 * ENUM or a short VARCHAR, new enum values will fail on save.
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class TicketSchemaFixConfig {

    private final JdbcTemplate jdbcTemplate;

    @Bean
    public CommandLineRunner fixTicketStatusColumn() {
        return args -> {
            try {
                // Check the current column type
                var rows = jdbcTemplate.queryForList(
                    "SELECT COLUMN_TYPE FROM information_schema.COLUMNS " +
                    "WHERE TABLE_SCHEMA = DATABASE() " +
                    "AND TABLE_NAME = 'tickets' " +
                    "AND COLUMN_NAME = 'status'"
                );

                if (rows.isEmpty()) {
                    log.debug("tickets.status column not found — skipping schema fix");
                    return;
                }

                String columnType = String.valueOf(rows.get(0).get("COLUMN_TYPE")).toUpperCase();
                log.info("Current tickets.status column type: {}", columnType);

                // If the column is already a large-enough VARCHAR, nothing to do
                if (columnType.startsWith("VARCHAR") && !columnType.contains("(") ) {
                    // Can't determine size — fix anyway to be safe
                } else if (columnType.startsWith("VARCHAR")) {
                    // Extract the size, e.g. VARCHAR(255) -> 255
                    String sizeStr = columnType.replaceAll("[^0-9]", "");
                    int size = sizeStr.isEmpty() ? 0 : Integer.parseInt(sizeStr);
                    if (size >= 20) {
                        log.debug("tickets.status is already {} — no fix needed", columnType);
                        return;
                    }
                }

                // Column is an ENUM, TINYINT, or undersized VARCHAR — alter it
                jdbcTemplate.execute(
                    "ALTER TABLE tickets MODIFY COLUMN status VARCHAR(20) NOT NULL DEFAULT 'OPEN'"
                );
                log.info("Fixed tickets.status column type from {} to VARCHAR(20)", columnType);

            } catch (Exception ex) {
                log.warn("Could not fix tickets.status column: {}", ex.getMessage());
            }
        };
    }
}
