import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';

/** Configuration globale transmise au démarrage de l'application standalone. */
export const appConfig: ApplicationConfig = {
  providers: [
    // HttpClient réalise les requêtes vers l'API Spring Boot.
    provideHttpClient(),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
  ],
};
