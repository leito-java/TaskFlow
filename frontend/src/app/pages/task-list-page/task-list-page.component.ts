import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TaskFilterComponent } from '../../task-filter/task-filter.component';
import { TaskListComponent } from '../../task-list/task-list.component';
import { Task, TaskFilter } from '../../task.model';
import { ProjectApiService } from '../../project-api.service';
import { Project } from '../../task.model';
import { TaskStore } from '../../task.store';
import { DailyPriority, DailyPriorityApiService, DailyPrioritySuggestion } from '../../daily-priority-api.service';
import { ApiErrorService } from '../../api-error.service';
import { OnboardingService } from '../../onboarding.service';

@Component({
  selector: 'app-task-list-page',
  imports: [FormsModule, RouterLink, TaskFilterComponent, TaskListComponent],
  templateUrl: './task-list-page.component.html',
  styleUrl: './task-list-page.component.css',
})
export class TaskListPageComponent {
  protected readonly store = inject(TaskStore);
  private readonly router = inject(Router);
  protected readonly currentFilter = signal<TaskFilter>('all');
  protected readonly searchTerm = signal('');
  protected readonly sortBy = signal<'priority' | 'dueDate'>('priority');
  protected readonly projectId = signal<number | null>(null);
  protected readonly currentPage = signal(1);
  protected readonly pageSize = 20;
  protected readonly projects = signal<Project[]>([]);
  // La tâche n'est supprimée qu'après une confirmation explicite dans la fenêtre modale.
  protected readonly taskPendingDeletion = signal<Task | null>(null);
  private readonly projectApi = inject(ProjectApiService);
  private readonly dailyPriorityApi = inject(DailyPriorityApiService);
  private readonly apiErrors = inject(ApiErrorService);
  private readonly onboarding = inject(OnboardingService);
  protected readonly dailyPriorities = signal<DailyPriority[]>([]);
  protected readonly prioritySuggestions = signal<DailyPrioritySuggestion[]>([]);
  protected readonly priorityError = signal<string | null>(null);
  protected readonly visiblePrioritySuggestions = computed(() =>
    this.prioritySuggestions().slice(0, Math.max(0, 3 - this.dailyPriorities().length)),
  );
  protected readonly completionPercentage = computed(() => {
    const total = this.store.taskCount();
    return total === 0 ? 0 : Math.round((this.store.completedTaskCount() / total) * 100);
  });
  protected readonly dailyEstimatedMinutes = computed(() => this.dailyPriorities()
    .reduce((total, priority) => total + (this.taskForPriority(priority.taskId)?.estimatedMinutes ?? 0), 0));

  constructor() {
    this.store.loadTasks();
    this.projectApi.getProjects().subscribe({ next: (projects) => this.projects.set(projects) });
    this.loadDailyPriorities();
    this.loadPrioritySuggestions();
  }

  protected loadPrioritySuggestions(): void {
    this.dailyPriorityApi.getSuggestions().subscribe({
      next: (suggestions) => this.prioritySuggestions.set(suggestions),
      error: (error: unknown) => this.priorityError.set(this.apiErrors.message(error, 'Impossible de charger les priorités de la veille.')),
    });
  }

  protected loadDailyPriorities(): void {
    this.dailyPriorityApi.getToday().subscribe({
      next: (priorities) => { this.dailyPriorities.set(priorities); this.priorityError.set(null); },
      error: (error: unknown) => this.priorityError.set(this.apiErrors.message(error, 'Impossible de charger vos priorités du jour.')),
    });
  }

  protected addDailyPriority(taskId: number): void {
    this.dailyPriorityApi.add(taskId).subscribe({
      next: () => {
        this.loadDailyPriorities();
        this.prioritySuggestions.update((suggestions) => suggestions.filter((suggestion) => suggestion.taskId !== taskId));
        this.onboarding.completeStep('daily-priorities');
      },
      error: (error: unknown) => this.priorityError.set(this.apiErrors.message(error, 'Vous pouvez choisir au maximum trois priorités.')),
    });
  }

  protected dismissPrioritySuggestion(taskId: number): void {
    this.prioritySuggestions.update((suggestions) => suggestions.filter((suggestion) => suggestion.taskId !== taskId));
  }

  protected removeDailyPriority(taskId: number): void {
    this.dailyPriorityApi.remove(taskId).subscribe({ next: () => this.loadDailyPriorities(), error: (error: unknown) => this.priorityError.set(this.apiErrors.message(error, 'Impossible de retirer cette priorité.')) });
  }

  protected isDailyPriority(taskId: number): boolean { return this.dailyPriorities().some((priority) => priority.taskId === taskId); }

  protected taskForPriority(taskId: number): Task | null {
    return this.store.taskById(taskId);
  }

  protected priorityLabel(priority: Task['priority']): string {
    return { low: 'Basse', medium: 'Moyenne', high: 'Haute' }[priority];
  }

  protected formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return remainder === 0 ? `${hours} h` : `${hours} h ${remainder} min`;
  }

  protected openTask(taskId: number): void {
    void this.router.navigate(['/tasks', taskId, 'edit']);
  }

  // La liste se recalcule quand le store, le filtre, la recherche ou le tri change.
  protected readonly filteredTasks = computed(() => {
    const filter = this.currentFilter();
    const query = this.searchTerm().trim().toLocaleLowerCase();
    const visibleTasks = (filter === 'all'
      ? this.store.tasks()
      : this.store.tasks().filter((task) => task.status === filter))
      .filter((task) => task.title.toLocaleLowerCase().includes(query))
      .filter((task) => this.projectId() === null || task.projectId === this.projectId());

    return [...visibleTasks].sort((left, right) => this.compareTasks(left, right));
  });

  protected readonly pageCount = computed(() => Math.max(1, Math.ceil(this.filteredTasks().length / this.pageSize)));
  protected readonly displayedPage = computed(() => Math.min(this.currentPage(), this.pageCount()));
  protected readonly paginatedTasks = computed(() => {
    const start = (this.displayedPage() - 1) * this.pageSize;
    return this.filteredTasks().slice(start, start + this.pageSize);
  });
  protected readonly firstDisplayedTask = computed(() => this.filteredTasks().length === 0 ? 0 : (this.displayedPage() - 1) * this.pageSize + 1);
  protected readonly lastDisplayedTask = computed(() => Math.min(this.displayedPage() * this.pageSize, this.filteredTasks().length));

  protected updateFilter(filter: TaskFilter): void { this.currentFilter.set(filter); this.currentPage.set(1); }
  protected updateSearch(value: string): void { this.searchTerm.set(value); this.currentPage.set(1); }
  protected updateSort(value: 'priority' | 'dueDate'): void { this.sortBy.set(value); this.currentPage.set(1); }
  protected updateProject(value: number | null): void { this.projectId.set(value); this.currentPage.set(1); }
  protected previousPage(): void { this.currentPage.update((page) => Math.max(1, page - 1)); }
  protected nextPage(): void { this.currentPage.update((page) => Math.min(this.pageCount(), page + 1)); }

  protected toggleTask(id: number): void {
    this.store.toggleTask(id, () => this.onboarding.completeStep('task-progress'));
  }

  protected editTask(id: number): void {
    // La navigation construit l'URL dynamique /tasks/:id/edit.
    void this.router.navigate(['/tasks', id, 'edit']);
  }

  /** Ouvre la confirmation sans appeler l'API. */
  protected requestDeletion(id: number): void {
    this.taskPendingDeletion.set(this.store.taskById(id));
  }

  /** Confirme la suppression puis referme la fenêtre. */
  protected confirmDeletion(): void {
    const task = this.taskPendingDeletion();
    if (!task) return;
    this.store.deleteTask(task.id);
    this.taskPendingDeletion.set(null);
  }

  /** Annuler laisse la liste et la base de données inchangées. */
  protected cancelDeletion(): void {
    this.taskPendingDeletion.set(null);
  }

  private compareTasks(left: { priority: string; dueDate: string | null }, right: { priority: string; dueDate: string | null }): number {
    if (this.sortBy() === 'priority') {
      const weight: Record<string, number> = { high: 0, medium: 1, low: 2 };
      return weight[left.priority] - weight[right.priority];
    }
    // Une tâche sans échéance est placée à la fin pour mettre les urgences en évidence.
    return (left.dueDate ?? '9999-12-31').localeCompare(right.dueDate ?? '9999-12-31');
  }
}
