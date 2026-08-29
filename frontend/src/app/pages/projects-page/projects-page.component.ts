import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../notification.service';
import { ProjectApiService } from '../../project-api.service';
import { Project, ProjectIcon } from '../../task.model';
import { ApiErrorService } from '../../api-error.service';

interface IconOption { value: ProjectIcon; label: string; symbol: string; }

@Component({
  selector: 'app-projects-page',
  imports: [FormsModule],
  templateUrl: './projects-page.component.html',
  styleUrl: './projects-page.component.css',
})
export class ProjectsPageComponent {
  private readonly api = inject(ProjectApiService);
  private readonly notifications = inject(NotificationService);
  private readonly apiErrors = inject(ApiErrorService);
  protected readonly projects = signal<Project[]>([]);
  protected readonly error = signal('');
  protected name = '';
  protected icon: ProjectIcon = 'work';
  protected color = '#6D5CE7';
  protected readonly iconOptions: IconOption[] = [
    { value: 'work', label: 'Travail', symbol: '💼' },
    { value: 'study', label: 'Études', symbol: '📚' },
    { value: 'personal', label: 'Personnel', symbol: '🏠' },
    { value: 'health', label: 'Santé', symbol: '♥' },
    { value: 'finance', label: 'Finance', symbol: '◈' },
    { value: 'code', label: 'Développement', symbol: '</>' },
    { value: 'creative', label: 'Créatif', symbol: '✦' },
    { value: 'folder', label: 'Autre', symbol: '▰' },
  ];
  protected readonly colors = ['#6D5CE7', '#2563EB', '#0891B2', '#059669', '#D97706', '#E11D48', '#7C3AED', '#475569'];

  constructor() {
    this.load();
  }

  protected create(): void {
    const name = this.name.trim();
    if (!name) return;
    this.api.createProject({ name, icon: this.icon, color: this.color }).subscribe({
      next: (project) => {
        this.projects.update((projects) => [...projects, project]);
        this.name = '';
        this.icon = 'work';
        this.color = '#6D5CE7';
        this.notifications.success('Projet créé avec succès.');
      },
      error: (error: unknown) => {
        const message = this.apiErrors.message(error, 'Impossible de créer ce projet.');
        this.error.set(message);
        this.notifications.error(message);
      },
    });
  }

  protected iconSymbol(icon: ProjectIcon | undefined): string {
    return this.iconOptions.find((option) => option.value === icon)?.symbol ?? '▰';
  }

  private load(): void {
    this.api.getProjects().subscribe({
      next: (projects) => this.projects.set(projects),
      error: (error: unknown) => this.error.set(this.apiErrors.message(error, 'Impossible de charger les projets.')),
    });
  }
}
