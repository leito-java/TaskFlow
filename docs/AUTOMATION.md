# Automatiser le workflow de Pull Request

> Les erreurs réutilisables et leurs mesures préventives sont consignées dans [INCIDENTS.md](INCIDENTS.md).

Les scripts PowerShell automatisent le workflow après le commit : vérifications, push, création de Pull Request, activation d'Auto-merge et synchronisation locale.

## Prérequis

Installez GitHub CLI une seule fois depuis un terminal Windows :

```powershell
winget install --id GitHub.cli -e
gh auth login
```

Dans GitHub, activez **Allow auto-merge** dans **Settings → General → Pull Requests**. La branche `main` doit exiger la CI avant fusion.

## Utilisation

Après avoir vérifié et créé un commit sur une branche dédiée :

Depuis une invite de commandes Windows ouverte à la racine de TaskFlow, la commande courte suffit :

```cmd
submit-pr
```

Elle utilise automatiquement le titre du dernier commit, attend la CI et synchronise `main` après la fusion.

Pour personnaliser précisément la description de la Pull Request, utilisez la version PowerShell complète :

```powershell
.\scripts\submit-pr.ps1 `
  -Title "feat: ajouter l'exemple" `
  -Objective "Permettre aux utilisateurs de faire l'action X." `
  -Changes "Ajouter le composant X", "Ajouter ses tests" `
  -RisksOrLimits "Aucun risque identifié." `
  -WaitForMerge
```

Le script exécute rapidement `npm test`, `npm run build` et `mvn verify`, puis active le **Squash auto-merge**. Le parcours Playwright reste obligatoire dans la CI GitHub, qui dispose de sa propre base PostgreSQL. Cette séparation évite de bloquer la création de PR lorsqu'un serveur local est déjà occupé ou mal configuré.

Pour lancer volontairement le parcours complet aussi en local, ajoutez `-RunE2E`. Le backend et PostgreSQL doivent alors être disponibles ; Playwright réutilise les serveurs locaux existants.

Avec `-WaitForMerge`, le script attend au plus 30 minutes la fusion avant de basculer sur `main` et de lancer `git pull --ff-only`.

Il génère aussi une description de PR homogène : objectif, changements, vérifications automatisées réellement réussies, checklist manuelle et risques. `-Title`, `-Objective`, `-Changes` et `-RisksOrLimits` sont personnalisables. Sans titre, le script reprend le titre du dernier commit ; sans changements, il indique de consulter le diff de la PR.

Sans `-WaitForMerge`, lancez ensuite manuellement :

```powershell
.\scripts\sync-main.ps1
```

## Protections

Les scripts s'arrêtent si la branche actuelle est `main` ou si des fichiers ne sont pas commités. Ils n'exécutent jamais `git add` ni `git commit` automatiquement.

Lorsqu'une commande échoue, `submit-pr.ps1` conserve son diagnostic dans `.taskflow/logs/last-submit-pr-error.log`. Ce fichier local est ignoré par Git. Après analyse, les enseignements durables doivent être ajoutés à `docs/INCIDENTS.md`.
