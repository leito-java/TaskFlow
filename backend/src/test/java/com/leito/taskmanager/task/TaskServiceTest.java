package com.leito.taskmanager.task;

import com.leito.taskmanager.task.api.CreateTaskRequest;
import com.leito.taskmanager.task.application.TaskService;
import com.leito.taskmanager.task.domain.Task;
import com.leito.taskmanager.task.domain.TaskPriority;
import com.leito.taskmanager.task.domain.TaskStatus;
import com.leito.taskmanager.task.infrastructure.TaskRepository;
import com.leito.taskmanager.user.application.UserService;
import com.leito.taskmanager.user.domain.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository repository;

    @Mock
    private UserService userService;

    @InjectMocks
    private TaskService service;

    @Test
    void createNormalizesTextAndStartsWithTodoStatus() {
        given(repository.save(any(Task.class))).willAnswer(invocation -> invocation.getArgument(0));
        given(userService.findByEmail("test@taskflow.local")).willReturn(new User("test@taskflow.local", "hash"));

        LocalDate dueDate = LocalDate.of(2026, 9, 15);
        var response = service.create(new CreateTaskRequest(
                "  Apprendre HttpClient  ",
                "  Relire le chapitre puis pratiquer  ",
                TaskPriority.HIGH,
                null,
                dueDate,
                null
        ), "test@taskflow.local");

        assertThat(response.title()).isEqualTo("Apprendre HttpClient");
        assertThat(response.description()).isEqualTo("Relire le chapitre puis pratiquer");
        assertThat(response.priority()).isEqualTo(TaskPriority.HIGH);
        assertThat(response.status()).isEqualTo(TaskStatus.TODO);
        assertThat(response.dueDate()).isEqualTo(dueDate);
        assertThat(response.completed()).isFalse();
    }
}
