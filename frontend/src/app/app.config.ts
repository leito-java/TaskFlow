import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { authInterceptor } from './auth.interceptor';

/** Configuration globale transmise au démarrage de l'application standalone. */
export const appConfig: ApplicationConfig = {
  providers: [
    // HttpClient réalise les requêtes vers l'API Spring Boot.
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
  ],
};
