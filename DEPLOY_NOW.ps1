# Script de Despliegue Final - Activa SL Digital
# Ejecutar cuando Google Cloud haya propagado el Plan Blaze (aprox. 30 min)

Write-Host ">>> Iniciando Protocolo de Despliegue Final..." -ForegroundColor Cyan

# 1. Navegar a la raíz
$rootPath = "C:\Users\Usuario\.gemini\antigravity\scratch\monorepo-activa-sl"
Set-Location $rootPath

# 2. Habilitar API via CLI (Evitar error de navegador)
Write-Host ">>> Intentando habilitar API de Secretos via Terminal..." -ForegroundColor Magenta
Write-Host ">>> Autenticando con Google Cloud..." -ForegroundColor Yellow
cmd /c "gcloud auth login --brief"
cmd /c "gcloud services enable secretmanager.googleapis.com --project=activa-sl-digital"

# 3. Verificar Login Firebase
Write-Host ">>> Verificando credenciales Firebase..."
firebase login --reauth

# 4. Desplegar
Write-Host ">>> Desplegando Cerebro IA (Cloud Functions)..." -ForegroundColor Yellow
firebase deploy --only functions --force

if ($LASTEXITCODE -eq 0) {
    Write-Host ">>> EXITO: Sistema Operativo." -ForegroundColor Green
}
else {
    Write-Host ">>> ERROR: Revisa los mensajes anteriores." -ForegroundColor Red
}

Pause
