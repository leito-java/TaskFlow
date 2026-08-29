package com.leito.taskmanager.project.domain;

import com.leito.taskmanager.user.domain.User;
import jakarta.persistence.*;
import java.util.Objects;

/** Regroupe des tâches appartenant au même utilisateur. */
@Entity @Table(name = "projects")
public class Project {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 80) private String name;
    @Column(nullable = false, length = 20) private String icon;
    @Column(nullable = false, length = 7) private String color;
    @ManyToOne(optional = false) @JoinColumn(name = "owner_id", nullable = false) private User owner;
    protected Project() { }
    public Project(String name, User owner) { this(name, "folder", "#6D5CE7", owner); }
    public Project(String name, String icon, String color, User owner) {
        this.name = Objects.requireNonNull(name);
        this.icon = Objects.requireNonNull(icon);
        this.color = Objects.requireNonNull(color);
        this.owner = Objects.requireNonNull(owner);
    }
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getIcon() { return icon; }
    public String getColor() { return color; }
}
