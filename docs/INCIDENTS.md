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

## 2026-08-29 — Un avertissement Node interrompt le script de Pull Request

### Symptôme

Les tests Angular réussissaient, mais `submit-pr.ps1` s'arrêtait sur un bloc `node.exe : stderr` signalé comme `NativeCommandError`.

### Cause

Windows PowerShell 5.1 convertit parfois la sortie d'erreur d'un programme natif en erreur PowerShell. Avec `$ErrorActionPreference = 'Stop'`, un simple avertissement interrompait le script avant la vérification du véritable code de sortie du programme.

### Correction

`Invoke-CheckedCommand` autorise temporairement les messages natifs sur `stderr`, restaure ensuite la politique stricte et considère la commande comme échouée uniquement lorsque `$LASTEXITCODE` est différent de zéro.

### Règle préventive

Pour les outils natifs (`npm`, Maven, Git et GitHub CLI), décider du succès avec leur code de sortie. Conserver leur sortie pour le diagnostic sans assimiler automatiquement chaque message `stderr` à un échec.

## 2026-08-30 — Playwright attend silencieusement les serveurs locaux

### Symptôme

Les tests Angular et le build réussissaient rapidement, puis `npm run test:e2e` restait sans message avant même d'afficher le lancement du scénario.

### Cause

Angular écoutait sur `localhost` via IPv6 (`::1`) alors que Playwright vérifiait `127.0.0.1` via IPv4. De plus, le parcours E2E local dépendait de plusieurs services et ralentissait systématiquement la création de la Pull Request.

### Correction

- utiliser `localhost` de manière cohérente dans la configuration Playwright ;
- rendre le parcours local optionnel avec `-RunE2E` ;
- conserver le parcours E2E obligatoire dans le contrôle CI Angular avant fusion.

### Règle préventive

Les vérifications rapides doivent rester séparées des tests multi-services. Les tests E2E sont lancés localement à la demande et systématiquement dans une CI reproductible avec sa propre base de données.

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
# 2026-08-31 — paramètre `WaitForMerge` transmis deux fois

## Symptôme

`submit-pr.cmd ... -WaitForMerge` échouait avec `ParameterAlreadyBound`.

## Cause

Le lanceur CMD ajoutait automatiquement `-WaitForMerge` tout en retransmettant les arguments saisis par l’utilisateur. PowerShell recevait donc deux fois le même paramètre.

## Correction durable

Le lanceur transmet désormais uniquement les arguments reçus. Le comportement d’attente est choisi explicitement avec `-WaitForMerge`, ce qui rend également possible une création de PR sans attente.
