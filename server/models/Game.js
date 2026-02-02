import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  color: { type: String, required: true },
  money: { type: Number, default: 0 },
  tokens: { type: Number, default: 2 }, // Siempre 2, no se pierden
  connected: { type: Boolean, default: true },
  isHost: { type: Boolean, default: false },
});

const answerSchema = new mongoose.Schema({
  playerId: { type: String, required: true },
  playerName: { type: String, required: true },
  playerColor: { type: String },
  value: { type: Number, required: true },
  position: { type: String }, // Asignado después de ordenar
  isDuplicate: { type: Boolean, default: false },
  duplicateGroup: { type: Number },
});

const betSchema = new mongoose.Schema({
  playerId: { type: String, required: true },
  playerName: { type: String, required: true },
  position: { type: String, required: true }, // ej: '4to1-red', '1to1-black'
  pokerChips: { type: Number, default: 0 }, // Fichas de póquer apostadas (pueden perderse)
  isToken: { type: Boolean, default: true }, // Si es una ficha de apuesta (token)
});

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  correctAnswer: { type: Number, required: true },
  category: { type: String },
  round: { type: Number, required: true },
});

const currentQuestionSchema = new mongoose.Schema({
  text: { type: String },
  correctAnswer: { type: Number },
  category: { type: String },
  answers: [answerSchema],
  bets: [betSchema],
  winningAnswer: {
    allTooHigh: { type: Boolean, default: false },
    winningPosition: { type: String },
    winningValue: { type: Number },
    winners: [{ type: String }], // Array de playerIds
  },
});

const blockerSchema = new mongoose.Schema({
  position: { type: String, required: true },
  active: { type: Boolean, default: true },
});

const gameSchema = new mongoose.Schema(
  {
    gameCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    hostId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['lobby', 'playing', 'finished'],
      default: 'lobby',
    },
    currentRound: {
      type: Number,
      default: 1,
      min: 1,
      max: 7,
    },
    currentPhase: {
      type: String,
      enum: ['lobby', 'question', 'ordering', 'betting', 'reveal', 'results', 'finished'],
      default: 'lobby',
    },
    players: [playerSchema],
    questions: [questionSchema], // 7 preguntas seleccionadas al inicio
    currentQuestion: currentQuestionSchema,
    blockers: [blockerSchema],
    roundBonuses: {
      type: [Number],
      default: [50, 75, 100, 125, 150, 200, 250],
    },
    settings: {
      timerEnabled: { type: Boolean, default: false },
      questionTime: { type: Number, default: 60 }, // segundos
      bettingTime: { type: Number, default: 90 }, // segundos
    },
    isPaused: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Índices para mejorar performance
gameSchema.index({ gameCode: 1 });
gameSchema.index({ status: 1 });
gameSchema.index({ createdAt: 1 });

// Método para obtener leaderboard
gameSchema.methods.getLeaderboard = function () {
  return this.players
    .map(p => ({
      id: p.id,
      name: p.name,
      color: p.color,
      money: p.money,
      connected: p.connected,
    }))
    .sort((a, b) => b.money - a.money);
};

// Método para verificar si todos respondieron
gameSchema.methods.allPlayersAnswered = function () {
  const connectedPlayers = this.players.filter(p => p.connected);
  const answeredPlayers = this.currentQuestion.answers.length;
  return connectedPlayers.length > 0 && answeredPlayers === connectedPlayers.length;
};

// Método para verificar si todos apostaron
gameSchema.methods.allPlayersBet = function () {
  const connectedPlayers = this.players.filter(p => p.connected);
  const playersWhoBet = new Set(this.currentQuestion.bets.map(b => b.playerId));
  return connectedPlayers.length > 0 && playersWhoBet.size === connectedPlayers.length;
};

// Método para limpiar la ronda actual
gameSchema.methods.clearCurrentRound = function () {
  this.currentQuestion = {
    text: '',
    correctAnswer: 0,
    category: '',
    answers: [],
    bets: [],
    winningAnswer: {},
  };
};

const Game = mongoose.model('Game', gameSchema);

export default Game;
