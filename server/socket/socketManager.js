import { registerHostHandlers } from './handlers/hostHandlers.js';
import { registerPlayerHandlers } from './handlers/playerHandlers.js';

export const initializeSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Cliente conectado: ${socket.id}`);

    // Registrar handlers del host
    registerHostHandlers(io, socket);

    // Registrar handlers del jugador
    registerPlayerHandlers(io, socket);

    // Ping/Pong para mantener conexión
    socket.on('ping', (callback) => {
      if (callback) callback('pong');
    });
  });

  console.log('✅ Socket handlers inicializados');
};
