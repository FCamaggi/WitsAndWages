import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame debe ser usado dentro de GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }) => {
  const { socket, isConnected } = useSocket();
  const [game, setGame] = useState(null);
  const [player, setPlayer] = useState(null);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    if (!socket) return;

    // Escuchar actualizaciones del juego
    socket.on('game:started', ({ game: updatedGame }) => {
      setGame(updatedGame);
    });

    socket.on('game:updated', ({ game: updatedGame }) => {
      setGame(updatedGame);
    });

    socket.on('player:joined', ({ player: newPlayer, playerCount }) => {
      console.log(`👤 ${newPlayer.name} se unió (${playerCount} jugadores)`);
    });

    socket.on('player:left', ({ playerName }) => {
      console.log(`👋 ${playerName} se fue`);
    });

    socket.on(
      'player:answered',
      ({ playerName, answeredCount, totalPlayers }) => {
        console.log(
          `📝 ${playerName} respondió (${answeredCount}/${totalPlayers})`,
        );
      },
    );

    socket.on('player:bet-placed', ({ playerName, betCount, totalPlayers }) => {
      console.log(`🎲 ${playerName} apostó (${betCount}/${totalPlayers})`);
    });

    socket.on('phase:question', ({ question, round, category }) => {
      console.log(`❓ Nueva pregunta (Ronda ${round}):`, question);
      setGame((prev) => ({
        ...prev,
        currentPhase: 'question',
        currentRound: round,
        currentQuestion: {
          ...prev.currentQuestion,
          text: question,
          category,
          answers: [],
        },
      }));
    });

    socket.on('phase:betting', ({ answers, blockers }) => {
      console.log('🎲 Fase de apuestas iniciada');
      setGame((prev) => ({
        ...prev,
        currentPhase: 'betting',
        currentQuestion: {
          ...prev.currentQuestion,
          answers,
        },
        blockers: blockers || prev.blockers,
      }));
    });

    socket.on('phase:reveal', ({ correctAnswer, winningAnswer }) => {
      console.log('🎯 Respuesta correcta:', correctAnswer);
      setGame((prev) => ({
        ...prev,
        currentPhase: 'reveal',
        currentQuestion: {
          ...prev.currentQuestion,
          correctAnswer,
          winningAnswer,
        },
      }));
    });

    socket.on('phase:results', ({ payments, leaderboard }) => {
      console.log('💰 Resultados:', payments);
      setGame((prev) => ({
        ...prev,
        currentPhase: 'results',
        payments,
        leaderboard,
      }));
    });

    socket.on('game:finished', ({ winner, leaderboard }) => {
      console.log('🏁 Juego terminado. Ganador:', winner);
    });

    socket.on('game:pause-toggled', ({ isPaused }) => {
      console.log(isPaused ? '⏸️ Juego pausado' : '▶️ Juego reanudado');
    });

    return () => {
      socket.off('game:started');
      socket.off('game:updated');
      socket.off('player:joined');
      socket.off('player:left');
      socket.off('phase:question');
      socket.off('phase:betting');
      socket.off('phase:reveal');
      socket.off('phase:results');
      socket.off('game:finished');
      socket.off('game:pause-toggled');
    };
  }, [socket]);

  const value = {
    socket,
    isConnected,
    game,
    setGame,
    player,
    setPlayer,
    isHost,
    setIsHost,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
