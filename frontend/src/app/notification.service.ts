import { Injectable, signal } from '@angular/core';

export type NotificationKind = 'success' | 'error';

export interface UserNotification {
  kind: NotificationKind;
  message: string;
}

/** Affiche un retour temporaire commun à toutes les pages de l'application. */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly notificationState = signal<UserNotification | null>(null);
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  readonly current = this.notificationState.asReadonly();

  success(message: string): void {
    this.show('success', message);
  }

  error(message: string): void {
    this.show('error', message);
  }

  dismiss(): void {
    if (this.timeoutId !== null) clearTimeout(this.timeoutId);
    this.timeoutId = null;
    this.notificationState.set(null);
  }

  private show(kind: NotificationKind, message: string): void {
    this.dismiss();
    this.notificationState.set({ kind, message });
    this.timeoutId = setTimeout(() => this.dismiss(), 5000);
  }
}
