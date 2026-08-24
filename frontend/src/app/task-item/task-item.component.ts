// Outils Angular nécessaires aux entrées et événements du composant.
import { Component, input, output } from '@angular/core';
// Modèle de la tâche affichée.
import { Task } from '../task.model';

@Component({
  // Balise utilisée par TaskListComponent.
  selector: 'app-task-item',
  templateUrl: './task-item.component.html',
  styleUrl: './task-item.component.css',
})
export class TaskItemComponent {
  // Tâche obligatoire reçue de TaskListComponent.
  readonly task = input.required<Task>();
  // Demande au parent de terminer la tâche ou de la replacer à faire.
  readonly toggled = output<number>();
  // Demande au parent de supprimer la tâche.
  readonly deleted = output<number>();
  // Demande au parent d'ouvrir la tâche dans le formulaire.
  readonly editRequested = output<number>();
}
