@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\submit-pr.ps1" %*
exit /b %errorlevel%
