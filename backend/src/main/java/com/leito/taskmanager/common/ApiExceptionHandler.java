package com.leito.taskmanager.common;

import com.leito.taskmanager.task.application.TaskNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import com.leito.taskmanager.user.application.EmailAlreadyUsedException;
import com.leito.taskmanager.user.application.InvalidCredentialsException;

import java.net.URI;
import java.util.LinkedHashMap;
import java.util.Map;

/** Produit des erreurs JSON cohérentes au format Problem Details (RFC 9457). */
@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(EmailAlreadyUsedException.class)
    ProblemDetail emailAlreadyUsed(EmailAlreadyUsedException exception) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, exception.getMessage());
        problem.setTitle("Adresse e-mail indisponible");
        return problem;
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    ProblemDetail invalidCredentials(InvalidCredentialsException exception) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.UNAUTHORIZED, exception.getMessage());
        problem.setTitle("Connexion refusée");
        return problem;
    }

    @ExceptionHandler(TaskNotFoundException.class)
    public ProblemDetail handleNotFound(TaskNotFoundException exception, HttpServletRequest request) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, exception.getMessage());
        problem.setTitle("Tâche introuvable");
        problem.setType(URI.create("https://taskflow.local/problems/task-not-found"));
        problem.setInstance(URI.create(request.getRequestURI()));
        return problem;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidation(MethodArgumentNotValidException exception, HttpServletRequest request) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        exception.getBindingResult().getFieldErrors().forEach(error ->
                fieldErrors.putIfAbsent(error.getField(), error.getDefaultMessage()));

        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                "Un ou plusieurs champs sont invalides"
        );
        problem.setTitle("Validation impossible");
        problem.setType(URI.create("https://taskflow.local/problems/validation"));
        problem.setInstance(URI.create(request.getRequestURI()));
        problem.setProperty("fieldErrors", fieldErrors);
        return problem;
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ProblemDetail handleUnreadableBody(HttpMessageNotReadableException exception, HttpServletRequest request) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                "Le corps JSON est absent ou contient une valeur inconnue"
        );
        problem.setTitle("Requête JSON invalide");
        problem.setType(URI.create("https://taskflow.local/problems/unreadable-json"));
        problem.setInstance(URI.create(request.getRequestURI()));
        return problem;
    }
}
