@echo off
REM Script de inicio para Windows

echo 🎰 Iniciando Wits ^& Wagers Vegas...
echo.

REM Verificar node_modules
if not exist "node_modules" (
  echo 📦 Instalando dependencias...
  call npm install
  echo.
)

REM Verificar .env
if not exist ".env" (
  echo ⚠️  Archivo .env no encontrado. Creando desde .env.example...
  copy .env.example .env
  echo ✅ Archivo .env creado. Por favor configúralo antes de continuar.
  echo.
  pause
  exit /b 1
)

REM Menú de opciones
echo Selecciona el modo de inicio:
echo 1) Desarrollo completo (backend + frontend^)
echo 2) Solo backend
echo 3) Solo frontend
echo 4) Build para producción
set /p option="Opción (1-4): "

if "%option%"=="1" (
  echo.
  echo 🚀 Iniciando en modo desarrollo completo...
  echo    Backend: http://localhost:3000
  echo    Frontend: http://localhost:5173
  echo.
  call npm run dev
) else if "%option%"=="2" (
  echo.
  echo 🔧 Iniciando solo backend...
  echo    Backend: http://localhost:3000
  echo.
  call npm run dev:server
) else if "%option%"=="3" (
  echo.
  echo 🎨 Iniciando solo frontend...
  echo    Frontend: http://localhost:5173
  echo.
  call npm run dev:client
) else if "%option%"=="4" (
  echo.
  echo 📦 Construyendo para producción...
  call npm run build
  echo ✅ Build completado en ./dist
  echo.
  echo Para previsualizar: npm run preview
) else (
  echo ❌ Opción inválida
  pause
  exit /b 1
)
