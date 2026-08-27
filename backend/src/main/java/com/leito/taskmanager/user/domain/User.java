package com.leito.taskmanager.user.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.Objects;

/** Compte propriétaire des données privées dans TaskFlow. */
@Entity
@Table(name = "app_users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    protected User() { }

    public User(String email, String passwordHash) {
        this.email = Objects.requireNonNull(email);
        this.passwordHash = Objects.requireNonNull(passwordHash);
    }

    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }

    /** Seul le service applicatif décide du nouveau hash, jamais le contrôleur HTTP. */
    public void changePasswordHash(String passwordHash) { this.passwordHash = Objects.requireNonNull(passwordHash); }
}
