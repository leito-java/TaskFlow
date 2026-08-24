import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Task } from '../task.model';
import { TaskItemComponent } from './task-item.component';

describe('TaskItemComponent', () => {
  let fixture: ComponentFixture<TaskItemComponent>;
  const task: Task = {
    id: 42,
    title: 'Tester les événements',
    description: 'Vérifier les outputs du composant',
    priority: 'medium',
    status: 'in-progress',
    dueDate: '2026-09-15',
    completed: false,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TaskItemComponent] });
    fixture = TestBed.createComponent(TaskItemComponent);
    fixture.componentRef.setInput('task', task);
    fixture.detectChanges();
  });

  it('affiche la tâche reçue', () => {
    expect(fixture.nativeElement.textContent).toContain('Tester les événements');
    expect(fixture.nativeElement.textContent).toContain('En cours');
    expect(fixture.nativeElement.textContent).toContain('2026-09-15');
  });

  it('émet l’identifiant pour les trois actions', () => {
    const emitted = { toggled: 0, edited: 0, deleted: 0 };
    fixture.componentInstance.toggled.subscribe((id) => emitted.toggled = id);
    fixture.componentInstance.editRequested.subscribe((id) => emitted.edited = id);
    fixture.componentInstance.deleted.subscribe((id) => emitted.deleted = id);

    const checkbox: HTMLInputElement = fixture.nativeElement.querySelector('input[type="checkbox"]');
    const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('button'));
    checkbox.dispatchEvent(new Event('change'));
    buttons.find((button) => button.textContent?.includes('Modifier'))?.click();
    buttons.find((button) => button.textContent?.includes('Supprimer'))?.click();

    expect(emitted).toEqual({ toggled: 42, edited: 42, deleted: 42 });
  });
});
