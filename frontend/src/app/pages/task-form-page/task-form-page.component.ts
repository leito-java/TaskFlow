import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { TaskFormComponent } from '../../task-form/task-form.component';
import { TaskDraft } from '../../task.model';
import { TaskStore } from '../../task.store';
import { ProjectApiService } from '../../project-api.service';
import { NotificationService } from '../../notification.service';
import { ApiErrorService } from '../../api-error.service';
import { OnboardingService } from '../../onboarding.service';

@Component({
  selector: 'app-task-form-page',
  imports: [RouterLink, TaskFormComponent],
  templateUrl: './task-form-page.component.html',
  styleUrl: './task-form-page.component.css',
})
export class TaskFormPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly store = inject(TaskStore);
  protected readonly saving = signal(false);
  private readonly projectApi = inject(ProjectApiService);
  private readonly apiErrors = inject(ApiErrorService);
  private readonly notifications = inject(NotificationService);
  private readonly onboarding = inject(OnboardingService);
  protected readonly projects = this.projectApi.projects;
  protected readonly projectError = signal<string | null>(null);

  constructor() {
    this.projectApi.getProjects().subscribe({
      next: () => this.projectError.set(null),
      error: (error: unknown) => this.projectError.set(this.apiErrors.message(error, 'Impossible de charger vos projets.')),
    });
  }

  // toSignal transforme les paramètres Observable du routeur en état réactif.
  private readonly paramMap = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });
  protected readonly taskId = computed(() => {
    const rawId = this.paramMap().get('id');
    if (rawId === null) return null;
    const id = Number(rawId);
    return Number.isInteger(id) ? id : Number.NaN;
  });
  protected readonly isEditing = computed(() => this.taskId() !== null);
  protected readonly task = computed(() => {
    const id = this.taskId();
    return id === null ? null : this.store.taskById(id);
  });
  protected readonly taskNotFound = computed(() =>
    this.isEditing() && !this.store.loading() && this.task() === null,
  );

  protected saveTask(draft: TaskDraft): void {
    const id = this.taskId();
    const request = id === null ? this.store.createTask(draft) : this.store.updateTask(id, draft);
    this.saving.set(true);
    request.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: () => {
        this.notifications.success(id === null ? 'Tâche créée avec succès.' : 'Tâche modifiée avec succès.');
        if (!this.onboarding.completeStep('task-creator')) void this.router.navigate(['/tasks']);
      },
    });
  }

  protected cancel(): void {
    void this.router.navigate(['/tasks']);
  }
}
