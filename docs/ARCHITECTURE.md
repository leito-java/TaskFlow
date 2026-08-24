# Architecture de TaskFlow

## Principes

- le frontend dépend du contrat HTTP, jamais des classes Java ou de la base ;
- le backend porte la validation métier et l'accès aux données ;
- Flyway est le seul outil autorisé à modifier le schéma ;
- Hibernate valide le schéma avec `ddl-auto: validate` ;
- les secrets et adresses d'environnement restent hors du code ;
- chaque couche est testable séparément avant le scénario full-stack.

## Frontend

| Élément | Responsabilité |
|---|---|
| composants page | navigation et composition de l'écran |
| composants réutilisables | formulaire, carte, liste et filtres |
| `TaskStore` | état partagé et orchestration des actions |
| `TaskApiService` | contrat et appels HTTP |
| `task.model.ts` | types publics du frontend |

## Backend

| Élément | Responsabilité |
|---|---|
| contrôleur REST | traduire HTTP vers les cas d'usage |
| service | appliquer les règles métier |
| repository | lire et écrire les entités |
| entités et DTO | séparer persistance et contrat HTTP |
| Flyway | versionner le schéma PostgreSQL |

## Trajet d'une création

```text
TaskFormComponent
  → TaskDraft
  → TaskStore
  → TaskApiService
  → POST /api/tasks
  → TaskController
  → TaskService
  → TaskRepository
  → PostgreSQL
  → réponse JSON
  → mise à jour du signal Angular
```

## Ports locaux

| Service | Port par défaut |
|---|---|
| Angular | `4200` |
| Spring Boot | `8080` |
| PostgreSQL | `5432` |

Le port PostgreSQL peut changer sans modifier Angular. Seule la variable `DB_URL` du backend doit viser la bonne instance.

## Tests

- Vitest et Angular TestBed couvrent les composants, le routeur, le store et HTTP ;
- JUnit couvre le service métier et l'API ;
- H2 garde les tests backend locaux rapides ;
- PostgreSQL dans la CI contrôle les migrations Flyway réelles ;
- un scénario CRUD manuel valide la chaîne complète avant une version.
