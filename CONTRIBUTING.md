# Contribuer à TaskFlow

## Workflow obligatoire

1. mettre `main` à jour ;
2. créer une branche dédiée ;
3. réaliser une seule intention cohérente ;
4. exécuter les vérifications locales ;
5. créer un commit Conventional Commits ;
6. pousser la branche et ouvrir une Pull Request ;
7. fusionner par squash uniquement lorsque la CI est verte.

Pour automatiser les étapes après le commit, consultez [la procédure d'automatisation](docs/AUTOMATION.md).

```powershell
git switch main
git pull --ff-only origin main
git switch -c feat/nom-court
```

Préfixes de branche autorisés : `feat/`, `fix/`, `docs/`, `test/`, `refactor/`, `chore/`, `ci/`, `build/`, `perf/` et `style/`.

Exemples de commits :

```text
feat: ajouter la recherche de tâches
fix: conserver le filtre après modification
docs: expliquer le démarrage PostgreSQL
test: couvrir la création d'une tâche
```

## Vérifications locales

```powershell
cd frontend
npm ci
npm test
npm run build
npm run test:e2e

cd ..\backend
mvn verify
```

## Definition of Done

- [ ] le besoin et les critères d'acceptation sont clairs ;
- [ ] le frontend compile et ses tests réussissent ;
- [ ] le parcours end-to-end critique réussit ;
- [ ] le backend compile et ses tests réussissent ;
- [ ] le contrat HTTP reste cohérent ;
- [ ] les erreurs et validations utiles sont couvertes ;
- [ ] la documentation est à jour ;
- [ ] aucun secret ni fichier généré n'est ajouté ;
- [ ] la CI de la Pull Request est verte ;
- [ ] le changement est fusionné par squash.
