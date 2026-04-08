#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="/home/asistentes/ProDus/ProDus_Registro_de_Horas_Frontend"
APP_DIR="$REPO_DIR/frontend"
WEB_ROOT="/var/www/produs"

echo "[FRONT] usar código local actual (sin git pull)..."

echo "[FRONT] npm install + build..."
cd "$APP_DIR"
npm install
npm run build

echo "[FRONT] publicar dist..."
sudo mkdir -p "$WEB_ROOT"
sudo rsync -a --delete "$APP_DIR/dist/" "$WEB_ROOT/"

echo "[FRONT] validar y reiniciar nginx..."
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl status nginx --no-pager
