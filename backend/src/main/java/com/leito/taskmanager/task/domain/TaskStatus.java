package com.leito.taskmanager.task.domain;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Locale;

/** Étapes métier traversées par une tâche dans le futur tableau Kanban. */
public enum TaskStatus {
    TODO,
    IN_PROGRESS,
    DONE;

    /** Accepte les formats JSON todo, in-progress et done. */
    @JsonCreator
    public static TaskStatus fromJson(String value) {
        if (value == null) return null;
        return valueOf(value.trim().replace('-', '_').toUpperCase(Locale.ROOT));
    }

    /** Expose des valeurs JSON lisibles sans dépendre du format interne Java. */
    @JsonValue
    public String toJson() {
        return name().toLowerCase(Locale.ROOT).replace('_', '-');
    }

    public boolean isCompleted() {
        return this == DONE;
    }
}
