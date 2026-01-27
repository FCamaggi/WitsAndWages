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
  // Cargar el tablero HTML existente
  fetch('/tablero.html')
    .then(response => response.text())
    .then(html => {
      const boardContainer = document.getElementById('board-container');
      if (boardContainer) {
        // Extraer solo el contenido del body
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        boardContainer.innerHTML = doc.body.innerHTML;
      }
    })
    .catch(error => {
      console.error('Error cargando tablero:', error);
    });
}

function startGame(excludedCategories) {
  state.socket.emit('host:startGame', { 
    code: state.roomCode,
    excludedCategories 
  }, (response) => {
    if (!response.success) {
      alert('Error iniciando juego: ' + response.error);
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
  });
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
</style>
`;

document.head.insertAdjacentHTML('beforeend', hostStyles);

window.showHostScreen = showHostScreen;
window.renderPlayersGrid = renderPlayersGrid;
window.updatePlayersList = updatePlayersList;
