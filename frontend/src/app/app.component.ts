// Component décrit la coquille commune ; inject récupère le store partagé.
import { Component, inject } from '@angular/core';
// Le routeur fournit les liens, l'état du lien actif et la zone d'affichage des pages.
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TaskStore } from './task.store';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  // Le compteur reste visible dans la navigation, quelle que soit la page active.
  protected readonly taskCount = inject(TaskStore).taskCount;
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected logout(): void { this.auth.logout(); void this.router.navigateByUrl('/login'); }
}
