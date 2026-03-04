#!/bin/bash
set -e

if [ -z "$FIREBASE_TOKEN" ]; then
  echo "Error: FIREBASE_TOKEN (CI Token) is not set."
  exit 1
fi

echo "🔵 [1/4] Actualizando Código en la Nube..."
cd ~/monorepo-activa-sl
git config --global pull.rebase false
git pull origin main

echo "🔵 [2/4] Instalando dependencias M2M en OpenClaw..."
pnpm install

echo "🔵 [3/4] Compilando y Desplegando Backend (Funciones Eventarc)..."
cd apps/functions
pnpm run build
npx firebase-tools deploy --only functions --force --non-interactive --token "$FIREBASE_TOKEN"

echo "🔵 [4/4] Compilando y Desplegando Frontend (Generative UI Vite)..."
cd ../crm-client
pnpm run build
npx firebase-tools deploy --only hosting --force --non-interactive --token "$FIREBASE_TOKEN"

echo "✅ DEPLOY ABSOLUTO COMPLETADO. M2M GENERATIVE UI ONLINE EN GCP."
