import Game from '../models/Game.js';
import { ODDS, POSITION_COLORS, ROUND_BONUSES } from '../utils/constants.js';

/**
 * Ordenar respuestas y asignar posiciones en el tablero
 * Respeta el manual: se parte desde el centro y se distribuye hacia los lados
 * - Número impar de respuestas: la del medio va en la casilla verde (2:1)
 * - Número par de respuestas: la verde se bloquea, las dos del medio van en 3:1
 */
export const orderAnswers = async (gameCode) => {
  try {
    const game = await Game.findOne({ gameCode });

    if (!game) {
      throw new Error('Juego no encontrado');
    }

    const answers = game.currentQuestion.answers;
    const blockers = game.blockers.filter(b => b.active).map(b => b.position);

    // Ordenar respuestas de menor a mayor
    const sortedAnswers = [...answers].sort((a, b) => a.value - b.value);

    // Posiciones en orden del tablero (de izquierda a derecha)
    const allPositions = [
      '5to1-red',    // índice 0
      '4to1-red',    // índice 1
      '3to1-red',    // índice 2
      '2to1-green',  // índice 3 - CENTRO
      '3to1-black',  // índice 4
      '4to1-black',  // índice 5
      '5to1-black',  // índice 6
    ];

    // Filtrar posiciones bloqueadas
    const availablePositions = allPositions.filter(p => !blockers.includes(p));

    // Encontrar el índice del centro en las posiciones disponibles
    const centerIndex = availablePositions.findIndex(p => p === '2to1-green');
    
    // Determinar si tenemos número par o impar de respuestas
    const isOdd = sortedAnswers.length % 2 === 1;

    const assignedAnswers = [];
    
    if (isOdd && centerIndex !== -1) {
      // NÚMERO IMPAR: la del medio va en la verde
      const middleIndex = Math.floor(sortedAnswers.length / 2);
      
      // Asignar la respuesta del medio a la casilla verde
      assignedAnswers.push({
        ...sortedAnswers[middleIndex].toObject ? sortedAnswers[middleIndex].toObject() : sortedAnswers[middleIndex],
        position: '2to1-green',
        isDuplicate: false,
        duplicateGroup: null,
      });

      // Distribuir las respuestas menores hacia la izquierda
      for (let i = middleIndex - 1, offset = 1; i >= 0; i--, offset++) {
        const posIndex = centerIndex - offset;
        if (posIndex >= 0) {
          assignedAnswers.push({
            ...sortedAnswers[i].toObject ? sortedAnswers[i].toObject() : sortedAnswers[i],
            position: availablePositions[posIndex],
            isDuplicate: false,
            duplicateGroup: null,
          });
        }
      }

      // Distribuir las respuestas mayores hacia la derecha
      for (let i = middleIndex + 1, offset = 1; i < sortedAnswers.length; i++, offset++) {
        const posIndex = centerIndex + offset;
        if (posIndex < availablePositions.length) {
          assignedAnswers.push({
            ...sortedAnswers[i].toObject ? sortedAnswers[i].toObject() : sortedAnswers[i],
            position: availablePositions[posIndex],
            isDuplicate: false,
            duplicateGroup: null,
          });
        }
      }
    } else {
      // NÚMERO PAR: la verde se bloquea, las dos del medio van en 3:1
      const middleLeft = Math.floor(sortedAnswers.length / 2) - 1;
      const middleRight = middleLeft + 1;

      // Encontrar las posiciones 3:1 (una a cada lado del centro)
      const red3to1Index = availablePositions.findIndex(p => p === '3to1-red');
      const black3to1Index = availablePositions.findIndex(p => p === '3to1-black');

      // Asignar las dos del medio
      if (red3to1Index !== -1) {
        assignedAnswers.push({
          ...sortedAnswers[middleLeft].toObject ? sortedAnswers[middleLeft].toObject() : sortedAnswers[middleLeft],
          position: '3to1-red',
          isDuplicate: false,
          duplicateGroup: null,
        });
      }

      if (black3to1Index !== -1) {
        assignedAnswers.push({
          ...sortedAnswers[middleRight].toObject ? sortedAnswers[middleRight].toObject() : sortedAnswers[middleRight],
          position: '3to1-black',
          isDuplicate: false,
          duplicateGroup: null,
        });
      }

      // Distribuir las respuestas menores hacia la izquierda
      for (let i = middleLeft - 1, offset = 1; i >= 0; i--, offset++) {
        const posIndex = red3to1Index - offset;
        if (posIndex >= 0) {
          assignedAnswers.push({
            ...sortedAnswers[i].toObject ? sortedAnswers[i].toObject() : sortedAnswers[i],
            position: availablePositions[posIndex],
            isDuplicate: false,
            duplicateGroup: null,
          });
        }
      }

      // Distribuir las respuestas mayores hacia la derecha
      for (let i = middleRight + 1, offset = 1; i < sortedAnswers.length; i++, offset++) {
        const posIndex = black3to1Index + offset;
        if (posIndex < availablePositions.length) {
          assignedAnswers.push({
            ...sortedAnswers[i].toObject ? sortedAnswers[i].toObject() : sortedAnswers[i],
            position: availablePositions[posIndex],
            isDuplicate: false,
            duplicateGroup: null,
          });
        }
      }
    }

    // Actualizar respuestas con posiciones asignadas
    game.currentQuestion.answers = assignedAnswers;
    game.currentPhase = 'betting';
    await game.save();

    console.log(`📊 Respuestas ordenadas en ${gameCode}:`, assignedAnswers.map(a => ({ value: a.value, position: a.position })));

    return game;
  } catch (error) {
    console.error('❌ Error ordenando respuestas:', error);
    throw error;
  }
};

/**
 * Determinar respuesta ganadora
 * Regla del manual: más cercana SIN PASARSE
 */
export const determineWinner = async (gameCode) => {
  try {
    const game = await Game.findOne({ gameCode });

    if (!game) {
      throw new Error('Juego no encontrado');
    }

    const answers = game.currentQuestion.answers;
    const correctAnswer = game.currentQuestion.correctAnswer;

    // Filtrar respuestas que NO se pasan
    const validAnswers = answers.filter(a => a.value <= correctAnswer);

    if (validAnswers.length === 0) {
      // TODAS MUY ALTAS
      game.currentQuestion.winningAnswer = {
        allTooHigh: true,
        winningPosition: '6to1-all-high',
        winningValue: null,
        winners: [],
      };

      console.log(`🎯 ${gameCode}: TODAS LAS RESPUESTAS MUY ALTAS`);
    } else {
      // Encontrar la más cercana (la última del array ordenado de válidas)
      const winningValue = Math.max(...validAnswers.map(a => a.value));
      const winningAnswers = answers.filter(a => a.value === winningValue);

      game.currentQuestion.winningAnswer = {
        allTooHigh: false,
        winningPosition: winningAnswers[0].position,
        winningValue: winningValue,
        winners: winningAnswers.map(a => a.playerId),
      };

      console.log(`🎯 ${gameCode}: Respuesta ganadora = ${winningValue} en ${winningAnswers[0].position}`);
    }

    game.currentPhase = 'results';
    await game.save();

    return game;
  } catch (error) {
    console.error('❌ Error determinando ganador:', error);
    throw error;
  }
};

/**
 * Calcular y aplicar pagos según el manual
 */
export const calculatePayouts = async (gameCode) => {
  try {
    const game = await Game.findOne({ gameCode });

    if (!game) {
      throw new Error('Juego no encontrado');
    }

    const { winningAnswer } = game.currentQuestion;
    const payments = [];

    // 1. PAGAR BONO a quien acertó (o quienes acertaron si hay duplicados)
    if (!winningAnswer.allTooHigh && winningAnswer.winners.length > 0) {
      const bonus = ROUND_BONUSES[game.currentRound - 1];

      for (const winnerId of winningAnswer.winners) {
        const player = game.players.find(p => p.id === winnerId);
        if (player) {
          player.money += bonus;
          payments.push({
            playerId: winnerId,
            playerName: player.name,
            type: 'bonus',
            amount: bonus,
            reason: `Respuesta ganadora: ${winningAnswer.winningValue}`,
          });
        }
      }

      console.log(`🎁 Bono de $${bonus} pagado a ${winningAnswer.winners.length} jugador(es)`);
    }

    // 2. PAGAR APUESTAS GANADORAS
    const bets = game.currentQuestion.bets;
    const answers = game.currentQuestion.answers;

    for (const bet of bets) {
      let isWinning = false;
      let usedOdds = 0;

      // Verificar si la apuesta es ganadora
      if (winningAnswer.allTooHigh && bet.position === '6to1-all-high') {
        // Caso especial: TODAS ALTAS
        isWinning = true;
        usedOdds = 6;
      } else if (!winningAnswer.allTooHigh) {
        // Verificar si apostó directamente a la respuesta ganadora
        const answerAtPosition = answers.find(a => a.position === bet.position);

        if (answerAtPosition && answerAtPosition.value === winningAnswer.winningValue) {
          isWinning = true;
          usedOdds = ODDS[bet.position];
        }

        // Verificar si apostó a ROJO 1:1 o NEGRO 1:1
        if (bet.position === '1to1-red') {
          const winningColor = POSITION_COLORS[winningAnswer.winningPosition];
          if (winningColor === 'red') {
            isWinning = true;
            usedOdds = 1;
          }
        }

        if (bet.position === '1to1-black') {
          const winningColor = POSITION_COLORS[winningAnswer.winningPosition];
          if (winningColor === 'black') {
            isWinning = true;
            usedOdds = 1;
          }
        }

        // Si hay duplicados ganadores, usar las odds más altas
        if (isWinning && winningAnswer.winners.length > 1) {
          const duplicatePositions = answers
            .filter(a => a.value === winningAnswer.winningValue)
            .map(a => a.position);

          const maxOdds = Math.max(...duplicatePositions.map(p => ODDS[p] || 0));
          usedOdds = Math.max(usedOdds, maxOdds);
        }
      }

      if (isWinning) {
        const player = game.players.find(p => p.id === bet.playerId);

        if (player) {
          // Cálculo según manual: apuesta + (apuesta × odds)
          const totalBet = 1 + (bet.pokerChips || 0); // 1 token + fichas de póquer
          const payout = totalBet + (totalBet * usedOdds);

          player.money += payout;

          payments.push({
            playerId: bet.playerId,
            playerName: player.name,
            type: 'bet',
            amount: payout,
            betAmount: totalBet,
            odds: usedOdds,
            position: bet.position,
            reason: `Apuesta en ${bet.position} (${usedOdds}:1)`,
          });

          console.log(`💰 ${player.name} ganó $${payout} (apuesta: $${totalBet} × ${usedOdds})`);
        }
      } else {
        // PERDER FICHAS DE PÓQUER (los tokens nunca se pierden)
        const player = game.players.find(p => p.id === bet.playerId);
        if (player && bet.pokerChips > 0) {
          console.log(`❌ ${player.name} perdió $${bet.pokerChips} en apuesta perdedora`);
        }
      }
    }

    // Asegurar que la fase sea 'results'
    game.currentPhase = 'results';
    await game.save();

    return { game, payments };
  } catch (error) {
    console.error('❌ Error calculando pagos:', error);
    throw error;
  }
};

/**
 * Avanzar a la siguiente ronda
 */
export const nextRound = async (gameCode) => {
  try {
    const game = await Game.findOne({ gameCode });

    if (!game) {
      throw new Error('Juego no encontrado');
    }

    if (game.currentRound >= 7) {
      // FIN DEL JUEGO
      game.currentPhase = 'finished';
      game.status = 'finished';
      await game.save();

      console.log(`🏁 Juego ${gameCode} terminado`);
      return game;
    }

    // Limpiar ronda actual
    game.currentQuestion = {
      text: '',
      correctAnswer: 0,
      category: '',
      answers: [],
      bets: [],
      winningAnswer: {},
    };

    // Avanzar ronda
    game.currentRound += 1;

    // Cargar siguiente pregunta
    const nextQuestion = game.questions[game.currentRound - 1];
    game.currentQuestion = {
      text: nextQuestion.text,
      correctAnswer: nextQuestion.correctAnswer,
      category: nextQuestion.category,
      answers: [],
      bets: [],
      winningAnswer: {},
    };

    game.currentPhase = 'question';

    await game.save();

    console.log(`➡️  ${gameCode}: Avanzando a ronda ${game.currentRound}`);

    return game;
  } catch (error) {
    console.error('❌ Error avanzando ronda:', error);
    throw error;
  }
};
