package com.leito.taskmanager.auth;

import com.leito.taskmanager.auth.application.JwtService;
import com.leito.taskmanager.user.application.InvalidCredentialsException;
import com.leito.taskmanager.user.application.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** Vérifie le contrat public : un compte est créé et ne révèle jamais son hash. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthApiIntegrationTest {
    @Autowired MockMvc mockMvc;
    @Autowired UserService userService;
    @Autowired JwtService jwtService;

    @Test
    void registerReturnsJwtButNeverPassword() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"new-user@taskflow.local\",\"password\":\"a-secure-password\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("new-user@taskflow.local"))
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.password").doesNotExist());
    }

    @Test
    void anonymousTasksEndpointIsRejected() throws Exception {
        mockMvc.perform(post("/api/tasks").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void authenticatedUserCanChangePasswordOnlyWithCurrentPassword() throws Exception {
        String email = "password-change@taskflow.local";
        userService.register(email, "old-password-123");

        mockMvc.perform(put("/api/auth/password")
                        .header("Authorization", "Bearer " + jwtService.createToken(email))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"currentPassword\":\"old-password-123\",\"newPassword\":\"new-password-456\"}"))
                .andExpect(status().isNoContent());

        userService.authenticate(email, "new-password-456");
        assertThatThrownBy(() -> userService.authenticate(email, "old-password-123"))
                .isInstanceOf(InvalidCredentialsException.class);
    }
}
