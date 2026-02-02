// Pantalla del Host (Display principal)

function showHostScreen(excludedCategories = []) {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="host-screen">
      <!-- Header -->
      <div class="host-header">
        <div class="logo-small">🎰 WITS & WAGERS</div>
        <div class="room-code-display">
          <div class="label">Código de Sala</div>
          <div class="code">${state.roomCode}</div>
        </div>
        <div class="round-info">
          <span id="current-round">Ronda: 0/7</span>
        </div>
      </div>

      <!-- Lobby Screen -->
      <div id="lobby-screen" class="game-section active">
        <h2 class="text-center mb-2">Esperando Jugadores...</h2>
        <p class="text-center" style="color: #999;">Los jugadores pueden unirse usando el código de sala</p>
        
        <div id="players-grid" class="players-grid"></div>

        <div class="host-controls text-center mt-2">
          <button id="btn-start-game" class="btn btn-primary" disabled>
            Iniciar Juego (mín. 2 jugadores)
          </button>
        </div>
      </div>

      <!-- Game Board -->
      <div id="game-board" class="game-section hidden">
        <div id="board-container"></div>
      </div>
    </div>
  `;

  // Cargar tablero desde tablero.html
  loadGameBoard();

  // Event listeners
  document.getElementById('btn-start-game').addEventListener('click', () => {
    startGame(excludedCategories);
  });

  // Actualizar lista de jugadores inicial
  state.socket.emit('host:join', { code: state.roomCode }, (response) => {
    if (response.success && response.room) {
      renderPlayersGrid(response.room.players);
    }
  });
}

function renderPlayersGrid(players) {
  const grid = document.getElementById('players-grid');
  const startBtn = document.getElementById('btn-start-game');

  if (!players || players.length === 0) {
    grid.innerHTML = '<p class="text-center" style="color: #999;">Aún no hay jugadores</p>';
    if (startBtn) startBtn.disabled = true;
    return;
  }

  grid.innerHTML = players.map((player, index) => `
    <div class="player-card-large">
      <div class="player-avatar-large" style="background: ${getPlayerColor(index)}">
        ${player.name.charAt(0).toUpperCase()}
      </div>
      <div class="player-name-large">${player.name}</div>
      <div class="player-status ${player.connected ? 'connected' : 'disconnected'}">
        ${player.connected ? '🟢 Conectado' : '🔴 Desconectado'}
      </div>
    </div>
  `).join('');

  if (startBtn) {
    startBtn.disabled = players.length < 2;
    startBtn.textContent = players.length < 2
      ? 'Iniciar Juego (mín. 2 jugadores)'
      : `Iniciar Juego (${players.length} jugadores)`;
  }
}

function updatePlayersList(data) {
  // Actualizar cuando un nuevo jugador se une
  state.socket.emit('host:join', { code: state.roomCode }, (response) => {
    if (response.success && response.room) {
      renderPlayersGrid(response.room.players);
    }
  });
}

function loadGameBoard() {
  // NO cargar HTML externo - generar el tablero directamente aquí
  const boardContainer = document.getElementById('board-container');
  if (!boardContainer) return;

  boardContainer.innerHTML = `
    <!-- Pregunta -->
    <div id="question-container" class="question-container">
      <h1 id="question-text" class="question-text">Esperando pregunta...</h1>
      <p id="question-category" class="question-category"></p>
    </div>

    <!-- Tablero de Apuestas -->
    <div class="betting-board">
      <!-- Fila 1: Fichas Rojas -->
      <div class="board-row">
        <div class="betting-slot red" data-multiplier="1">
          <div class="slot-content">
            <div class="slot-multiplier">Red 1:1</div>
            <div class="slot-chips" id="slot-red-0"></div>
            <div class="slot-answer" id="answer-red-0">-</div>
          </div>
        </div>
        <div class="betting-slot red" data-multiplier="1">
          <div class="slot-content">
            <div class="slot-multiplier">Red 1:1</div>
            <div class="slot-chips" id="slot-red-1"></div>
            <div class="slot-answer" id="answer-red-1">-</div>
          </div>
        </div>
        <div class="betting-slot red" data-multiplier="1">
          <div class="slot-content">
            <div class="slot-multiplier">Red 1:1</div>
            <div class="slot-chips" id="slot-red-2"></div>
            <div class="slot-answer" id="answer-red-2">-</div>
          </div>
        </div>
      </div>

      <!-- Fila 2: Ficha Verde -->
      <div class="board-row">
        <div class="betting-slot green" data-multiplier="2">
          <div class="slot-content">
            <div class="slot-multiplier">Green 2:1</div>
            <div class="slot-chips" id="slot-green"></div>
            <div class="slot-answer" id="answer-green">-</div>
          </div>
        </div>
      </div>

      <!-- Fila 3: Fichas Negras -->
      <div class="board-row">
        <div class="betting-slot black" data-multiplier="3">
          <div class="slot-content">
            <div class="slot-multiplier">Black 3:1</div>
            <div class="slot-chips" id="slot-black-0"></div>
            <div class="slot-answer" id="answer-black-0">-</div>
          </div>
        </div>
        <div class="betting-slot black" data-multiplier="3">
          <div class="slot-content">
            <div class="slot-multiplier">Black 3:1</div>
            <div class="slot-chips" id="slot-black-1"></div>
            <div class="slot-answer" id="answer-black-1">-</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Timer -->
    <div id="timer-container" class="timer-container hidden">
      <div class="timer-label">Tiempo restante:</div>
      <div id="timer-display" class="timer-display">60</div>
    </div>

    <!-- Controles del Host -->
    <div class="host-game-controls">
      <button id="btn-reveal-answer" class="btn btn-primary" disabled>Revelar Respuesta</button>
      <button id="btn-next-round" class="btn btn-secondary hidden">Siguiente Ronda</button>
      <button id="btn-end-game" class="btn btn-danger">Terminar Juego</button>
    </div>
  `;

  // Agregar event listeners
  document.getElementById('btn-reveal-answer')?.addEventListener('click', revealAnswer);
  document.getElementById('btn-next-round')?.addEventListener('click', nextRound);
  document.getElementById('btn-end-game')?.addEventListener('click', endGame);
}

function startGame(excludedCategories) {
  state.socket.emit('host:startGame', {
    code: state.roomCode,
    excludedCategories
  }, (response) => {
    if (!response.success) {
      NotificationSystem.error('Error iniciando juego: ' + response.error);
      return;
    }

    // Ocultar lobby, mostrar tablero
    document.getElementById('lobby-screen').classList.add('hidden');
    document.getElementById('game-board').classList.remove('hidden');

    // Iniciar primera ronda
    setTimeout(() => {
      nextRound();
    }, 2000);
  });
}

function nextRound() {
  state.socket.emit('host:nextRound', { code: state.roomCode }, (response) => {
    if (!response.success) {
      console.error('Error iniciando ronda:', response.error);
      return;
    }

    if (response.gameEnded) {
      console.log('Juego terminado');
      return;
    }

    // Actualizar UI
    document.getElementById('current-round').textContent = `Ronda: ${response.roundNumber}/7`;

    // Limpiar tablero para la nueva ronda
    clearAllAnswers();

    // Ocultar botón de siguiente ronda
    const nextBtn = document.getElementById('btn-next-round');
    if (nextBtn) nextBtn.classList.add('hidden');

    // Deshabilitar botón de revelar
    const revealBtn = document.getElementById('btn-reveal-answer');
    if (revealBtn) revealBtn.disabled = true;
  });
}

// ========== Funciones del Tablero ==========

function showQuestion(question) {
  console.log('📋 Mostrando pregunta:', question);

  const questionText = document.getElementById('question-text');
  const questionCategory = document.getElementById('question-category');

  if (questionText) {
    questionText.textContent = question.text;
  }

  if (questionCategory) {
    questionCategory.textContent = `Categoría: ${question.category}`;
  }

  // Limpiar respuestas anteriores
  clearAllAnswers();

  // Mostrar timer
  const timerContainer = document.getElementById('timer-container');
  if (timerContainer) {
    timerContainer.classList.remove('hidden');
  }
}

function showAnswers(answers) {
  console.log('📊 Mostrando respuestas:', answers);

  if (!answers || !Array.isArray(answers)) {
    console.error('❌ Respuestas inválidas:', answers);
    return;
  }

  // Ordenar respuestas de menor a mayor
  const sortedAnswers = [...answers].sort((a, b) => a.answer - b.answer);

  // Distribuir en los slots
  const slotIds = [
    'answer-red-0', 'answer-red-1', 'answer-red-2',
    'answer-green',
    'answer-black-0', 'answer-black-1'
  ];

  sortedAnswers.forEach((answerData, index) => {
    if (index < slotIds.length) {
      const slotElement = document.getElementById(slotIds[index]);
      if (slotElement) {
        slotElement.textContent = answerData.answer;
        slotElement.style.fontWeight = 'bold';
        slotElement.style.fontSize = '1.5rem';
      }
    }
  });

  // Habilitar botón de revelar respuesta
  const revealBtn = document.getElementById('btn-reveal-answer');
  if (revealBtn) {
    revealBtn.disabled = false;
  }
}

function showBets(bets) {
  console.log('💰 Mostrando apuestas:', bets);

  if (!bets) {
    console.error('❌ Apuestas inválidas:', bets);
    return;
  }

  // Limpiar chips anteriores
  document.querySelectorAll('[id^="slot-"]').forEach(container => {
    container.innerHTML = '';
  });

  // bets es un objeto: {playerId: {red: X, green: Y, black: Z}}
  Object.entries(bets).forEach(([playerId, playerBets]) => {
    // Mostrar fichas en cada slot
    const slotMap = {
      'red': ['red-0', 'red-1', 'red-2'],
      'green': ['green'],
      'black': ['black-0', 'black-1']
    };

    Object.entries(playerBets).forEach(([color, amount]) => {
      if (amount > 0 && slotMap[color]) {
        const slotIds = slotMap[color];
        // Distribuir chips en los slots disponibles
        slotIds.forEach(slotId => {
          const chipsContainer = document.getElementById(`slot-${slotId}`);
          if (chipsContainer) {
            // Agregar chip visual
            for (let i = 0; i < amount; i++) {
              const chip = document.createElement('div');
              chip.className = 'chip';
              chip.style.cssText = `
                width: 45px;
                height: 45px;
                border-radius: 50%;
                background: radial-gradient(circle at 30% 30%, 
                  ${color === 'red' ? '#ff6b6b' : color === 'green' ? '#51cf66' : '#495057'} 0%,
                  ${color === 'red' ? '#c92a2a' : color === 'green' ? '#2f9e44' : '#212529'} 100%);
                border: 4px solid white;
                box-shadow: 0 3px 10px rgba(0,0,0,0.4);
                display: inline-block;
                margin: 3px;
                position: relative;
              `;

              // Añadir valor de la ficha
              const chipValue = document.createElement('span');
              chipValue.textContent = '$' + (color === 'red' ? 1 : color === 'green' ? 2 : 3);
              chipValue.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: white;
                font-weight: bold;
                font-size: 0.8rem;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
              `;
              chip.appendChild(chipValue);

              chipsContainer.appendChild(chip);
            }
          }
        });
      }
    });
  });
}

function revealAnswer() {
  console.log('🎯 Revelando respuesta correcta');

  // Aquí iría la lógica para resaltar la respuesta correcta
  state.socket.emit('host:revealAnswer', { code: state.roomCode });

  const nextRoundBtn = document.getElementById('btn-next-round');
  if (nextRoundBtn) {
    nextRoundBtn.classList.remove('hidden');
  }

  const revealBtn = document.getElementById('btn-reveal-answer');
  if (revealBtn) {
    revealBtn.disabled = true;
  }
}

function clearAllAnswers() {
  // Limpiar respuestas
  const answerElements = document.querySelectorAll('[id^="answer-"]');
  answerElements.forEach(el => {
    el.textContent = '-';
    el.style.fontWeight = 'normal';
    el.style.fontSize = 'inherit';
  });

  // Limpiar chips
  const chipContainers = document.querySelectorAll('[id^="slot-"]');
  chipContainers.forEach(container => {
    container.innerHTML = '';
  });
}

function endGame() {
  if (confirm('¿Estás seguro de que deseas terminar el juego?')) {
    state.socket.emit('host:endGame', { code: state.roomCode });
    showHomeScreen();
  }
}

function getPlayerColor(index) {
  const colors = [
    '#d4af37', // Gold
    '#c41e3a', // Red
    '#28a745', // Green
    '#007bff', // Blue
    '#6f42c1', // Purple
    '#fd7e14', // Orange
    '#20c997'  // Teal
  ];
  return colors[index % colors.length];
}

// CSS adicional para host
const hostStyles = `
<style>
.host-screen {
  min-height: 100vh;
  padding: 1rem;
}

.host-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: var(--card-bg);
  border-radius: var(--border-radius);
  margin-bottom: 2rem;
}

.logo-small {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color);
}

.round-info {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--text-light);
}

.players-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.player-card-large {
  background: var(--card-bg);
  border-radius: var(--border-radius);
  padding: 2rem;
  text-align: center;
  transition: var(--transition);
  border: 2px solid transparent;
}

.player-card-large:hover {
  border-color: var(--primary-color);
  transform: translateY(-5px);
}

.player-avatar-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  color: var(--text-dark);
}

.player-name-large {
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.player-status {
  font-size: 0.9rem;
}

.player-status.connected {
  color: var(--success-color);
}

.player-status.disconnected {
  color: var(--danger-color);
}

.game-section {
  animation: fadeIn 0.5s ease;
}

.game-section.hidden {
  display: none;
}

#board-container {
  max-width: 1400px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .host-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .players-grid {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
}

/* Estilos del Tablero de Juego */

.question-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.question-text {
  color: white;
  font-size: 2rem;
  margin: 0;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.question-category {
  color: rgba(255,255,255,0.9);
  font-size: 1.2rem;
  margin-top: 0.5rem;
}

.betting-board {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 1200px;
  margin: 0 auto 2rem;
}

.board-row {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.betting-slot {
  flex: 1;
  min-height: 200px;
  border-radius: 12px;
  padding: 1.5rem;
  position: relative;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  transition: transform 0.2s ease;
}

.betting-slot:hover {
  transform: translateY(-5px);
}

.betting-slot.red {
  background: linear-gradient(135deg, #ff6b6b 0%, #c92a2a 100%);
  max-width: 300px;
}

.betting-slot.green {
  background: linear-gradient(135deg, #51cf66 0%, #2f9e44 100%);
  min-width: 600px;
}

.betting-slot.black {
  background: linear-gradient(135deg, #495057 0%, #212529 100%);
  max-width: 400px;
}

.slot-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  color: white;
}

.slot-multiplier {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.slot-chips {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 60px;
}

.slot-answer {
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
  margin-top: 1rem;
  padding: 0.5rem;
  background: rgba(255,255,255,0.2);
  border-radius: 8px;
}

.timer-container {
  text-align: center;
  margin: 2rem 0;
}

.timer-label {
  font-size: 1.2rem;
  color: var(--text-light);
  margin-bottom: 0.5rem;
}

.timer-display {
  font-size: 3rem;
  font-weight: bold;
  color: var(--primary-color);
  font-family: 'Courier New', monospace;
}

.host-game-controls {
  display: flex;
  gap: 1rem;
  justify-content: center;
  padding: 2rem;
  flex-wrap: wrap;
}

.chip {
  animation: chipAppear 0.3s ease;
}

@keyframes chipAppear {
  from {
    opacity: 0;
    transform: scale(0);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@media (max-width: 768px) {
  .question-text {
    font-size: 1.5rem;
  }
  
  .board-row {
    flex-direction: column;
  }
  
  .betting-slot {
    max-width: 100%;
    min-width: 100%;
  }
  
  .host-game-controls {
    flex-direction: column;
  }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', hostStyles);

// ========== Event Listeners Socket.IO para el Host ==========

// Escuchar eventos del juego
if (typeof state !== 'undefined' && state.socket) {
  state.socket.on('round:started', (data) => {
    console.log('🎲 Ronda iniciada (host):', data);
    if (data.question) {
      showQuestion(data.question);
    }
  });

  state.socket.on('round:answers-submitted', (data) => {
    console.log('✅ Respuestas enviadas (host):', data);
    if (data.answers) {
      showAnswers(data.answers);
    }
  });

  state.socket.on('round:bets-placed', (data) => {
    console.log('💰 Apuestas realizadas (host):', data);
    if (data.bets) {
      showBets(data.bets);
    }
  });

  state.socket.on('player:joined', (data) => {
    console.log('👤 Jugador unido:', data);
    updatePlayersList(data);
  });

  state.socket.on('player:left', (data) => {
    console.log('👋 Jugador salió:', data);
    updatePlayersList(data);
  });
}

window.showHostScreen = showHostScreen;
window.renderPlayersGrid = renderPlayersGrid;
window.updatePlayersList = updatePlayersList;
window.showQuestion = showQuestion;
window.showAnswers = showAnswers;
window.showBets = showBets;
