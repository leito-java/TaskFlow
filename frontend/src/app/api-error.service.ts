import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

export function unavailableApiMessage(production: boolean): string {
  return production
    ? 'Le service est temporairement indisponible. Veuillez réessayer dans quelques instants.'
    : "Le serveur TaskFlow est indisponible. Démarrez l’application Spring Boot sur le port 8080, puis réessayez.";
}

/** Transforme les erreurs techniques HTTP en explications utiles à l'utilisateur. */
@Injectable({ providedIn: 'root' })
export class ApiErrorService {
  message(error: unknown, fallback = "Une erreur inattendue s'est produite. Réessayez."): string {
    if (!(error instanceof HttpErrorResponse)) return fallback;
    const detail = error.error?.detail;
    if (typeof detail === 'string' && detail.trim()) return detail;
    if ([0, 501, 502, 503, 504].includes(error.status)) return unavailableApiMessage(environment.production);
    switch (error.status) {
      case 400: return 'Les informations envoyées sont invalides. Vérifiez les champs puis réessayez.';
      case 401: return 'Votre adresse e-mail ou votre mot de passe est incorrect.';
      case 403: return "Vous n’avez pas l’autorisation d’effectuer cette action.";
      case 404: return "La ressource demandée n’existe plus ou est introuvable.";
      case 409: return "Cette action entre en conflit avec une donnée existante.";
      case 422: return 'Certaines informations ne respectent pas les règles attendues.';
      default: return error.status >= 500 ? 'Le serveur a rencontré un problème interne. Réessayez dans quelques instants.' : fallback;
    }
  }
}
