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
import { AuthService } from './auth.service';
import { ProjectApiService } from './project-api.service';

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
  deleteTask(id: number) {
    return of(undefined);
  }
}

describe('routes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        { provide: TaskApiService, useClass: FakeTaskApiService },
        { provide: AuthService, useValue: { isAuthenticated: () => true } },
        { provide: ProjectApiService, useValue: { getProjects: () => of([]) } },
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

  it('affiche un état vide lorsqu’une recherche ne correspond à aucune tâche', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/tasks', TaskListPageComponent);

    const search: HTMLInputElement | null = harness.routeNativeElement?.querySelector('input[type="search"]') ?? null;
    search!.value = 'inexistante';
    search!.dispatchEvent(new Event('input'));
    harness.detectChanges();

    expect(harness.routeNativeElement?.textContent).toContain('Aucune tâche ne correspond.');
  });

  it('demande confirmation avant de supprimer une tâche', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/tasks', TaskListPageComponent);

    const deleteButton = Array.from(harness.routeNativeElement!.querySelectorAll('button'))
      .find((button) => button.textContent?.includes('Supprimer')) as HTMLButtonElement;
    deleteButton.click();
    harness.detectChanges();

    expect(harness.routeNativeElement?.textContent).toContain('Supprimer cette tâche ?');
    expect(harness.routeNativeElement?.textContent).toContain('Préparer le rapport hebdomadaire');

    const cancelButton = Array.from(harness.routeNativeElement!.querySelectorAll('button'))
      .find((button) => button.textContent?.includes('Annuler')) as HTMLButtonElement;
    cancelButton.click();
    harness.detectChanges();

    expect(harness.routeNativeElement?.textContent).not.toContain('Supprimer cette tâche ?');
    expect(harness.routeNativeElement?.textContent).toContain('Préparer le rapport hebdomadaire');
  });

  it('supprime uniquement après confirmation explicite', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/tasks', TaskListPageComponent);

    const deleteButton = Array.from(harness.routeNativeElement!.querySelectorAll('button'))
      .find((button) => button.textContent?.includes('Supprimer')) as HTMLButtonElement;
    deleteButton.click();
    harness.detectChanges();

    const confirmButton = Array.from(harness.routeNativeElement!.querySelectorAll('button'))
      .find((button) => button.textContent?.includes('Oui, supprimer')) as HTMLButtonElement;
    confirmButton.click();
    harness.detectChanges();

    expect(harness.routeNativeElement?.textContent).not.toContain('Supprimer cette tâche ?');
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
