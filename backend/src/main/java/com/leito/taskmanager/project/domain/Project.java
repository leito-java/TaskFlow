package com.leito.taskmanager.project.domain;

import com.leito.taskmanager.user.domain.User;
import jakarta.persistence.*;
import java.util.Objects;

/** Regroupe des tâches appartenant au même utilisateur. */
@Entity @Table(name = "projects")
public class Project {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 80) private String name;
    @ManyToOne(optional = false) @JoinColumn(name = "owner_id", nullable = false) private User owner;
    protected Project() { }
    public Project(String name, User owner) { this.name = Objects.requireNonNull(name); this.owner = Objects.requireNonNull(owner); }
    public Long getId() { return id; }
    public String getName() { return name; }
}
