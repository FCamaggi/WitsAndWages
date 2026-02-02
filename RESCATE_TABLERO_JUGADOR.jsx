/**
 * TABLERO DE JUGADORES - WITS & WAGERS VEGAS
 * Este componente funciona perfectamente - NO MODIFICAR
 * Rescatado el 28 de enero de 2026
 */

// ==================== ESTRUCTURA HTML ====================

const PlayerBoardHTML = () => `
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
`;

// ==================== FUNCIÓN DE RENDERIZADO ====================

function renderMiniBettingBoard(data) {
  const grid = document.getElementById('mini-board-grid');
  if (!grid) return;

  console.log('🎨 Renderizando mini tablero del jugador...');
  console.log('📦 Data recibida:', data);
  console.log('📋 Answers:', data.answers);
  console.log('🚫 Blockers:', data.blockers);

  // Posiciones del tablero
  const positions = [
    {
      id: '6to1-all-high',
      odds: '6:1',
      label: 'TODAS ALTAS',
      color: 'all-high',
    },
    { id: '5to1-red', odds: '5:1', label: '', color: 'red' },
    { id: '4to1-red', odds: '4:1', label: '', color: 'red' },
    { id: '3to1-red', odds: '3:1', label: '', color: 'red' },
    { id: '2to1-green', odds: '2:1', label: '', color: 'green' },
    { id: '3to1-black', odds: '3:1', label: '', color: 'black' },
    { id: '4to1-black', odds: '4:1', label: '', color: 'black' },
    { id: '5to1-black', odds: '5:1', label: '', color: 'black' },
  ];

  const answersMap = {};
  if (data.answers) {
    console.log('Respuestas recibidas:', data.answers);
    data.answers.forEach((answer) => {
      if (
        answer &&
        answer.position &&
        answer.value !== null &&
        answer.value !== undefined
      ) {
        answersMap[answer.position] = answer;
      }
    });
  }

  console.log('Mapa de respuestas:', answersMap);
  console.log('Bloqueadores:', data.blockers);

  grid.innerHTML = positions
    .map((pos) => {
      const answer = answersMap[pos.id];
      const isBlocked =
        data.blockers && data.blockers.some((b) => b.position === pos.id);

      return `
      <div class="mini-bet-space ${pos.color} ${isBlocked ? 'blocked' : ''}" 
           data-position="${pos.id}"
           ${isBlocked ? '' : 'style="cursor: pointer;"'}>
        <div class="mini-odds">${pos.odds}</div>
        ${pos.label ? `<div class="mini-label">${pos.label}</div>` : ''}
        ${
          answer && answer.value !== undefined
            ? `
          <div class="mini-answer-value">${answer.value}</div>
          <div class="mini-answer-player">${answer.playerName || ''}</div>
        `
            : ''
        }
        <div class="mini-bet-indicator" id="indicator-${pos.id}"></div>
        ${isBlocked ? '<div class="blocked-icon">🚫</div>' : ''}
      </div>
    `;
    })
    .join('');
}

// ==================== VISUAL DE FICHAS ====================

function updateBetsVisualDisplay() {
  // Actualizar indicadores en el tablero
  document.querySelectorAll('.mini-bet-indicator').forEach((indicator) => {
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
}

// ==================== ESTILOS CSS ====================

const PlayerBoardStyles = `
/* Tablero de Apuestas del Jugador */

.player-betting-board {
  background: var(--bg-dark);
  border-radius: 12px;
  padding: 1rem;
  margin: 1rem 0;
}

.mini-board-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 1rem;
}

.mini-bet-space {
  aspect-ratio: 1;
  border-radius: 8px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.mini-bet-space:hover:not(.blocked) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
}

.mini-bet-space.all-high {
  background: linear-gradient(135deg, #ffd700 0%, #d4af37 100%);
  grid-column: span 4;
  aspect-ratio: 4;
}

.mini-bet-space.red {
  background: linear-gradient(135deg, #ff6b6b 0%, #c92a2a 100%);
}

.mini-bet-space.green {
  background: linear-gradient(135deg, #51cf66 0%, #2f9e44 100%);
  grid-column: span 4;
  aspect-ratio: 4;
}

.mini-bet-space.black {
  background: linear-gradient(135deg, #495057 0%, #212529 100%);
}

.mini-bet-space.blocked {
  opacity: 0.5;
  cursor: not-allowed;
}

.mini-odds {
  font-size: 0.9rem;
  font-weight: bold;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.mini-label {
  font-size: 0.7rem;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.9);
  text-transform: uppercase;
  margin: 2px 0;
}

.mini-answer-value {
  font-size: 1rem;
  font-weight: bold;
  color: white;
  margin-top: 4px;
}

.mini-answer-player {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 2px;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mini-bet-indicator {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 20px;
  min-height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mini-bet-indicator.has-bet {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  padding: 2px;
}

.blocked-icon {
  position: absolute;
  font-size: 2rem;
  opacity: 0.8;
}

.mini-board-special {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.mini-special-bet {
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.mini-special-bet:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
}

.mini-special-bet.red-special {
  background: linear-gradient(135deg, #ff6b6b 0%, #c92a2a 100%);
}

.mini-special-bet.black-special {
  background: linear-gradient(135deg, #495057 0%, #212529 100%);
}

.mini-special-title {
  font-size: 0.85rem;
  font-weight: bold;
  color: white;
  margin-bottom: 4px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.mini-special-desc {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.9);
}

.visual-chip {
  animation: chipAppear 0.3s ease-out;
}

@keyframes chipAppear {
  from {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  to {
    transform: scale(1) rotate(360deg);
    opacity: 1;
  }
}

/* Header de apuestas */
.player-betting-header {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: var(--card-bg);
  border-radius: 8px;
}

.money-info, .tokens-info {
  text-align: center;
}

.money-label, .tokens-label {
  font-size: 0.85rem;
  color: #999;
  margin-bottom: 4px;
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

/* Lista de apuestas actuales */
.current-bets-display {
  background: var(--card-bg);
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
}

.current-bets-title {
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: var(--primary-color);
}

.current-bet-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--bg-dark);
  border-radius: 6px;
  margin-bottom: 0.5rem;
}

.current-bet-name {
  font-weight: bold;
}

.current-bet-details {
  font-size: 0.85rem;
  color: #999;
}

.bet-odds {
  color: var(--primary-color);
}

.btn-remove-bet {
  background: var(--danger-color);
  color: white;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s ease;
}

.btn-remove-bet:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
}

.no-bets {
  text-align: center;
  color: #666;
  padding: 1rem;
  font-style: italic;
}

/* Responsive */
@media (max-width: 480px) {
  .mini-board-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
  }
  
  .mini-odds {
    font-size: 0.75rem;
  }
  
  .mini-answer-value {
    font-size: 0.85rem;
  }
  
  .visual-chip {
    width: 24px;
    height: 24px;
  }
}
`;

// ==================== EXPORTS ====================

export {
  PlayerBoardHTML,
  renderMiniBettingBoard,
  updateBetsVisualDisplay,
  PlayerBoardStyles,
};
