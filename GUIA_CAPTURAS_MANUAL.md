# 🎮 Guía para Capturar el Flujo Completo del Jugador

## 🎯 Objetivo
Capturar screenshots de **todas las etapas** del juego desde la perspectiva del jugador.

---

## 🚀 Preparación

### 1. Iniciar Servidores
```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
npm run dev:client
```

### 2. Abrir Ventanas
Necesitas **6 ventanas de navegador**:
- 1 ventana para HOST (pantalla completa en desktop)
- 5 ventanas para JUGADORES (modo responsive 390x844 - iPhone 12 Pro)

**Tip**: Usa Chrome DevTools (F12) → Device Toolbar (Ctrl+Shift+M) → Selecciona "iPhone 12 Pro"

---

## 📸 Capturas a Tomar

### FASE 1: INICIO Y CONEXIÓN

#### 1️⃣ Home Screen
**Página**: Jugador
**URL**: `http://localhost:5173`
**Acción**: Ninguna, solo captura
**Nombre archivo**: `01-home-screen.png`
**Muestra**: 
- Logo "Wits & Wagers Vegas"
- Efectos de neón
- Botones "Crear Partida" y "Unirse"

---

#### 2️⃣ Formulario de Entrada (Vacío)
**Página**: Jugador
**Acción**: Click en "Unirse a Partida"
**Nombre archivo**: `02-join-form-empty.png`
**Muestra**: 
- Input código (vacío)
- Input nombre (vacío)
- Selector de 8 colores
- Botón "Unirse" deshabilitado

---

#### 3️⃣ Crear Partida (Host)
**Página**: Host
**Acción**: 
1. Click "Crear Partida"
2. Click "Crear Partida" de nuevo
3. **COPIAR el código de 6 dígitos**
**Nombre archivo**: `03-host-game-created.png`
**Muestra**: 
- Código grande (ej: 820908)
- "Esperando jugadores..."
- Botón "Iniciar Juego" (deshabilitado)

---

#### 4️⃣ Formulario Completado
**Página**: Jugador 1 (Ana)
**Acción**: 
1. Pegar código
2. Escribir "Ana"
3. Seleccionar color ROJO
**Nombre archivo**: `04-form-filled.png`
**Muestra**: 
- Código ingresado
- Nombre "Ana"
- Color rojo seleccionado (borde dorado)
- Botón "Unirse" habilitado

---

#### 5️⃣ Sala de Espera (1 jugador)
**Página**: Jugador 1 (Ana)
**Acción**: Click "Unirse"
**Nombre archivo**: `05-waiting-room-1player.png`
**Muestra**: 
- Mensaje "Bienvenido Ana"
- Código de partida visible
- Lista con 1 jugador
- "1/7 jugadores"

---

#### 6️⃣ Host viendo 1 jugador conectado
**Página**: Host
**Nombre archivo**: `06-host-1player.png`
**Muestra**: 
- Lista de jugadores con Ana
- "Esperando más jugadores (mínimo 5)"

---

#### 7️⃣ Conectar 4 Jugadores Más
**Acción**: En 4 ventanas más, repite:
1. Abrir http://localhost:5173
2. Click "Unirse"
3. Ingresar mismo código
4. Nombres: Beto, Cami, Dani, Eli
5. Colores diferentes cada uno
6. Click "Unirse"

---

#### 8️⃣ Sala de Espera (5 jugadores)
**Página**: Jugador 1 (Ana)
**Nombre archivo**: `07-waiting-room-5players.png`
**Muestra**: 
- 5 jugadores en lista
- Cada uno con su color
- "5/7 jugadores"

---

#### 9️⃣ Host listo para iniciar
**Página**: Host
**Nombre archivo**: `08-host-ready.png`
**Muestra**: 
- 5 jugadores listados
- Botón "Iniciar Juego" HABILITADO (verde)

---

### FASE 2: GAMEPLAY - RONDA 1

#### 🔟 Pregunta Mostrada (Jugador)
**Página**: Jugador 1 (Ana)
**Acción**: Host hace click en "Iniciar Juego"
**Nombre archivo**: `09-question-display.png`
**Muestra**: 
- Pregunta grande y legible
- "Ronda 1 de 7"
- Input para respuesta
- Placeholder "Tu respuesta..."

---

#### 1️⃣1️⃣ Pregunta Mostrada (Host)
**Página**: Host
**Nombre archivo**: `10-host-question.png`
**Muestra**: 
- Misma pregunta
- Lista de jugadores
- Contador "0/5 respuestas"

---

#### 1️⃣2️⃣ Ingresando Respuesta
**Página**: Jugador 1 (Ana)
**Acción**: Escribir número (ej: 1500) pero NO enviar aún
**Nombre archivo**: `11-answer-typing.png`
**Muestra**: 
- Input con "1500"
- Botón "Enviar Respuesta"
- Teclado numérico visible (si es móvil)

---

#### 1️⃣3️⃣ Respuesta Enviada
**Página**: Jugador 1 (Ana)
**Acción**: Click "Enviar Respuesta"
**Nombre archivo**: `12-answer-submitted.png`
**Muestra**: 
- Mensaje "¡Respuesta enviada!"
- Checkmark verde ✅
- "Esperando a otros jugadores..."
- Tu respuesta visible (1500)

---

#### 1️⃣4️⃣ Host viendo progreso
**Página**: Host
**Acción**: (Los otros 4 jugadores también envían respuestas)
**Nombre archivo**: `13-host-answers-progress.png`
**Muestra**: 
- Contador "5/5 respuestas"
- Barra de progreso 100%
- Botón "Mostrar Respuestas" habilitado

---

### FASE 3: APUESTAS

#### 1️⃣5️⃣ Tablero de Apuestas (Jugador)
**Página**: Jugador 1 (Ana)
**Acción**: Host hace click en "Mostrar Respuestas"
**Nombre archivo**: `14-betting-board.png`
**Muestra**: 
- 8 casillas (1 dorada + 3 rojas + 1 verde + 3 negras)
- Respuestas ordenadas de menor a mayor
- Odds en cada casilla (6:1, 5:1, etc.)
- "2 fichas disponibles"
- Nombres de jugadores en sus respuestas

---

#### 1️⃣6️⃣ Tablero de Apuestas (Host)
**Página**: Host
**Nombre archivo**: `15-host-betting-board.png`
**Muestra**: 
- Mismo tablero más grande
- Ver todas las apuestas de todos en tiempo real
- Contador "0/5 jugadores apostaron"

---

#### 1️⃣7️⃣ Primera Apuesta
**Página**: Jugador 1 (Ana)
**Acción**: Click en una casilla (ej: la 3ra casilla roja)
**Nombre archivo**: `16-first-bet.png`
**Muestra**: 
- **Ficha dorada cayendo** con animación
- Ficha con "1" dentro
- "1 ficha restante"
- Casilla con feedback visual

---

#### 1️⃣8️⃣ Segunda Apuesta
**Página**: Jugador 1 (Ana)
**Acción**: Click en otra casilla
**Nombre archivo**: `17-second-bet.png`
**Muestra**: 
- 2 fichas en el tablero
- "0 fichas restantes"
- Mensaje "Apuestas completadas"
- Esperando a otros jugadores

---

#### 1️⃣9️⃣ Host viendo todas las apuestas
**Página**: Host
**Acción**: (Todos los jugadores apuestan)
**Nombre archivo**: `18-host-all-bets.png`
**Muestra**: 
- Tablero lleno de fichas (10 fichas total)
- Colores mezclados
- "5/5 jugadores apostaron"
- Input para respuesta correcta

---

### FASE 4: RESULTADOS

#### 2️⃣0️⃣ Respuesta Correcta Revelada (Jugador)
**Página**: Jugador 1 (Ana)
**Acción**: Host ingresa respuesta correcta y hace click "Revelar"
**Nombre archivo**: `19-correct-answer-revealed.png`
**Muestra**: 
- Casilla ganadora con **animación dorada pulsante**
- Box-shadow intenso
- Respuesta correcta destacada
- Mensaje "¡Respuesta correcta: 1600!"

---

#### 2️⃣1️⃣ Tus Ganancias
**Página**: Jugador 1 (Ana)
**Nombre archivo**: `20-your-winnings.png`
**Muestra**: 
- Panel de resultados
- "¡Ganaste $300!"
- O "No ganaste esta ronda"
- Fichas que ganaron marcadas
- Dinero total actualizado

---

#### 2️⃣2️⃣ Leaderboard
**Página**: Jugador 1 (Ana)
**Nombre archivo**: `21-leaderboard.png`
**Muestra**: 
- Top 3 con medallas:
  - 🥇 1º lugar (borde oro)
  - 🥈 2º lugar (borde plata)
  - 🥉 3º lugar (borde bronce)
- Posiciones 4-5 normales
- Dinero de cada jugador
- "Ronda 1 de 7 completada"

---

#### 2️⃣3️⃣ Host Leaderboard
**Página**: Host
**Nombre archivo**: `22-host-leaderboard.png`
**Muestra**: 
- Mismo leaderboard formato grande
- Botón "Siguiente Ronda"

---

### FASE 5: RONDA 2

#### 2️⃣4️⃣ Nueva Ronda
**Página**: Jugador 1 (Ana)
**Acción**: Host hace click "Siguiente Ronda"
**Nombre archivo**: `23-round-2-question.png`
**Muestra**: 
- Nueva pregunta
- "Ronda 2 de 7"
- Fichas restauradas (2/2)
- Dinero acumulado visible

---

### BONUS: FINAL DEL JUEGO

#### 2️⃣5️⃣ Ganador Final (después de ronda 7)
**Página**: Jugador 1 (Ana) - si ganó
**Nombre archivo**: `24-winner.png`
**Muestra**: 
- **Trofeo 🏆 animado**
- "¡GANADOR!"
- Nombre del ganador enorme
- Dinero total
- Confetti (si implementado)

---

## 📁 Organizar Capturas

Guarda todas en:
```
test-results/player-journey-manual/
```

O crea tu propia carpeta:
```
screenshots/
├── 01-home-screen.png
├── 02-join-form-empty.png
├── 03-host-game-created.png
... etc
```

---

## 🎨 Tips para Mejores Capturas

### Para Jugador (Móvil):
1. **Viewport**: 390x844px (iPhone 12 Pro)
2. **Chrome DevTools**: F12 → Device Toolbar
3. **Orientación**: Portrait
4. **Captura**: F12 → "Capture screenshot" (dropdown en los 3 puntos)

### Para Host (Desktop):
1. **Viewport**: 1920x1080 o tu resolución
2. **Full screen**: F11
3. **Captura**: Windows: Win+Shift+S | Mac: Cmd+Shift+4 | Linux: Shift+PrtScn

### General:
- Espera 1-2 segundos después de cada acción para que terminen las animaciones
- Captura cuando las animaciones estén en su punto más impactante
- Verifica que no haya scrollbars innecesarios

---

## ⚡ Captura Rápida (10 minutos)

Si no quieres capturar TODO, al menos captura estas **10 claves**:

1. Home screen ✅
2. Formulario completado ✅
3. Sala de espera (5 jugadores) ✅
4. Pregunta ✅
5. Tablero de apuestas ✅
6. Primera apuesta (con ficha cayendo) ✅
7. Respuesta correcta revelada (con glow) ✅
8. Leaderboard ✅
9. Nueva ronda ✅
10. Ganador final 🏆

---

## 🔧 Comandos Útiles

```bash
# Verificar que los servidores corren
curl http://localhost:3000/health
curl http://localhost:5173

# Si algo falla, restart:
pkill -f "node.*server"
cd server && npm run dev

# Frontend:
npm run dev:client
```

---

**Creado para**: Documentar mejoras UX/UI de Wits & Wagers Vegas
**Tiempo estimado**: 20-30 minutos para captura completa
**Resultado**: ~25 imágenes mostrando TODO el flujo del jugador
