# Plan de Implementación - Wits & Wagers Vegas Digital

## 📋 Resumen del Proyecto

Digitalización completa del juego de mesa "Wits & Wagers Vegas" con dos interfaces:

- **Host**: Pantalla principal que todos los jugadores pueden ver
- **Jugador**: Interfaz personal en dispositivo móvil (horizontal recomendado)

---

## 🎯 Componentes Rescatados

✅ **RESCATE_TABLERO_JUGADOR.jsx** - Tablero funcional del jugador (NO MODIFICAR)

---

## 🛠️ Stack Tecnológico Propuesto

### Frontend

- **React 18** + **Vite** - Desarrollo rápido y moderno
- **Socket.io-client** - Comunicación en tiempo real
- **React Router** - Navegación entre vistas

### Backend

- **Node.js** + **Express** - Servidor HTTP
- **Socket.io** - WebSockets para sincronización en tiempo real
- **MongoDB + Mongoose** - Base de datos persistente
- **Express Validator** - Validación de datos

### Deploy

- **Frontend**: Netlify (ya configurado)
- **Backend**: Render (ya configurado)
- **Base de datos**: MongoDB Atlas (ya configurado)

---

## 📐 Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────┐
│                   MONGODB ATLAS                     │
│              (Estado persistente)                   │
└─────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────┐
│              BACKEND (Render)                       │
│  Express + Socket.io + Game Logic                  │
└─────────────────────────────────────────────────────┘
                         ↕
        ┌────────────────┴────────────────┐
        ↓                                 ↓
┌──────────────────┐           ┌──────────────────┐
│   HOST VIEW      │           │  PLAYER VIEW     │
│   (Netlify)      │           │  (Netlify)       │
│   React + Vite   │           │  React + Vite    │
└──────────────────┘           └──────────────────┘
```

---

## 📊 Modelo de Datos (MongoDB)

### Collection: `games`

```javascript
{
  _id: ObjectId,
  gameCode: String (6 dígitos, único),
  hostId: String,
  status: String, // 'lobby' | 'playing' | 'finished'
  currentRound: Number, // 1-7
  currentPhase: String, // 'question' | 'ordering' | 'betting' | 'reveal' | 'results'
  questions: [
    {
      text: String,
      answer: Number,
      round: Number
    }
  ],
  players: [
    {
      id: String,
      name: String,
      color: String,
      money: Number,
      tokens: Number, // Siempre 2
      connected: Boolean
    }
  ],
  currentQuestion: {
    text: String,
    correctAnswer: Number,
    answers: [
      {
        playerId: String,
        playerName: String,
        value: Number,
        position: String // ej: '4to1-red'
      }
    ],
    bets: [
      {
        playerId: String,
        position: String,
        pokerChips: Number,
        isToken: Boolean
      }
    ]
  },
  blockers: [
    {
      position: String, // ej: '5to1-red'
      active: Boolean
    }
  ],
  roundBonuses: [50, 75, 100, 125, 150, 200, 250], // Fichas del círculo por ronda
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎮 Flujo del Juego (según Manual)

### 1️⃣ FASE: LOBBY

- Host crea partida → genera código de 6 dígitos
- Jugadores se unen con código
- Configuración automática de blockers según número de jugadores:
  - 5 jugadores: Blocker en ambos "5 to 1"
  - 6 jugadores: Blocker en "2 to 1"
  - 7 jugadores: Sin blockers
- Host inicia juego cuando todos están listos

### 2️⃣ FASE: PREGUNTA (Question)

- Host muestra pregunta de la ronda actual
- Cada jugador escribe su respuesta/estimación en su dispositivo
- Timer opcional de 60 segundos
- Todos deben responder antes de continuar

### 3️⃣ FASE: ORDENAMIENTO (Ordering)

- Sistema ordena respuestas de menor a mayor AUTOMÁTICAMENTE
- Asigna posiciones en el tablero:
  - Respuesta más baja → espacio rojo
  - Respuestas duplicadas → lado a lado
  - Respeta blockers configurados
- Host visualiza el tablero completo

### 4️⃣ FASE: APUESTAS (Betting)

- Jugadores ven el mini-tablero con todas las respuestas ordenadas
- Cada jugador tiene 2 fichas de apuesta (tokens)
- Pueden apostar:
  - Ambas fichas en la misma posición
  - Dividir en 2 posiciones diferentes
  - Agregar fichas de póquer ganadas (pueden perderlas)
- Espacios de apuesta válidos:
  - Cualquier respuesta (6:1, 5:1, 4:1, 3:1, 2:1)
  - "TODAS ALTAS" (6:1)
  - "ROJO 1 a 1"
  - "NEGRO 1 a 1"
- Timer de apuestas

### 5️⃣ FASE: REVELACIÓN (Reveal)

- Host revela la respuesta correcta
- Sistema calcula respuesta ganadora: **más cerca sin pasarse**
- Animación dramática

### 6️⃣ FASE: PAGOS (Results)

**Orden de pagos según manual:**

1. **Bono al que acertó**:
   - Jugador con respuesta ganadora recibe bono de la ronda
   - Bonos: [50, 75, 100, 125, 150, 200, 250]
   - Si múltiples jugadores tienen la misma respuesta ganadora → todos reciben bono completo

2. **Retirar apuestas perdedoras**:
   - Todas las fichas en espacios no ganadores → banco

3. **Pagar apuestas ganadoras**:
   - Pago = apuesta original + (apuesta × odds)
   - Ejemplos del manual:
     - Apostar 1 en 2:1 → recibe 3 (1 + 2)
     - Apostar 2 en 3:1 → recibe 8 (2 + 6)
     - Apostar 2 en 4:1 → recibe 10 (2 + 8)
4. **Reglas especiales de pago**:
   - Si respuesta ganadora está en ROJO → "ROJO 1 a 1" también gana
   - Si respuesta ganadora está en NEGRO → "NEGRO 1 a 1" también gana
   - Si hay respuestas duplicadas ganadoras → todos los espacios con esa respuesta pagan (usar odds más altas)
   - Si TODAS las respuestas son muy altas → solo paga "6 a 1 TODAS ALTAS"

### 7️⃣ SIGUIENTE RONDA

- Limpiar tablero
- Incrementar número de ronda
- Volver a FASE: PREGUNTA
- Repetir hasta ronda 7

### 8️⃣ FIN DEL JUEGO

- Después de ronda 7
- Jugador con más dinero gana
- En caso de empate → gana el más joven (fecha de nacimiento o input manual)

---

## 🎨 Vistas Necesarias

### 🖥️ VISTA HOST

#### 1. Lobby Host

- Código de partida grande
- Lista de jugadores conectados (nombre + color)
- Configuración de blockers automática
- Botón "INICIAR JUEGO"

#### 2. Fase Pregunta

- Número de ronda (1-7)
- Texto de la pregunta grande
- Contador de jugadores que respondieron (X/Total)
- Timer opcional

#### 3. Fase Ordenamiento

- Tablero completo con 8 espacios:
  ```
  [6:1 TODAS ALTAS - ancho completo]
  [5:1 RED] [4:1 RED] [3:1 RED] [2:1 GREEN - ancho completo]
  [3:1 BLACK] [4:1 BLACK] [5:1 BLACK]
  ```
- Espacios especiales debajo:
  ```
  [ROJO 1 a 1]  [NEGRO 1 a 1]
  ```
- Respuestas ordenadas con nombre del jugador
- Blockers visibles (🚫)

#### 4. Fase Apuestas

- Mismo tablero
- Fichas de apuesta de cada jugador visibles en sus posiciones
- Contador de jugadores que apostaron (X/Total)
- Animaciones de fichas cayendo

#### 5. Fase Revelación

- Respuesta correcta aparece dramáticamente
- Respuesta ganadora resaltada en VERDE brillante
- Efecto de spotlight

#### 6. Fase Resultados

- Resumen de pagos:
  - 🎁 "Juan recibió bono: $100"
  - 💰 "María ganó: $12 (apuesta en 4:1)"
  - 💰 "Pedro ganó: $5 (apuesta en ROJO 1 a 1)"
- Tabla de posiciones actualizada
- Botón "SIGUIENTE RONDA"

#### 7. Pantalla Final

- 🏆 "¡GANADOR: [Nombre]!"
- Tabla final con todos los jugadores y dinero
- Opción de nueva partida

---

### 📱 VISTA JUGADOR (Móvil - Horizontal)

#### 1. Unirse a Partida

- Input para código de 6 dígitos
- Input para nombre
- Selector de color (evitar duplicados)
- Botón "UNIRSE"

#### 2. Lobby Jugador

- "Esperando que el host inicie..."
- Lista de jugadores en la sala
- Tu color asignado

#### 3. Fase Respuesta

- Pregunta visible
- Input numérico grande para respuesta
- Validación: solo números positivos
- Botón "ENVIAR RESPUESTA"
- Confirmación visual cuando se envió

#### 4. Esperando Ordenamiento

- "Esperando a que todos respondan..."
- Animación de carga

#### 5. Fase Apuestas

**USAR COMPONENTE RESCATADO: RESCATE_TABLERO_JUGADOR.jsx**

- Header con:
  - 💰 Dinero actual: $XXX
  - 🎯 Fichas restantes: X/2
- Mini tablero con todas las respuestas ordenadas
- Click en espacio → coloca ficha
- Modal para agregar fichas de póquer (si tiene dinero)
- Botón "CONFIRMAR APUESTAS"
- Poder eliminar apuestas antes de confirmar

#### 6. Esperando Resultados

- "Esperando revelación..."
- Tus apuestas actuales visibles

#### 7. Resultados Personales

- ✅/❌ para cada apuesta
- 💰 Total ganado esta ronda
- 📊 Dinero total actual
- Tu posición en el ranking

---

## 🔌 Eventos Socket.io

### Del Cliente al Servidor

```javascript
// Host
'host:create-game' → { hostName }
'host:start-game' → { gameCode }
'host:next-phase' → { gameCode }
'host:next-round' → { gameCode }
'host:reveal-answer' → { gameCode, correctAnswer }

// Player
'player:join-game' → { gameCode, playerName, playerColor }
'player:submit-answer' → { gameCode, playerId, answer }
'player:place-bet' → { gameCode, playerId, bets }
'player:disconnect' → { gameCode, playerId }
```

### Del Servidor al Cliente

```javascript
// General
'game:created' → { gameCode, hostId }
'game:updated' → { game } // Estado completo
'game:error' → { message }

// Fases
'phase:question' → { question, round }
'phase:ordering' → { answers, positions }
'phase:betting' → { board }
'phase:reveal' → { correctAnswer, winningPosition }
'phase:results' → { payments, leaderboard }
'game:finished' → { winner, finalLeaderboard }

// Players
'player:joined' → { player }
'player:left' → { playerId }
'player:answered' → { playerId }
'player:bet-placed' → { playerId }
```

---

## 🧮 Lógica de Negocio Crítica

### 1. Ordenamiento de Respuestas

```javascript
function orderAnswers(answers, blockers) {
  // 1. Ordenar respuestas de menor a mayor
  const sorted = answers.sort((a, b) => a.value - b.value);

  // 2. Asignar posiciones según tabla
  const positions = [
    '6to1-all-high', // Solo si todas muy altas
    '5to1-red',
    '4to1-red',
    '3to1-red',
    '2to1-green',
    '3to1-black',
    '4to1-black',
    '5to1-black',
  ];

  // 3. Saltar posiciones bloqueadas
  // 4. Si hay duplicados, colocar lado a lado
  // 5. La respuesta más baja siempre en rojo

  return positionedAnswers;
}
```

### 2. Cálculo de Respuesta Ganadora

```javascript
function findWinningAnswer(answers, correctAnswer) {
  // Filtrar respuestas <= correcta
  const valid = answers.filter((a) => a.value <= correctAnswer);

  if (valid.length === 0) {
    // TODAS MUY ALTAS
    return { position: '6to1-all-high', answers: [] };
  }

  // La más cercana sin pasarse
  const winning = valid[valid.length - 1];

  // Si hay duplicados, incluir todos
  const duplicates = answers.filter((a) => a.value === winning.value);

  return { position: winning.position, answers: duplicates };
}
```

### 3. Cálculo de Pagos

```javascript
function calculatePayments(game) {
  const payments = [];
  const { correctAnswer, answers, bets } = game.currentQuestion;
  const winning = findWinningAnswer(answers, correctAnswer);

  // 1. BONO - Jugadores con respuesta ganadora
  if (winning.answers.length > 0) {
    const bonus = game.roundBonuses[game.currentRound - 1];
    winning.answers.forEach((answer) => {
      payments.push({
        playerId: answer.playerId,
        type: 'bonus',
        amount: bonus,
        reason: `Respuesta ganadora: ${answer.value}`,
      });
    });
  }

  // 2. APUESTAS GANADORAS
  bets.forEach((bet) => {
    if (isWinningBet(bet, winning)) {
      const odds = getOdds(bet.position);
      const payout = bet.totalAmount + bet.totalAmount * odds;
      payments.push({
        playerId: bet.playerId,
        type: 'bet',
        amount: payout,
        reason: `Apuesta en ${bet.position} (${odds}:1)`,
      });
    }
  });

  return payments;
}
```

### 4. Validación de Blockers según Jugadores

```javascript
function setupBlockers(playerCount) {
  const blockers = [];

  if (playerCount === 5) {
    blockers.push({ position: '5to1-red', active: true });
    blockers.push({ position: '5to1-black', active: true });
  } else if (playerCount === 6) {
    blockers.push({ position: '2to1-green', active: true });
  }
  // 7 jugadores: sin blockers

  return blockers;
}
```

---

## 📁 Estructura de Archivos Propuesta

```
WitsAndWagers/
├── client/                          # Frontend (Vite + React)
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   ├── host/
│   │   │   │   ├── HostLobby.jsx
│   │   │   │   ├── HostBoard.jsx
│   │   │   │   ├── QuestionPhase.jsx
│   │   │   │   ├── BettingPhase.jsx
│   │   │   │   ├── RevealPhase.jsx
│   │   │   │   ├── ResultsPhase.jsx
│   │   │   │   └── FinalScreen.jsx
│   │   │   ├── player/
│   │   │   │   ├── JoinGame.jsx
│   │   │   │   ├── PlayerLobby.jsx
│   │   │   │   ├── AnswerPhase.jsx
│   │   │   │   ├── BettingBoard.jsx (RESCATADO)
│   │   │   │   ├── WaitingScreen.jsx
│   │   │   │   └── PlayerResults.jsx
│   │   │   └── shared/
│   │   │       ├── BettingSpace.jsx
│   │   │       ├── PokerChip.jsx
│   │   │       └── Leaderboard.jsx
│   │   ├── hooks/
│   │   │   ├── useSocket.js
│   │   │   ├── useGame.js
│   │   │   └── usePlayer.js
│   │   ├── context/
│   │   │   └── GameContext.jsx
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   └── helpers.js
│   │   ├── styles/
│   │   │   ├── variables.css
│   │   │   ├── host.css
│   │   │   └── player.css
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vite.config.js
│   └── package.json
│
├── server/                          # Backend (Express + Socket.io)
│   ├── models/
│   │   ├── Game.js
│   │   └── Player.js
│   ├── controllers/
│   │   ├── gameController.js
│   │   └── playerController.js
│   ├── services/
│   │   ├── gameLogic.js           # Lógica principal del juego
│   │   ├── answerOrdering.js      # Ordenamiento de respuestas
│   │   ├── paymentCalculator.js   # Cálculo de pagos
│   │   └── questionService.js     # Gestión de preguntas
│   ├── socket/
│   │   ├── handlers/
│   │   │   ├── hostHandlers.js
│   │   │   └── playerHandlers.js
│   │   └── socketManager.js
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   └── validator.js
│   ├── config/
│   │   ├── db.js
│   │   └── socket.js
│   ├── data/
│   │   └── questions.json         # Banco de preguntas
│   ├── utils/
│   │   ├── constants.js
│   │   └── helpers.js
│   ├── server.js
│   └── package.json
│
├── docs/
│   ├── Manual vegas.md             # Manual del juego (REFERENCIA)
│   ├── PLAN_IMPLEMENTACION.md      # Este archivo
│   └── API.md                      # Documentación de eventos Socket
│
├── .env.example
├── .gitignore
├── netlify.toml
├── render.yaml
└── README.md
```

---

## ✅ Checklist de Implementación

### Fase 1: Setup Base

- [ ] Configurar estructura de carpetas
- [ ] Instalar dependencias (cliente y servidor)
- [ ] Configurar variables de entorno
- [ ] Conectar MongoDB Atlas
- [ ] Setup básico de Socket.io

### Fase 2: Backend Core

- [ ] Modelo de datos Game (Mongoose)
- [ ] Servicio de creación de partidas
- [ ] Generador de códigos de 6 dígitos
- [ ] Handlers de Socket.io básicos
- [ ] Sistema de preguntas (cargar desde JSON)

### Fase 3: Lógica de Juego

- [ ] Ordenamiento de respuestas
- [ ] Asignación de posiciones en tablero
- [ ] Lógica de blockers automáticos
- [ ] Cálculo de respuesta ganadora
- [ ] Sistema de pagos completo (según manual)
- [ ] Gestión de fases del juego

### Fase 4: Frontend Host

- [ ] Vista de creación de partida
- [ ] Lobby con código compartible
- [ ] Fase de pregunta
- [ ] Tablero de apuestas (visualización)
- [ ] Animación de revelación
- [ ] Pantalla de resultados
- [ ] Tabla de clasificación
- [ ] Pantalla de ganador final

### Fase 5: Frontend Jugador

- [ ] Vista de unión a partida
- [ ] Lobby de espera
- [ ] Input de respuesta
- [ ] **Integrar RESCATE_TABLERO_JUGADOR.jsx**
- [ ] Sistema de apuestas con tokens y fichas
- [ ] Feedback visual de apuestas
- [ ] Resultados personales

### Fase 6: Sincronización en Tiempo Real

- [ ] Actualización automática de tablero
- [ ] Notificaciones de jugadores que responden
- [ ] Sincronización de fase de apuestas
- [ ] Animaciones coordinadas
- [ ] Manejo de desconexiones

### Fase 7: Polish & Testing

- [ ] Animaciones y transiciones
- [ ] Responsive para móvil (horizontal)
- [ ] Manejo de errores
- [ ] Testing de flujo completo
- [ ] Testing con múltiples jugadores

### Fase 8: Deploy

- [ ] Build de producción
- [ ] Configurar variables en Netlify
- [ ] Configurar variables en Render
- [ ] Deploy y pruebas en producción

---

## 🎨 Paleta de Colores

```css
:root {
  /* Espacios de apuesta */
  --red-gradient: linear-gradient(135deg, #ff6b6b 0%, #c92a2a 100%);
  --green-gradient: linear-gradient(135deg, #51cf66 0%, #2f9e44 100%);
  --black-gradient: linear-gradient(135deg, #495057 0%, #212529 100%);
  --gold-gradient: linear-gradient(135deg, #ffd700 0%, #d4af37 100%);

  /* Estados */
  --winning-glow: #00ff88;
  --losing-dim: rgba(255, 255, 255, 0.3);

  /* Backgrounds */
  --bg-dark: #1a1a2e;
  --bg-card: #16213e;

  /* Fichas de póquer */
  --chip-gold: radial-gradient(circle at 30% 30%, #ffd700, #d4af37, #b8941f);
  --chip-border: #fff;
  --chip-shadow: 0 4px 8px rgba(0, 0, 0, 0.6);
}
```

---

## 🚀 Comandos de Desarrollo

### Instalar dependencias

```bash
# Cliente
cd client && npm install

# Servidor
cd server && npm install
```

### Desarrollo local

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### Build de producción

```bash
# Cliente
cd client
npm run build

# Servidor
cd server
npm start
```

---

## 🔐 Variables de Entorno

### `.env` (servidor)

```env
PORT=3000
MONGODB_URI=mongodb+srv://...
NODE_ENV=development
CLIENT_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,https://witsandwages.netlify.app
```

### `.env` (cliente)

```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

---

## 📝 Notas Importantes del Manual

### Reglas Críticas a Respetar:

1. **Ordenamiento**: La respuesta más baja SIEMPRE en rojo
2. **Duplicados**: Lado a lado, mismo espacio si es posible
3. **Pagos**: Siempre devolver apuesta + (apuesta × odds)
4. **Bonos**: Si hay múltiples ganadores, TODOS reciben el bono completo
5. **Tokens**: Cada jugador SIEMPRE tiene 2 tokens (no se pierden)
6. **Fichas de póquer**: Pueden perderse si la apuesta pierde
7. **Empate final**: Gana el jugador más joven

### ✅ Configuración Confirmada:

1. **Timer**: Opcional, controlado por toggle del host
2. **Preguntas**: Selección aleatoria del banco de preguntas
3. **Pausar partida**: Sí, host puede pausar/reanudar
4. **Efectos de sonido**: Sí, en momentos clave (apuestas, revelación, pagos)

---

## 🎯 Próximos Pasos

1. **Revisar y aprobar este plan**
2. **Responder preguntas de configuración**
3. **Comenzar implementación por fases**
4. **Testing iterativo**
5. **Deploy final**

---

**RECORDATORIO**: Todo debe seguir el manual al pie de la letra. Ante cualquier duda, consultar el manual primero.
