# 🎮 PRUEBA TU JUEGO COMPLETO

## ✨ Inicio Rápido

```bash
# Ejecutar script interactivo
./run-test.sh
```

Luego selecciona:
- **Opción 1**: Partida completa (7 rondas) - Prueba TODO el juego
- **Opción 2**: Partida rápida (3 rondas) - Verificación rápida
- **Opción 3**: Test básico (1 ronda) - Debug

## 🎯 ¿Qué Hace Cada Test?

### 1️⃣ Partida Completa (RECOMENDADO para producción)
```bash
npm run test:full
```
- ✅ 5 jugadores (Ana, Beto, Cami, Dani, Eli)
- ✅ 7 rondas completas
- ✅ Apuestas con fichas de póquer (rondas 2-7)
- ✅ Ranking final
- ⏱️ Duración: 8-10 minutos

**Úsalo antes de deploy a producción**

### 2️⃣ Partida Rápida (para desarrollo)
```bash
npm run test:quick
```
- ⚡ 3 jugadores
- ⚡ 3 rondas
- ⏱️ Duración: 3-4 minutos

**Úsalo para verificar cambios rápido**

### 3️⃣ Test Básico (para debug)
```bash
npm run test:e2e
```
- 🔍 5 jugadores
- 🔍 1 ronda + inicio de ronda 2
- ⏱️ Duración: 1-2 minutos

**Úsalo para debugear una fase específica**

## 📊 Ver Resultados

```bash
# Ver reporte HTML con screenshots
npm run test:report
```

## 🎥 Ver el Test en Acción

```bash
# Ver navegadores mientras el test corre
npm run test:full:headed
```

## ✅ ¿Cuándo Está Listo para Producción?

Tu juego está listo cuando:
- ✅ El test completo (7 rondas) pasa sin errores
- ✅ Los 5 jugadores se unen correctamente
- ✅ Todas las fases funcionan (responder, apostar, resultados)
- ✅ El ranking final se genera
- ✅ No hay errores en la consola

## 🐛 Si Algo Falla

1. **Ver screenshots**: `npm run test:report`
2. **Ver navegadores**: `npm run test:full:headed`
3. **Verificar MongoDB**: Revisar `.env`
4. **Revisar logs**: Buscar mensajes `⚠️` en la salida

## 📁 Archivos Generados

Después del test encontrarás en `test-results/`:
- Screenshots de cada fase
- Videos (si hubo fallo)
- Reporte HTML completo

## 🚀 Comando Todo-en-Uno

```bash
# Instalar, configurar y ejecutar
npx playwright install chromium && npm run test:quick
```

---

**¿Listo?** Ejecuta: `./run-test.sh`
