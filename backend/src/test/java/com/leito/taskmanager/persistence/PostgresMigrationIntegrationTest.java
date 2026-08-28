package com.leito.taskmanager.persistence;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

/** Vérifie en CI que la migration Flyway est réellement compatible avec PostgreSQL. */
@SpringBootTest
@ActiveProfiles("postgres-test")
@EnabledIfEnvironmentVariable(named = "POSTGRES_TEST_URL", matches = ".+")
@Transactional
class PostgresMigrationIntegrationTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void flywayCreatesAUsableTasksTable() {
        Long successfulMigrations = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM flyway_schema_history WHERE success = TRUE",
                Long.class
        );
        Long legacyOwnerId = jdbcTemplate.queryForObject(
                "SELECT id FROM app_users WHERE email = 'legacy@taskflow.local'",
                Long.class
        );

        jdbcTemplate.update(
                """
                INSERT INTO tasks (title, description, priority, status, due_date, owner_id)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                "Tester la migration PostgreSQL",
                "Vérifier la deuxième migration",
                "HIGH",
                "IN_PROGRESS",
                LocalDate.of(2026, 9, 15),
                legacyOwnerId
        );

        String taskStatus = jdbcTemplate.queryForObject(
                "SELECT status FROM tasks WHERE title = ?",
                String.class,
                "Tester la migration PostgreSQL"
        );

        Long removedCompletedColumns = jdbcTemplate.queryForObject(
                """
                SELECT COUNT(*)
                FROM information_schema.columns
                WHERE table_schema = current_schema()
                  AND table_name = 'tasks'
                  AND column_name = 'completed'
                """,
                Long.class
        );

        assertThat(successfulMigrations).isEqualTo(4);
        assertThat(taskStatus).isEqualTo("IN_PROGRESS");
        assertThat(removedCompletedColumns).isZero();
    }
}
