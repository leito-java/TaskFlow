package com.leito.taskmanager.task.api;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.leito.taskmanager.task.domain.TaskPriority;
import com.leito.taskmanager.task.domain.TaskStatus;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalDateTime;

/** Corps JSON attendu pour remplacer les valeurs modifiables d'une tâche. */
public record UpdateTaskRequest(
        @NotBlank(message = "Le titre est obligatoire")
        @Size(min = 3, max = 120, message = "Le titre doit contenir entre 3 et 120 caractères")
        String title,

        @Size(max = 1000, message = "La description ne doit pas dépasser 1000 caractères")
        String description,

        @NotNull(message = "La priorité est obligatoire")
        TaskPriority priority,

        TaskStatus status,

        LocalDate dueDate,

        Boolean completed,
        Long projectId,

        @Min(value = 5, message = "La durée estimée doit être d'au moins 5 minutes")
        @Max(value = 1440, message = "La durée estimée ne doit pas dépasser 24 heures")
        Integer estimatedMinutes,
        LocalDateTime reminderAt,
        @Min(2) @Max(10080) Integer reminderRepeatMinutes,
        @Min(1) @Max(3) Integer reminderMaxOccurrences
) {
    public UpdateTaskRequest {
        if (title != null) title = title.trim();
        if (description != null) description = description.isBlank() ? null : description.trim();
    }

    /** Autorise le nouveau statut ou l'ancien booléen pendant la transition Angular. */
    @JsonIgnore
    @AssertTrue(message = "Le statut ou completed est obligatoire")
    public boolean isStateDefined() {
        return status != null || completed != null;
    }

    /** Empêche deux représentations contradictoires du même état. */
    @JsonIgnore
    @AssertTrue(message = "Le statut et completed sont incohérents")
    public boolean isStateConsistent() {
        return status == null || completed == null || status.isCompleted() == completed;
    }

    public TaskStatus resolvedStatus() {
        if (status != null) return status;
        return Boolean.TRUE.equals(completed) ? TaskStatus.DONE : TaskStatus.TODO;
    }
}
