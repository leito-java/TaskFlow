// Type union : seules ces trois valeurs sont acceptées comme priorité.
export type TaskPriority = 'low' | 'medium' | 'high';

// Étapes métier partagées avec le contrat JSON de l'API Java.
export type TaskStatus = 'todo' | 'in-progress' | 'done';

// La liste peut afficher tous les éléments ou un statut précis.
export type TaskFilter = 'all' | TaskStatus;

// Données saisies avant la création ou la modification d'une tâche.
export interface TaskDraft {
  // Texte décrivant la tâche.
  title: string;
  // Informations facultatives utiles pour réaliser la tâche.
  description: string | null;
  // Niveau de priorité choisi dans le formulaire.
  priority: TaskPriority;
  // Étape actuelle dans le flux de travail.
  status: TaskStatus;
  // Date ISO YYYY-MM-DD, ou null lorsque l'échéance est absente.
  dueDate: string | null;
  // Temps prévu pour réaliser la tâche, entre 5 minutes et 24 heures.
  estimatedMinutes?: number | null;
  projectId?: number | null;
}

// Tâche enregistrée : l'API ajoute l'identité et le booléen de compatibilité.
export interface Task extends TaskDraft {
  // Identifiant unique utilisé pour retrouver la tâche.
  id: number;
  // Valeur dérivée de status par Java, conservée pendant la transition.
  completed: boolean;
  projectName?: string | null;
}

export type ProjectIcon = 'work' | 'study' | 'personal' | 'health' | 'finance' | 'code' | 'creative' | 'folder';
export interface Project { id: number; name: string; icon: ProjectIcon; color: string; }
