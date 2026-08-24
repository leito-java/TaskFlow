import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, tap, throwError } from 'rxjs';
import { TaskApiService } from './task-api.service';
import { Task, TaskDraft } from './task.model';

/** État d'interface partagé ; la source persistante est maintenant l'API. */
@Injectable({ providedIn: 'root' })
export class TaskStore {
  private readonly api = inject(TaskApiService);
  // L'état reste privé : les composants peuvent le lire, mais pas le modifier directement.
  private readonly taskState = signal<Task[]>([]);
  private readonly loadingState = signal(false);
  private readonly errorState = signal<string | null>(null);

  // asReadonly expose le signal sans sa méthode set.
  readonly tasks = this.taskState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly taskCount = computed(() => this.tasks().length);
  readonly todoTaskCount = computed(() => this.tasks().filter((task) => task.status === 'todo').length);
  readonly inProgressTaskCount = computed(() => this.tasks().filter((task) => task.status === 'in-progress').length);
  readonly completedTaskCount = computed(() => this.tasks().filter((task) => task.status === 'done').length);
  readonly remainingTaskCount = computed(() => this.todoTaskCount() + this.inProgressTaskCount());

  constructor() {
    this.loadTasks();
  }

  /** Charge la liste depuis Spring Boot et met à jour les états d'interface. */
  loadTasks(): void {
    this.loadingState.set(true);
    this.clearError();
    this.api.getTasks()
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: (tasks) => this.taskState.set(tasks),
        error: (error: unknown) => this.reportError(error),
      });
  }

  /** Recherche une tâche à partir de l'identifiant contenu dans l'URL. */
  taskById(id: number): Task | null {
    return this.tasks().find((task) => task.id === id) ?? null;
  }

  /** Demande la création à l'API puis ajoute sa réponse au signal local. */
  createTask(draft: TaskDraft): Observable<Task> {
    this.clearError();
    return this.api.createTask(draft).pipe(
      tap((task) => this.taskState.update((tasks) => [...tasks, task])),
      catchError((error: unknown) => this.propagateError(error)),
    );
  }

  /** Enregistre l'édition côté serveur avant de remplacer la tâche locale. */
  updateTask(id: number, draft: TaskDraft): Observable<Task> {
    const current = this.taskById(id);
    if (!current) return throwError(() => new Error(`Tâche ${id} introuvable`));
    this.clearError();
    return this.api.updateTask(id, draft).pipe(
      tap((task) => this.replaceTask(task)),
      catchError((error: unknown) => this.propagateError(error)),
    );
  }

  /** Termine une tâche, ou la replace à faire lorsqu'elle était terminée. */
  toggleTask(id: number): void {
    const current = this.taskById(id);
    if (!current) return;
    this.clearError();
    this.api.updateTask(id, {
      title: current.title,
      description: current.description,
      priority: current.priority,
      status: current.status === 'done' ? 'todo' : 'done',
      dueDate: current.dueDate,
    }).subscribe({
      next: (task) => this.replaceTask(task),
      error: (error: unknown) => this.reportError(error),
    });
  }

  /** Supprime la tâche ciblée. */
  deleteTask(id: number): void {
    this.clearError();
    this.api.deleteTask(id).subscribe({
      next: () => this.taskState.update((tasks) => tasks.filter((task) => task.id !== id)),
      error: (error: unknown) => this.reportError(error),
    });
  }

  clearError(): void {
    this.errorState.set(null);
  }

  private replaceTask(updated: Task): void {
    this.taskState.update((tasks) => tasks.map((task) => task.id === updated.id ? updated : task));
  }

  private propagateError(error: unknown): Observable<never> {
    this.reportError(error);
    return throwError(() => error);
  }

  private reportError(error: unknown): void {
    if (error instanceof HttpErrorResponse && error.status === 0) {
      this.errorState.set("Impossible de joindre l'API. Vérifiez que Spring Boot est lancé sur le port 8080.");
      return;
    }
    if (error instanceof HttpErrorResponse && typeof error.error?.detail === 'string') {
      this.errorState.set(error.error.detail);
      return;
    }
    this.errorState.set("Une erreur inattendue s'est produite. Réessayez.");
  }
}
