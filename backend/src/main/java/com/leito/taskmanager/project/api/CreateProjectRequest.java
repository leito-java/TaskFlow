package com.leito.taskmanager.project.api;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
public record CreateProjectRequest(@NotBlank @Size(max = 80) String name) { public CreateProjectRequest { if (name != null) name = name.trim(); } }
