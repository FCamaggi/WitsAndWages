import { joinGame, disconnectPlayer } from '../../services/gameService.js';
import Game from '../../models/Game.js';

export const registerPlayerHandlers = (io, socket) => {
  // Unirse a partida
  socket.on('player:join-game', async ({ gameCode, playerName, playerColor }, callback) => {
    try {
      console.log(`👤 ${playerName} uniéndose a ${gameCode}...`);

      const game = await joinGame(gameCode, socket.id, playerName, playerColor);

      // Unir al jugador a la sala
      socket.join(gameCode);

      const joinedPlayer = game.players.find(p => p.id === socket.id);

      // Notificar a todos que un jugador se unió
      io.to(gameCode).emit('player:joined', {
        player: joinedPlayer,
        playerCount: game.players.filter(p => p.connected).length,
      });

      // Enviar estado completo del juego actualizado
      io.to(gameCode).emit('game:updated', { game });

      callback({ success: true, game, playerId: socket.id });

      console.log(`✅ ${playerName} unido a ${gameCode}`);
    } catch (error) {
      console.error('❌ Error en player:join-game:', error);
      callback({ success: false, error: error.message });
    }
  });

  // Enviar respuesta
  socket.on('player:submit-answer', async ({ gameCode, playerId, answer }, callback) => {
    try {
      console.log(`📝 Jugador ${playerId} envió respuesta: ${answer}`);

      const game = await Game.findOne({ gameCode });

      if (!game) {
        callback({ success: false, error: 'Juego no encontrado' });
        return;
      }

      if (game.currentPhase !== 'question') {
        callback({ success: false, error: 'No es momento de responder' });
        return;
      }

      // Verificar si ya respondió
      const existingAnswer = game.currentQuestion.answers.find(a => a.playerId === playerId);
      if (existingAnswer) {
        callback({ success: false, error: 'Ya has respondido' });
        return;
      }

      // Validar respuesta
      if (isNaN(answer) || Number(answer) < 0) {
        callback({ success: false, error: 'Respuesta inválida' });
        return;
      }

      const player = game.players.find(p => p.id === playerId);

      if (!player) {
        callback({ success: false, error: 'Jugador no encontrado' });
        return;
      }

      // Agregar respuesta
      game.currentQuestion.answers.push({
        playerId,
        playerName: player.name,
        playerColor: player.color,
        value: Number(answer),
      });

      await game.save();

      // Notificar que un jugador respondió
      io.to(gameCode).emit('player:answered', {
        playerId,
        playerName: player.name,
        answeredCount: game.currentQuestion.answers.length,
        totalPlayers: game.players.filter(p => p.connected).length,
      });

      // Enviar estado actualizado del juego
      io.to(gameCode).emit('game:updated', { game });

      // Si todos respondieron, notificar al host
      if (game.allPlayersAnswered()) {
        io.to(gameCode).emit('game:all-answered', {});
      }

      callback({ success: true });
    } catch (error) {
      console.error('❌ Error en player:submit-answer:', error);
      callback({ success: false, error: error.message });
    }
  });

  // Colocar apuesta
  socket.on('player:place-bet', async ({ gameCode, playerId, bets }, callback) => {
    try {
      console.log(`🎲 Jugador ${playerId} colocando apuestas:`, bets);

      const game = await Game.findOne({ gameCode });

      if (!game) {
        callback({ success: false, error: 'Juego no encontrado' });
        return;
      }

      if (game.currentPhase !== 'betting') {
        callback({ success: false, error: 'No es momento de apostar' });
        return;
      }

      const player = game.players.find(p => p.id === playerId);

      if (!player) {
        callback({ success: false, error: 'Jugador no encontrado' });
        return;
      }

      // Validar número de apuestas (máximo 2)
      if (bets.length > 2 || bets.length === 0) {
        callback({ success: false, error: 'Debes colocar 1 o 2 apuestas' });
        return;
      }

      // Validar que el jugador tenga suficiente dinero para las fichas de póquer
      const totalPokerChips = bets.reduce((sum, bet) => sum + (bet.pokerChips || 0), 0);
      if (totalPokerChips > player.money) {
        callback({ success: false, error: 'No tienes suficiente dinero' });
        return;
      }

      // Remover apuestas previas del jugador
      game.currentQuestion.bets = game.currentQuestion.bets.filter(b => b.playerId !== playerId);

      // Agregar nuevas apuestas
      for (const bet of bets) {
        game.currentQuestion.bets.push({
          playerId,
          playerName: player.name,
          playerColor: player.color,
          position: bet.position,
          tokens: bet.tokens || 1,
          pokerChips: bet.pokerChips || 0,
          isToken: true,
        });
      }

      await game.save();

      // Notificar que un jugador apostó
      const playersWhoBet = new Set(game.currentQuestion.bets.map(b => b.playerId));
      const totalPlayers = game.players.filter(p => p.connected).length;

      io.to(gameCode).emit('player:bet-placed', {
        playerId,
        playerName: player.name,
        betCount: playersWhoBet.size,
        totalPlayers,
      });

      // Enviar estado actualizado del juego
      io.to(gameCode).emit('game:updated', { game });

      // Si todos apostaron, notificar al host
      if (game.allPlayersBet()) {
        io.to(gameCode).emit('game:all-bet', {});
      }

      callback({ success: true });
    } catch (error) {
      console.error('❌ Error en player:place-bet:', error);
      callback({ success: false, error: error.message });
    }
  });

  // Obtener estado del juego para el jugador
  socket.on('player:get-game-state', async ({ gameCode, playerId }, callback) => {
    try {
      const game = await Game.findOne({ gameCode });

      if (!game) {
        callback({ success: false, error: 'Juego no encontrado' });
        return;
      }

      const player = game.players.find(p => p.id === playerId);

      callback({ success: true, game, player });
    } catch (error) {
      console.error('❌ Error en player:get-game-state:', error);
      callback({ success: false, error: error.message });
    }
  });

  // Desconexión
  socket.on('disconnect', async () => {
    try {
      console.log(`👋 Socket ${socket.id} desconectado`);

      // Buscar en qué juego estaba el jugador
      const games = await Game.find({ 'players.id': socket.id, status: { $ne: 'finished' } });

      for (const game of games) {
        await disconnectPlayer(game.gameCode, socket.id);

        const player = game.players.find(p => p.id === socket.id);

        io.to(game.gameCode).emit('player:left', {
          playerId: socket.id,
          playerName: player ? player.name : 'Desconocido',
        });

        // Enviar estado actualizado
        const updatedGame = await Game.findOne({ gameCode: game.gameCode });
        if (updatedGame) {
          io.to(game.gameCode).emit('game:updated', { game: updatedGame });
        }
      }
    } catch (error) {
      console.error('❌ Error en disconnect:', error);
    }
  });
};
