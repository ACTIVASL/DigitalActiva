#!/bin/bash
set -e

echo "🔵 [1/4] Actualizando Código en la Nube..."
cd ~/monorepo-activa-sl
git pull origin main

echo "🔵 [2/4] Instalando dependencias M2M en OpenClaw..."
pnpm install

echo "🔵 [3/4] Compilando y Desplegando Backend (Funciones Eventarc)..."
cd apps/functions
pnpm run build
npx firebase-tools deploy --only functions --force --non-interactive

echo "🔵 [4/4] Compilando y Desplegando Frontend (Generative UI Vite)..."
cd ../crm-client
pnpm run build
npx firebase-tools deploy --only hosting --force --non-interactive

echo "✅ DEPLOY ABSOLUTO COMPLETADO. M2M GENERATIVE UI ONLINE EN GCP."
