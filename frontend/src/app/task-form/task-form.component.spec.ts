import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskDraft } from '../task.model';
import { TaskFormComponent } from './task-form.component';

describe('TaskFormComponent', () => {
  let fixture: ComponentFixture<TaskFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TaskFormComponent] });
    fixture = TestBed.createComponent(TaskFormComponent);
    fixture.detectChanges();
  });

  it('désactive le bouton lorsque le titre est trop court', () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('#task');
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');

    input.value = 'ab';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(button.disabled).toBe(true);
  });

  it('affiche une erreur après interaction avec un titre invalide', () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('#task');

    input.value = 'ab';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('au moins 3 caractères');
  });

  it('affiche une erreur et ne sauvegarde pas après une soumission invalide', () => {
    let savedTask: TaskDraft | undefined;
    fixture.componentInstance.taskSaved.subscribe((task) => savedTask = task);
    const form: HTMLFormElement = fixture.nativeElement.querySelector('form');

    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Le titre est obligatoire');
    expect(savedTask).toBeUndefined();
  });

  it('émet les données lorsque le formulaire est valide', () => {
    let savedTask: TaskDraft | undefined;
    fixture.componentInstance.taskSaved.subscribe((task) => savedTask = task);

    const input: HTMLInputElement = fixture.nativeElement.querySelector('#task');
    const select: HTMLSelectElement = fixture.nativeElement.querySelector('#priority');
    const form: HTMLFormElement = fixture.nativeElement.querySelector('form');

    input.value = 'Tester le formulaire';
    input.dispatchEvent(new Event('input'));
    select.value = 'high';
    select.dispatchEvent(new Event('change'));
    form.dispatchEvent(new Event('submit'));

    expect(savedTask).toEqual({
      title: 'Tester le formulaire',
      description: null,
      priority: 'high',
      status: 'todo',
      dueDate: null,
    });
  });

  it('refuse une description supérieure à 1000 caractères', () => {
    const description: HTMLTextAreaElement = fixture.nativeElement.querySelector('#description');
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');

    description.value = 'a'.repeat(1001);
    description.dispatchEvent(new Event('input'));
    description.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(button.disabled).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('1000 caractères');
  });

  it('préremplit puis enregistre le formulaire en mode modification', () => {
    fixture.componentRef.setInput('task', {
      id: 7,
      title: 'Ancien titre',
      description: 'Contexte existant',
      priority: 'low',
      status: 'in-progress',
      dueDate: '2026-09-15',
      completed: false,
    });
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('#task');
    const select: HTMLSelectElement = fixture.nativeElement.querySelector('#priority');
    const status: HTMLSelectElement = fixture.nativeElement.querySelector('#status');
    const dueDate: HTMLInputElement = fixture.nativeElement.querySelector('#due-date');
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
    const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
    let savedTask: TaskDraft | undefined;
    fixture.componentInstance.taskSaved.subscribe((task) => savedTask = task);

    expect(input.value).toBe('Ancien titre');
    expect(select.value).toBe('low');
    expect(status.value).toBe('in-progress');
    expect(dueDate.value).toBe('2026-09-15');
    expect(button.textContent).toContain('Enregistrer');

    input.value = 'Titre modifié';
    input.dispatchEvent(new Event('input'));
    select.value = 'high';
    select.dispatchEvent(new Event('change'));
    form.dispatchEvent(new Event('submit'));

    expect(savedTask).toEqual({
      title: 'Titre modifié',
      description: 'Contexte existant',
      priority: 'high',
      status: 'in-progress',
      dueDate: '2026-09-15',
    });
  });
});
