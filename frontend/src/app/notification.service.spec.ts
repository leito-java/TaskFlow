import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
  });

  it('affiche puis ferme une notification de succès', () => {
    service.success('Tâche créée avec succès.');

    expect(service.current()).toEqual({ kind: 'success', message: 'Tâche créée avec succès.' });

    service.dismiss();
    expect(service.current()).toBeNull();
  });

  it('remplace une notification par une erreur plus récente', () => {
    service.success('Ancien message');
    service.error("Impossible de joindre l'API.");

    expect(service.current()).toEqual({ kind: 'error', message: "Impossible de joindre l'API." });
    service.dismiss();
  });
});
