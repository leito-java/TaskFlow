# Frontend TaskFlow

Application Angular 22 du produit TaskFlow.

## Démarrer

L'API doit répondre sur `http://localhost:8080`.

```powershell
npm ci
npm start
```

Le proxy de développement transfère `/api` vers Spring Boot.

## Vérifier

```powershell
npm test
npm run build
```

## Responsabilités

- `pages/` compose les écrans liés au routeur ;
- `task-form/`, `task-list/`, `task-item/` et `task-filter/` fournissent les composants réutilisables ;
- `TaskStore` centralise l'état d'interface ;
- `TaskApiService` est la seule classe qui connaît les endpoints ;
- `task.model.ts` décrit le contrat TypeScript.
