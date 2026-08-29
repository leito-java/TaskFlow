param(
  [string]$Title,
  [string]$Objective,
  [string[]]$Changes,
  [string]$RisksOrLimits = 'Aucun risque ou travail reporté identifié automatiquement.',
  [switch]$WaitForMerge,
  [ValidateRange(1, 120)][int]$TimeoutMinutes = 30
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Invoke-CheckedCommand {
  param([string]$Command, [string[]]$Arguments)
  $capturedOutput = @()
  $previousErrorActionPreference = $ErrorActionPreference
  try {
    # Windows PowerShell 5.1 transforme parfois stderr d'un programme natif
    # en NativeCommandError. Seul son code de sortie détermine ici le succès.
    $ErrorActionPreference = 'Continue'
    & $Command @Arguments 2>&1 | Tee-Object -Variable capturedOutput
    $exitCode = $LASTEXITCODE
  } finally {
    $ErrorActionPreference = $previousErrorActionPreference
  }
  if ($exitCode -ne 0) {
    $logDirectory = Join-Path $repositoryRoot '.taskflow\logs'
    New-Item -ItemType Directory -Path $logDirectory -Force | Out-Null
    $logPath = Join-Path $logDirectory 'last-submit-pr-error.log'
    @(
      "Date : $((Get-Date).ToString('o'))"
      "Branche : $branch"
      "Commande : $Command $($Arguments -join ' ')"
      'Sortie :'
      ($capturedOutput | Out-String).TrimEnd()
    ) | Set-Content -LiteralPath $logPath -Encoding utf8
    Write-Host "Diagnostic conservé dans $logPath" -ForegroundColor Yellow
    Write-Host "Après résolution, documente la cause durable dans docs\INCIDENTS.md." -ForegroundColor Yellow
    throw "La commande '$Command $($Arguments -join ' ')' a échoué."
  }
}

function Get-PullRequestBody {
  param(
    [string]$PullRequestTitle,
    [string]$PullRequestObjective,
    [string[]]$PullRequestChanges,
    [string]$PullRequestRisksOrLimits
  )

  if ([string]::IsNullOrWhiteSpace($PullRequestObjective)) {
    $PullRequestObjective = "Intégrer : $PullRequestTitle"
  }

  if ($null -eq $PullRequestChanges -or $PullRequestChanges.Count -eq 0) {
    $PullRequestChanges = @(
      'Voir les commits et les fichiers modifiés dans cette Pull Request.'
    )
  }

  $changeLines = ($PullRequestChanges | ForEach-Object { "- $_" }) -join [Environment]::NewLine

  return @"
## Objectif

$PullRequestObjective

## Changements

$changeLines

## Vérifications automatisées

- [x] ``npm test`` dans ``frontend``
- [x] ``npm run build`` dans ``frontend``
- [x] ``mvn verify`` dans ``backend``

## À vérifier avant la fusion

- [ ] scénario manuel concerné
- [ ] documentation mise à jour si nécessaire
- [ ] aucun secret ni fichier généré ajouté

## Risques ou limites

$PullRequestRisksOrLimits
"@
}

function Find-OpenPullRequestForBranch {
  param([string]$Branch)

  # Contrairement à `gh pr view`, `gh pr list` renvoie simplement [] lorsque
  # la branche n'a pas encore de PR : c'est le cas attendu avant la création.
  $result = & $ghCommand pr list --head $Branch --state open --limit 1 --json number,url,state
  if ($LASTEXITCODE -ne 0) {
    throw "Impossible de rechercher la Pull Request de la branche $Branch."
  }

  $json = ($result | Out-String).Trim()
  if ([string]::IsNullOrWhiteSpace($json) -or $json -eq '[]') {
    return $null
  }

  return @($json | ConvertFrom-Json)[0]
}

$repositoryRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repositoryRoot

$ghCommand = Join-Path $env:ProgramFiles 'GitHub CLI\gh.exe'
if (-not (Test-Path -LiteralPath $ghCommand)) {
  throw "GitHub CLI est requis. Installe-le avec : winget install --id GitHub.cli -e"
}

$branch = (& git branch --show-current).Trim()
if ([string]::IsNullOrWhiteSpace($branch) -or $branch -eq 'main') {
  throw "Crée et utilise une branche dédiée avant de lancer ce script."
}

if (& git status --porcelain) {
  throw "Le dossier contient des changements non commités. Vérifie-les et crée un commit avant de créer la Pull Request."
}

Write-Host "Vérifications frontend..." -ForegroundColor Cyan
Push-Location frontend
try {
  Invoke-CheckedCommand npm @('test')
  Invoke-CheckedCommand npm @('run', 'build')
} finally {
  Pop-Location
}

Write-Host "Vérifications backend..." -ForegroundColor Cyan
Push-Location backend
try {
  Invoke-CheckedCommand mvn @('verify')
} finally {
  Pop-Location
}

Write-Host "Publication de la branche $branch..." -ForegroundColor Cyan
Invoke-CheckedCommand git @('push', '-u', 'origin', $branch)

$pullRequest = Find-OpenPullRequestForBranch -Branch $branch

if ($null -eq $pullRequest) {
  if ([string]::IsNullOrWhiteSpace($Title)) {
    $Title = (& git log -1 --pretty=%s).Trim()
  }

  $description = Get-PullRequestBody `
    -PullRequestTitle $Title `
    -PullRequestObjective $Objective `
    -PullRequestChanges $Changes `
    -PullRequestRisksOrLimits $RisksOrLimits

  $createArguments = @('pr', 'create', '--base', 'main', '--head', $branch, '--title', $Title, '--body', $description)
  $createOutput = & $ghCommand @createArguments
  if ($LASTEXITCODE -ne 0) { throw "La création de la Pull Request a échoué." }

  Start-Sleep -Seconds 2
  $pullRequest = Find-OpenPullRequestForBranch -Branch $branch
  if ($null -eq $pullRequest) {
    throw "GitHub a créé la Pull Request mais elle est introuvable. Vérifie GitHub avant de relancer le script."
  }
}

if ($null -eq $pullRequest.PSObject.Properties['state'] -or $pullRequest.state -ne 'OPEN') {
  throw "La Pull Request #$($pullRequest.number) n'est pas ouverte."
}

Write-Host "Activation du squash auto-merge pour la PR #$($pullRequest.number)..." -ForegroundColor Cyan
Invoke-CheckedCommand $ghCommand @('pr', 'merge', "$($pullRequest.number)", '--auto', '--squash')
Write-Host "PR prête : $($pullRequest.url)" -ForegroundColor Green

if (-not $WaitForMerge) {
  Write-Host "La CI et GitHub termineront la fusion. Lance scripts\sync-main.ps1 après la fusion." -ForegroundColor Yellow
  exit 0
}

$deadline = (Get-Date).AddMinutes($TimeoutMinutes)
do {
  Start-Sleep -Seconds 15
  $state = (& $ghCommand pr view $pullRequest.number --json state | ConvertFrom-Json).state
  if ($state -eq 'CLOSED') {
    throw "La Pull Request a été fermée sans fusion."
  }
} while ($state -ne 'MERGED' -and (Get-Date) -lt $deadline)

if ($state -ne 'MERGED') {
  throw "La fusion n'a pas eu lieu après $TimeoutMinutes minutes. La PR reste en attente de CI ou de règles GitHub."
}

& "$PSScriptRoot\sync-main.ps1"
