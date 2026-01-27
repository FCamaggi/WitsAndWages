// Pantalla del Jugador (Mobile)

function showPlayerScreen() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="player-screen">
      <!-- Header -->
      <div class="player-header">
        <div class="player-info-top">
          <div>
            <div class="player-name-display">${state.playerName}</div>
            <div class="room-code-small">Sala: ${state.roomCode}</div>
          </div>
          <div class="player-money">
            💰 $<span id="player-money">0</span>
          </div>
        </div>
      </div>

      <!-- Waiting Screen -->
      <div id="waiting-screen" class="player-section active">
        <div class="waiting-content">
          <h2>⏳ Esperando...</h2>
          <p>El host iniciará el juego pronto</p>
          <div class="loading-dots">
            <span>.</span><span>.</span><span>.</span>
          </div>
        </div>
      </div>

      <!-- Question Screen -->
      <div id="question-screen" class="player-section hidden">
        <div class="question-card">
          <div class="round-badge">Ronda <span id="round-number">1</span>/7</div>
          <div class="question-text" id="question-text"></div>
          <div class="question-category" id="question-category"></div>
          
          <div class="answer-form">
            <label for="player-answer">Tu Respuesta:</label>
            <input 
              type="number" 
              id="player-answer" 
              placeholder="Escribe tu estimación"
              step="0.01"
            />
            <span class="answer-unit" id="answer-unit"></span>
            <button id="btn-submit-answer" class="btn btn-primary">
              Enviar Respuesta
            </button>
          </div>
        </div>
      </div>

      <!-- Betting Screen -->
      <div id="betting-screen" class="player-section hidden">
        <h3 class="text-center">💰 Haz tus Apuestas</h3>
        <p class="text-center" style="color: #999; margin-bottom: 1rem;">
          Puedes hacer hasta 2 apuestas
        </p>

        <div id="answers-display" class="answers-display"></div>

        <div class="betting-controls">
          <div class="tokens-available">
            <span>Fichas disponibles:</span>
            <span id="tokens-count">2</span>
          </div>
          
          <button id="btn-submit-bets" class="btn btn-secondary" disabled>
            Confirmar Apuestas
          </button>
        </div>
      </div>

      <!-- Results Screen -->
      <div id="results-screen" class="player-section hidden">
        <div class="results-content">
          <h2>📊 Resultados</h2>
          <div id="results-info"></div>
          <div id="player-result" class="player-result-card"></div>
        </div>
      </div>
    </div>
  `;

  setupPlayerEventListeners();
}

function setupPlayerEventListeners() {
  const submitAnswerBtn = document.getElementById('btn-submit-answer');
  if (submitAnswerBtn) {
    submitAnswerBtn.addEventListener('click', submitAnswer);
  }

  const submitBetsBtn = document.getElementById('btn-submit-bets');
  if (submitBetsBtn) {
    submitBetsBtn.addEventListener('click', submitBets);
  }
}

function showQuestionScreen(data) {
  // Ocultar otras secciones
  hideAllPlayerSections();
  
  const questionScreen = document.getElementById('question-screen');
  questionScreen.classList.remove('hidden');

  // Actualizar contenido
  document.getElementById('round-number').textContent = data.roundNumber;
  document.getElementById('question-text').textContent = data.question.pregunta;
  document.getElementById('question-category').textContent = `📂 ${data.question.categoria}`;
  document.getElementById('answer-unit').textContent = data.question.unidad || '';

  // Limpiar input
  document.getElementById('player-answer').value = '';
  document.getElementById('btn-submit-answer').disabled = false;
}

function submitAnswer() {
  const answerInput = document.getElementById('player-answer');
  const answer = parseFloat(answerInput.value);

  if (isNaN(answer)) {
    alert('Por favor ingresa un número válido');
    return;
  }

  state.socket.emit('player:submitAnswer', {
    code: state.roomCode,
    playerId: state.playerId,
    answer
  }, (response) => {
    if (!response.success) {
      alert('Error: ' + response.error);
      return;
    }

    // Deshabilitar botón
    document.getElementById('btn-submit-answer').disabled = true;
    document.getElementById('btn-submit-answer').textContent = '✓ Respuesta Enviada';

    // Mostrar pantalla de espera
    showWaitingScreen('Esperando a los demás jugadores...');
  });
}

function showBettingScreen(data) {
  hideAllPlayerSections();
  
  const bettingScreen = document.getElementById('betting-screen');
  bettingScreen.classList.remove('hidden');

  // Renderizar respuestas disponibles
  const answersDisplay = document.getElementById('answers-display');
  answersDisplay.innerHTML = `
    <div class="answers-list">
      ${data.answers.map(answer => `
        <div class="answer-option" data-position="${answer.position}">
          <div class="answer-value">${answer.value}</div>
          <div class="answer-player">${answer.playerName}</div>
          <div class="answer-odds">${getOddsText(answer.position)}</div>
          <button class="btn-bet-token" data-position="${answer.position}">
            Apostar
          </button>
        </div>
      `).join('')}
      
      <!-- Opción "Todas muy altas" -->
      <div class="answer-option" data-position="6to1-all-high">
        <div class="answer-value">Todas muy altas</div>
        <div class="answer-odds">6 a 1</div>
        <button class="btn-bet-token" data-position="6to1-all-high">
          Apostar
        </button>
      </div>

      <!-- Opciones RED/BLACK 1 to 1 -->
      <div class="answer-option" data-position="1to1-red">
        <div class="answer-value">Rojo 1 a 1</div>
        <button class="btn-bet-token" data-position="1to1-red">
          Apostar
        </button>
      </div>

      <div class="answer-option" data-position="1to1-black">
        <div class="answer-value">Negro 1 a 1</div>
        <button class="btn-bet-token" data-position="1to1-black">
          Apostar
        </button>
      </div>
    </div>
  `;

  // Event listeners para botones de apuesta
  document.querySelectorAll('.btn-bet-token').forEach(btn => {
    btn.addEventListener('click', (e) => {
      placeBet(e.target.dataset.position);
    });
  });

  // Resetear contador de fichas
  state.currentBets = [];
  updateTokensDisplay();
}

let currentBets = [];

function placeBet(position) {
  if (currentBets.length >= 2) {
    alert('Solo puedes hacer 2 apuestas por ronda');
    return;
  }

  currentBets.push({
    position,
    amount: 1,
    pokerChips: 0
  });

  updateTokensDisplay();
  updateBetsDisplay();
}

function updateTokensDisplay() {
  document.getElementById('tokens-count').textContent = 2 - currentBets.length;
  
  const submitBtn = document.getElementById('btn-submit-bets');
  submitBtn.disabled = currentBets.length === 0;
}

function updateBetsDisplay() {
  // Resaltar opciones apostadas
  document.querySelectorAll('.answer-option').forEach(option => {
    option.classList.remove('bet-placed');
  });

  currentBets.forEach(bet => {
    const option = document.querySelector(`[data-position="${bet.position}"]`);
    if (option) {
      option.classList.add('bet-placed');
    }
  });
}

function submitBets() {
  if (currentBets.length === 0) {
    alert('Debes hacer al menos una apuesta');
    return;
  }

  state.socket.emit('player:placeBet', {
    code: state.roomCode,
    playerId: state.playerId,
    bets: currentBets
  }, (response) => {
    if (!response.success) {
      alert('Error: ' + response.error);
      return;
    }

    showWaitingScreen('Esperando resultados...');
  });
}

function showResultsScreen(data) {
  hideAllPlayerSections();
  
  const resultsScreen = document.getElementById('results-screen');
  resultsScreen.classList.remove('hidden');

  const resultsInfo = document.getElementById('results-info');
  resultsInfo.innerHTML = `
    <div class="result-correct">
      <strong>Respuesta Correcta:</strong> ${data.correctAnswer}
    </div>
    ${data.allTooHigh ? 
      '<div class="result-all-high">⚠️ Todas las respuestas fueron muy altas</div>' :
      `<div class="result-winning">
        <strong>Respuesta Ganadora:</strong> ${data.winningAnswer}
      </div>`
    }
    ${data.trivia ? `<div class="result-trivia">💡 ${data.trivia}</div>` : ''}
  `;

  // Actualizar dinero del jugador
  const playerData = data.players.find(p => p.id === state.playerId);
  if (playerData) {
    document.getElementById('player-money').textContent = playerData.money;
  }

  // Mostrar si ganó algo
  const playerWon = data.winners.find(w => w.id === state.playerId);
  const playerResult = document.getElementById('player-result');
  
  if (playerWon) {
    playerResult.innerHTML = `
      <div class="win-badge">🎉 ¡Ganaste!</div>
      <div class="win-amount">+$${playerWon.bonus}</div>
    `;
    playerResult.className = 'player-result-card winner';
  } else {
    playerResult.innerHTML = `
      <div class="neutral-message">Mejor suerte en la próxima ronda</div>
    `;
    playerResult.className = 'player-result-card';
  }
}

function showGameEndScreen(data) {
  hideAllPlayerSections();
  
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="game-end-screen">
      <h1 class="game-end-title">🏆 Juego Terminado</h1>
      
      <div class="winner-card">
        <div class="winner-label">Ganador</div>
        <div class="winner-name">${data.winner.name}</div>
        <div class="winner-money">💰 $${data.winner.money}</div>
      </div>

      <div class="rankings">
        <h3>📊 Clasificación Final</h3>
        ${data.rankings.map((player, index) => `
          <div class="ranking-item">
            <span class="rank">${index + 1}°</span>
            <span class="player">${player.name}</span>
            <span class="money">$${player.money}</span>
          </div>
        `).join('')}
      </div>

      <button class="btn btn-primary" onclick="location.reload()">
        Volver al Inicio
      </button>
    </div>
  `;
}

function showWaitingScreen(message) {
  hideAllPlayerSections();
  
  const waitingScreen = document.getElementById('waiting-screen');
  waitingScreen.classList.remove('hidden');
  waitingScreen.querySelector('p').textContent = message;
}

function hideAllPlayerSections() {
  document.querySelectorAll('.player-section').forEach(section => {
    section.classList.add('hidden');
  });
}

function getOddsText(position) {
  const oddsMap = {
    '6to1-all-high': '6 a 1',
    '5to1-red': '5 a 1',
    '5to1-black': '5 a 1',
    '4to1-red': '4 a 1',
    '4to1-black': '4 a 1',
    '3to1-red': '3 a 1',
    '3to1-black': '3 a 1',
    '2to1-green': '2 a 1'
  };
  return oddsMap[position] || '';
}

// CSS adicional para jugador
const playerStyles = `
<style>
.player-screen {
  min-height: 100vh;
  padding-bottom: 2rem;
}

.player-header {
  background: var(--card-bg);
  padding: 1rem;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

.player-info-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.player-name-display {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--primary-color);
}

.room-code-small {
  font-size: 0.9rem;
  color: #999;
}

.player-money {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--success-color);
}

.player-section {
  padding: 1.5rem;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

.player-section.hidden {
  display: none;
}

.waiting-content {
  text-align: center;
  padding: 4rem 1rem;
}

.loading-dots {
  font-size: 2rem;
  color: var(--primary-color);
}

.loading-dots span {
  animation: bounce 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
}

.question-card {
  background: var(--card-bg);
  border-radius: var(--border-radius);
  padding: 2rem;
}

.round-badge {
  background: var(--primary-color);
  color: var(--text-dark);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  display: inline-block;
  font-weight: bold;
  margin-bottom: 1rem;
}

.question-text {
  font-size: 1.3rem;
  font-weight: bold;
  margin: 1.5rem 0;
  line-height: 1.6;
}

.question-category {
  color: #999;
  margin-bottom: 2rem;
}

.answer-form {
  margin-top: 2rem;
}

.answer-form label {
  display: block;
  margin-bottom: 0.5rem;
  color: #ccc;
}

.answer-form input {
  width: 100%;
  padding: 1rem;
  font-size: 1.2rem;
  border: 2px solid #4a4a4a;
  border-radius: 8px;
  background: #1a1a1a;
  color: var(--text-light);
  margin-bottom: 0.5rem;
}

.answer-unit {
  display: block;
  color: #999;
  margin-bottom: 1rem;
}

.answers-display {
  margin-bottom: 2rem;
}

.answers-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.answer-option {
  background: var(--card-bg);
  border: 2px solid #4a4a4a;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: var(--transition);
}

.answer-option.bet-placed {
  border-color: var(--primary-color);
  background: rgba(212, 175, 55, 0.1);
}

.answer-value {
  font-size: 1.2rem;
  font-weight: bold;
}

.answer-player {
  color: #999;
  font-size: 0.9rem;
}

.answer-odds {
  color: var(--primary-color);
  font-weight: bold;
}

.btn-bet-token {
  padding: 0.5rem 1rem;
  background: var(--primary-color);
  color: var(--text-dark);
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: var(--transition);
}

.btn-bet-token:hover {
  transform: scale(1.05);
}

.betting-controls {
  position: sticky;
  bottom: 0;
  background: var(--dark-bg);
  padding: 1rem;
  border-radius: var(--border-radius);
  box-shadow: 0 -4px 10px rgba(0,0,0,0.3);
}

.tokens-available {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.results-content {
  text-align: center;
}

.result-correct,
.result-winning {
  background: var(--card-bg);
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
}

.result-all-high {
  background: var(--danger-color);
  color: white;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
}

.result-trivia {
  background: rgba(212, 175, 55, 0.2);
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  font-style: italic;
}

.player-result-card {
  margin-top: 2rem;
  padding: 2rem;
  border-radius: var(--border-radius);
  background: var(--card-bg);
}

.player-result-card.winner {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
}

.win-badge {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.win-amount {
  font-size: 2rem;
  font-weight: bold;
  color: var(--primary-color);
}

.game-end-screen {
  padding: 2rem;
  text-align: center;
}

.game-end-title {
  font-size: 2.5rem;
  color: var(--primary-color);
  margin-bottom: 2rem;
}

.winner-card {
  background: linear-gradient(135deg, var(--primary-color) 0%, #b8941f 100%);
  color: var(--text-dark);
  padding: 2rem;
  border-radius: var(--border-radius);
  margin-bottom: 2rem;
}

.winner-name {
  font-size: 2rem;
  font-weight: bold;
  margin: 1rem 0;
}

.winner-money {
  font-size: 1.5rem;
}

.rankings {
  background: var(--card-bg);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.ranking-item {
  display: flex;
  justify-content: space-between;
  padding: 0.8rem;
  border-bottom: 1px solid #4a4a4a;
}

.ranking-item:last-child {
  border-bottom: none;
}

.rank {
  font-weight: bold;
  color: var(--primary-color);
  width: 40px;
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', playerStyles);

window.showPlayerScreen = showPlayerScreen;
window.showQuestionScreen = showQuestionScreen;
window.showBettingScreen = showBettingScreen;
window.showResultsScreen = showResultsScreen;
window.showGameEndScreen = showGameEndScreen;
