# Automatiser le workflow de Pull Request

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

```powershell
.\scripts\submit-pr.ps1 `
  -Title "feat: ajouter l'exemple" `
  -Objective "Permettre aux utilisateurs de faire l'action X." `
  -Changes "Ajouter le composant X", "Ajouter ses tests" `
  -RisksOrLimits "Aucun risque identifié." `
  -WaitForMerge
```

Le script exécute `npm test`, `npm run build` et `mvn verify`, puis active le **Squash auto-merge**. Avec `-WaitForMerge`, il attend au plus 30 minutes la fusion avant de basculer sur `main` et de lancer `git pull --ff-only`.

Il génère aussi une description de PR homogène : objectif, changements, vérifications automatisées réellement réussies, checklist manuelle et risques. `-Title`, `-Objective`, `-Changes` et `-RisksOrLimits` sont personnalisables. Sans titre, le script reprend le titre du dernier commit ; sans changements, il indique de consulter le diff de la PR.

Sans `-WaitForMerge`, lancez ensuite manuellement :

```powershell
.\scripts\sync-main.ps1
```

## Protections

Les scripts s'arrêtent si la branche actuelle est `main` ou si des fichiers ne sont pas commités. Ils n'exécutent jamais `git add` ni `git commit` automatiquement.
