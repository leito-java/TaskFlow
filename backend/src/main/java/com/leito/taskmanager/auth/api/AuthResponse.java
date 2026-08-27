package com.leito.taskmanager.auth.api;

/** Seul le jeton est renvoyé : jamais le hash du mot de passe. */
public record AuthResponse(String accessToken, String email) { }
