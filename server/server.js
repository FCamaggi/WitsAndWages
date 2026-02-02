import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { initializeSocket } from './config/socket.js';
import { initializeSocketHandlers } from './socket/socketManager.js';

// Cargar variables de entorno
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:5173'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Inicializar Socket.io
const io = initializeSocket(httpServer);
initializeSocketHandlers(io);

// Conectar a MongoDB
connectDB();

// Rutas básicas
app.get('/', (req, res) => {
  res.json({
    message: '🎮 Wits & Wagers Vegas API',
    version: '2.0.0',
    status: 'online',
    endpoints: {
      health: '/health',
      socket: 'Socket.io enabled',
    },
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log('');
  console.log('🎰 ================================== 🎰');
  console.log('🎮  WITS & WAGERS VEGAS - SERVIDOR  🎮');
  console.log('🎰 ================================== 🎰');
  console.log('');
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
  console.log(`🌐 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔌 Socket.io listo para conexiones`);
  console.log('');
  console.log('📡 Endpoints disponibles:');
  console.log(`   - HTTP: http://localhost:${PORT}`);
  console.log(`   - Health: http://localhost:${PORT}/health`);
  console.log('');
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM recibido, cerrando servidor...');
  httpServer.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

export default app;
