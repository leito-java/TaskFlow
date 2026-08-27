package com.leito.taskmanager.user.application;

import com.leito.taskmanager.user.domain.User;
import com.leito.taskmanager.user.infrastructure.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Cas d'utilisation des comptes : l'API ne manipule jamais un mot de passe chiffré directement. */
@Service
@Transactional(readOnly = true)
public class UserService {
    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User register(String email, String password) {
        String normalizedEmail = normalizeEmail(email);
        if (repository.existsByEmail(normalizedEmail)) {
            throw new EmailAlreadyUsedException();
        }
        return repository.save(new User(normalizedEmail, passwordEncoder.encode(password)));
    }

    public User authenticate(String email, String password) {
        User user = findByEmail(normalizeEmail(email));
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }
        return user;
    }

    @Transactional
    public void changePassword(String email, String currentPassword, String newPassword) {
        User user = authenticate(email, currentPassword);
        user.changePasswordHash(passwordEncoder.encode(newPassword));
    }

    public User findByEmail(String email) {
        return repository.findByEmail(email).orElseThrow(InvalidCredentialsException::new);
    }

    private String normalizeEmail(String email) { return email.trim().toLowerCase(); }
}
