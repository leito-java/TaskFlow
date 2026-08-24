// input reçoit le filtre actif ; output demande au parent de le changer.
import { Component, input, output } from '@angular/core';
import { TaskFilter } from '../task.model';

@Component({
  selector: 'app-task-filter',
  templateUrl: './task-filter.component.html',
  styleUrl: './task-filter.component.css',
})
export class TaskFilterComponent {
  // Filtre actuellement sélectionné par le composant parent.
  readonly activeFilter = input.required<TaskFilter>();
  // Nouvel état demandé lorsque l'utilisateur clique sur un bouton.
  readonly filterChanged = output<TaskFilter>();
}
