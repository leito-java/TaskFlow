package com.leito.taskmanager.task.application;

/** Erreur métier transformée en réponse HTTP 404 par le gestionnaire global. */
public class TaskNotFoundException extends RuntimeException {

    public TaskNotFoundException(long id) {
        super("La tâche " + id + " n'existe pas");
    }
}
