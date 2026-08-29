import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ProjectApiService } from './project-api.service';

describe('ProjectApiService', () => {
  let service: ProjectApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProjectApiService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProjectApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('partage immédiatement un projet confirmé par l’API', () => {
    const draft = { name: 'Formation Angular', icon: 'study' as const, color: '#2563EB' };

    service.createProject(draft).subscribe();
    const request = http.expectOne('/api/projects');
    request.flush({ id: 7, ...draft });

    expect(service.projects()).toEqual([{ id: 7, ...draft }]);
  });

  it('remplace le cache lors du rechargement des projets', () => {
    service.getProjects().subscribe();
    const request = http.expectOne('/api/projects');
    request.flush([{ id: 3, name: 'Personnel', icon: 'personal', color: '#059669' }]);

    expect(service.projects()).toHaveLength(1);
    expect(service.projects()[0].name).toBe('Personnel');
  });
});
