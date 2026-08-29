package com.leito.taskmanager.dailypriority.application;

import com.leito.taskmanager.dailypriority.api.DailyPriorityResponse;
import com.leito.taskmanager.dailypriority.api.DailyPrioritySuggestionResponse;
import com.leito.taskmanager.dailypriority.domain.DailyPriority;
import com.leito.taskmanager.dailypriority.infrastructure.DailyPriorityRepository;
import com.leito.taskmanager.task.infrastructure.TaskRepository;
import com.leito.taskmanager.user.application.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class DailyPriorityService {
    private static final int MAX_DAILY_PRIORITIES = 3;
    private static final int MAX_YESTERDAY_SUGGESTIONS = 2;

    private final DailyPriorityRepository priorities;
    private final TaskRepository tasks;
    private final UserService users;

    public DailyPriorityService(
            DailyPriorityRepository priorities,
            TaskRepository tasks,
            UserService users
    ) {
        this.priorities = priorities;
        this.tasks = tasks;
        this.users = users;
    }

    public List<DailyPriorityResponse> findToday(String email) {
        return entities(email, LocalDate.now()).stream()
                .map(DailyPriorityResponse::from)
                .toList();
    }

    /** Propose les choix inachevés de la veille sans les reconduire automatiquement. */
    public List<DailyPrioritySuggestionResponse> findYesterdaySuggestions(String email) {
        LocalDate today = LocalDate.now();
        return entities(email, today.minusDays(1)).stream()
                .filter(priority -> !priority.getTask().isCompleted())
                .filter(priority -> priorities.findByTaskIdAndOwnerEmailAndPriorityDate(
                        priority.getTask().getId(), email, today
                ).isEmpty())
                .limit(MAX_YESTERDAY_SUGGESTIONS)
                .map(DailyPrioritySuggestionResponse::from)
                .toList();
    }

    @Transactional
    public DailyPriorityResponse add(Long taskId, String email) {
        LocalDate today = LocalDate.now();
        long count = priorities.countByOwnerEmailAndPriorityDate(email, today);
        if (count >= MAX_DAILY_PRIORITIES) {
            throw new IllegalStateException("Maximum de trois priorités atteint");
        }
        if (priorities.findByTaskIdAndOwnerEmailAndPriorityDate(taskId, email, today).isPresent()) {
            throw new IllegalArgumentException("Tâche déjà sélectionnée");
        }

        var task = tasks.findByIdAndOwnerEmail(taskId, email)
                .orElseThrow(() -> new IllegalArgumentException("Tâche introuvable"));
        var priority = new DailyPriority(users.findByEmail(email), task, today, (int) count + 1);
        return DailyPriorityResponse.from(priorities.save(priority));
    }

    @Transactional
    public void remove(Long taskId, String email) {
        DailyPriority priority = priorities.findByTaskIdAndOwnerEmailAndPriorityDate(
                        taskId, email, LocalDate.now()
                )
                .orElseThrow(() -> new IllegalArgumentException("Priorité introuvable"));
        priorities.delete(priority);

        List<DailyPriority> remaining = entities(email, LocalDate.now());
        for (int index = 0; index < remaining.size(); index++) {
            remaining.get(index).moveTo(index + 1);
        }
    }

    private List<DailyPriority> entities(String email, LocalDate date) {
        return priorities.findAllByOwnerEmailAndPriorityDateOrderByPositionAsc(email, date);
    }
}
