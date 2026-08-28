param(
  [string]$Title,
  [switch]$WaitForMerge,
  [ValidateRange(1, 120)][int]$TimeoutMinutes = 30
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Invoke-CheckedCommand {
  param([string]$Command, [string[]]$Arguments)
  & $Command @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "La commande '$Command $($Arguments -join ' ')' a échoué."
  }
}

$repositoryRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repositoryRoot

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
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

$pullRequest = $null
try {
  $pullRequest = (& gh pr view $branch --json number,url,state | ConvertFrom-Json)
} catch {
  # Aucune Pull Request pour cette branche : elle sera créée ci-dessous.
}

if ($null -eq $pullRequest) {
  $createArguments = @('pr', 'create', '--base', 'main', '--head', $branch, '--fill')
  if (-not [string]::IsNullOrWhiteSpace($Title)) {
    $createArguments += @('--title', $Title)
  }
  $url = (& gh @createArguments).Trim()
  if ($LASTEXITCODE -ne 0) { throw "La création de la Pull Request a échoué." }
  $pullRequest = (& gh pr view $url --json number,url,state | ConvertFrom-Json)
}

if ($pullRequest.state -ne 'OPEN') {
  throw "La Pull Request #$($pullRequest.number) n'est pas ouverte."
}

Write-Host "Activation du squash auto-merge pour la PR #$($pullRequest.number)..." -ForegroundColor Cyan
Invoke-CheckedCommand gh @('pr', 'merge', "$($pullRequest.number)", '--auto', '--squash')
Write-Host "PR prête : $($pullRequest.url)" -ForegroundColor Green

if (-not $WaitForMerge) {
  Write-Host "La CI et GitHub termineront la fusion. Lance scripts\sync-main.ps1 après la fusion." -ForegroundColor Yellow
  exit 0
}

$deadline = (Get-Date).AddMinutes($TimeoutMinutes)
do {
  Start-Sleep -Seconds 15
  $state = (& gh pr view $pullRequest.number --json state | ConvertFrom-Json).state
  if ($state -eq 'CLOSED') {
    throw "La Pull Request a été fermée sans fusion."
  }
} while ($state -ne 'MERGED' -and (Get-Date) -lt $deadline)

if ($state -ne 'MERGED') {
  throw "La fusion n'a pas eu lieu après $TimeoutMinutes minutes. La PR reste en attente de CI ou de règles GitHub."
}

& "$PSScriptRoot\sync-main.ps1"
