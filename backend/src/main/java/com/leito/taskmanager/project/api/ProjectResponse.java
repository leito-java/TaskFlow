package com.leito.taskmanager.project.api;
import com.leito.taskmanager.project.domain.Project;
public record ProjectResponse(Long id, String name) { public static ProjectResponse from(Project project) { return new ProjectResponse(project.getId(), project.getName()); } }
