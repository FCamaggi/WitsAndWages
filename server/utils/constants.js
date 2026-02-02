// Posiciones del tablero de apuestas
export const BETTING_POSITIONS = {
  ALL_HIGH: '6to1-all-high',
  RED_5: '5to1-red',
  RED_4: '4to1-red',
  RED_3: '3to1-red',
  GREEN_2: '2to1-green',
  BLACK_3: '3to1-black',
  BLACK_4: '4to1-black',
  BLACK_5: '5to1-black',
  RED_1TO1: '1to1-red',
  BLACK_1TO1: '1to1-black',
};

// Odds de cada posición
export const ODDS = {
  '6to1-all-high': 6,
  '5to1-red': 5,
  '4to1-red': 4,
  '3to1-red': 3,
  '2to1-green': 2,
  '3to1-black': 3,
  '4to1-black': 4,
  '5to1-black': 5,
  '1to1-red': 1,
  '1to1-black': 1,
};

// Colores de las posiciones
export const POSITION_COLORS = {
  '6to1-all-high': 'gold',
  '5to1-red': 'red',
  '4to1-red': 'red',
  '3to1-red': 'red',
  '2to1-green': 'green',
  '3to1-black': 'black',
  '4to1-black': 'black',
  '5to1-black': 'black',
};

// Bonos por ronda (según manual)
export const ROUND_BONUSES = [50, 75, 100, 125, 150, 200, 250];

// Fases del juego
export const GAME_PHASES = {
  LOBBY: 'lobby',
  QUESTION: 'question',
  ORDERING: 'ordering',
  BETTING: 'betting',
  REVEAL: 'reveal',
  RESULTS: 'results',
  FINISHED: 'finished',
};

// Estados del juego
export const GAME_STATUS = {
  LOBBY: 'lobby',
  PLAYING: 'playing',
  FINISHED: 'finished',
};

// Configuración de blockers según número de jugadores
export const BLOCKER_CONFIG = {
  5: ['5to1-red', '5to1-black'],
  6: ['2to1-green'],
  7: [],
};

// Colores disponibles para jugadores
export const PLAYER_COLORS = [
  '#ff6b6b', // Rojo
  '#51cf66', // Verde
  '#4dabf7', // Azul
  '#ffd43b', // Amarillo
  '#da77f2', // Morado
  '#ff922b', // Naranja
  '#20c997', // Teal
  '#ff6b9d', // Rosa
  '#748ffc', // Índigo
  '#69db7c', // Lima
];

// Tiempos de espera (milisegundos)
export const TIMERS = {
  QUESTION: 60000, // 60 segundos
  BETTING: 90000,  // 90 segundos
  REVEAL: 5000,    // 5 segundos
  RESULTS: 10000,  // 10 segundos
};

// Número total de rondas
export const TOTAL_ROUNDS = 7;
