#!/bin/bash

# Script de inicio para desarrollo local de Wits & Wagers Vegas

echo "🎰 Iniciando Wits & Wagers Vegas..."
echo ""

# Verificar si existe node_modules
if [ ! -d "node_modules" ]; then
  echo "📦 Instalando dependencias..."
  npm install
  echo ""
fi

# Verificar si existe .env
if [ ! -f ".env" ]; then
  echo "⚠️  Archivo .env no encontrado. Creando desde .env.example..."
  cp .env.example .env
  echo "✅ Archivo .env creado. Por favor configúralo antes de continuar."
  echo ""
  exit 1
fi

# Verificar MongoDB
echo "🔍 Verificando MongoDB..."
if ! command -v mongod &> /dev/null; then
  echo "⚠️  MongoDB no está instalado o no está en el PATH."
  echo "   Opción 1: Instalar MongoDB localmente"
  echo "   Opción 2: Usar MongoDB Atlas (actualiza MONGODB_URI en .env)"
  echo ""
fi

# Preguntar modo de inicio
echo "Selecciona el modo de inicio:"
echo "1) Desarrollo completo (backend + frontend)"
echo "2) Solo backend"
echo "3) Solo frontend"
echo "4) Build para producción"
read -p "Opción (1-4): " option

case $option in
  1)
    echo ""
    echo "🚀 Iniciando en modo desarrollo completo..."
    echo "   Backend: http://localhost:3000"
    echo "   Frontend: http://localhost:5173"
    echo ""
    npm run dev
    ;;
  2)
    echo ""
    echo "🔧 Iniciando solo backend..."
    echo "   Backend: http://localhost:3000"
    echo ""
    npm run dev:server
    ;;
  3)
    echo ""
    echo "🎨 Iniciando solo frontend..."
    echo "   Frontend: http://localhost:5173"
    echo ""
    npm run dev:client
    ;;
  4)
    echo ""
    echo "📦 Construyendo para producción..."
    npm run build
    echo "✅ Build completado en ./dist"
    echo ""
    echo "Para previsualizar: npm run preview"
    ;;
  *)
    echo "❌ Opción inválida"
    exit 1
    ;;
esac
