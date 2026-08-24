package com.leito.taskmanager.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

/** Origines autorisées, externalisées pour ne pas les disperser dans le code. */
@ConfigurationProperties(prefix = "app.cors")
public record CorsProperties(List<String> allowedOrigins) {
}
