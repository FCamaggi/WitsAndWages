#!/bin/bash
# Script para ejecutar test de partida completa

echo "🎰 Wits & Wagers Vegas - Test de Partida Completa"
echo "=================================================="
echo ""
echo "Selecciona el test a ejecutar:"
echo ""
echo "1) Partida completa (7 rondas, 5 jugadores) ~8-10 min"
echo "2) Partida rápida (3 rondas, 3 jugadores) ~3-4 min"
echo "3) Test básico (1 ronda, 5 jugadores) ~1-2 min"
echo "4) Todos los tests"
echo "5) Ver reporte del último test"
echo ""
read -p "Opción (1-5): " option

case $option in
  1)
    echo ""
    echo "🎮 Ejecutando partida completa..."
    echo "   • 5 jugadores"
    echo "   • 7 rondas"
    echo "   • Tiempo estimado: 8-10 minutos"
    echo ""
    npm run test:full:headed
    ;;
  2)
    echo ""
    echo "⚡ Ejecutando partida rápida..."
    echo "   • 3 jugadores"
    echo "   • 3 rondas"
    echo "   • Tiempo estimado: 3-4 minutos"
    echo ""
    npm run test:quick
    ;;
  3)
    echo ""
    echo "🚀 Ejecutando test básico..."
    echo "   • 5 jugadores"
    echo "   • 1 ronda completa"
    echo "   • Tiempo estimado: 1-2 minutos"
    echo ""
    npm run test:e2e
    ;;
  4)
    echo ""
    echo "🧪 Ejecutando todos los tests..."
    echo "   • Tiempo estimado: 12-15 minutos"
    echo ""
    npm run test:all
    ;;
  5)
    echo ""
    echo "📊 Abriendo reporte..."
    npm run test:report
    ;;
  *)
    echo "❌ Opción inválida"
    exit 1
    ;;
esac

if [ $? -eq 0 ] && [ "$option" != "5" ]; then
  echo ""
  echo "✅ Test completado!"
  echo ""
  echo "📊 Para ver el reporte con screenshots:"
  echo "   npm run test:report"
  echo ""
fi
