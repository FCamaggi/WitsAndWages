import { createGame, startGame, updateGameSettings, togglePause } from '../../services/gameService.js';
import { orderAnswers, determineWinner, calculatePayouts, nextRound } from '../../services/gameLogic.js';
import Game from '../../models/Game.js';

export const registerHostHandlers = (io, socket) => {
  // Crear partida
  socket.on('host:create-game', async ({ hostName }, callback) => {
    try {
      console.log(`🎮 Host ${hostName} creando partida...`);

      const game = await createGame(socket.id, hostName);

      // Unir al host a su sala
      socket.join(game.gameCode);

      callback({ success: true, game });

      // Emitir que el juego fue creado
      socket.emit('game:updated', { game });

      console.log(`✅ Partida ${game.gameCode} creada`);
    } catch (error) {
      console.error('❌ Error en host:create-game:', error);
      callback({ success: false, error: error.message });
    }
  });

  // Iniciar juego
  socket.on('host:start-game', async ({ gameCode }, callback) => {
    try {
      console.log(`▶️  Iniciando juego ${gameCode}...`);

      const game = await startGame(gameCode);

      // Notificar a todos en la sala
      io.to(gameCode).emit('game:started', { game });
      io.to(gameCode).emit('phase:question', {
        question: game.currentQuestion.text,
        round: game.currentRound,
        category: game.currentQuestion.category,
      });

      callback({ success: true, game });
    } catch (error) {
      console.error('❌ Error en host:start-game:', error);
      callback({ success: false, error: error.message });
    }
  });

  // Ordenar respuestas (después de que todos respondieron)
  socket.on('host:order-answers', async ({ gameCode }, callback) => {
    try {
      console.log(`📊 Ordenando respuestas en ${gameCode}...`);

      const game = await orderAnswers(gameCode);

      // Cambiar a fase de ordenamiento (mostrar tablero antes de apostar)
      game.currentPhase = 'ordering';
      await game.save();

      // Notificar fase de ordenamiento
      io.to(gameCode).emit('game:updated', { game });

      callback({ success: true, game });
    } catch (error) {
      console.error('❌ Error en host:order-answers:', error);
      callback({ success: false, error: error.message });
    }
  });

  // Continuar a fase de apuestas (desde ordering)
  socket.on('host:start-betting', async ({ gameCode }, callback) => {
    try {
      console.log(`💰 Iniciando fase de apuestas en ${gameCode}...`);

      const game = await Game.findOne({ gameCode });
      if (!game) {
        throw new Error('Partida no encontrada');
      }

      game.currentPhase = 'betting';
      await game.save();

      // Notificar fase de apuestas
      io.to(gameCode).emit('game:updated', { game });
      io.to(gameCode).emit('phase:betting', {
        answers: game.currentQuestion.answers,
        blockers: game.blockers,
      });

      callback({ success: true, game });
    } catch (error) {
      console.error('❌ Error en host:start-betting:', error);
      callback({ success: false, error: error.message });
    }
  });

  // Revelar respuesta correcta
  socket.on('host:reveal-answer', async ({ gameCode }, callback) => {
    try {
      console.log(`🎯 Revelando respuesta en ${gameCode}...`);

      const game = await determineWinner(gameCode);

      // Notificar revelación
      io.to(gameCode).emit('phase:reveal', {
        correctAnswer: game.currentQuestion.correctAnswer,
        winningAnswer: game.currentQuestion.winningAnswer,
      });

      callback({ success: true, game });
    } catch (error) {
      console.error('❌ Error en host:reveal-answer:', error);
      callback({ success: false, error: error.message });
    }
  });

  // Calcular pagos
  socket.on('host:calculate-payouts', async ({ gameCode }, callback) => {
    try {
      console.log(`💰 Calculando pagos en ${gameCode}...`);

      const { game, payments } = await calculatePayouts(gameCode);

      // Notificar resultados
      io.to(gameCode).emit('phase:results', {
        payments,
        leaderboard: game.getLeaderboard(),
      });

      callback({ success: true, game, payments });
    } catch (error) {
      console.error('❌ Error en host:calculate-payouts:', error);
      callback({ success: false, error: error.message });
    }
  });

  // Siguiente ronda
  socket.on('host:next-round', async ({ gameCode }, callback) => {
    try {
      console.log(`➡️  Siguiente ronda en ${gameCode}...`);

      const game = await nextRound(gameCode);

      if (game.currentPhase === 'finished') {
        // Juego terminado
        io.to(gameCode).emit('game:finished', {
          leaderboard: game.getLeaderboard(),
          winner: game.getLeaderboard()[0],
        });
      } else {
        // Nueva ronda
        io.to(gameCode).emit('phase:question', {
          question: game.currentQuestion.text,
          round: game.currentRound,
          category: game.currentQuestion.category,
        });
      }

      callback({ success: true, game });
    } catch (error) {
      console.error('❌ Error en host:next-round:', error);
      callback({ success: false, error: error.message });
    }
  });

  // Actualizar configuración
  socket.on('host:update-settings', async ({ gameCode, settings }, callback) => {
    try {
      const game = await updateGameSettings(gameCode, settings);

      io.to(gameCode).emit('game:settings-updated', { settings: game.settings });

      callback({ success: true, game });
    } catch (error) {
      console.error('❌ Error en host:update-settings:', error);
      callback({ success: false, error: error.message });
    }
  });

  // Pausar/Reanudar
  socket.on('host:toggle-pause', async ({ gameCode }, callback) => {
    try {
      const game = await togglePause(gameCode);

      io.to(gameCode).emit('game:pause-toggled', { isPaused: game.isPaused });

      callback({ success: true, game });
    } catch (error) {
      console.error('❌ Error en host:toggle-pause:', error);
      callback({ success: false, error: error.message });
    }
  });

  // Obtener estado del juego
  socket.on('host:get-game-state', async ({ gameCode }, callback) => {
    try {
      const game = await Game.findOne({ gameCode });

      if (!game) {
        callback({ success: false, error: 'Juego no encontrado' });
        return;
      }

      callback({ success: true, game });
    } catch (error) {
      console.error('❌ Error en host:get-game-state:', error);
      callback({ success: false, error: error.message });
    }
  });
};
