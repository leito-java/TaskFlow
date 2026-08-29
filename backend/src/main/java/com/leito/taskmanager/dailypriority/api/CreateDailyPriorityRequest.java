package com.leito.taskmanager.dailypriority.api;
import jakarta.validation.constraints.NotNull;
public record CreateDailyPriorityRequest(@NotNull Long taskId) { }
