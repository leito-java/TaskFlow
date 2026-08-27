package com.leito.taskmanager.task.infrastructure;

import com.leito.taskmanager.task.domain.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/** Spring Data génère l'implémentation de cet accès aux données. */
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findAllByOwnerEmailOrderByIdAsc(String email);

    java.util.Optional<Task> findByIdAndOwnerEmail(Long id, String email);
}
