import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(() => {
    // Le composant racine utilise le routeur : le test lui fournit une configuration vide.
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])],
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
});
