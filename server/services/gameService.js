import Game from '../models/Game.js';
import { generateGameCode, getRandomQuestion, selectRandomElements } from '../utils/helpers.js';
import { BLOCKER_CONFIG, PLAYER_COLORS, TOTAL_ROUNDS } from '../utils/constants.js';

/**
 * Crear una nueva partida
 */
export const createGame = async (hostId, hostName) => {
  try {
    // Generar código único
    let gameCode;
    let existingGame;

    do {
      gameCode = generateGameCode();
      existingGame = await Game.findOne({ gameCode });
    } while (existingGame);

    // Crear juego (el host NO es jugador, solo controlador)
    const game = new Game({
      gameCode,
      hostId,
      players: [], // Host no se agrega como jugador
    });

    await game.save();
    console.log(`✅ Juego creado: ${gameCode} por ${hostName}`);

    return game;
  } catch (error) {
    console.error('❌ Error creando juego:', error);
    throw error;
  }
};

/**
 * Unir jugador a partida
 */
export const joinGame = async (gameCode, playerId, playerName, playerColor) => {
  try {
    const game = await Game.findOne({ gameCode, status: 'lobby' });

    if (!game) {
      throw new Error('Juego no encontrado o ya iniciado');
    }

    // Verificar si el jugador ya existe
    const existingPlayer = game.players.find(p => p.id === playerId);
    if (existingPlayer) {
      existingPlayer.connected = true;
      await game.save();
      return game;
    }

    // Verificar límite de jugadores (7 máximo según manual)
    if (game.players.length >= 7) {
      throw new Error('La partida está llena (máximo 7 jugadores)');
    }

    // Verificar que el color no esté en uso
    const colorInUse = game.players.some(p => p.color === playerColor);
    if (colorInUse) {
      // Asignar un color disponible
      const usedColors = game.players.map(p => p.color);
      const availableColor = PLAYER_COLORS.find(c => !usedColors.includes(c));
      playerColor = availableColor || PLAYER_COLORS[game.players.length % PLAYER_COLORS.length];
    }

    // Agregar jugador
    game.players.push({
      id: playerId,
      name: playerName,
      color: playerColor,
      money: 0,
      tokens: 2,
      connected: true,
      isHost: false,
    });

    await game.save();
    console.log(`✅ ${playerName} se unió a ${gameCode}`);

    return game;
  } catch (error) {
    console.error('❌ Error uniendo jugador:', error);
    throw error;
  }
};

/**
 * Iniciar juego (seleccionar 7 preguntas aleatorias y configurar blockers)
 */
export const startGame = async (gameCode) => {
  try {
    const game = await Game.findOne({ gameCode });

    if (!game) {
      throw new Error('Juego no encontrado');
    }

    if (game.status !== 'lobby') {
      throw new Error('El juego ya ha iniciado');
    }

    const playerCount = game.players.filter(p => p.connected).length;

    if (playerCount < 3) {
      throw new Error('Se necesitan al menos 3 jugadores para iniciar');
    }

    if (playerCount > 7) {
      throw new Error('Máximo 7 jugadores permitidos');
    }

    // Seleccionar 7 preguntas aleatorias
    const allQuestions = [];
    const usedQuestionIds = [];

    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      const question = getRandomQuestion([], usedQuestionIds);
      usedQuestionIds.push(question.id);

      // Limpiar y convertir respuesta a número (remover %, comas, espacios)
      const cleanAnswer = String(question.respuesta).replace(/[%,\s]/g, '');
      const numericAnswer = parseFloat(cleanAnswer);

      allQuestions.push({
        text: question.pregunta,
        correctAnswer: numericAnswer,
        category: question.categoria,
        round: i + 1,
      });
    }

    // Configurar blockers según jugadores
    const blockerPositions = BLOCKER_CONFIG[playerCount] || [];
    const blockers = blockerPositions.map(pos => ({
      position: pos,
      active: true,
    }));

    // Actualizar juego
    game.questions = allQuestions;
    game.blockers = blockers;
    game.status = 'playing';
    game.currentPhase = 'question';
    game.currentRound = 1;

    // Cargar primera pregunta
    game.currentQuestion = {
      text: allQuestions[0].text,
      correctAnswer: allQuestions[0].correctAnswer,
      category: allQuestions[0].category,
      answers: [],
      bets: [],
      winningAnswer: {},
    };

    await game.save();
    console.log(`✅ Juego ${gameCode} iniciado con ${playerCount} jugadores`);

    return game;
  } catch (error) {
    console.error('❌ Error iniciando juego:', error);
    throw error;
  }
};

/**
 * Obtener juego por código
 */
export const getGame = async (gameCode) => {
  try {
    const game = await Game.findOne({ gameCode });
    return game;
  } catch (error) {
    console.error('❌ Error obteniendo juego:', error);
    throw error;
  }
};

/**
 * Desconectar jugador
 */
export const disconnectPlayer = async (gameCode, playerId) => {
  try {
    const game = await Game.findOne({ gameCode });

    if (!game) {
      return;
    }

    const player = game.players.find(p => p.id === playerId);
    if (player) {
      player.connected = false;
      await game.save();
      console.log(`👋 ${player.name} se desconectó de ${gameCode}`);
    }
  } catch (error) {
    console.error('❌ Error desconectando jugador:', error);
  }
};

/**
 * Actualizar configuración del juego
 */
export const updateGameSettings = async (gameCode, settings) => {
  try {
    const game = await Game.findOne({ gameCode });

    if (!game) {
      throw new Error('Juego no encontrado');
    }

    game.settings = { ...game.settings, ...settings };
    await game.save();

    return game;
  } catch (error) {
    console.error('❌ Error actualizando configuración:', error);
    throw error;
  }
};

/**
 * Pausar/Reanudar juego
 */
export const togglePause = async (gameCode) => {
  try {
    const game = await Game.findOne({ gameCode });

    if (!game) {
      throw new Error('Juego no encontrado');
    }

    game.isPaused = !game.isPaused;
    await game.save();

    console.log(`⏸️  Juego ${gameCode} ${game.isPaused ? 'pausado' : 'reanudado'}`);

    return game;
  } catch (error) {
    console.error('❌ Error pausando juego:', error);
    throw error;
  }
};
