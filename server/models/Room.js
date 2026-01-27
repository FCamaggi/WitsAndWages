const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  socketId: { type: String, required: true },
  money: { type: Number, default: 0 },
  bettingTokens: { type: Number, default: 2 },
  currentAnswer: { type: Number, default: null },
  bets: [{
    position: String,
    amount: Number,
    pokerChips: Number
  }],
  connected: { type: Boolean, default: true }
});

const roundSchema = new mongoose.Schema({
  number: { type: Number, required: true },
  question: {
    id: String,
    pregunta: String,
    respuesta: Number,
    unidad: String,
    categoria: String,
    trivia: String
  },
  answers: [{
    playerId: String,
    playerName: String,
    value: Number
  }],
  bets: [{
    playerId: String,
    position: String,
    amount: Number,
    pokerChips: Number
  }],
  winningAnswer: { type: Number, default: null },
  winners: [String],
  completed: { type: Boolean, default: false }
});

const roomSchema = new mongoose.Schema({
  code: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true,
    length: 6
  },
  hostId: { type: String, required: true },
  hostSocketId: { type: String, required: true },
  players: [playerSchema],
  status: { 
    type: String, 
    enum: ['waiting', 'playing', 'finished'],
    default: 'waiting'
  },
  currentRound: { type: Number, default: 0 },
  totalRounds: { type: Number, default: 7 },
  rounds: [roundSchema],
  excludedCategories: [String],
  blockers: [{
    position: String,
    playerCount: Number
  }],
  gameState: {
    phase: {
      type: String,
      enum: ['lobby', 'question', 'answering', 'betting', 'reveal', 'roundEnd', 'gameEnd'],
      default: 'lobby'
    },
    timer: Number
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Índices
roomSchema.index({ code: 1 });
roomSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 }); // Expira después de 24 horas

module.exports = mongoose.model('Room', roomSchema);
