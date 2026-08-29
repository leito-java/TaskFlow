package com.leito.taskmanager.dailypriority.api;

import com.leito.taskmanager.dailypriority.domain.DailyPriority;

import java.time.LocalDate;

public record DailyPrioritySuggestionResponse(
        Long taskId,
        String title,
        LocalDate previousDate
) {
    public static DailyPrioritySuggestionResponse from(DailyPriority priority) {
        return new DailyPrioritySuggestionResponse(
                priority.getTask().getId(),
                priority.getTask().getTitle(),
                priority.getPriorityDate()
        );
    }
}
