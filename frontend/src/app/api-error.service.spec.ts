import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ApiErrorService, unavailableApiMessage } from './api-error.service';

describe('ApiErrorService', () => {
  const service = TestBed.inject(ApiErrorService);
  it('explique comment démarrer le backend lorsque le proxy ne peut pas le joindre', () => expect(service.message(new HttpErrorResponse({ status: 503 }))).toContain('Spring Boot'));
  it('préfère le détail métier renvoyé par le backend', () => expect(service.message(new HttpErrorResponse({ status: 409, error: { detail: 'Ce projet existe déjà.' } }))).toBe('Ce projet existe déjà.'));
  it('traduit une authentification refusée', () => expect(service.message(new HttpErrorResponse({ status: 401 }))).toContain('mot de passe'));
  it('ne révèle aucun détail technique dans le message de production', () => {
    expect(unavailableApiMessage(true)).not.toContain('Spring Boot');
    expect(unavailableApiMessage(true)).not.toContain('8080');
  });
});
