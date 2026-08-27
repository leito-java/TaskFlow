package com.leito.taskmanager.user.application;

public class EmailAlreadyUsedException extends RuntimeException {
    public EmailAlreadyUsedException() { super("Cette adresse e-mail est déjà utilisée."); }
}
