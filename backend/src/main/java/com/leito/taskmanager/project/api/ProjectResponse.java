package com.leito.taskmanager.project.api;
import com.leito.taskmanager.project.domain.Project;
public record ProjectResponse(Long id, String name, String icon, String color) {
    public static ProjectResponse from(Project project) {
        return new ProjectResponse(project.getId(), project.getName(), project.getIcon(), project.getColor());
    }
}
