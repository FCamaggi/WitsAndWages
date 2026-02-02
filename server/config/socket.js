import { Server } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173'];

export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  console.log(`✅ Socket.io inicializado con CORS para: ${allowedOrigins.join(', ')}`);

  return io;
};
