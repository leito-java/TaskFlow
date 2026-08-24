package com.leito.taskmanager.task;

import com.leito.taskmanager.task.domain.Task;
import com.leito.taskmanager.task.domain.TaskPriority;
import com.leito.taskmanager.task.infrastructure.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TaskApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TaskRepository repository;

    @BeforeEach
    void cleanDatabase() {
        repository.deleteAll();
    }

    @Test
    void createThenReadDetailedTask() throws Exception {
        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title":"Connecter Angular",
                                  "description":"Brancher HttpClient à l'API",
                                  "priority":"high",
                                  "status":"in-progress",
                                  "dueDate":"2026-09-15"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", org.hamcrest.Matchers.matchesPattern("/api/tasks/\\d+")))
                .andExpect(jsonPath("$.status").value("in-progress"))
                .andExpect(jsonPath("$.completed").value(false));

        long id = repository.findAll().get(0).getId();

        mockMvc.perform(get("/api/tasks/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Connecter Angular"))
                .andExpect(jsonPath("$.description").value("Brancher HttpClient à l'API"))
                .andExpect(jsonPath("$.priority").value("high"))
                .andExpect(jsonPath("$.dueDate").value("2026-09-15"));
    }

    @Test
    void updateTaskWithNewStatusContract() throws Exception {
        Task task = repository.save(new Task("Ancien titre", TaskPriority.LOW));

        mockMvc.perform(put("/api/tasks/{id}", task.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title":"Nouveau titre",
                                  "description":"Description détaillée",
                                  "priority":"medium",
                                  "status":"done",
                                  "dueDate":"2026-09-20"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Nouveau titre"))
                .andExpect(jsonPath("$.status").value("done"))
                .andExpect(jsonPath("$.completed").value(true));
    }

    @Test
    void keepCompletedCompatibleWithCurrentAngularFrontend() throws Exception {
        Task task = repository.save(new Task("Ancien contrat", TaskPriority.LOW));

        mockMvc.perform(put("/api/tasks/{id}", task.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title":"Ancien contrat", "priority":"medium", "completed":true}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("done"))
                .andExpect(jsonPath("$.completed").value(true));
    }

    @Test
    void deleteTask() throws Exception {
        Task task = repository.save(new Task("À supprimer", TaskPriority.LOW));

        mockMvc.perform(delete("/api/tasks/{id}", task.getId()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/tasks/{id}", task.getId()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Tâche introuvable"));
    }

    @Test
    void rejectInvalidTitle() throws Exception {
        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title":"x", "priority":"high"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Validation impossible"))
                .andExpect(jsonPath("$.fieldErrors.title").exists());
    }

    @Test
    void rejectContradictoryStatusAndCompletedValues() throws Exception {
        Task task = repository.save(new Task("Contrat incohérent", TaskPriority.LOW));

        mockMvc.perform(put("/api/tasks/{id}", task.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title":"Contrat incohérent",
                                  "priority":"high",
                                  "status":"in-progress",
                                  "completed":true
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.stateConsistent").exists());
    }
}
