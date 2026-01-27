// Configuración
const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://wits-and-wagers-backend.onrender.com'; // Actualizar con tu URL de Render

const SOCKET_URL = API_URL;

// Estado de la aplicación
const state = {
    socket: null,
    currentView: 'home',
    roomCode: null,
    playerId: null,
    playerName: null,
    role: null, // 'host' o 'player'
    room: null
};

// Inicializar aplicación
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 Wits & Wagers Vegas iniciado');
    initializeApp();
});

function initializeApp() {
    showHomeScreen();
    setupEventListeners();
}

function setupEventListeners() {
    // Botones principales
    document.getElementById('btn-create-room')?.addEventListener('click', showCreateRoomModal);
    document.getElementById('btn-join-room')?.addEventListener('click', showJoinRoomModal);
    document.getElementById('btn-manual')?.addEventListener('click', showManual);

    // Modales
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });

    // Formularios
    document.getElementById('form-create-room')?.addEventListener('submit', handleCreateRoom);
    document.getElementById('form-join-room')?.addEventListener('submit', handleJoinRoom);
}

// Pantallas
function showHomeScreen() {
    const app = document.getElementById('app');
    app.innerHTML = `
    <div class="home-screen">
      <div class="logo">🎰 WITS & WAGERS</div>
      <div class="subtitle">Vegas Edition</div>
      
      <div class="menu-buttons">
        <button id="btn-create-room" class="btn btn-primary">
          Crear Sala
        </button>
        <button id="btn-join-room" class="btn btn-secondary">
          Unirse a Sala
        </button>
        <button id="btn-manual" class="btn btn-tertiary">
          Manual de Juego
        </button>
      </div>
    </div>

    <!-- Modal Crear Sala -->
    <div id="modal-create-room" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Crear Sala</h2>
          <button class="close-btn">&times;</button>
        </div>
        <form id="form-create-room">
          <div class="form-group">
            <label>Configurar Categorías</label>
            <p style="color: #999; font-size: 0.9rem; margin-bottom: 1rem;">
              Selecciona las categorías que NO quieres incluir en el juego
            </p>
            <div id="categories-list"></div>
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%;">
            Crear Sala
          </button>
          <div class="error-message" id="create-room-error"></div>
        </form>
      </div>
    </div>

    <!-- Modal Unirse a Sala -->
    <div id="modal-join-room" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Unirse a Sala</h2>
          <button class="close-btn">&times;</button>
        </div>
        <form id="form-join-room">
          <div class="form-group">
            <label for="player-name">Tu Nombre</label>
            <input 
              type="text" 
              id="player-name" 
              placeholder="Ingresa tu nombre" 
              required
              maxlength="20"
            />
          </div>
          <div class="form-group">
            <label for="room-code">Código de Sala</label>
            <input 
              type="text" 
              id="room-code" 
              placeholder="Ejemplo: ABC123" 
              required
              maxlength="6"
              style="text-transform: uppercase;"
            />
          </div>
          <button type="submit" class="btn btn-secondary" style="width: 100%;">
            Unirse
          </button>
          <div class="error-message" id="join-room-error"></div>
        </form>
      </div>
    </div>
  `;

    state.currentView = 'home';
    setupEventListeners();
}

function showCreateRoomModal() {
    const modal = document.getElementById('modal-create-room');
    modal.classList.add('active');
    loadCategories();
}

function showJoinRoomModal() {
    const modal = document.getElementById('modal-join-room');
    modal.classList.add('active');
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

function showManual() {
    window.open('/manual.html', '_blank');
}

// Cargar categorías
async function loadCategories() {
    const categoriesList = document.getElementById('categories-list');
    categoriesList.innerHTML = '<div class="loading"></div>';

    try {
        // Conectar socket temporalmente para obtener categorías
        const tempSocket = io(SOCKET_URL);

        tempSocket.emit('host:getCategories', {}, (response) => {
            if (response.success) {
                renderCategories(response.categories);
            }
            tempSocket.disconnect();
        });
    } catch (error) {
        console.error('Error cargando categorías:', error);
        categoriesList.innerHTML = '<p style="color: var(--danger-color);">Error cargando categorías</p>';
    }
}

function renderCategories(categories) {
    const categoriesList = document.getElementById('categories-list');

    // Filtrar categorías que no son "Tarjeta X"
    const filteredCategories = categories.filter(cat =>
        !cat.id.startsWith('tarjeta_')
    );

    categoriesList.innerHTML = filteredCategories.map(cat => `
    <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.8rem; cursor: pointer;">
      <input 
        type="checkbox" 
        name="excluded-category" 
        value="${cat.id}"
        style="width: auto;"
      />
      <span>${cat.nombre} (${cat.totalPreguntas} preguntas)</span>
    </label>
  `).join('');
}

// Handlers
async function handleCreateRoom(e) {
    e.preventDefault();

    const errorDiv = document.getElementById('create-room-error');
    errorDiv.classList.remove('active');

    try {
        // Obtener categorías excluidas
        const excludedCategories = Array.from(
            document.querySelectorAll('input[name="excluded-category"]:checked')
        ).map(input => input.value);

        // Crear sala via API
        const hostId = `host_${Date.now()}`;
        const response = await fetch(`${API_URL}/api/rooms/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                hostId,
                hostSocketId: 'temp' // Se actualizará con socket
            })
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Error creando sala');
        }

        // Guardar estado
        state.roomCode = data.code;
        state.role = 'host';

        // Conectar socket
        connectSocket();

        // Ir a pantalla de host
        showHostScreen(excludedCategories);
        closeAllModals();

    } catch (error) {
        console.error('Error:', error);
        errorDiv.textContent = error.message;
        errorDiv.classList.add('active');
    }
}

async function handleJoinRoom(e) {
    e.preventDefault();

    const errorDiv = document.getElementById('join-room-error');
    errorDiv.classList.remove('active');

    const playerName = document.getElementById('player-name').value.trim();
    const roomCode = document.getElementById('room-code').value.trim().toUpperCase();

    if (!playerName || !roomCode) {
        errorDiv.textContent = 'Completa todos los campos';
        errorDiv.classList.add('active');
        return;
    }

    try {
        // Validar código de sala
        const response = await fetch(`${API_URL}/api/rooms/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: roomCode })
        });

        const data = await response.json();

        if (!data.valid) {
            throw new Error(data.error || 'Sala no válida');
        }

        // Guardar estado
        state.roomCode = roomCode;
        state.playerName = playerName;
        state.role = 'player';

        // Conectar socket
        connectSocket();

        // Unirse a la sala via socket
        state.socket.emit('player:join', {
            code: roomCode,
            playerName
        }, (response) => {
            if (!response.success) {
                errorDiv.textContent = response.error;
                errorDiv.classList.add('active');
                return;
            }

            state.playerId = response.playerId;
            showPlayerScreen();
            closeAllModals();
        });

    } catch (error) {
        console.error('Error:', error);
        errorDiv.textContent = error.message;
        errorDiv.classList.add('active');
    }
}

// Socket.io
function connectSocket() {
    if (state.socket) return;

    state.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling']
    });

    state.socket.on('connect', () => {
        console.log('✅ Conectado al servidor');

        if (state.role === 'host') {
            state.socket.emit('host:join', { code: state.roomCode }, (response) => {
                if (!response.success) {
                    console.error('Error conectando como host:', response.error);
                }
            });
        }
    });

    state.socket.on('disconnect', () => {
        console.log('❌ Desconectado del servidor');
    });

    // Eventos del juego
    state.socket.on('room:playerJoined', (data) => {
        console.log('Jugador unido:', data);
        if (state.role === 'host') {
            updatePlayersList(data);
        }
    });

    state.socket.on('game:started', (data) => {
        console.log('Juego iniciado:', data);
    });

    state.socket.on('round:started', (data) => {
        console.log('Ronda iniciada:', data);
        if (state.role === 'player') {
            showQuestionScreen(data);
        }
    });

    state.socket.on('round:bettingPhase', (data) => {
        console.log('Fase de apuestas:', data);
        if (state.role === 'player') {
            showBettingScreen(data);
        }
    });

    state.socket.on('round:revealed', (data) => {
        console.log('Respuesta revelada:', data);
        showResultsScreen(data);
    });

    state.socket.on('game:ended', (data) => {
        console.log('Juego terminado:', data);
        showGameEndScreen(data);
    });
}

// Exportar funciones para uso en otros módulos
window.showHostScreen = showHostScreen;
window.showPlayerScreen = showPlayerScreen;
window.showQuestionScreen = showQuestionScreen;
window.showBettingScreen = showBettingScreen;
window.showResultsScreen = showResultsScreen;
window.showGameEndScreen = showGameEndScreen;
window.updatePlayersList = updatePlayersList;
window.state = state;
