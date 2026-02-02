import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import BettingBoard from '../board/BettingBoard';
import './HostView.css';

const HostView = () => {
  const navigate = useNavigate();
  const { socket, isConnected, game, setGame, setIsHost } = useGame();
  const [hostName, setHostName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsHost(true);

    // Escuchar eventos del juego
    if (socket) {
      socket.on('game:updated', ({ game: updatedGame }) => {
        console.log('🔄 Juego actualizado:', updatedGame);
        setGame(updatedGame);
      });

      socket.on('player:joined', ({ player, playerCount }) => {
        console.log('👤 Jugador unido:', player.name, '- Total:', playerCount);
        // El game:updated ya actualizará el estado
      });

      socket.on('player:left', ({ playerName }) => {
        console.log('👋 Jugador se fue:', playerName);
      });

      socket.on('game:all-answered', () => {
        console.log('✅ Todos respondieron');
      });

      socket.on('game:all-bet', () => {
        console.log('✅ Todos apostaron');
      });

      return () => {
        socket.off('game:updated');
        socket.off('player:joined');
        socket.off('player:left');
        socket.off('game:all-answered');
        socket.off('game:all-bet');
      };
    }
  }, [socket, setIsHost, setGame]);

  const handleCreateGame = async () => {
    if (!socket || !isConnected) {
      setError('No hay conexión con el servidor');
      return;
    }

    setLoading(true);
    setError('');

    socket.emit('host:create-game', { hostName: 'HOST' }, (response) => {
      setLoading(false);

      if (response.success) {
        setGame(response.game);
        console.log('✅ Partida creada:', response.game.gameCode);
      } else {
        setError(response.error || 'Error creando partida');
      }
    });
  };

  const handleStartGame = () => {
    if (!game) return;

    const playerCount = game.players.filter((p) => p.connected).length;

    if (playerCount < 3) {
      setError('Se necesitan al menos 3 jugadores para empezar');
      return;
    }

    socket.emit('host:start-game', { gameCode: game.gameCode }, (response) => {
      if (response.success) {
        setGame(response.game);
      } else {
        setError(response.error || 'Error iniciando juego');
      }
    });
  };

  const handleOrderAnswers = () => {
    socket.emit(
      'host:order-answers',
      { gameCode: game.gameCode },
      (response) => {
        if (response.success) {
          setGame(response.game);
        } else {
          setError(response.error);
        }
      },
    );
  };

  const handleStartBetting = () => {
    socket.emit(
      'host:start-betting',
      { gameCode: game.gameCode },
      (response) => {
        if (response.success) {
          setGame(response.game);
        } else {
          setError(response.error);
        }
      },
    );
  };

  const handleRevealAnswer = () => {
    socket.emit(
      'host:reveal-answer',
      { gameCode: game.gameCode },
      (response) => {
        if (response.success) {
          setGame(response.game);

          // Calcular pagos automáticamente después de revelar
          setTimeout(() => {
            socket.emit(
              'host:calculate-payouts',
              { gameCode: game.gameCode },
              (payoutResponse) => {
                if (payoutResponse.success) {
                  setGame(payoutResponse.game);
                }
              },
            );
          }, 2000);
        } else {
          setError(response.error);
        }
      },
    );
  };

  const handleNextRound = () => {
    socket.emit('host:next-round', { gameCode: game.gameCode }, (response) => {
      if (response.success) {
        setGame(response.game);
      } else {
        setError(response.error);
      }
    });
  };

  if (!isConnected) {
    return (
      <div className="host-view">
        <div className="container">
          <div className="card">
            <h1 className="title">⏳ Conectando...</h1>
            <p className="loading">Estableciendo conexión con el servidor</p>
          </div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="host-view">
        <div className="container">
          <div className="card">
            <h1 className="title">🎮 Crear Partida</h1>

            <p className="subtitle" style={{ marginBottom: '2rem' }}>
              Como host, controlarás el flujo del juego y todos lo verán en esta
              pantalla
            </p>

            {error && <div className="error-message">{error}</div>}

            <button
              className="btn btn-primary btn-large"
              onClick={handleCreateGame}
              disabled={loading}
            >
              {loading ? '⏳ Creando...' : '🎮 Crear Partida'}
            </button>

            <button
              className="btn btn-secondary btn-large"
              onClick={() => navigate('/')}
            >
              ← Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  // LOBBY
  if (game.currentPhase === 'lobby') {
    const connectedPlayers = game.players.filter((p) => p.connected);

    return (
      <div className="host-view">
        <div className="container">
          <div className="card">
            <h1 className="title">🎰 Lobby</h1>

            <div className="game-code-display">
              <h2>Código de Partida:</h2>
              <div className="game-code" data-testid="game-code">
                {game.gameCode}
              </div>
              <p>Comparte este código con los jugadores</p>
            </div>

            <div className="players-list">
              <h3>Jugadores ({connectedPlayers.length}/7):</h3>
              {connectedPlayers.length === 0 ? (
                <div className="no-players">
                  <p>⏳ Esperando jugadores...</p>
                  <p
                    style={{
                      fontSize: '0.9rem',
                      color: '#999',
                      marginTop: '0.5rem',
                    }}
                  >
                    Los jugadores deben unirse con el código de arriba
                  </p>
                </div>
              ) : (
                connectedPlayers.map((player) => (
                  <div
                    key={player.id}
                    className="player-item"
                    style={{ borderLeft: `4px solid ${player.color}` }}
                  >
                    <span className="player-name">{player.name}</span>
                  </div>
                ))
              )}
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              className="btn btn-success"
              onClick={handleStartGame}
              disabled={connectedPlayers.length < 3}
            >
              {connectedPlayers.length < 3
                ? `Esperando jugadores (mínimo 3)`
                : `Iniciar Juego (${connectedPlayers.length} jugadores)`}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // FASE DE ORDENAMIENTO
  if (game.currentPhase === 'ordering') {
    return (
      <div className="host-view">
        <div className="host-container">
          <div className="host-header">
            <h1 className="host-title">Ronda {game.currentRound} de 7</h1>
          </div>

          <div className="host-main">
            <h2 className="question-display">{game.currentQuestion.text}</h2>

            <BettingBoard
              answers={game.currentQuestion.answers}
              blockers={game.blockers}
              bets={[]}
              isHost={true}
            />

            <div className="host-controls">
              <button
                className="btn btn-primary btn-large"
                onClick={handleStartBetting}
              >
                Iniciar Apuestas →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // FASE DE PREGUNTA
  if (game.currentPhase === 'question') {
    const answeredCount = game.currentQuestion.answers.length;
    const totalPlayers = game.players.filter((p) => p.connected).length;
    const allAnswered = answeredCount === totalPlayers;

    return (
      <div className="host-view">
        <div className="host-container">
          <div className="host-header">
            <h1 className="host-title">Ronda {game.currentRound} de 7</h1>
          </div>

          <div className="host-main">
            <h2 className="question-display">{game.currentQuestion.text}</h2>

            <div className="answer-progress">
              <h3>Esperando respuestas...</h3>
              <div className="progress-display">
                <span className="progress-count">
                  {answeredCount}/{totalPlayers}
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${(answeredCount / totalPlayers) * 100}%` }}
                ></div>
              </div>
            </div>

            {allAnswered && (
              <div className="host-controls">
                <button
                  className="btn btn-success btn-large"
                  onClick={handleOrderAnswers}
                >
                  ✓ Todos respondieron - Ordenar Respuestas
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // FASE DE APUESTAS
  if (game.currentPhase === 'betting') {
    const bettingPlayers = new Set(
      game.currentQuestion.bets.map((b) => b.playerId),
    );
    const totalPlayers = game.players.filter((p) => p.connected).length;
    const allBet = bettingPlayers.size === totalPlayers;

    return (
      <div className="host-view">
        <div className="host-container">
          <div className="host-header">
            <h1 className="host-title">
              Ronda {game.currentRound} de 7 - APUESTAS
            </h1>
          </div>

          <div className="host-main">
            <h2 className="question-display">{game.currentQuestion.text}</h2>

            <BettingBoard
              answers={game.currentQuestion.answers}
              blockers={game.blockers}
              bets={game.currentQuestion.bets}
              isHost={true}
            />

            <div className="betting-status">
              <h3>
                Esperando apuestas: {bettingPlayers.size}/{totalPlayers}
              </h3>
            </div>

            {allBet && (
              <div className="host-controls">
                <button
                  className="btn btn-success btn-large"
                  onClick={handleRevealAnswer}
                >
                  🎯 Todos apostaron - Revelar Respuesta
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // FASE DE RESULTADOS
  if (game.currentPhase === 'results') {
    // El leaderboard viene del evento phase:results
    const leaderboard = game.leaderboard || game.players?.sort((a, b) => b.money - a.money) || [];

    return (
      <div className="host-view">
        <div className="container">
          <div className="card">
            <h1 className="title">💰 Resultados Ronda {game.currentRound}</h1>

            <div className="results-summary">
              <h2>Respuesta Correcta: {game.currentQuestion.correctAnswer}</h2>
              {game.currentQuestion.winningAnswer.allTooHigh ? (
                <h3 className="all-high">¡TODAS LAS RESPUESTAS MUY ALTAS!</h3>
              ) : (
                <h3>
                  Respuesta Ganadora:{' '}
                  {game.currentQuestion.winningAnswer.winningValue}
                </h3>
              )}
            </div>

            <div className="leaderboard">
              <h3>Clasificación:</h3>
              {leaderboard.map((player, idx) => (
                <div key={player.id} className="leaderboard-item">
                  <span className="position">{idx + 1}.</span>
                  <span className="name" style={{ color: player.color }}>
                    {player.name}
                  </span>
                  <span className="money">${player.money}</span>
                </div>
              ))}
            </div>

            <button className="btn btn-primary" onClick={handleNextRound}>
              {game.currentRound >= 7 ? 'Ver Ganador 🏆' : 'Siguiente Ronda →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // JUEGO TERMINADO
  if (game.currentPhase === 'finished') {
    const leaderboard = game.leaderboard || game.players?.sort((a, b) => b.money - a.money) || [];
    const winner = leaderboard[0];

    return (
      <div className="host-view">
        <div className="container">
          <div className="card">
            <h1 className="title">🏆 ¡Juego Terminado! 🏆</h1>

            <div className="winner-display">
              <h2>GANADOR:</h2>
              <div className="winner-name" style={{ color: winner.color }}>
                {winner.name}
              </div>
              <div className="winner-money">${winner.money}</div>
            </div>

            <div className="final-leaderboard">
              <h3>Clasificación Final:</h3>
              {leaderboard.map((player, idx) => (
                <div key={player.id} className="leaderboard-item">
                  <span className="position">{idx + 1}.</span>
                  <span className="name" style={{ color: player.color }}>
                    {player.name}
                  </span>
                  <span className="money">${player.money}</span>
                </div>
              ))}
            </div>

            <button className="btn btn-primary" onClick={() => navigate('/')}>
              Volver al Inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="host-view">
      <div className="container">
        <div className="card">
          <p>Fase: {game.currentPhase}</p>
        </div>
      </div>
    </div>
  );
};

export default HostView;
