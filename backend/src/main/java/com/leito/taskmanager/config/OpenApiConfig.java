package com.leito.taskmanager.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.context.annotation.Configuration;

/** Métadonnées visibles dans Swagger UI. */
@Configuration
@OpenAPIDefinition(info = @Info(
        title = "TaskFlow API",
        version = "v1",
        description = "API REST pédagogique utilisée par le Task Manager Angular"
))
public class OpenApiConfig {
}
