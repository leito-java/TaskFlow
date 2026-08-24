import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TaskFilterComponent } from '../../task-filter/task-filter.component';
import { TaskListComponent } from '../../task-list/task-list.component';
import { TaskFilter } from '../../task.model';
import { TaskStore } from '../../task.store';

@Component({
  selector: 'app-task-list-page',
  imports: [RouterLink, TaskFilterComponent, TaskListComponent],
  templateUrl: './task-list-page.component.html',
  styleUrl: './task-list-page.component.css',
})
export class TaskListPageComponent {
  protected readonly store = inject(TaskStore);
  private readonly router = inject(Router);
  protected readonly currentFilter = signal<TaskFilter>('all');

  // La liste se recalcule quand le store ou le filtre change.
  protected readonly filteredTasks = computed(() => {
    const filter = this.currentFilter();
    return filter === 'all'
      ? this.store.tasks()
      : this.store.tasks().filter((task) => task.status === filter);
  });

  protected editTask(id: number): void {
    // La navigation construit l'URL dynamique /tasks/:id/edit.
    void this.router.navigate(['/tasks', id, 'edit']);
  }
}
