# Gestion des erreurs utilisateur

Le frontend ne doit pas exposer un code HTTP seul. `ApiErrorService` centralise la traduction des erreurs techniques en messages compréhensibles et actionnables.

| Situation | Message attendu |
|---|---|
| API inaccessible (`0`, `501` à `504`) en développement | Le serveur TaskFlow est indisponible ; démarrer Spring Boot sur le port 8080. |
| API inaccessible (`0`, `501` à `504`) en production | Le service est temporairement indisponible ; réessayer dans quelques instants. |
| `400` | Vérifier les informations saisies. |
| `401` | Identifiants incorrects, ou session expirée lorsqu'elle était déjà ouverte. |
| `403` | Action non autorisée. |
| `404` | Ressource inexistante ou supprimée. |
| `409` | Conflit avec une donnée existante. |
| `422` | Données contraires aux règles métier. |
| autre erreur `5xx` | Problème interne du serveur, réessayer plus tard. |

Lorsque le backend fournit un champ JSON `detail`, ce message métier est prioritaire. Les composants peuvent fournir un message de repli lié à leur contexte, mais ne doivent pas recréer leur propre tableau de correspondance HTTP.

Le remplacement de `environment.ts` par `environment.production.ts` est effectué automatiquement par `ng build`. Aucun nom de technologie, port local, trace ou détail d'infrastructure ne doit être présenté au client final.

`npm test` utilise explicitement `taskflow:build:development` afin de tester les diagnostics destinés aux développeurs. La CI exécute ensuite `npm run build` séparément pour vérifier le remplacement de production.
