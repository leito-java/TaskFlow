import { Injectable, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

export interface OnboardingStep { eyebrow: string; title: string; description: string; route: string; action: string; target?: string; }

@Injectable({ providedIn: 'root' })
export class OnboardingService {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly open = signal(false);
  readonly stepIndex = signal(0);
  readonly steps: OnboardingStep[] = [
    { eyebrow: 'Bienvenue', title: 'Prenez TaskFlow en main', description: 'Vous allez réellement créer un projet, une tâche et votre premier focus. Les zones à utiliser seront mises en évidence.', route: '/projects', action: 'Commencer le parcours' },
    { eyebrow: 'Étape 1 sur 4', title: 'Créez un projet', description: 'Utilisez la zone éclairée : saisissez un nom, choisissez une icône et une couleur, puis cliquez sur Créer le projet.', route: '/projects', action: "J’ai créé mon projet", target: 'project-creator' },
    { eyebrow: 'Étape 2 sur 4', title: 'Ajoutez une tâche', description: 'Remplissez le vrai formulaire, sélectionnez le projet que vous venez de créer, puis enregistrez la tâche.', route: '/tasks/new', action: "J’ai créé ma tâche", target: 'task-creator' },
    { eyebrow: 'Étape 3 sur 4', title: 'Choisissez votre focus', description: 'Dans la zone éclairée, ajoutez votre nouvelle tâche aux trois priorités du jour.', route: '/tasks', action: "J’ai choisi mon focus", target: 'daily-priorities' },
    { eyebrow: 'Étape 4 sur 4', title: 'Marquez votre tâche comme terminée', description: 'Dans la liste située plus bas, cochez la case à gauche du titre de votre tâche. La progression éclairée augmentera et une confirmation affichera le nouveau total. Le focus restera à 3/3, car il compte les priorités choisies.', route: '/tasks', action: 'Ma tâche est terminée', target: 'task-progress' },
  ];

  constructor() {
    effect(() => {
      const email = this.auth.email();
      if (email && !this.hasCompleted(email)) this.open.set(true);
    });
  }

  start(): void { this.clearHighlight(); this.stepIndex.set(0); this.open.set(true); }
  close(): void { this.clearHighlight(); this.rememberCompletion(); this.open.set(false); }

  next(): void {
    const current = this.stepIndex();
    if (current === this.steps.length - 1) { this.close(); return; }
    const nextIndex = current + 1;
    this.stepIndex.set(nextIndex);
    this.openStep(nextIndex);
  }

  previous(): void {
    const previousIndex = Math.max(0, this.stepIndex() - 1);
    this.stepIndex.set(previousIndex);
    this.openStep(previousIndex);
  }

  private openStep(index: number): void {
    this.clearHighlight();
    const step = this.steps[index];
    void this.router.navigateByUrl(step.route).then(() => {
      setTimeout(() => {
        if (!step.target) return;
        const target = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
        target?.classList.add('tour-highlight');
        target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });
  }

  private clearHighlight(): void { document.querySelector('.tour-highlight')?.classList.remove('tour-highlight'); }

  private rememberCompletion(): void {
    const email = this.auth.email();
    if (!email) return;
    try { localStorage.setItem(this.storageKey(email), 'true'); } catch { /* Le guide peut rester limité à la session. */ }
  }
  private hasCompleted(email: string): boolean {
    try { return localStorage.getItem(this.storageKey(email)) === 'true'; } catch { return false; }
  }
  private storageKey(email: string): string { return `taskflow.onboarding.completed.${email}`; }
}
