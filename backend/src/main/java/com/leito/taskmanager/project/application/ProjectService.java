package com.leito.taskmanager.project.application;

import com.leito.taskmanager.project.api.ProjectResponse;
import com.leito.taskmanager.project.domain.Project;
import com.leito.taskmanager.project.infrastructure.ProjectRepository;
import com.leito.taskmanager.user.application.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service @Transactional(readOnly = true)
public class ProjectService {
    private final ProjectRepository repository; private final UserService userService;
    public ProjectService(ProjectRepository repository, UserService userService) { this.repository = repository; this.userService = userService; }
    public List<ProjectResponse> findAll(String email) { return repository.findAllByOwnerEmailOrderByNameAsc(email).stream().map(ProjectResponse::from).toList(); }
    @Transactional public ProjectResponse create(String name, String email) { return ProjectResponse.from(repository.save(new Project(name, userService.findByEmail(email)))); }
    public Project findOwned(Long id, String email) { return repository.findByIdAndOwnerEmail(id, email).orElseThrow(() -> new IllegalArgumentException("Projet introuvable")); }
}
