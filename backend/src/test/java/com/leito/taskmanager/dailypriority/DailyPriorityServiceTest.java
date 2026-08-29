package com.leito.taskmanager.dailypriority;

import com.leito.taskmanager.dailypriority.application.DailyPriorityService;
import com.leito.taskmanager.dailypriority.infrastructure.DailyPriorityRepository;
import com.leito.taskmanager.task.infrastructure.TaskRepository;
import com.leito.taskmanager.user.application.UserService;
import com.leito.taskmanager.user.domain.User;
import com.leito.taskmanager.task.domain.Task;
import com.leito.taskmanager.task.domain.TaskPriority;
import com.leito.taskmanager.task.domain.TaskStatus;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import java.util.Optional;
import java.time.LocalDate;
import java.util.List;

class DailyPriorityServiceTest {
    @Test
    void suggestsAtMostTwoUnfinishedPrioritiesFromYesterday() {
        DailyPriorityRepository priorities = mock(DailyPriorityRepository.class);
        User user = new User("user@taskflow.local", "hash");
        Task first = new Task("Finaliser la présentation", null, TaskPriority.HIGH, TaskStatus.IN_PROGRESS, null, user);
        Task completed = new Task("Envoyer le compte rendu", null, TaskPriority.MEDIUM, TaskStatus.DONE, null, user);
        Task second = new Task("Préparer la réunion", null, TaskPriority.MEDIUM, TaskStatus.TODO, null, user);
        Task third = new Task("Relire le contrat", null, TaskPriority.LOW, TaskStatus.TODO, null, user);
        LocalDate yesterday = LocalDate.now().minusDays(1);
        when(priorities.findAllByOwnerEmailAndPriorityDateOrderByPositionAsc("user@taskflow.local", yesterday))
                .thenReturn(List.of(
                        new com.leito.taskmanager.dailypriority.domain.DailyPriority(user, first, yesterday, 1),
                        new com.leito.taskmanager.dailypriority.domain.DailyPriority(user, completed, yesterday, 2),
                        new com.leito.taskmanager.dailypriority.domain.DailyPriority(user, second, yesterday, 3),
                        new com.leito.taskmanager.dailypriority.domain.DailyPriority(user, third, yesterday, 4)
                ));

        var suggestions = new DailyPriorityService(priorities, mock(TaskRepository.class), mock(UserService.class))
                .findYesterdaySuggestions("user@taskflow.local");

        assertEquals(2, suggestions.size());
        assertEquals("Finaliser la présentation", suggestions.get(0).title());
        assertEquals("Préparer la réunion", suggestions.get(1).title());
        assertEquals(yesterday, suggestions.get(0).previousDate());
    }

    @Test
    void refusesFourthPriorityForToday() {
        DailyPriorityRepository priorities = mock(DailyPriorityRepository.class);
        when(priorities.countByOwnerEmailAndPriorityDate(org.mockito.ArgumentMatchers.eq("user@taskflow.local"), org.mockito.ArgumentMatchers.any()))
                .thenReturn(3L);
        DailyPriorityService service = new DailyPriorityService(priorities, mock(TaskRepository.class), mock(UserService.class));

        assertThrows(IllegalStateException.class, () -> service.add(1L, "user@taskflow.local"));
    }

    @Test
    void addsFirstPriorityForItsOwner() {
        DailyPriorityRepository priorities = mock(DailyPriorityRepository.class);
        TaskRepository tasks = mock(TaskRepository.class);
        UserService users = mock(UserService.class);
        User user = new User("user@taskflow.local", "hash");
        Task task = new Task("Préparer la démo", TaskPriority.HIGH, user);
        when(priorities.countByOwnerEmailAndPriorityDate(anyString(), any())).thenReturn(0L);
        when(priorities.findByTaskIdAndOwnerEmailAndPriorityDate(anyLong(), anyString(), any())).thenReturn(Optional.empty());
        when(tasks.findByIdAndOwnerEmail(1L, "user@taskflow.local")).thenReturn(Optional.of(task));
        when(users.findByEmail("user@taskflow.local")).thenReturn(user);
        when(priorities.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        assertEquals("Préparer la démo", new DailyPriorityService(priorities, tasks, users).add(1L, "user@taskflow.local").title());
    }

    @Test
    void removesSelectedPriority() {
        DailyPriorityRepository priorities = mock(DailyPriorityRepository.class);
        User user = new User("user@taskflow.local", "hash");
        com.leito.taskmanager.dailypriority.domain.DailyPriority priority = new com.leito.taskmanager.dailypriority.domain.DailyPriority(user, new Task("À retirer", TaskPriority.LOW, user), LocalDate.now(), 1);
        when(priorities.findByTaskIdAndOwnerEmailAndPriorityDate(1L, "user@taskflow.local", LocalDate.now())).thenReturn(Optional.of(priority));
        when(priorities.findAllByOwnerEmailAndPriorityDateOrderByPositionAsc("user@taskflow.local", LocalDate.now())).thenReturn(java.util.List.of());

        new DailyPriorityService(priorities, mock(TaskRepository.class), mock(UserService.class)).remove(1L, "user@taskflow.local");

        verify(priorities).delete(priority);
    }

    @Test
    void refusesTaskOwnedByAnotherUser() {
        DailyPriorityRepository priorities = mock(DailyPriorityRepository.class);
        TaskRepository tasks = mock(TaskRepository.class);
        when(priorities.countByOwnerEmailAndPriorityDate(anyString(), any())).thenReturn(0L);
        when(priorities.findByTaskIdAndOwnerEmailAndPriorityDate(anyLong(), anyString(), any())).thenReturn(Optional.empty());
        when(tasks.findByIdAndOwnerEmail(1L, "user@taskflow.local")).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> new DailyPriorityService(priorities, tasks, mock(UserService.class)).add(1L, "user@taskflow.local"));
    }
}
