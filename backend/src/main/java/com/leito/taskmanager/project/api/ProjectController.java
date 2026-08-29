package com.leito.taskmanager.project.api;

import com.leito.taskmanager.project.application.ProjectService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController @RequestMapping("/api/projects")
public class ProjectController {
    private final ProjectService service;
    public ProjectController(ProjectService service) { this.service = service; }
    @GetMapping public List<ProjectResponse> findAll(Principal principal) { return service.findAll(principal.getName()); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public ProjectResponse create(@Valid @RequestBody CreateProjectRequest request, Principal principal) { return service.create(request.name(), request.icon(), request.color(), principal.getName()); }
}
