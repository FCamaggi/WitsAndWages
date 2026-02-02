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

  // Inicializar helper de orientación
  if (window.OrientationHelper) {
    OrientationHelper.init();
  }
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

  // Desactivar ayuda de orientación durante preguntas
  if (window.OrientationHelper) {
    OrientationHelper.disable();
  }

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
    NotificationSystem.error('Por favor ingresa un número válido');
    return;
  }

  state.socket.emit('player:submitAnswer', {
    code: state.roomCode,
    playerId: state.playerId,
    answer
  }, (response) => {
    if (!response.success) {
      NotificationSystem.error('Error: ' + response.error);
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

  // Guardar datos para uso posterior
  state.lastBettingData = data;

  // Activar ayuda de orientación para la fase de apuestas (donde el tablero es importante)
  if (window.OrientationHelper) {
    OrientationHelper.enable();
  }

  // Obtener dinero actual del jugador
  const currentMoney = parseInt(document.getElementById('player-money').textContent) || 0;
  const isFirstRound = state.currentRound === 1;

  console.log('Datos recibidos para apuestas:', data);

  // Renderizar tablero interactivo de apuestas
  const answersDisplay = document.getElementById('answers-display');
  answersDisplay.innerHTML = `
    <div class="player-betting-header">
      <div class="money-info">
        <div class="money-label">💰 Dinero disponible</div>
        <div class="money-amount">$${currentMoney}</div>
      </div>
      <div class="tokens-info">
        <div class="tokens-label">🎰 Fichas de apuesta</div>
        <div class="tokens-remaining" id="tokens-remaining">2 / 2</div>
      </div>
    </div>

    ${!isFirstRound && currentMoney > 0 ? `
      <div class="betting-tip">
        <span class="tip-icon">💡</span>
        <span>Puedes agregar fichas de póquer para aumentar tus ganancias (con riesgo de perderlas)</span>
      </div>
    ` : ''}

    <div class="player-betting-board">
      <div class="mini-board-grid" id="mini-board-grid"></div>
      <div class="mini-board-special">
        <div class="mini-special-bet red-special" data-position="1to1-red">
          <div class="mini-special-title">ROJO 1 a 1</div>
          <div class="mini-special-desc">Gana ROJO</div>
          <div class="mini-bet-indicator" id="indicator-1to1-red"></div>
        </div>
        <div class="mini-special-bet black-special" data-position="1to1-black">
          <div class="mini-special-title">NEGRO 1 a 1</div>
          <div class="mini-special-desc">Gana NEGRO</div>
          <div class="mini-bet-indicator" id="indicator-1to1-black"></div>
        </div>
      </div>
    </div>

    <div class="current-bets-display" id="current-bets-display">
      <div class="current-bets-title">Tus apuestas:</div>
      <div class="current-bets-list" id="current-bets-list">
        <div class="no-bets">Sin apuestas aún</div>
      </div>
    </div>
  `;

  // Guardar data globalmente
  currentBettingData = data;

  // Renderizar tablero miniatura con respuestas
  renderMiniBettingBoard(data);

  // Event listeners para las casillas del tablero
  document.querySelectorAll('.mini-bet-space, .mini-special-bet').forEach(space => {
    space.addEventListener('click', (e) => {
      const position = e.currentTarget.dataset.position;
      if (position) {
        showBetModal(position);
      }
    });
  });

  // Resetear apuestas actuales
  currentBets = [];
  updateBetsVisualDisplay();
}

function renderMiniBettingBoard(data) {
  const grid = document.getElementById('mini-board-grid');
  if (!grid) return;

  console.log('🎨 Renderizando mini tablero del jugador...');
  console.log('📦 Data recibida:', data);
  console.log('📋 Answers:', data.answers);
  console.log('🚫 Blockers:', data.blockers);

  // Posiciones del tablero
  const positions = [
    { id: '6to1-all-high', odds: '6:1', label: 'TODAS ALTAS', color: 'all-high' },
    { id: '5to1-red', odds: '5:1', label: '', color: 'red' },
    { id: '4to1-red', odds: '4:1', label: '', color: 'red' },
    { id: '3to1-red', odds: '3:1', label: '', color: 'red' },
    { id: '2to1-green', odds: '2:1', label: '', color: 'green' },
    { id: '3to1-black', odds: '3:1', label: '', color: 'black' },
    { id: '4to1-black', odds: '4:1', label: '', color: 'black' },
    { id: '5to1-black', odds: '5:1', label: '', color: 'black' }
  ];

  const answersMap = {};
  if (data.answers) {
    console.log('Respuestas recibidas:', data.answers);
    data.answers.forEach(answer => {
      if (answer && answer.position && answer.value !== null && answer.value !== undefined) {
        answersMap[answer.position] = answer;
      }
    });
  }

  console.log('Mapa de respuestas:', answersMap);
  console.log('Bloqueadores:', data.blockers);

  grid.innerHTML = positions.map(pos => {
    const answer = answersMap[pos.id];
    const isBlocked = data.blockers && data.blockers.some(b => b.position === pos.id);

    return `
      <div class="mini-bet-space ${pos.color} ${isBlocked ? 'blocked' : ''}" 
           data-position="${pos.id}"
           ${isBlocked ? '' : 'style="cursor: pointer;"'}>
        <div class="mini-odds">${pos.odds}</div>
        ${pos.label ? `<div class="mini-label">${pos.label}</div>` : ''}
        ${answer && answer.value !== undefined ? `
          <div class="mini-answer-value">${answer.value}</div>
          <div class="mini-answer-player">${answer.playerName || ''}</div>
        ` : ''}
        <div class="mini-bet-indicator" id="indicator-${pos.id}"></div>
        ${isBlocked ? '<div class="blocked-icon">🚫</div>' : ''}
      </div>
    `;
  }).join('');
}

let currentBets = [];

function showBetModal(position, data) {
  if (currentBets.length >= 2) {
    NotificationSystem.warning('Solo puedes hacer 2 apuestas por ronda');
    return;
  }

  // Validar que la posición tenga respuesta (excepto espacios especiales)
  const isSpecialSpace = position === '6to1-all-high' || position === '1to1-red' || position === '1to1-black';

  console.log('🔍 Es espacio especial?', isSpecialSpace);

  if (!isSpecialSpace) {
    const hasAnswer = data.answers && data.answers.some(a =>
      a && a.position === position && a.value !== null && a.value !== undefined
    );

    console.log('✅ Tiene respuesta en posición ' + position + '?', hasAnswer);
    console.log('📝 Respuestas filtradas para posición:', data.answers.filter(a => a.position === position));

    if (!hasAnswer) {
      NotificationSystem.warning('No puedes apostar en una casilla sin respuesta');
      return;
    }
  }

  // Nota: Según el manual, SÍ se pueden poner las 2 fichas en la misma posición

  const currentMoney = parseInt(document.getElementById('player-money').textContent) || 0;
  const isFirstRound = state.currentRound === 1;

  // Obtener info de la posición
  const positionInfo = getPositionInfo(position, data);

  // Crear modal para agregar fichas de póquer
  const modal = document.createElement('div');
  modal.className = 'bet-modal';
  modal.innerHTML = `
    <div class="bet-modal-content">
      <h3>Realizar Apuesta</h3>
      <div class="bet-position-info">
        <div class="bet-position-name">${positionInfo.name}</div>
        ${positionInfo.value ? `<div class="bet-position-value">Respuesta: ${positionInfo.value}</div>` : ''}
        ${positionInfo.player ? `<div class="bet-position-player">Jugador: ${positionInfo.player}</div>` : ''}
        <div class="bet-position-odds">Paga ${positionInfo.odds}</div>
      </div>
      
      <div class="bet-form">
        <div class="bet-token-info">
          <label>✓ 1 Ficha de Apuesta (obligatoria)</label>
        </div>
        
        ${!isFirstRound && currentMoney > 0 ? `
          <div class="poker-chips-input">
            <label for="poker-chips">Fichas de Póquer adicionales (opcional):</label>
            <input 
              type="number" 
              id="poker-chips" 
              min="0" 
              max="${currentMoney}" 
              value="0"
              placeholder="0"
            />
            <small>Disponible: $${currentMoney}</small>
            <small class="warning-text">⚠️ Si pierdes, estas fichas se perderán</small>
          </div>
        ` : `
          <div class="first-round-info">
            <small>En la primera ronda solo puedes apostar tus fichas de apuesta.</small>
            <small>Desde la ronda 2 podrás agregar fichas de póquer.</small>
          </div>
        `}
        
        <div class="bet-modal-buttons">
          <button class="btn btn-secondary btn-modal" onclick="closeBetModal()">Cancelar</button>
          <button class="btn btn-primary btn-modal" onclick="confirmBet('${position}')">Confirmar</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

function getPositionInfo(position, data) {
  const oddsMap = {
    '6to1-all-high': { name: 'Todas muy altas', odds: '6 a 1' },
    '5to1-red': { name: 'Casilla Roja', odds: '5 a 1' },
    '4to1-red': { name: 'Casilla Roja', odds: '4 a 1' },
    '3to1-red': { name: 'Casilla Roja', odds: '3 a 1' },
    '2to1-green': { name: 'Casilla Verde', odds: '2 a 1' },
    '3to1-black': { name: 'Casilla Negra', odds: '3 a 1' },
    '4to1-black': { name: 'Casilla Negra', odds: '4 a 1' },
    '5to1-black': { name: 'Casilla Negra', odds: '5 a 1' },
    '1to1-red': { name: 'Rojo 1 a 1', odds: '1 a 1 (gana ROJO)' },
    '1to1-black': { name: 'Negro 1 a 1', odds: '1 a 1 (gana NEGRO)' }
  };

  const info = oddsMap[position] || { name: 'Posición desconocida', odds: '?' };

  // Buscar respuesta en esta posición
  if (data && data.answers) {
    const answer = data.answers.find(a => a.position === position);
    if (answer) {
      info.value = answer.value;
      info.player = answer.playerName;
    }
  }

  return info;
}

function closeBetModal() {
  const modal = document.querySelector('.bet-modal');
  if (modal) modal.remove();
}

function confirmBet(position) {
  const pokerChipsInput = document.getElementById('poker-chips');
  const pokerChips = pokerChipsInput ? parseInt(pokerChipsInput.value) || 0 : 0;
  const currentMoney = parseInt(document.getElementById('player-money').textContent) || 0;

  if (pokerChips > currentMoney) {
    NotificationSystem.error('No tienes suficiente dinero');
    return;
  }

  currentBets.push({
    position,
    amount: 1,
    pokerChips
  });

  closeBetModal();
  updateBetsVisualDisplay();
  NotificationSystem.success('Apuesta realizada');
}

function updateBetsVisualDisplay() {
  // Actualizar contador de fichas
  const tokensRemaining = document.getElementById('tokens-remaining');
  if (tokensRemaining) {
    tokensRemaining.textContent = `${2 - currentBets.length} / 2`;
  }

  // Actualizar indicadores en el tablero
  document.querySelectorAll('.mini-bet-indicator').forEach(indicator => {
    indicator.innerHTML = '';
    indicator.classList.remove('has-bet');
  });

  currentBets.forEach((bet, betIndex) => {
    const indicator = document.getElementById(`indicator-${bet.position}`);
    if (indicator) {
      indicator.classList.add('has-bet');

      // Crear ficha visual realista
      const chipDiv = document.createElement('div');
      chipDiv.className = 'visual-chip';
      chipDiv.style.cssText = `
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: radial-gradient(circle at 30% 30%, #ffd700, #d4af37, #b8941f);
        border: 3px solid #fff;
        box-shadow: 
          0 2px 4px rgba(0, 0, 0, 0.6),
          inset 0 2px 3px rgba(255, 255, 255, 0.4),
          inset 0 -2px 3px rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 900;
        font-size: 0.75rem;
        color: #000;
        text-shadow: 0 1px 1px rgba(255, 255, 255, 0.5);
        position: relative;
        margin: 2px;
      `;

      // Círculo interior punteado
      const innerCircle = document.createElement('div');
      innerCircle.style.cssText = `
        position: absolute;
        top: 3px;
        left: 3px;
        right: 3px;
        bottom: 3px;
        border: 2px dashed rgba(255, 255, 255, 0.7);
        border-radius: 50%;
      `;
      chipDiv.appendChild(innerCircle);

      // Valor de la ficha
      const value = document.createElement('span');
      value.textContent = bet.pokerChips > 0 ? `$${bet.pokerChips}` : '1';
      value.style.cssText = 'position: relative; z-index: 1;';
      chipDiv.appendChild(value);

      indicator.appendChild(chipDiv);
    }
  });

  // Actualizar lista de apuestas actuales
  const betsList = document.getElementById('current-bets-list');
  if (betsList) {
    if (currentBets.length === 0) {
      betsList.innerHTML = '<div class="no-bets">Sin apuestas aún</div>';
    } else {
      betsList.innerHTML = currentBets.map((bet, index) => {
        const posInfo = getPositionInfo(bet.position, state.lastBettingData);
        return `
          <div class="current-bet-item">
            <div class="current-bet-info">
              <div class="current-bet-name">${posInfo.name}</div>
              <div class="current-bet-details">
                1 ficha${bet.pokerChips > 0 ? ` + $${bet.pokerChips}` : ''} 
                <span class="bet-odds">(${posInfo.odds})</span>
              </div>
            </div>
            <button class="btn-remove-bet" onclick="removeBet(${index})">✕</button>
          </div>
        `;
      }).join('');
    }
  }

  // Actualizar botón de confirmar
  const submitBtn = document.getElementById('btn-submit-bets');
  if (submitBtn) {
    submitBtn.disabled = currentBets.length === 0;
    if (currentBets.length > 0) {
      submitBtn.textContent = `Confirmar ${currentBets.length} apuesta${currentBets.length > 1 ? 's' : ''}`;
    } else {
      submitBtn.textContent = 'Confirmar Apuestas';
    }
  }
}

function removeBet(index) {
  currentBets.splice(index, 1);
  updateBetsVisualDisplay();
  NotificationSystem.info('Apuesta removida');
}

function submitBets() {
  if (currentBets.length === 0) {
    NotificationSystem.warning('Debes hacer al menos una apuesta');
    return;
  }

  state.socket.emit('player:placeBet', {
    code: state.roomCode,
    playerId: state.playerId,
    bets: currentBets
  }, (response) => {
    if (!response.success) {
      NotificationSystem.error('Error: ' + response.error);
      return;
    }

    showWaitingScreen('Esperando resultados...');
  });
}

function showResultsScreen(data) {
  hideAllPlayerSections();

  const resultsScreen = document.getElementById('results-screen');
  resultsScreen.classList.remove('hidden');

  // Desactivar ayuda de orientación en resultados
  if (window.OrientationHelper) {
    OrientationHelper.disable();
  }

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

  // Calcular ganancias/pérdidas del jugador
  const playerData = data.players.find(p => p.id === state.playerId);
  const previousMoney = parseInt(document.getElementById('player-money').textContent) || 0;
  const currentMoney = playerData ? playerData.money : previousMoney;
  const difference = currentMoney - previousMoney;

  // Actualizar dinero del jugador
  if (playerData) {
    document.getElementById('player-money').textContent = playerData.money;
  }

  // Mostrar si ganó algo
  const playerWon = data.winners.find(w => w.id === state.playerId);
  const playerResult = document.getElementById('player-result');

  if (playerWon) {
    playerResult.innerHTML = `
      <div class="win-badge">🎉 ¡Respuesta Ganadora!</div>
      <div class="win-amount">+$${playerWon.bonus} (Bono)</div>
    `;
    playerResult.className = 'player-result-card winner';
  } else {
    playerResult.innerHTML = `
      <div class="neutral-message">No acertaste la respuesta ganadora</div>
    `;
    playerResult.className = 'player-result-card';
  }

  // Agregar información de apuestas
  if (difference > 0) {
    const betWinnings = document.createElement('div');
    betWinnings.className = 'bet-winnings';
    betWinnings.innerHTML = `
            <div class="win-badge">💰 ¡Apuestas Ganadoras!</div>
            <div class="win-amount">+$${difference}${playerWon ? ' (Total con bono)' : ''}</div>
        `;
    playerResult.appendChild(betWinnings);
  } else if (difference < 0) {
    const betLoss = document.createElement('div');
    betLoss.className = 'bet-loss';
    betLoss.innerHTML = `
            <div class="loss-badge">❌ Fichas de Póquer Perdidas</div>
            <div class="loss-amount">-$${Math.abs(difference)}</div>
            <div class="loss-message">Tus apuestas no ganaron y perdiste las fichas de póquer apostadas</div>
        `;
    playerResult.appendChild(betLoss);
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

  // Desactivar ayuda de orientación en pantallas de espera
  if (window.OrientationHelper) {
    OrientationHelper.disable();
  }
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

.bet-winnings {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(40, 167, 69, 0.2);
  border-radius: 8px;
}

.bet-loss {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(220, 53, 69, 0.2);
  border: 2px solid var(--danger-color);
  border-radius: 8px;
}

.loss-badge {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--danger-color);
  margin-bottom: 0.5rem;
}

.loss-amount {
  font-size: 1.8rem;
  font-weight: bold;
  color: var(--danger-color);
  margin: 0.5rem 0;
}

.loss-message {
  font-size: 0.9rem;
  color: #ccc;
  margin-top: 0.5rem;
  font-style: italic;
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

/* Estilos para modal de apuestas */
.bet-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.bet-modal-content {
  background: var(--card-bg);
  border-radius: var(--border-radius);
  padding: 2rem;
  max-width: 450px;
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;
}

.bet-modal-content h3 {
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.bet-form {
  margin-top: 1.5rem;
}

.bet-token-info {
  background: rgba(40, 167, 69, 0.1);
  border: 2px solid var(--success-color);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.bet-token-info label {
  color: var(--success-color);
  font-weight: bold;
  display: block;
}

.poker-chips-input {
  background: rgba(220, 53, 69, 0.1);
  border: 2px solid var(--danger-color);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.poker-chips-input label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.poker-chips-input input {
  width: 100%;
  padding: 0.75rem;
  font-size: 1.2rem;
  border: 2px solid #4a4a4a;
  border-radius: 8px;
  background: #1a1a1a;
  color: var(--text-light);
  margin-bottom: 0.5rem;
}

.poker-chips-input small {
  display: block;
  margin-top: 0.3rem;
  color: #999;
}

.first-round-info {
  background: rgba(255, 193, 7, 0.1);
  border: 2px solid #ffc107;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.first-round-info small {
  display: block;
  margin-top: 0.3rem;
  color: #ffc107;
}

.bet-modal-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

.bet-modal-buttons button {
  flex: 1;
  min-width: 100px;
  word-wrap: break-word;
}

.bet-badge {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: rgba(212, 175, 55, 0.2);
  border-radius: 6px;
  font-size: 0.85rem;
}

.bet-badge span {
  display: block;
  margin: 0.2rem 0;
}

.answer-info {
  flex: 1;
}

.money-info {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

/* Estilos para tablero interactivo de jugador */
.player-betting-header {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.money-info,
.tokens-info {
  background: var(--card-bg);
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
}

.money-label,
.tokens-label {
  font-size: 0.9rem;
  color: #999;
  margin-bottom: 0.3rem;
}

.money-amount {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--success-color);
}

.tokens-remaining {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color);
}

.betting-tip {
  background: rgba(255, 193, 7, 0.1);
  border-left: 4px solid #ffc107;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #ffc107;
}

.tip-icon {
  font-size: 1.2rem;
}

/* Tablero miniatura para jugador */
.player-betting-board {
  background: linear-gradient(135deg, #1a6b2e 0%, #0d3d1a 100%);
  border: 4px solid var(--primary-color);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.mini-board-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0.4rem;
  margin-bottom: 0.5rem;
}

.mini-bet-space {
  aspect-ratio: 3/4;
  border: 3px solid;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 0.4rem 0.2rem;
  position: relative;
  transition: all 0.2s ease;
  font-size: 0.75rem;
  min-height: 100px;
}

.mini-bet-space:not(.blocked) {
  cursor: pointer;
}

.mini-bet-space:not(.blocked):active {
  transform: scale(0.95);
}

.mini-bet-space.red {
  background: linear-gradient(135deg, #dc143c 0%, #8b0000 100%);
  border-color: #ffd700;
  color: white;
}

.mini-bet-space.green {
  background: linear-gradient(135deg, #32cd32 0%, #228b22 100%);
  border-color: #ffd700;
  color: white;
}

.mini-bet-space.black {
  background: linear-gradient(135deg, #2a2a2a 0%, #000 100%);
  border-color: #ffd700;
  color: white;
}

.mini-bet-space.all-high {
  background: linear-gradient(135deg, #ffd700 0%, #ffa500 100%);
  border-color: #8b0000;
  color: #000;
  font-weight: bold;
}

.mini-bet-space.blocked {
  background: repeating-linear-gradient(
    45deg,
    #666,
    #666 8px,
    #444 8px,
    #444 16px
  );
  opacity: 0.5;
  cursor: not-allowed;
}

.blocked-icon {
  position: absolute;
  font-size: 2rem;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.mini-odds {
  font-weight: bold;
  font-size: 0.85rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.mini-label {
  font-size: 0.6rem;
  font-weight: bold;
  text-align: center;
}

.mini-answer-value {
  font-size: 1.1rem;
  font-weight: bold;
  text-shadow: 0 2px 3px rgba(0, 0, 0, 0.8);
  margin: auto 0;
}

.mini-answer-player {
  font-size: 0.65rem;
  opacity: 0.9;
  text-align: center;
  margin-top: 0.2rem;
}

.mini-bet-indicator {
  width: 100%;
  min-height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mini-bet-indicator.has-bet {
  background: rgba(212, 175, 55, 0.3);
  border-top: 2px solid var(--primary-color);
  border-radius: 4px;
}

.bet-chip-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
  font-size: 0.7rem;
  font-weight: bold;
}

.chip-count {
  color: var(--primary-color);
}

.poker-count {
  color: #ffc107;
  font-size: 0.65rem;
}

/* Apuestas especiales */
.mini-board-special {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0.4rem;
}

.mini-special-bet {
  padding: 0.75rem 0.5rem;
  border: 3px solid #ffd700;
  border-radius: 6px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.mini-special-bet:active {
  transform: scale(0.95);
}

.red-special {
  background: linear-gradient(135deg, #dc143c 0%, #8b0000 100%);
  color: white;
  grid-column: 2 / 5; /* Debajo de las 3 casillas rojas */
}

.black-special {
  background: linear-gradient(135deg, #2a2a2a 0%, #000 100%);
  color: white;
  grid-column: 6 / 9; /* Debajo de las 3 casillas negras */
}

.mini-special-title {
  font-size: 0.9rem;
  font-weight: bold;
  margin-bottom: 0.2rem;
}

.mini-special-desc {
  font-size: 0.65rem;
  opacity: 0.9;
  color: #ffd700;
}

/* Display de apuestas actuales */
.current-bets-display {
  background: var(--card-bg);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.current-bets-title {
  font-size: 1rem;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 0.75rem;
}

.current-bets-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.no-bets {
  text-align: center;
  color: #999;
  padding: 1rem;
  font-style: italic;
}

.current-bet-item {
  background: rgba(212, 175, 55, 0.1);
  border: 2px solid var(--primary-color);
  border-radius: 6px;
  padding: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  animation: slideInLeft 0.3s ease;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.current-bet-info {
  flex: 1;
}

.current-bet-name {
  font-weight: bold;
  margin-bottom: 0.2rem;
}

.current-bet-details {
  font-size: 0.85rem;
  color: #999;
}

.bet-odds {
  color: var(--primary-color);
  font-weight: bold;
}

.btn-remove-bet {
  background: var(--danger-color);
  color: white;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: bold;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-left: 0.5rem;
}

.btn-remove-bet:hover {
  background: #c82333;
  transform: scale(1.1);
}

/* Modal de apuesta mejorado */
.bet-position-info {
  background: rgba(212, 175, 55, 0.1);
  border: 2px solid var(--primary-color);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  text-align: center;
}

.bet-position-name {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 0.3rem;
}

.bet-position-value {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0.5rem 0;
}

.bet-position-player {
  font-size: 0.9rem;
  color: #999;
  margin-bottom: 0.3rem;
}

.bet-position-odds {
  font-size: 1rem;
  color: var(--success-color);
  font-weight: bold;
}

.btn-modal {
  padding: 0.7rem 1rem;
  font-size: 0.9rem;
}

.warning-text {
  color: var(--danger-color) !important;
}

/* Responsivo */
@media (max-width: 768px) {
  .mini-board-grid {
    grid-template-columns: repeat(8, 1fr);
    gap: 0.25rem;
  }
  
  .mini-bet-space {
    min-height: 70px;
    padding: 0.25rem 0.1rem;
    font-size: 0.65rem;
  }
  
  .mini-answer-value {
    font-size: 0.85rem;
  }
  
  .mini-odds {
    font-size: 0.7rem;
  }

  .player-betting-header {
    grid-template-columns: 1fr;
  }

  .bet-modal-buttons {
    flex-direction: column;
  }

  .bet-modal-buttons button {
    width: 100%;
  }
  
  .mini-board-special {
    grid-template-columns: repeat(8, 1fr);
  }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', playerStyles);

// Funciones globales
window.showPlayerScreen = showPlayerScreen;
window.showQuestionScreen = showQuestionScreen;
window.showBettingScreen = showBettingScreen;
window.showResultsScreen = showResultsScreen;
window.showGameEndScreen = showGameEndScreen;
window.closeBetModal = closeBetModal;
window.confirmBet = confirmBet;
window.removeBet = removeBet;
