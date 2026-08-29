# Incidents et enseignements techniques

Ce journal conserve les erreurs qui ont révélé une faiblesse durable du projet. Une erreur ponctuelle n'est ajoutée ici que si sa résolution peut prévenir une récidive.

Le script `scripts/submit-pr.ps1` conserve également le dernier échec local dans `.taskflow/logs/last-submit-pr-error.log`. Ce fichier peut contenir des chemins locaux : il est ignoré par Git et ne doit pas être publié.

## 2026-08-29 — CI PostgreSQL rouge après une nouvelle migration Flyway

### Symptôme

Les tests Angular et les tests Java locaux réussissaient, mais le job GitHub **Tests et build Spring Boot** échouait.

### Cause

`PostgresMigrationIntegrationTest` attendait exactement quatre migrations réussies. L'ajout de `V5__add_daily_priorities.sql` rendait cette assertion obsolète. Le test PostgreSQL était ignoré localement lorsque `POSTGRES_TEST_URL` était absent, donc seul GitHub Actions révélait l'erreur.

### Correction

- vérifier explicitement que la migration `V5` a réussi ;
- vérifier que la table `daily_priorities` existe ;
- accepter les migrations futures avec `isGreaterThanOrEqualTo(5)` au lieu de figer leur nombre exact.

### Règle préventive

Un test de migration doit contrôler le contrat introduit par une migration précise, pas supposer que le nombre total de migrations restera constant.

## Modèle pour un prochain incident

```text
## AAAA-MM-JJ — Titre

### Symptôme
Ce qui a été observé.

### Cause
La cause racine, et pourquoi les contrôles existants ne l'ont pas détectée.

### Correction
La modification appliquée.

### Règle préventive
Le contrôle, le test ou la convention ajouté pour empêcher la récidive.
```
