// Component décrit la coquille commune ; inject récupère le store partagé.
import { Component, inject } from '@angular/core';
// Le routeur fournit les liens, l'état du lien actif et la zone d'affichage des pages.
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TaskStore } from './task.store';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';
import { OnboardingComponent } from './onboarding/onboarding.component';
import { OnboardingService } from './onboarding.service';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, OnboardingComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  // Le compteur reste visible dans la navigation, quelle que soit la page active.
  private readonly taskStore = inject(TaskStore);
  protected readonly taskCount = this.taskStore.taskCount;
  protected readonly auth = inject(AuthService);
  protected readonly notifications = inject(NotificationService);
  protected readonly onboarding = inject(OnboardingService);
  private readonly router = inject(Router);

  protected logout(): void {
    this.taskStore.clearUserData();
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }
}
