import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { authGuard } from './auth.guard';

/** Une route associe un chemin d'URL au composant qui représente la page. */
export const routes: Routes = [
  // La page principale est chargée immédiatement car elle constitue le premier écran.
  { path: '', title: 'Accueil · TaskFlow', component: HomePageComponent },
  { path: 'login', title: 'Connexion · TaskFlow', loadComponent: () => import('./pages/auth-page/auth-page.component').then((m) => m.AuthPageComponent) },
  { path: 'register', title: 'Inscription · TaskFlow', loadComponent: () => import('./pages/auth-page/auth-page.component').then((m) => m.AuthPageComponent) },
  { path: 'security', title: 'Sécurité · TaskFlow', canActivate: [authGuard], loadComponent: () => import('./pages/security-page/security-page.component').then((m) => m.SecurityPageComponent) },
  // Les autres pages sont chargées seulement lorsqu'elles deviennent nécessaires.
  // Les routes les plus précises sont placées avant la liste générale.
  {
    path: 'tasks/new',
    title: 'Nouvelle tâche · TaskFlow',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/task-form-page/task-form-page.component').then((module) => module.TaskFormPageComponent),
  },
  {
    path: 'tasks/:id/edit',
    title: 'Modifier une tâche · TaskFlow',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/task-form-page/task-form-page.component').then((module) => module.TaskFormPageComponent),
  },
  {
    path: 'tasks',
    title: 'Mes tâches · TaskFlow',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/task-list-page/task-list-page.component').then((module) => module.TaskListPageComponent),
  },
  {
    path: 'about',
    title: 'À propos · TaskFlow',
    loadComponent: () => import('./pages/about-page/about-page.component').then((module) => module.AboutPageComponent),
  },
  // Le wildcard doit rester en dernier : il capture toute URL inconnue.
  {
    path: '**',
    title: 'Page introuvable · TaskFlow',
    loadComponent: () => import('./pages/not-found-page/not-found-page.component').then((module) => module.NotFoundPageComponent),
  },
];
