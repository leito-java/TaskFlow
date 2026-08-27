package com.leito.taskmanager.auth.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Le mot de passe courant empêche qu'un JWT volé suffise à changer le secret. */
public record ChangePasswordRequest(
        @NotBlank String currentPassword,
        @NotBlank @Size(min = 8, max = 72) String newPassword
) { }
