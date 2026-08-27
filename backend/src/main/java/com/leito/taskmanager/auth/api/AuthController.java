package com.leito.taskmanager.auth.api;

import com.leito.taskmanager.auth.application.JwtService;
import com.leito.taskmanager.user.application.UserService;
import com.leito.taskmanager.user.domain.User;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import java.security.Principal;

/** Endpoints publics qui créent ou ouvrent un compte. */
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserService userService;
    private final JwtService jwtService;

    public AuthController(UserService userService, JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return response(userService.register(request.email(), request.password()));
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return response(userService.authenticate(request.email(), request.password()));
    }

    @PutMapping("/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePassword(@Valid @RequestBody ChangePasswordRequest request, Principal principal) {
        userService.changePassword(principal.getName(), request.currentPassword(), request.newPassword());
    }

    private AuthResponse response(User user) { return new AuthResponse(jwtService.createToken(user.getEmail()), user.getEmail()); }
}
