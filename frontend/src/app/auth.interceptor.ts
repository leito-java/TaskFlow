import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

/** Ajoute le JWT à notre API et ferme proprement une session rejetée. */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.token;
  if (!token || !request.url.startsWith('/api/')) return next(request);

  return next(request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })).pipe(
    catchError((error: unknown) => {
      const status = (error as { status?: number }).status;

      // Un 401 signifie que le serveur ne reconnaît plus le JWT (expiré ou invalide).
      if (status === 401) {
        auth.logout();
        void router.navigate(['/login'], { queryParams: { reason: 'session-expired' } });
      }

      return throwError(() => error);
    }),
  );
};
