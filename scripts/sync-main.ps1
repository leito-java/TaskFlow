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

if (& git status --porcelain) {
  throw "Le dossier contient des changements non commités. La synchronisation est arrêtée pour les protéger."
}

$currentBranch = (& git branch --show-current).Trim()
Write-Host "Branche actuelle : $currentBranch" -ForegroundColor Cyan
Invoke-CheckedCommand git @('fetch', 'origin')
Invoke-CheckedCommand git @('switch', 'main')
Invoke-CheckedCommand git @('pull', '--ff-only', 'origin', 'main')
Write-Host "Dossier local synchronisé sur main." -ForegroundColor Green
