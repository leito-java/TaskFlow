// input reçoit des données du parent ; output lui renvoie des événements.
import { Component, input, output } from '@angular/core';
// Composant enfant utilisé une fois pour chaque tâche.
import { TaskItemComponent } from '../task-item/task-item.component';
// Type métier de la liste reçue.
import { Task } from '../task.model';

@Component({
  // Balise utilisée par AppComponent.
  selector: 'app-task-list',
  // Autorise l'utilisation de <app-task-item> dans le template.
  imports: [TaskItemComponent],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css',
})
export class TaskListComponent {
  // Liste obligatoire reçue du composant parent.
  readonly tasks = input.required<Task[]>();
  // Identifiant de la tâche à basculer.
  readonly toggled = output<number>();
  // Identifiant de la tâche à supprimer.
  readonly deleted = output<number>();
  // Identifiant de la tâche à modifier.
  readonly editRequested = output<number>();
}
