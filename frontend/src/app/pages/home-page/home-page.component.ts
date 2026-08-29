import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TaskStore } from '../../task.store';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
})
export class HomePageComponent {
  protected readonly auth = inject(AuthService);
  // Les statistiques proviennent du même store que les autres pages.
  protected readonly store = inject(TaskStore);
}
