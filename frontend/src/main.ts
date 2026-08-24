// Importe la fonction qui démarre une application Angular standalone.
import { bootstrapApplication } from '@angular/platform-browser';
// Importe le composant racine affiché au lancement de l'application.
import { AppComponent } from './app/app.component';
// Configuration qui enregistre les routes et les services globaux.
import { appConfig } from './app/app.config';

// Démarre Angular avec le composant racine et la configuration du routeur.
bootstrapApplication(AppComponent, appConfig).catch((error: unknown) => console.error(error));
