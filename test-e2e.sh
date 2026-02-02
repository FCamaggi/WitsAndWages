#!/bin/bash
# Script para ejecutar tests E2E de Wits & Wagers Vegas

echo "🎰 Wits & Wagers Vegas - Test E2E"
echo "=================================="
echo ""

# Verificar que node_modules existe
if [ ! -d "node_modules" ]; then
  echo "📦 Instalando dependencias raíz..."
  npm install
fi

# Verificar dependencias del servidor
if [ ! -d "server/node_modules" ]; then
  echo "📦 Instalando dependencias del servidor..."
  cd server && npm install && cd ..
fi

# Verificar dependencias del cliente
if [ ! -d "client/node_modules" ]; then
  echo "📦 Instalando dependencias del cliente..."
  cd client && npm install && cd ..
fi

# Instalar Playwright browsers si es necesario
echo "🎭 Verificando navegadores de Playwright..."
npx playwright install chromium

echo ""
echo "🧪 Ejecutando tests E2E..."
echo ""

# Ejecutar tests
npx playwright test

# Verificar resultado
if [ $? -eq 0 ]; then
  echo ""
  echo "✅ ¡Tests completados exitosamente!"
  echo ""
  echo "📊 Para ver el reporte HTML:"
  echo "   npx playwright show-report"
else
  echo ""
  echo "❌ Tests fallaron. Verifica los logs arriba."
  echo ""
  echo "📊 Para ver el reporte HTML:"
  echo "   npx playwright show-report"
  exit 1
fi
