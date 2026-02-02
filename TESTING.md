# 🧪 Testing E2E - Wits & Wagers Vegas

## Estado Actual

He creado un suite completo de tests End-to-End usando Playwright que prueba todo el flujo de juego con 5 jugadores.

## 📦 Archivos Creados

1. **`playwright.config.ts`** - Configuración de Playwright
   - Timeout de 3 minutos por test
   - Inicia automáticamente servidor y cliente
   - Screenshots y videos en fallos

2. **`e2e/wits-vegas-e2e.spec.ts`** - Test principal
   - Flujo completo de 5 jugadores
   - Verificación de host y jugadores
   - Una ronda completa + inicio de ronda 2

3. **`e2e/README.md`** - Documentación detallada

4. **`test-e2e.sh`** - Script de ejecución fácil

5. **`package.json`** - Scripts npm actualizados

## 🎯 Lo Que Se Prueba

### ✅ Fase 1: Creación de Juego
- Host crea partida
- Se genera código de 6 dígitos
- Lobby se muestra correctamente

### ✅ Fase 2: Unión de Jugadores
- 5 jugadores se unen (Ana, Beto, Cami, Dani, Eli)
- Cada jugador completa formulario
- Host visualiza todos los jugadores

### ✅ Fase 3: Inicio de Juego
- Host inicia la partida
- Pregunta se muestra a todos

### ✅ Fase 4: Respuestas
- Los 5 jugadores responden (2000, 2100, 2200, 2300, 2400)
- Respuestas se registran

### ✅ Fase 5: Tablero de Apuestas
- Host ordena respuestas
- Tablero se visualiza
- Bloqueadores para 5 jugadores aplicados

### ✅ Fase 6: Apuestas
- Cada jugador coloca 2 fichas
- Confirmación funciona

### ✅ Fase 7: Resultados
- Host revela respuesta
- Cálculo de ganadores
- Todos ven resultados

### ✅ Fase 8: Siguiente Ronda
- Host avanza a ronda 2
- Nueva pregunta se muestra

## 🚀 Cómo Ejecutar

### Preparación (solo primera vez)

```bash
# Instalar dependencias
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..

# Instalar navegador de Playwright
npx playwright install chromium
```

### Ejecutar Tests

```bash
# Opción 1: Con script (recomendado)
./test-e2e.sh

# Opción 2: Comando directo
npm run test:e2e

# Opción 3: Ver el navegador (modo headed)
npm run test:e2e:headed

# Opción 4: Modo UI interactivo
npm run test:e2e:ui

# Opción 5: Modo debug (paso a paso)
npm run test:e2e:debug
```

### Ver Reportes

```bash
# Abrir reporte HTML con screenshots
npm run test:report
```

## 📸 Screenshots Generados

Durante cada ejecución se generan screenshots automáticos en `test-results/`:

- `01-home.png` - Página principal
- `02-host-view.png` - Vista del host
- `03-game-created-lobby.png` - Lobby con código
- `04-player-1-joined.png` a `04-player-5-joined.png` - Cada jugador
- `05-host-lobby-full.png` - Lobby completo
- `06-question-displayed.png` - Pregunta
- `07-player-X-answered.png` - Respuestas
- `08-betting-board-displayed.png` - Tablero
- `09-player-X-bet-placed.png` - Apuestas
- `10-results-displayed.png` - Resultados del host
- `11-player-X-results.png` - Resultados de jugadores
- `12-round-2-question.png` - Segunda ronda

## ⚙️ Configuración

### Timeouts
- **Test completo**: 3 minutos
- **Acciones individuales**: 30 segundos
- **Web servers**: 2 minutos para iniciar

### Puertos
- **Backend**: http://localhost:3000
- **Frontend**: http://localhost:5173

## 🐛 Troubleshooting

### Si el test falla:

1. **Ver el reporte HTML** (tiene screenshots del momento del fallo):
   ```bash
   npm run test:report
   ```

2. **Ejecutar con navegador visible**:
   ```bash
   npm run test:e2e:headed
   ```

3. **Verificar que MongoDB Atlas está configurado**:
   - Archivo `.env` debe existir
   - `MONGODB_URI` debe estar configurado

4. **Verificar que los puertos están libres**:
   ```bash
   lsof -ti:3000 -ti:5173 | xargs kill -9
   ```

5. **Logs del servidor**:
   Los logs aparecen en la salida del test con prefijo `[WebServer]`

## 📊 Métricas

- **Tiempo estimado**: 60-90 segundos por ejecución completa
- **Navegadores abiertos simultáneamente**: 6 (1 host + 5 jugadores)
- **Screenshots por ejecución**: 12+
- **Fases probadas**: 8

## 🎯 Próximos Pasos Recomendados

### Tests Adicionales Sugeridos

1. **Test de 7 rondas completas**
   - Verificar el flujo completo del juego
   - Probar con fichas de póquer (rondas 2-7)
   - Verificar ranking final

2. **Test con 7 jugadores** (sin bloqueadores)
3. **Test con 6 jugadores** (bloqueador en 2:1)
4. **Test de respuestas duplicadas**
5. **Test de "Todas las respuestas muy altas"**
6. **Test de reconexión**
7. **Test de múltiples salas simultáneas**

### Mejoras de Código

1. **Advertencias de MongoDB**:
   - Remover índice duplicado en `gameCode`
   - Eliminar opciones deprecated (`useNewUrlParser`, `useUnifiedTopology`)

2. **Refactoring**:
   - Extraer helpers comunes
   - Page Objects para mejor organización
   - Fixtures personalizados

## 📝 Notas Importantes

- Los tests inician automáticamente los servidores (backend + frontend)
- Se ejecutan en orden secuencial (no paralelo) para evitar conflictos
- Los selectores están ajustados a la implementación React actual
- Los screenshots solo se toman en fallos (configurable)
- Los videos solo se guardan en fallos

## ✅ Estado del Test

**Actualmente**: El test está funcional y cubre el flujo básico, pero puede requerir ajustes menores dependiendo del comportamiento específico del socket y la velocidad de la conexión.

**Recomendación**: Ejecutar en modo `headed` primero para ver el flujo completo visualmente y hacer ajustes si es necesario.

---

Para cualquier problema o pregunta, consulta:
- `e2e/README.md` - Documentación detallada
- [Playwright Docs](https://playwright.dev/docs/intro)
