package com.leito.taskmanager.task.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import com.leito.taskmanager.user.domain.User;

import java.time.LocalDate;
import java.util.Objects;

/** Entité persistée dans la table tasks. */
@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String title;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private TaskPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TaskStatus status;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @ManyToOne(optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    protected Task() {
        // Constructeur requis par JPA.
    }

    public Task(String title, TaskPriority priority, User owner) {
        this(title, null, priority, TaskStatus.TODO, null, owner);
    }

    public Task(
            String title,
            String description,
            TaskPriority priority,
            TaskStatus status,
            LocalDate dueDate,
            User owner
    ) {
        this.title = Objects.requireNonNull(title);
        this.description = description;
        this.priority = Objects.requireNonNull(priority);
        this.status = Objects.requireNonNull(status);
        this.dueDate = dueDate;
        this.owner = Objects.requireNonNull(owner);
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public boolean isCompleted() {
        return status.isCompleted();
    }

    public TaskPriority getPriority() {
        return priority;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    /** L'entité protège sa propre mise à jour au lieu d'exposer des setters publics. */
    public void update(
            String title,
            String description,
            TaskPriority priority,
            TaskStatus status,
            LocalDate dueDate
    ) {
        this.title = Objects.requireNonNull(title);
        this.description = description;
        this.priority = Objects.requireNonNull(priority);
        this.status = Objects.requireNonNull(status);
        this.dueDate = dueDate;
    }
}
