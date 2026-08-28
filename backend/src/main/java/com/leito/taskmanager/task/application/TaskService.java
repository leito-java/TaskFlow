package com.leito.taskmanager.task.application;

import com.leito.taskmanager.task.api.CreateTaskRequest;
import com.leito.taskmanager.task.api.TaskResponse;
import com.leito.taskmanager.task.api.UpdateTaskRequest;
import com.leito.taskmanager.task.domain.Task;
import com.leito.taskmanager.task.domain.TaskStatus;
import com.leito.taskmanager.task.infrastructure.TaskRepository;
import com.leito.taskmanager.user.application.UserService;
import com.leito.taskmanager.project.application.ProjectService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Cas d'utilisation des tâches, indépendant du protocole HTTP. */
@Service
@Transactional(readOnly = true)
public class TaskService {

    private final TaskRepository repository;
    private final UserService userService;
    private final ProjectService projectService;

    public TaskService(TaskRepository repository, UserService userService, ProjectService projectService) {
        this.repository = repository;
        this.userService = userService;
        this.projectService = projectService;
    }

    public List<TaskResponse> findAll(String email) {
        return repository.findAllByOwnerEmailOrderByIdAsc(email).stream()
                .map(TaskResponse::from)
                .toList();
    }

    public TaskResponse findById(long id, String email) {
        return TaskResponse.from(findEntity(id, email));
    }

    @Transactional
    public TaskResponse create(CreateTaskRequest request, String email) {
        TaskStatus initialStatus = request.status() == null ? TaskStatus.TODO : request.status();
        Task task = new Task(
                normalizeTitle(request.title()),
                request.description(),
                request.priority(),
                initialStatus,
                request.dueDate(),
                userService.findByEmail(email)
        );
        task.setProject(request.projectId() == null ? null : projectService.findOwned(request.projectId(), email));
        return TaskResponse.from(repository.save(task));
    }

    @Transactional
    public TaskResponse update(long id, UpdateTaskRequest request, String email) {
        Task task = findEntity(id, email);
        task.update(
                normalizeTitle(request.title()),
                request.description(),
                request.priority(),
                request.resolvedStatus(),
                request.dueDate()
        );
        task.setProject(request.projectId() == null ? null : projectService.findOwned(request.projectId(), email));
        return TaskResponse.from(task);
    }

    @Transactional
    public void delete(long id, String email) {
        Task task = findEntity(id, email);
        repository.delete(task);
    }

    private Task findEntity(long id, String email) {
        return repository.findByIdAndOwnerEmail(id, email).orElseThrow(() -> new TaskNotFoundException(id));
    }

    private String normalizeTitle(String title) {
        return title.trim();
    }
}
