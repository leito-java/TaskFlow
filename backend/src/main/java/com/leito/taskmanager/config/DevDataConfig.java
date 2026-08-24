package com.leito.taskmanager.config;

import com.leito.taskmanager.task.domain.Task;
import com.leito.taskmanager.task.domain.TaskPriority;
import com.leito.taskmanager.task.infrastructure.TaskRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/** Données d'exemple chargées uniquement avec le profil de développement. */
@Configuration
@Profile("dev")
public class DevDataConfig {

    @Bean
    CommandLineRunner initializeTasks(TaskRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                repository.save(new Task("Préparer les priorités de la semaine", TaskPriority.MEDIUM));
                repository.save(new Task("Planifier la prochaine livraison", TaskPriority.HIGH));
            }
        };
    }
}
