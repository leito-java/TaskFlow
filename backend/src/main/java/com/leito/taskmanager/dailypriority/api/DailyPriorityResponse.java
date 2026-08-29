package com.leito.taskmanager.dailypriority.api;
import com.leito.taskmanager.dailypriority.domain.DailyPriority;
public record DailyPriorityResponse(Long id, Long taskId, String title, int position) {
 public static DailyPriorityResponse from(DailyPriority p) { return new DailyPriorityResponse(p.getId(), p.getTask().getId(), p.getTask().getTitle(), p.getPosition()); }
}
