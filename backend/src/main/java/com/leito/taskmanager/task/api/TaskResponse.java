package com.leito.taskmanager.task.api;

import com.leito.taskmanager.task.domain.Task;
import com.leito.taskmanager.task.domain.TaskPriority;
import com.leito.taskmanager.task.domain.TaskStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

/** Réponse publique de l'API : l'entité JPA n'est jamais exposée directement. */
public record TaskResponse(
        Long id,
        String title,
        String description,
        TaskPriority priority,
        TaskStatus status,
        LocalDate dueDate,
        boolean completed,
        Long projectId,
        String projectName,
        Integer estimatedMinutes,
        LocalDateTime reminderAt,
        Integer reminderRepeatMinutes,
        Integer reminderMaxOccurrences,
        boolean reminderRead
) {
    public static TaskResponse from(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getPriority(),
                task.getStatus(),
                task.getDueDate(),
                task.isCompleted(),
                task.getProject() == null ? null : task.getProject().getId(),
                task.getProject() == null ? null : task.getProject().getName(),
                task.getEstimatedMinutes(),
                task.getReminderAt(),
                task.getReminderRepeatMinutes(),
                task.getReminderMaxOccurrences(),
                task.isReminderRead()
        );
    }
}
