# Backend TaskFlow

API REST Spring Boot 4.1 exécutée avec Java 21.

## Démarrer

Lancez PostgreSQL depuis la racine du dépôt, puis :

```powershell
mvn spring-boot:run
```

Variables acceptées :

```text
DB_URL
DB_USERNAME
DB_PASSWORD
```

Sans variables, le profil `dev` utilise `jdbc:postgresql://localhost:5432/taskflow` avec les identifiants locaux documentés dans `.env.example`.

## Vérifier

```powershell
mvn verify
```

- le profil `test` utilise H2 pour les tests rapides ;
- la CI fournit PostgreSQL et exécute aussi le test des migrations Flyway ;
- Hibernate valide le schéma sans le modifier.

## Endpoints

| Méthode | URL | Usage |
|---|---|---|
| `GET` | `/api/tasks` | lister les tâches |
| `GET` | `/api/tasks/{id}` | lire une tâche |
| `POST` | `/api/tasks` | créer une tâche |
| `PUT` | `/api/tasks/{id}` | modifier une tâche |
| `DELETE` | `/api/tasks/{id}` | supprimer une tâche |

Swagger UI est disponible sur `http://localhost:8080/swagger-ui.html`.
