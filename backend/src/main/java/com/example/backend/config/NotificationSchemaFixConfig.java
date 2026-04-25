package com.example.backend.config;

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
public class NotificationSchemaFixConfig {

    private final JdbcTemplate jdbcTemplate;

    @Bean
    public CommandLineRunner migrateNotificationTypeToVarchar() {
        return args -> {
            try {
                List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                    "SELECT DATA_TYPE, COLUMN_TYPE " +
                    "FROM information_schema.COLUMNS " +
                    "WHERE TABLE_SCHEMA = DATABASE() " +
                    "AND TABLE_NAME = 'notifications' " +
                    "AND COLUMN_NAME = 'type'"
                );
                if (rows.isEmpty()) {
                    return;
                }

                String dataType = String.valueOf(rows.get(0).get("DATA_TYPE"));
                if (!"enum".equalsIgnoreCase(dataType)) {
                    log.debug("notifications.type is already {}. No enum migration needed.", dataType);
                    return;
                }

                jdbcTemplate.execute("ALTER TABLE notifications MODIFY COLUMN type VARCHAR(64) NOT NULL");
                log.info("Migrated notifications.type from ENUM to VARCHAR(64)");
            } catch (Exception ex) {
                log.warn("Could not migrate notifications.type column: {}", ex.getMessage());
            }
        };
    }
}
