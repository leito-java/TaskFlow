import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TaskApiService } from './task-api.service';

describe('TaskApiService', () => {
  let service: TaskApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TaskApiService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TaskApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('charge les tâches avec GET', () => {
    const expected = [{
      id: 1,
      title: 'Tester HttpClient',
      description: 'Intercepter la requête',
      priority: 'high' as const,
      status: 'in-progress' as const,
      dueDate: '2026-09-15',
      completed: false,
    }];

    service.getTasks().subscribe((tasks) => expect(tasks).toEqual(expected));

    const request = http.expectOne('/api/tasks');
    expect(request.request.method).toBe('GET');
    request.flush(expected);
  });

  it('crée une tâche avec POST', () => {
    const draft = {
      title: 'Créer une API',
      description: null,
      priority: 'medium' as const,
      status: 'todo' as const,
      dueDate: null,
      estimatedMinutes: 45,
    };

    service.createTask(draft).subscribe((task) => expect(task.id).toBe(7));

    const request = http.expectOne('/api/tasks');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(draft);
    request.flush({ id: 7, ...draft, completed: false });
  });

  it('modifie tous les détails d’une tâche avec PUT', () => {
    const update = {
      title: 'Finaliser la connexion',
      description: 'Vérifier le contrat complet',
      priority: 'high' as const,
      status: 'done' as const,
      dueDate: '2026-09-20',
      estimatedMinutes: 90,
    };

    service.updateTask(7, update).subscribe((task) => expect(task.completed).toBe(true));

    const request = http.expectOne('/api/tasks/7');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(update);
    request.flush({ id: 7, ...update, completed: true });
  });

  it('supprime une tâche avec DELETE', () => {
    service.deleteTask(7).subscribe();

    const request = http.expectOne('/api/tasks/7');
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });
});
