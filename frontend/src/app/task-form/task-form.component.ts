// Outils Angular : composant, réaction à un signal, entrées, sorties et état local.
import { Component, effect, inject, input, output, signal, untracked } from '@angular/core';
// Outils des formulaires réactifs et validateurs fournis par Angular.
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// Types métier utilisés par le formulaire.
import { Project, Task, TaskDraft, TaskPriority, TaskStatus } from '../task.model';
import { OnboardingService } from '../onboarding.service';

// Déclaration du composant standalone responsable du formulaire.
@Component({
  // Balise HTML utilisée par le composant parent.
  selector: 'app-task-form',
  // Rend formGroup et formControlName disponibles dans le template.
  imports: [ReactiveFormsModule],
  // Vue HTML du formulaire.
  templateUrl: './task-form.component.html',
  // Styles propres au formulaire.
  styleUrl: './task-form.component.css',
})
export class TaskFormComponent {
  private readonly onboarding = inject(OnboardingService);
  // Une tâche présente signifie que le formulaire est en mode édition.
  readonly task = input<Task | null>(null);
  readonly projects = input<Project[]>([]);
  // Empêche une double soumission pendant l'appel HTTP.
  readonly busy = input(false);
  // Événement envoyé au parent lorsque les données valides doivent être enregistrées.
  readonly taskSaved = output<TaskDraft>();
  // Événement envoyé au parent lorsque l'utilisateur annule la modification.
  readonly cancelled = output<void>();
  // Mémorise une tentative de soumission pour contrôler l'affichage des erreurs.
  protected readonly submitted = signal(false);
  protected readonly reminderGuideOpen = signal(false);
  // FormGroup rassemble les champs et leurs règles de validation.
  protected readonly form = new FormGroup({
    // Titre obligatoire, non null et composé d'au moins trois caractères.
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(120)],
    }),
    // Description facultative limitée comme dans le DTO Java.
    description: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(1000)] }),
    // Priorité toujours définie, avec « medium » comme valeur initiale.
    priority: new FormControl<TaskPriority>('medium', { nonNullable: true }),
    // Une nouvelle tâche commence dans la colonne « À faire ».
    status: new FormControl<TaskStatus>('todo', { nonNullable: true }),
    // Un input date renvoie une chaîne ISO vide lorsqu'aucune date n'est choisie.
    dueDate: new FormControl('', { nonNullable: true }),
    estimatedMinutes: new FormControl<number | null>(null, { validators: [Validators.min(5), Validators.max(1440)] }),
    projectId: new FormControl<number | null>(null),
    reminderAt: new FormControl('', { nonNullable: true }),
    reminderRepeatMinutes: new FormControl<number | null>(null, { validators: [Validators.min(2), Validators.max(10080)] }),
    reminderMaxOccurrences: new FormControl<number | null>(1, { validators: [Validators.min(1), Validators.max(3)] }),
  });

  constructor() {
    // effect se réexécute automatiquement lorsque l'entrée task change.
    effect(() => {
      // Lit la tâche choisie par le parent.
      const task = this.task();
      // Une nouvelle tâche à éditer réinitialise l'état de soumission.
      this.submitted.set(false);
      // Préremplit le formulaire en édition ou le vide en création.
      const guideDraft = !task && this.onboarding.open() ? untracked(() => this.onboarding.taskDraft()) : null;
      this.form.reset(guideDraft ?? {
          title: task?.title ?? '',
          description: task?.description ?? '',
          priority: task?.priority ?? 'medium',
          status: task?.status ?? 'todo',
          dueDate: task?.dueDate ?? '',
          estimatedMinutes: task?.estimatedMinutes ?? null,
          projectId: task?.projectId ?? null,
          reminderAt: task?.reminderAt?.slice(0, 16) ?? '',
          reminderRepeatMinutes: task?.reminderRepeatMinutes ?? null,
          reminderMaxOccurrences: task?.reminderMaxOccurrences ?? 1,
        });
    });
    this.form.valueChanges.subscribe((value) => {
      if (!this.onboarding.open() || this.task()) return;
      this.onboarding.updateTaskDraft({
        title: value.title ?? '',
        description: value.description ?? '',
        priority: value.priority ?? 'medium',
        status: value.status ?? 'todo',
        dueDate: value.dueDate ?? '',
        estimatedMinutes: value.estimatedMinutes ?? null,
        projectId: value.projectId ?? null,
        reminderAt: value.reminderAt ?? '',
        reminderRepeatMinutes: value.reminderRepeatMinutes ?? null,
        reminderMaxOccurrences: value.reminderMaxOccurrences ?? 1,
      });
    });
  }

  /** Valide le formulaire puis envoie ses données au composant parent. */
  protected submit(): void {
    // Indique que l'utilisateur a essayé d'envoyer le formulaire.
    this.submitted.set(true);
    // Interrompt la méthode si un champ est invalide.
    if (this.form.invalid || this.busy()) return;
    // Transmet au parent les valeurs typées du formulaire.
    const value = this.form.getRawValue();
    this.taskSaved.emit({
      ...value,
      title: value.title.trim(),
      description: value.description.trim() || null,
      dueDate: value.dueDate || null,
      projectId: value.projectId,
      reminderAt: value.reminderAt || null,
      reminderRepeatMinutes: value.reminderAt ? value.reminderRepeatMinutes : null,
      reminderMaxOccurrences: value.reminderAt ? value.reminderMaxOccurrences : null,
    });
    // Après une création, prépare le formulaire pour une nouvelle tâche.
    if (!this.task() && !this.onboarding.open()) {
      this.form.reset({ title: '', description: '', priority: 'medium', status: 'todo', dueDate: '', estimatedMinutes: null, projectId: null, reminderAt: '', reminderRepeatMinutes: null, reminderMaxOccurrences: 1 });
    }
    // Masque les messages liés à la tentative précédente.
    this.submitted.set(false);
  }

  /** Affiche une erreur après visite du champ ou tentative de soumission. */
  protected shouldShowError(field: 'title' | 'description' | 'estimatedMinutes' | 'reminderRepeatMinutes' | 'reminderMaxOccurrences'): boolean {
    // Récupère le contrôle demandé.
    const control = this.form.controls[field];
    // Une erreur apparaît seulement si le champ invalide a déjà été utilisé.
    return control.invalid && (control.touched || this.submitted());
  }

  /** Informe le parent que l'utilisateur abandonne la modification. */
  protected cancel(): void {
    this.cancelled.emit();
  }

  protected openReminderGuide(): void { this.reminderGuideOpen.set(true); }
  protected closeReminderGuide(): void {
    this.reminderGuideOpen.set(false);
    try { localStorage.setItem('taskflow.reminder-guide.seen', 'true'); } catch { /* Guide limité à la session. */ }
  }
  protected shouldSuggestReminderGuide(): boolean {
    try { return localStorage.getItem('taskflow.reminder-guide.seen') !== 'true'; } catch { return true; }
  }
}
