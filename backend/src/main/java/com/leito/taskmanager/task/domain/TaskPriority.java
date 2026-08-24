package com.leito.taskmanager.task.domain;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Locale;

/** Valeurs de priorité partagées avec le frontend Angular. */
public enum TaskPriority {
    LOW,
    MEDIUM,
    HIGH;

    /** Accepte les valeurs JSON low, medium et high envoyées par Angular. */
    @JsonCreator
    public static TaskPriority fromJson(String value) {
        return value == null ? null : valueOf(value.toUpperCase(Locale.ROOT));
    }

    /** Expose une convention JSON stable, indépendante du nom Java en majuscules. */
    @JsonValue
    public String toJson() {
        return name().toLowerCase(Locale.ROOT);
    }
}
