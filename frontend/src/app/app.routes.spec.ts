import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { routes } from './app.routes';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { NotFoundPageComponent } from './pages/not-found-page/not-found-page.component';
import { TaskFormPageComponent } from './pages/task-form-page/task-form-page.component';
import { TaskListPageComponent } from './pages/task-list-page/task-list-page.component';
import { TaskApiService, TaskUpdate } from './task-api.service';
import { Task, TaskDraft } from './task.model';

class FakeTaskApiService {
  private readonly tasks: Task[] = [
    {
      id: 1,
      title: 'Préparer le rapport hebdomadaire',
      description: null,
      priority: 'medium',
      status: 'done',
      dueDate: null,
      completed: true,
    },
    {
      id: 2,
      title: 'Organiser la prochaine livraison',
      description: 'Définir les prochaines actions',
      priority: 'high',
      status: 'in-progress',
      dueDate: '2026-09-15',
      completed: false,
    },
  ];

  getTasks() { return of(this.tasks); }
  createTask(draft: TaskDraft) {
    return of({ id: 3, ...draft, completed: draft.status === 'done' });
  }
  updateTask(id: number, update: TaskUpdate) {
    return of({ id, ...update, completed: update.status === 'done' });
  }
  deleteTask() { return of(undefined); }
}

describe('routes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        { provide: TaskApiService, useClass: FakeTaskApiService },
      ],
    });
  });

  it('affiche la page d’accueil pour /', async () => {
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/', HomePageComponent);

    expect(harness.routeNativeElement?.textContent).toContain('Organisez votre journée');
    const createLink = harness.routeNativeElement?.querySelector('a[href="/tasks/new"]');
    expect(createLink?.textContent).toContain('Créer une tâche');
  });

  it('affiche la liste pour /tasks', async () => {
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/tasks', TaskListPageComponent);

    expect(harness.routeNativeElement?.textContent).toContain('Liste des tâches');
    expect(harness.routeNativeElement?.textContent).toContain('Organiser la prochaine livraison');
  });

  it('lit le paramètre id pour préremplir la page de modification', async () => {
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/tasks/2/edit', TaskFormPageComponent);
    harness.detectChanges();

    const titleInput: HTMLInputElement | null = harness.routeNativeElement?.querySelector('#task') ?? null;
    expect(titleInput?.value).toBe('Organiser la prochaine livraison');
  });

  it('affiche la page 404 pour une URL inconnue', async () => {
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/route-inconnue', NotFoundPageComponent);

    expect(harness.routeNativeElement?.textContent).toContain('Cette page n’existe pas');
  });
});
