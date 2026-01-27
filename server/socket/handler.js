const Room = require('../models/Room');
const {
  getRandomQuestion,
  calculateBlockers,
  sortAnswersAndAssignPositions,
  determineWinningAnswer,
  calculatePayout,
  getCategories
} = require('../utils/helpers');

module.exports = (io) => {
  // Almacenar conexiones activas
  const connections = new Map(); // socketId -> { roomCode, playerId, role }

  io.on('connection', (socket) => {
    console.log('🔌 Cliente conectado:', socket.id);

    // HOST: Crear y unirse a sala como host
    socket.on('host:create', async (data, callback) => {
      try {
        const { hostId } = data;
        
        // Nota: La sala ya debe existir (creada via API)
        // Aquí solo conectamos el socket del host
        
        callback({ success: true });
      } catch (error) {
        console.error('Error en host:create:', error);
        callback({ success: false, error: error.message });
      }
    });

    // HOST: Unirse a sala existente
    socket.on('host:join', async ({ code }, callback) => {
      try {
        const room = await Room.findOne({ code: code.toUpperCase() });
        
        if (!room) {
          return callback({ success: false, error: 'Sala no encontrada' });
        }

        // Actualizar socket del host
        room.hostSocketId = socket.id;
        await room.save();

        // Unirse al canal de la sala
        socket.join(code);
        connections.set(socket.id, { roomCode: code, role: 'host' });

        callback({ 
          success: true, 
          room: {
            code: room.code,
            players: room.players,
            status: room.status,
            currentRound: room.currentRound
          }
        });
      } catch (error) {
        console.error('Error en host:join:', error);
        callback({ success: false, error: error.message });
      }
    });

    // JUGADOR: Unirse a sala
    socket.on('player:join', async ({ code, playerName }, callback) => {
      try {
        const room = await Room.findOne({ code: code.toUpperCase() });
        
        if (!room) {
          return callback({ success: false, error: 'Sala no encontrada' });
        }

        if (room.players.length >= 7) {
          return callback({ success: false, error: 'Sala llena (máximo 7 jugadores)' });
        }

        // Verificar si el nombre ya existe
        const nameExists = room.players.some(p => p.name === playerName);
        if (nameExists) {
          return callback({ success: false, error: 'Nombre ya en uso' });
        }

        // Crear jugador
        const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newPlayer = {
          id: playerId,
          name: playerName,
          socketId: socket.id,
          money: 0,
          bettingTokens: 2,
          connected: true
        };

        room.players.push(newPlayer);
        
        // Actualizar bloqueadores si es necesario
        const playerCount = room.players.length;
        if (playerCount === 5 || playerCount === 6) {
          room.blockers = calculateBlockers(playerCount);
        }

        await room.save();

        // Unirse al canal de la sala
        socket.join(code);
        connections.set(socket.id, { 
          roomCode: code, 
          playerId, 
          role: 'player' 
        });

        // Notificar a todos en la sala
        io.to(code).emit('room:playerJoined', {
          player: newPlayer,
          totalPlayers: room.players.length
        });

        callback({ 
          success: true, 
          playerId,
          player: newPlayer,
          room: {
            code: room.code,
            players: room.players,
            status: room.status
          }
        });
      } catch (error) {
        console.error('Error en player:join:', error);
        callback({ success: false, error: error.message });
      }
    });

    // HOST: Obtener categorías
    socket.on('host:getCategories', (data, callback) => {
      try {
        const categories = getCategories();
        callback({ success: true, categories });
      } catch (error) {
        callback({ success: false, error: error.message });
      }
    });

    // HOST: Iniciar juego
    socket.on('host:startGame', async ({ code, excludedCategories }, callback) => {
      try {
        const room = await Room.findOne({ code: code.toUpperCase() });
        
        if (!room) {
          return callback({ success: false, error: 'Sala no encontrada' });
        }

        if (room.players.length < 2) {
          return callback({ success: false, error: 'Se necesitan al menos 2 jugadores' });
        }

        room.status = 'playing';
        room.excludedCategories = excludedCategories || [];
        room.gameState.phase = 'question';
        await room.save();

        // Notificar a todos
        io.to(code).emit('game:started', {
          excludedCategories: room.excludedCategories
        });

        callback({ success: true });
      } catch (error) {
        console.error('Error en host:startGame:', error);
        callback({ success: false, error: error.message });
      }
    });

    // HOST: Siguiente ronda
    socket.on('host:nextRound', async ({ code }, callback) => {
      try {
        const room = await Room.findOne({ code: code.toUpperCase() });
        
        if (!room) {
          return callback({ success: false, error: 'Sala no encontrada' });
        }

        room.currentRound += 1;

        if (room.currentRound > room.totalRounds) {
          // Juego terminado
          room.status = 'finished';
          room.gameState.phase = 'gameEnd';
          await room.save();

          // Determinar ganador
          const sortedPlayers = room.players.sort((a, b) => b.money - a.money);
          
          io.to(code).emit('game:ended', {
            winner: sortedPlayers[0],
            rankings: sortedPlayers
          });

          return callback({ success: true, gameEnded: true });
        }

        // Obtener pregunta aleatoria
        const usedQuestionIds = room.rounds.map(r => r.question.id);
        const question = getRandomQuestion(room.excludedCategories, usedQuestionIds);

        // Crear nueva ronda
        const newRound = {
          number: room.currentRound,
          question: {
            id: question.id,
            pregunta: question.pregunta,
            respuesta: question.respuesta,
            unidad: question.unidad,
            categoria: question.categoria,
            trivia: question.trivia
          },
          answers: [],
          bets: [],
          completed: false
        };

        room.rounds.push(newRound);
        room.gameState.phase = 'answering';
        await room.save();

        // Enviar pregunta a todos
        io.to(code).emit('round:started', {
          roundNumber: room.currentRound,
          question: {
            pregunta: question.pregunta,
            unidad: question.unidad,
            categoria: question.categoria
          },
          bonus: getBonusForRound(room.currentRound)
        });

        callback({ success: true, roundNumber: room.currentRound });
      } catch (error) {
        console.error('Error en host:nextRound:', error);
        callback({ success: false, error: error.message });
      }
    });

    // JUGADOR: Enviar respuesta
    socket.on('player:submitAnswer', async ({ code, playerId, answer }, callback) => {
      try {
        const room = await Room.findOne({ code: code.toUpperCase() });
        
        if (!room || room.gameState.phase !== 'answering') {
          return callback({ success: false, error: 'No se puede enviar respuesta ahora' });
        }

        const currentRound = room.rounds[room.rounds.length - 1];
        const player = room.players.find(p => p.id === playerId);

        if (!player) {
          return callback({ success: false, error: 'Jugador no encontrado' });
        }

        // Verificar si ya respondió
        const alreadyAnswered = currentRound.answers.some(a => a.playerId === playerId);
        if (alreadyAnswered) {
          return callback({ success: false, error: 'Ya enviaste tu respuesta' });
        }

        // Agregar respuesta
        currentRound.answers.push({
          playerId,
          playerName: player.name,
          value: parseFloat(answer)
        });

        await room.save();

        // Notificar al host
        io.to(room.hostSocketId).emit('round:answerReceived', {
          playerId,
          playerName: player.name,
          totalAnswers: currentRound.answers.length,
          totalPlayers: room.players.length
        });

        callback({ success: true });

        // Si todos respondieron, pasar a fase de apuestas
        if (currentRound.answers.length === room.players.length) {
          room.gameState.phase = 'betting';
          
          // Ordenar respuestas y asignar posiciones
          const sortedAnswers = sortAnswersAndAssignPositions(
            currentRound.answers,
            room.blockers
          );
          
          currentRound.answers = sortedAnswers;
          await room.save();

          io.to(code).emit('round:bettingPhase', {
            answers: sortedAnswers,
            blockers: room.blockers
          });
        }
      } catch (error) {
        console.error('Error en player:submitAnswer:', error);
        callback({ success: false, error: error.message });
      }
    });

    // JUGADOR: Realizar apuesta
    socket.on('player:placeBet', async ({ code, playerId, bets }, callback) => {
      try {
        const room = await Room.findOne({ code: code.toUpperCase() });
        
        if (!room || room.gameState.phase !== 'betting') {
          return callback({ success: false, error: 'No se puede apostar ahora' });
        }

        const currentRound = room.rounds[room.rounds.length - 1];
        const player = room.players.find(p => p.id === playerId);

        if (!player) {
          return callback({ success: false, error: 'Jugador no encontrado' });
        }

        // Validar apuestas (máximo 2 tokens)
        if (bets.length > 2) {
          return callback({ success: false, error: 'Máximo 2 apuestas por ronda' });
        }

        // Remover apuestas anteriores de este jugador
        currentRound.bets = currentRound.bets.filter(b => b.playerId !== playerId);

        // Agregar nuevas apuestas
        bets.forEach(bet => {
          currentRound.bets.push({
            playerId,
            position: bet.position,
            amount: bet.amount,
            pokerChips: bet.pokerChips || 0
          });
        });

        await room.save();

        // Notificar al host
        io.to(room.hostSocketId).emit('round:betPlaced', {
          playerId,
          playerName: player.name,
          totalBets: currentRound.bets.filter((v, i, a) => 
            a.findIndex(t => t.playerId === v.playerId) === i
          ).length,
          totalPlayers: room.players.length
        });

        callback({ success: true });

        // Si todos apostaron, revelar respuesta
        const uniqueBettors = new Set(currentRound.bets.map(b => b.playerId));
        if (uniqueBettors.size === room.players.length) {
          await revealAnswer(room, code, io);
        }
      } catch (error) {
        console.error('Error en player:placeBet:', error);
        callback({ success: false, error: error.message });
      }
    });

    // Desconexión
    socket.on('disconnect', async () => {
      console.log('🔌 Cliente desconectado:', socket.id);
      
      const connection = connections.get(socket.id);
      if (connection) {
        const { roomCode, playerId, role } = connection;
        
        try {
          const room = await Room.findOne({ code: roomCode });
          
          if (room && role === 'player') {
            const player = room.players.find(p => p.id === playerId);
            if (player) {
              player.connected = false;
              await room.save();
              
              io.to(roomCode).emit('room:playerDisconnected', {
                playerId,
                playerName: player.name
              });
            }
          }
        } catch (error) {
          console.error('Error manejando desconexión:', error);
        }
        
        connections.delete(socket.id);
      }
    });
  });
};

// Funciones auxiliares

function getBonusForRound(roundNumber) {
  const bonuses = {
    1: 100,
    2: 200,
    3: 300,
    4: 400,
    5: 500,
    6: 600,
    7: 700
  };
  return bonuses[roundNumber] || 0;
}

async function revealAnswer(room, code, io) {
  const currentRound = room.rounds[room.rounds.length - 1];
  
  // Determinar respuesta ganadora
  const result = determineWinningAnswer(
    currentRound.answers,
    currentRound.question.respuesta
  );

  currentRound.winningAnswer = result.winningValue;
  currentRound.winners = result.winners;
  room.gameState.phase = 'reveal';

  // Calcular y pagar bonos
  if (!result.allTooHigh) {
    const bonus = getBonusForRound(room.currentRound);
    result.winners.forEach(winnerId => {
      const player = room.players.find(p => p.id === winnerId);
      if (player) {
        player.money += bonus;
      }
    });
  }

  // Calcular y pagar apuestas ganadoras
  currentRound.bets.forEach(bet => {
    const player = room.players.find(p => p.id === bet.playerId);
    if (!player) return;

    const isWinningBet = checkWinningBet(bet, result, currentRound.answers);
    
    if (isWinningBet) {
      const payout = calculatePayout(bet, result.winningPosition);
      player.money += payout;
    }
  });

  currentRound.completed = true;
  await room.save();

  // Enviar resultados a todos
  io.to(code).emit('round:revealed', {
    correctAnswer: currentRound.question.respuesta,
    winningAnswer: result.winningValue,
    allTooHigh: result.allTooHigh,
    winners: result.winners.map(id => {
      const p = room.players.find(pl => pl.id === id);
      return { id, name: p.name, bonus: getBonusForRound(room.currentRound) };
    }),
    players: room.players.map(p => ({
      id: p.id,
      name: p.name,
      money: p.money
    })),
    trivia: currentRound.question.trivia
  });
}

function checkWinningBet(bet, result, answers) {
  // Si todas las respuestas son muy altas
  if (result.allTooHigh) {
    return bet.position === '6to1-all-high';
  }

  // Verificar si apostó directamente a la respuesta ganadora
  const winningAnswers = answers.filter(a => a.value === result.winningValue);
  const betOnWinningAnswer = winningAnswers.some(a => bet.position === a.position);
  
  if (betOnWinningAnswer) {
    return true;
  }

  // Verificar apuestas en RED 1to1 o BLACK 1to1
  if (bet.position === '1to1-red') {
    return winningAnswers.some(a => 
      a.position.includes('red') || a.position === '2to1-green'
    );
  }

  if (bet.position === '1to1-black') {
    return winningAnswers.some(a => 
      a.position.includes('black') || a.position === '2to1-green'
    );
  }

  return false;
}
