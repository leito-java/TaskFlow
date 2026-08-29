import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';
import { AuthService } from './auth.service';
import { TaskStore } from './task.store';
import { NotificationService } from './notification.service';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  const auth = { isAuthenticated: () => true, logout: vi.fn() };
  const taskStore = { taskCount: () => 0, clearUserData: vi.fn() };

  beforeEach(() => {
    // Le composant racine utilise le routeur : le test lui fournit une configuration vide.
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: auth },
        { provide: TaskStore, useValue: taskStore },
        { provide: NotificationService, useValue: { current: () => null, dismiss: () => undefined } },
      ],
    });
    fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
  });

  it('affiche la navigation commune', () => {
    const navigation = fixture.nativeElement.querySelector('nav');
    expect(navigation.textContent).toContain('Accueil');
    expect(navigation.textContent).toContain('Tâches');
    expect(navigation.textContent).toContain('À propos');
  });

  it('réserve une zone aux pages routées', () => {
    expect(fixture.nativeElement.querySelector('router-outlet')).not.toBeNull();
  });

  it('propose un lien pour accéder directement au contenu principal au clavier', () => {
    expect(fixture.nativeElement.querySelector('a[href="#main-content"]')?.textContent)
      .toContain('Aller au contenu principal');
  });

  it('efface les tâches en mémoire avant la déconnexion', () => {
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.logout-button');
    button.click();

    expect(taskStore.clearUserData).toHaveBeenCalled();
    expect(auth.logout).toHaveBeenCalled();
  });
});
