import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { NotificationService } from '../../notification.service';
import { ProjectDraft, ProjectApiService } from '../../project-api.service';
import { ProjectsPageComponent } from './projects-page.component';
import { OnboardingService } from '../../onboarding.service';

class FakeProjectApiService {
  createdDraft: ProjectDraft | null = null;
  getProjects() { return of([]); }
  createProject(draft: ProjectDraft) {
    this.createdDraft = draft;
    return of({ id: 1, ...draft });
  }
}

describe('ProjectsPageComponent', () => {
  let fixture: ComponentFixture<ProjectsPageComponent>;
  let api: FakeProjectApiService;
  let onboarding: { completeStep: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    const projectDraft = signal({ name: '', icon: 'work' as const, color: '#6D5CE7' });
    await TestBed.configureTestingModule({
      imports: [ProjectsPageComponent],
      providers: [
        { provide: ProjectApiService, useClass: FakeProjectApiService },
        { provide: NotificationService, useValue: { success: () => undefined, error: () => undefined } },
        { provide: OnboardingService, useValue: {
          projectDraft,
          updateProjectDraft: (change: object) => projectDraft.update((draft) => ({ ...draft, ...change })),
          completeStep: vi.fn(() => false),
        } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ProjectsPageComponent);
    api = TestBed.inject(ProjectApiService) as unknown as FakeProjectApiService;
    onboarding = TestBed.inject(OnboardingService) as unknown as { completeStep: ReturnType<typeof vi.fn> };
    fixture.detectChanges();
  });

  it('crée un projet avec son icône et sa couleur', () => {
    const component = fixture.componentInstance as unknown as { name: string; icon: string; color: string; create(): void };
    component.name = '  Formation Angular  ';
    component.icon = 'study';
    component.color = '#2563EB';

    component.create();

    expect(api.createdDraft).toEqual({ name: 'Formation Angular', icon: 'study', color: '#2563EB' });
    expect(fixture.componentInstance['projects']()).toHaveLength(1);
    expect(onboarding.completeStep).toHaveBeenCalledWith('project-creator');
  });

  it('ne crée pas de projet sans nom', () => {
    const component = fixture.componentInstance as unknown as { name: string; create(): void };
    component.name = '   ';
    component.create();
    expect(api.createdDraft).toBeNull();
  });
});
