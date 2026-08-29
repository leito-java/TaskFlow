package com.leito.taskmanager.project.api;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
public record CreateProjectRequest(
        @NotBlank @Size(max = 80) String name,
        @Pattern(regexp = "work|study|personal|health|finance|code|creative|folder") String icon,
        @Pattern(regexp = "^#[0-9A-Fa-f]{6}$") String color
) {
    public CreateProjectRequest {
        if (name != null) name = name.trim();
        if (icon == null) icon = "folder";
        if (color == null) color = "#6D5CE7";
    }
}
