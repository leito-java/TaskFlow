import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../notification.service';
import { ProjectApiService } from '../../project-api.service';
import { Project } from '../../task.model';

@Component({
  selector: 'app-projects-page',
  imports: [FormsModule],
  templateUrl: './projects-page.component.html',
  styleUrl: './projects-page.component.css',
})
export class ProjectsPageComponent {
  private readonly api = inject(ProjectApiService);
  private readonly notifications = inject(NotificationService);
  protected readonly projects = signal<Project[]>([]);
  protected readonly error = signal('');
  protected name = '';

  constructor() {
    this.load();
  }

  protected create(): void {
    const name = this.name.trim();
    if (!name) return;
    this.api.createProject(name).subscribe({
      next: (project) => {
        this.projects.update((projects) => [...projects, project]);
        this.name = '';
        this.notifications.success('Projet créé avec succès.');
      },
      error: () => {
        const message = 'Impossible de créer ce projet.';
        this.error.set(message);
        this.notifications.error(message);
      },
    });
  }

  private load(): void {
    this.api.getProjects().subscribe({
      next: (projects) => this.projects.set(projects),
      error: () => this.error.set('Impossible de charger les projets.'),
    });
  }
}
