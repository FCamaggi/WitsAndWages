# 🧪 Tests E2E - Wits & Wagers Vegas

Tests end-to-end completos usando Playwright para verificar el flujo completo del juego.

## 📋 Qué se Prueba

### ✅ Flujo Completo de Juego (5 Jugadores)

1. **Creación de Juego**
   - Host crea una nueva partida
   - Se genera código de 6 dígitos
   - Lobby del host se muestra correctamente

2. **Unión de Jugadores**
   - 5 jugadores se unen con sus nombres
   - Cada jugador aparece en el lobby
   - Host visualiza todos los jugadores

3. **Inicio de Juego**
   - Host inicia la partida
   - Pregunta se muestra al host
   - Pregunta se muestra a todos los jugadores

4. **Fase de Respuestas**
   - Los 5 jugadores envían respuestas numéricas
   - Respuestas se registran correctamente

5. **Tablero de Apuestas**
   - Host ordena las respuestas
   - Tablero de apuestas se visualiza correctamente
   - Se consideran los bloqueadores para 5 jugadores

6. **Fase de Apuestas**
   - Cada jugador coloca sus 2 fichas de apuesta
   - Se manejan correctamente los diálogos (ronda 1 sin fichas extra)
   - Confirmación de apuestas funciona

7. **Revelación y Resultados**
   - Host revela la respuesta correcta
   - Se calculan ganadores
   - Se distribuyen bonos y pagos
   - Todos los jugadores ven sus resultados

8. **Siguiente Ronda**
   - Host avanza a la ronda 2
   - Nueva pregunta se muestra
   - Sistema está listo para continuar

## 🚀 Ejecución

### Prerequisitos

```bash
# Instalar dependencias
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..

# Instalar navegadores de Playwright
npx playwright install chromium
```

### Ejecutar Tests

```bash
# Método 1: Usando el script
./test-e2e.sh

# Método 2: Comando directo
npm run test:e2e

# Método 3: Con interfaz visual
npm run test:e2e:ui

# Método 4: Ver el navegador (headed mode)
npm run test:e2e:headed

# Método 5: Modo debug (paso a paso)
npm run test:e2e:debug
```

### Ver Reportes

```bash
# Ver reporte HTML con screenshots
npm run test:report
```

## 📸 Screenshots

Durante la ejecución, se generan screenshots automáticos en `test-results/`:

- `01-home.png` - Página principal
- `02-create-game-modal.png` - Modal de creación
- `03-game-created-lobby.png` - Lobby con código
- `04-player-X-joined.png` - Cada jugador al unirse
- `05-host-lobby-full.png` - Lobby completo
- `06-question-displayed.png` - Pregunta mostrada
- `07-player-X-answered.png` - Jugadores respondiendo
- `08-betting-board-displayed.png` - Tablero de apuestas
- `09-player-X-bet-placed.png` - Apuestas realizadas
- `10-results-displayed.png` - Resultados del host
- `11-player-X-results.png` - Resultados de jugadores
- `12-round-2-question.png` - Segunda ronda

## ⚙️ Configuración

La configuración de Playwright está en `playwright.config.ts`:

- **Workers**: 1 (tests secuenciales para evitar conflictos)
- **Retries**: 2 en CI, 0 en local
- **Timeouts**: Configurados para operaciones lentas
- **Web Server**: Inicia automáticamente backend y frontend
- **Screenshots**: Solo en fallos
- **Videos**: Solo en fallos

## 🐛 Debugging

### Si los tests fallan:

1. **Ver el reporte HTML**:
   ```bash
   npm run test:report
   ```

2. **Ejecutar en modo headed** (ver el navegador):
   ```bash
   npm run test:e2e:headed
   ```

3. **Ejecutar en modo debug** (paso a paso):
   ```bash
   npm run test:e2e:debug
   ```

4. **Verificar que los servidores funcionan**:
   ```bash
   # Terminal 1
   cd server && npm run dev
   
   # Terminal 2
   cd client && npm run dev
   ```

### Problemas Comunes

**Error: "Cannot find module"**
```bash
npm install
npx playwright install
```

**Error: "Port already in use"**
```bash
# Matar procesos en puertos 3000 y 5173
lsof -ti:3000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

**Tests timeout**
- Aumentar timeouts en `playwright.config.ts`
- Verificar velocidad de red
- Verificar recursos del sistema

## 📊 Métricas de Cobertura

El test E2E cubre:

- ✅ Creación de sala (100%)
- ✅ Unión de jugadores (100%)
- ✅ Flujo de pregunta-respuesta (100%)
- ✅ Ordenamiento y tablero (100%)
- ✅ Sistema de apuestas (100%)
- ✅ Cálculo de resultados (100%)
- ✅ Navegación entre rondas (100%)
- ✅ Visualización del host (100%)
- ✅ Visualización de jugadores (100%)

## 🎯 Próximos Tests

Tests adicionales recomendados:

- [ ] Flujo completo de 7 rondas
- [ ] Juego con 7 jugadores (sin bloqueadores)
- [ ] Juego con 6 jugadores (bloqueador en 2:1)
- [ ] Respuestas duplicadas
- [ ] Caso "Todas las respuestas muy altas"
- [ ] Apuestas con fichas de póquer (rondas 2-7)
- [ ] Reconexión de jugadores
- [ ] Múltiples salas simultáneas
- [ ] Categorías excluidas

## 📝 Notas

- Los tests usan 5 jugadores por defecto (configuración en `PLAYER_NAMES`)
- Se simula una ronda completa más el inicio de la segunda
- Los diálogos de fichas de póquer se manejan automáticamente
- Los screenshots ayudan a verificar el estado visual del juego
- Los tests son idempotent (pueden ejecutarse múltiples veces)

---

**¿Problemas?** Revisa [playwright.dev/docs](https://playwright.dev/docs/intro) o abre un issue.
