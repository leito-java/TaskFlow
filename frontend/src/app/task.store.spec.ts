import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { TaskApiService, TaskUpdate } from './task-api.service';
import { Task, TaskDraft } from './task.model';
import { TaskStore } from './task.store';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';

class FakeTaskApiService {
  private data: Task[] = [
    {
      id: 1,
      title: 'Lire le chapitre TypeScript',
      description: null,
      priority: 'medium',
      status: 'done',
      dueDate: null,
      completed: true,
    },
    {
      id: 2,
      title: 'Créer mon premier composant Angular',
      description: 'Découper la page',
      priority: 'high',
      status: 'in-progress',
      dueDate: '2026-09-15',
      estimatedMinutes: 60,
      completed: false,
    },
  ];

  getTasks() {
    return of(this.data.map((task) => ({ ...task })));
  }

  createTask(draft: TaskDraft) {
    const task: Task = { id: 3, ...draft, completed: draft.status === 'done' };
    this.data = [...this.data, task];
    return of(task);
  }

  updateTask(id: number, update: TaskUpdate) {
    const task: Task = { id, ...update, completed: update.status === 'done' };
    this.data = this.data.map((item) => item.id === id ? task : item);
    return of(task);
  }

  deleteTask(id: number) {
    this.data = this.data.filter((task) => task.id !== id);
    return of(undefined);
  }
}

describe('TaskStore', () => {
  let store: TaskStore;
  let notifications: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: TaskApiService, useClass: FakeTaskApiService },
        { provide: AuthService, useValue: { isAuthenticated: () => true } },
      ],
    });
    store = TestBed.inject(TaskStore);
    notifications = TestBed.inject(NotificationService);
  });

  it('charge la liste et expose ses compteurs dérivés', () => {
    expect(store.taskCount()).toBe(2);
    expect(store.completedTaskCount()).toBe(1);
    expect(store.todoTaskCount()).toBe(0);
    expect(store.inProgressTaskCount()).toBe(1);
    expect(store.remainingTaskCount()).toBe(1);
    expect(store.loading()).toBe(false);
  });

  it('crée une tâche non terminée à partir de la réponse API', () => {
    store.createTask({
      title: 'Comprendre HttpClient',
      description: null,
      priority: 'high',
      status: 'todo',
      dueDate: null,
    }).subscribe();

    expect(store.taskById(3)?.completed).toBe(false);
    expect(store.taskCount()).toBe(3);
  });

  it('modifie une tâche existante', () => {
    store.updateTask(2, {
      title: 'Créer une page Angular',
      description: 'Utiliser une route dédiée',
      priority: 'low',
      status: 'in-progress',
      dueDate: '2026-09-20',
    }).subscribe();

    expect(store.taskById(2)?.title).toBe('Créer une page Angular');
    expect(store.taskById(2)?.priority).toBe('low');
    expect(store.taskById(2)?.dueDate).toBe('2026-09-20');
  });

  it('bascule puis supprime une tâche', () => {
    store.toggleTask(2);
    expect(store.taskById(2)?.status).toBe('done');
    expect(notifications.current()?.message).toContain('progression : 2 sur 2');
    expect(store.taskById(2)?.description).toBe('Découper la page');
    expect(store.taskById(2)?.dueDate).toBe('2026-09-15');
    expect(store.taskById(2)?.estimatedMinutes).toBe(60);

    store.deleteTask(2);
    expect(store.taskById(2)).toBeNull();
    expect(store.taskCount()).toBe(1);
  });

  it('explique lorsqu’une tâche terminée est replacée à faire', () => {
    store.toggleTask(1);

    expect(store.taskById(1)?.status).toBe('todo');
    expect(notifications.current()?.message).toContain('replacée dans les tâches à faire');
  });

  it('efface toutes les données utilisateur de la mémoire', () => {
    store.clearUserData();

    expect(store.tasks()).toEqual([]);
    expect(store.taskCount()).toBe(0);
    expect(store.error()).toBeNull();
  });
});
