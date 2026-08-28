import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TaskFilterComponent } from '../../task-filter/task-filter.component';
import { TaskListComponent } from '../../task-list/task-list.component';
import { Task, TaskFilter } from '../../task.model';
import { ProjectApiService } from '../../project-api.service';
import { Project } from '../../task.model';
import { TaskStore } from '../../task.store';

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
  protected readonly projects = signal<Project[]>([]);
  // La tâche n'est supprimée qu'après une confirmation explicite dans la fenêtre modale.
  protected readonly taskPendingDeletion = signal<Task | null>(null);
  private readonly projectApi = inject(ProjectApiService);

  constructor() { this.store.loadTasks(); this.projectApi.getProjects().subscribe({ next: (projects) => this.projects.set(projects) }); }

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
