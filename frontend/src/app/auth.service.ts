import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

export interface AuthResponse { accessToken: string; email: string; }
export interface Credentials { email: string; password: string; }
export interface PasswordChange { currentPassword: string; newPassword: string; }

/** Centralise la session : seul ce service lit ou écrit le jeton local. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  // Certains navigateurs intégrés peuvent bloquer localStorage. La session reste alors
  // utilisable dans l'onglet courant grâce aux signals en mémoire.
  private readonly tokenState = signal(this.readStorage('taskflow.access-token'));
  private readonly emailState = signal(this.readStorage('taskflow.email'));

  readonly isAuthenticated = computed(() => this.tokenState() !== null);
  readonly email = this.emailState.asReadonly();

  register(credentials: Credentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/register', credentials).pipe(tap((response) => this.saveSession(response)));
  }

  login(credentials: Credentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/login', credentials).pipe(tap((response) => this.saveSession(response)));
  }

  changePassword(change: PasswordChange): Observable<void> {
    return this.http.put<void>('/api/auth/password', change);
  }

  logout(): void {
    this.removeStorage('taskflow.access-token');
    this.removeStorage('taskflow.email');
    this.tokenState.set(null);
    this.emailState.set(null);
  }

  get token(): string | null { return this.tokenState(); }

  private saveSession(response: AuthResponse): void {
    this.writeStorage('taskflow.access-token', response.accessToken);
    this.writeStorage('taskflow.email', response.email);
    this.tokenState.set(response.accessToken);
    this.emailState.set(response.email);
  }

  private readStorage(key: string): string | null {
    try { return localStorage.getItem(key); } catch { return null; }
  }

  private writeStorage(key: string, value: string): void {
    try { localStorage.setItem(key, value); } catch { /* La session reste en mémoire. */ }
  }

  private removeStorage(key: string): void {
    try { localStorage.removeItem(key); } catch { /* Rien à supprimer hors mémoire. */ }
  }
}
