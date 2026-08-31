package com.leito.taskmanager.task.api;

import com.leito.taskmanager.task.application.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.security.Principal;

import java.net.URI;
import java.util.List;

/** Adaptateur HTTP : traduit les requêtes REST en appels au service. */
@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService service;

    public TaskController(TaskService service) {
        this.service = service;
    }

    @GetMapping
    public List<TaskResponse> findAll(Principal principal) {
        return service.findAll(principal.getName());
    }

    @GetMapping("/{id}")
    public TaskResponse findById(@PathVariable long id, Principal principal) {
        return service.findById(id, principal.getName());
    }

    @PostMapping
    public ResponseEntity<TaskResponse> create(@Valid @RequestBody CreateTaskRequest request, Principal principal) {
        TaskResponse created = service.create(request, principal.getName());
        return ResponseEntity.created(URI.create("/api/tasks/" + created.id())).body(created);
    }

    @PutMapping("/{id}")
    public TaskResponse update(@PathVariable long id, @Valid @RequestBody UpdateTaskRequest request, Principal principal) {
        return service.update(id, request, principal.getName());
    }

    @PatchMapping("/{id}/reminder/read")
    public TaskResponse markReminderRead(@PathVariable long id, Principal principal) {
        return service.markReminderRead(id, principal.getName());
    }

    @PatchMapping("/{id}/reminder/snooze")
    public TaskResponse snoozeReminder(@PathVariable long id, @Valid @RequestBody SnoozeReminderRequest request, Principal principal) {
        return service.snoozeReminder(id, request.minutes(), principal.getName());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable long id, Principal principal) {
        service.delete(id, principal.getName());
        return ResponseEntity.noContent().build();
    }
}
