package com.leito.taskmanager.task.api;

import com.leito.taskmanager.task.domain.TaskPriority;
import com.leito.taskmanager.task.domain.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/** Corps JSON attendu pour créer une tâche. */
public record CreateTaskRequest(
        @NotBlank(message = "Le titre est obligatoire")
        @Size(min = 3, max = 120, message = "Le titre doit contenir entre 3 et 120 caractères")
        String title,

        @Size(max = 1000, message = "La description ne doit pas dépasser 1000 caractères")
        String description,

        @NotNull(message = "La priorité est obligatoire")
        TaskPriority priority,

        TaskStatus status,

        LocalDate dueDate
) {
    public CreateTaskRequest {
        if (title != null) title = title.trim();
        if (description != null) description = description.isBlank() ? null : description.trim();
    }
}
