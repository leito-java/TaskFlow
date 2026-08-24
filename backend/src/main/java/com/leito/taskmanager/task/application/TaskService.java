package com.leito.taskmanager.task.application;

import com.leito.taskmanager.task.api.CreateTaskRequest;
import com.leito.taskmanager.task.api.TaskResponse;
import com.leito.taskmanager.task.api.UpdateTaskRequest;
import com.leito.taskmanager.task.domain.Task;
import com.leito.taskmanager.task.domain.TaskStatus;
import com.leito.taskmanager.task.infrastructure.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Cas d'utilisation des tâches, indépendant du protocole HTTP. */
@Service
@Transactional(readOnly = true)
public class TaskService {

    private final TaskRepository repository;

    public TaskService(TaskRepository repository) {
        this.repository = repository;
    }

    public List<TaskResponse> findAll() {
        return repository.findAllByOrderByIdAsc().stream()
                .map(TaskResponse::from)
                .toList();
    }

    public TaskResponse findById(long id) {
        return TaskResponse.from(findEntity(id));
    }

    @Transactional
    public TaskResponse create(CreateTaskRequest request) {
        TaskStatus initialStatus = request.status() == null ? TaskStatus.TODO : request.status();
        Task task = new Task(
                normalizeTitle(request.title()),
                request.description(),
                request.priority(),
                initialStatus,
                request.dueDate()
        );
        return TaskResponse.from(repository.save(task));
    }

    @Transactional
    public TaskResponse update(long id, UpdateTaskRequest request) {
        Task task = findEntity(id);
        task.update(
                normalizeTitle(request.title()),
                request.description(),
                request.priority(),
                request.resolvedStatus(),
                request.dueDate()
        );
        return TaskResponse.from(task);
    }

    @Transactional
    public void delete(long id) {
        Task task = findEntity(id);
        repository.delete(task);
    }

    private Task findEntity(long id) {
        return repository.findById(id).orElseThrow(() -> new TaskNotFoundException(id));
    }

    private String normalizeTitle(String title) {
        return title.trim();
    }
}
