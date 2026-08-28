// Outils Angular : composant, réaction à un signal, entrées, sorties et état local.
import { Component, effect, input, output, signal } from '@angular/core';
// Outils des formulaires réactifs et validateurs fournis par Angular.
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// Types métier utilisés par le formulaire.
import { Project, Task, TaskDraft, TaskPriority, TaskStatus } from '../task.model';

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
    projectId: new FormControl<number | null>(null),
  });

  constructor() {
    // effect se réexécute automatiquement lorsque l'entrée task change.
    effect(() => {
      // Lit la tâche choisie par le parent.
      const task = this.task();
      // Une nouvelle tâche à éditer réinitialise l'état de soumission.
      this.submitted.set(false);
      // Préremplit le formulaire en édition ou le vide en création.
      this.form.reset({
        title: task?.title ?? '',
        description: task?.description ?? '',
        priority: task?.priority ?? 'medium',
        status: task?.status ?? 'todo',
        dueDate: task?.dueDate ?? '',
        projectId: task?.projectId ?? null,
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
    });
    // Après une création, prépare le formulaire pour une nouvelle tâche.
    if (!this.task()) {
      this.form.reset({ title: '', description: '', priority: 'medium', status: 'todo', dueDate: '', projectId: null });
    }
    // Masque les messages liés à la tentative précédente.
    this.submitted.set(false);
  }

  /** Affiche une erreur après visite du champ ou tentative de soumission. */
  protected shouldShowError(field: 'title' | 'description'): boolean {
    // Récupère le contrôle demandé.
    const control = this.form.controls[field];
    // Une erreur apparaît seulement si le champ invalide a déjà été utilisé.
    return control.invalid && (control.touched || this.submitted());
  }

  /** Informe le parent que l'utilisateur abandonne la modification. */
  protected cancel(): void {
    this.cancelled.emit();
  }
}
