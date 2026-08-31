package com.leito.taskmanager.task.api;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record SnoozeReminderRequest(
        @Min(value = 2, message = "Le report doit être d'au moins 2 minutes")
        @Max(value = 10080, message = "Le report ne doit pas dépasser 7 jours")
        int minutes
) {}
