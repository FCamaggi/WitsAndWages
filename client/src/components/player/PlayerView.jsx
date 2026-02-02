import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import PlayerBettingBoard from '../board/PlayerBettingBoard';
import PlayerBettingBoardV2 from '../board/PlayerBettingBoardV2';
import LoadingSpinner from '../shared/LoadingSpinner';
import './PlayerView.css';

const PlayerView = () => {
  const navigate = useNavigate();
  const { socket, isConnected, game, setGame, player, setPlayer } = useGame();

  const [gameCode, setGameCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [playerColor, setPlayerColor] = useState(() => {
    // Generar color aleatorio al inicio
    const colors = [
      '#ff6b6b',
      '#51cf66',
      '#4dabf7',
      '#ffd43b',
      '#da77f2',
      '#ff922b',
      '#20c997',
      '#ff6b9d',
      '#748ffc',
      '#69db7c',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Estado para responder
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado para apostar - FICHAS INDIVIDUALES
  const [token1, setToken1] = useState(null); // { position, pokerChips }
  const [token2, setToken2] = useState(null); // { position, pokerChips }

  const handleJoinGame = async () => {
    if (!gameCode.trim() || !playerName.trim()) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (!socket || !isConnected) {
      setError('No hay conexión con el servidor');
      return;
    }

    setLoading(true);
    setError('');

    socket.emit(
      'player:join-game',
      { gameCode: gameCode.toUpperCase(), playerName, playerColor },
      (response) => {
        setLoading(false);

        if (response.success) {
          setGame(response.game);
          const joinedPlayer = response.game.players.find(
            (p) => p.id === response.playerId,
          );
          setPlayer(joinedPlayer);
          console.log('✅ Unido a la partida');
        } else {
          setError(response.error || 'Error uniéndose a la partida');
        }
      },
    );
  };

  const handleSubmitAnswer = () => {
    if (!answer || isNaN(answer) || Number(answer) < 0) {
      setError('Ingresa un número válido');
      return;
    }

    setIsSubmitting(true);
    socket.emit(
      'player:submit-answer',
      {
        gameCode: game.gameCode,
        playerId: player.id,
        answer: Number(answer),
      },
      (response) => {
        setIsSubmitting(false);
        if (response.success) {
          console.log('✅ Respuesta enviada');
          setAnswer('');
          setError('');
        } else {
          setError(response.error);
        }
      },
    );
  };

  const handlePlaceToken = (tokenNumber, position, pokerChips = 0) => {
    // Verificar dinero disponible
    const currentPlayer = game.players.find((p) => p.id === player.id);
    if (pokerChips > currentPlayer.money) {
      alert('No tienes suficiente dinero');
      return;
    }

    if (tokenNumber === 1) {
      setToken1({ position, pokerChips });
    } else if (tokenNumber === 2) {
      setToken2({ position, pokerChips });
    }
  };

  const handleRemoveToken = (tokenNumber) => {
    if (tokenNumber === 1) {
      setToken1(null);
    } else if (tokenNumber === 2) {
      setToken2(null);
    }
  };

  const handleConfirmBets = () => {
    if (!token1 && !token2) {
      setError('Debes colocar al menos 1 ficha');
      return;
    }

    // Convertir fichas a formato de apuestas para el servidor
    const bets = [];
    if (token1) {
      bets.push({ position: token1.position, tokens: 1, pokerChips: token1.pokerChips });
    }
    if (token2) {
      bets.push({ position: token2.position, tokens: 1, pokerChips: token2.pokerChips });
    }

    socket.emit(
      'player:place-bet',
      {
        gameCode: game.gameCode,
        playerId: player.id,
        bets: bets,
      },
      (response) => {
        if (response.success) {
          console.log('✅ Apuestas confirmadas');
          setToken1(null);
          setToken2(null);
          setError('');
        } else {
          setError(response.error);
        }
      },
    );
  };

  // Nuevo handler para el sistema V2 de drag & drop
  const handleConfirmBetsV2 = (bets) => {
    if (!bets || bets.length === 0) {
      setError('Debes colocar al menos 1 ficha de apuesta');
      return;
    }

    socket.emit(
      'player:place-bet',
      {
        gameCode: game.gameCode,
        playerId: player.id,
        bets: bets,
      },
      (response) => {
        if (response.success) {
          console.log('✅ Apuestas confirmadas (V2)');
          setError('');
        } else {
          setError(response.error);
        }
      },
    );
  };

  // Verificar si ya respondió
  const hasAnswered = game?.currentQuestion?.answers?.some(
    (a) => a.playerId === player?.id,
  );

  // Verificar si ya apostó
  const hasBet = game?.currentQuestion?.bets?.some(
    (b) => b.playerId === player?.id,
  );

  if (!isConnected) {
    return (
      <div className="player-view">
        <div className="container">
          <div className="card">
            <h1 className="title">⏳ Conectando...</h1>
            <p className="loading">Estableciendo conexión</p>
          </div>
        </div>
      </div>
    );
  }

  if (!player) {
    // Colores disponibles para el jugador
    const availableColors = [
      { hex: '#ff6b6b', name: 'Rojo' },
      { hex: '#51cf66', name: 'Verde' },
      { hex: '#4dabf7', name: 'Azul' },
      { hex: '#ffd43b', name: 'Amarillo' },
      { hex: '#da77f2', name: 'Morado' },
      { hex: '#ff922b', name: 'Naranja' },
      { hex: '#20c997', name: 'Turquesa' },
      { hex: '#ff6b9d', name: 'Rosa' },
      { hex: '#748ffc', name: 'Índigo' },
      { hex: '#69db7c', name: 'Lima' },
    ];

    return (
      <div className="player-view join-view">
        <div className="container">
          <div className="card join-card">
            <h1 className="title">👤 Unirse a Partida</h1>
            <p className="subtitle">Ingresa el código para empezar a jugar</p>

            {error && (
              <div className="error-message" role="alert">
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="gameCode">Código de Partida</label>
              <input
                id="gameCode"
                type="text"
                className="input input-code"
                placeholder="Ej: ABC123"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                maxLength={6}
                autoComplete="off"
                autoFocus
                disabled={loading}
              />
              <small className="input-hint">6 caracteres proporcionados por el host</small>
            </div>

            <div className="form-group">
              <label htmlFor="playerName">Tu Nombre</label>
              <input
                id="playerName"
                type="text"
                className="input"
                placeholder="Ingresa tu nombre"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={20}
                autoComplete="name"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Tu Color</label>
              <div className="color-selector">
                {availableColors.map((color) => (
                  <button
                    key={color.hex}
                    type="button"
                    className={`color-option ${playerColor === color.hex ? 'selected' : ''}`}
                    style={{ backgroundColor: color.hex }}
                    onClick={() => setPlayerColor(color.hex)}
                    title={color.name}
                    disabled={loading}
                    aria-label={`Seleccionar color ${color.name}`}
                  >
                    {playerColor === color.hex && <span className="check-icon">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Tu Color:</label>
              <input
                type="color"
                value={playerColor}
                onChange={(e) => setPlayerColor(e.target.value)}
                style={{ width: '100%', height: '50px', cursor: 'pointer' }}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              className="btn btn-success"
              onClick={handleJoinGame}
              disabled={loading}
            >
              {loading ? 'Uniéndose...' : 'Unirse'}
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => navigate('/')}
              style={{ marginTop: '1rem' }}
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  // LOBBY
  if (game.currentPhase === 'lobby') {
    return (
      <div className="player-view">
        <div className="container">
          <div className="card">
            <h1 className="title">⏳ Esperando...</h1>
            <p className="subtitle">El host iniciará la partida pronto</p>

            <div className="player-info">
              <div
                className="player-badge"
                style={{ borderColor: player.color }}
              >
                <span style={{ color: player.color }}>●</span> {player.name}
              </div>
              <p>
                Jugadores conectados:{' '}
                {game.players.filter((p) => p.connected).length}/7
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // FASE DE PREGUNTA
  if (game.currentPhase === 'question') {
    return (
      <div className="player-view">
        <div className="player-container">
          <div className="player-header">
            <div className="round-badge">Ronda {game.currentRound}/7</div>
            <div
              className="player-badge"
              style={{ backgroundColor: player.color }}
            >
              {player.name}
            </div>
          </div>

          <div className="player-main">
            <h2 className="question-text">{game.currentQuestion.text}</h2>

            {!hasAnswered ? (
              <div className="answer-form">
                <label htmlFor="answer">Tu estimación:</label>
                <input
                  id="answer"
                  type="number"
                  className="input-answer"
                  placeholder="Ingresa un número"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  min="0"
                  step="any"
                />

                {error && <div className="error-message">{error}</div>}

                <button
                  className="btn btn-primary btn-large"
                  onClick={handleSubmitAnswer}
                >
                  Enviar Respuesta
                </button>
              </div>
            ) : (
              <div className="waiting-message">
                <div className="success-icon">✓</div>
                <h3>Respuesta enviada</h3>
                <p>Esperando a los demás jugadores...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // FASE DE ORDENAMIENTO - Mostrar tablero mientras espera
  if (game.currentPhase === 'ordering') {
    return (
      <div className="player-view">
        <div className="player-container">
          <div className="player-header">
            <div className="round-badge">Ronda {game.currentRound}/7</div>
            <div
              className="player-badge"
              style={{ backgroundColor: player.color }}
            >
              {player.name} - ${player.money}
            </div>
          </div>

          <div className="player-main">
            <h2 className="question-text">{game.currentQuestion.text}</h2>

            <PlayerBettingBoard
              answers={game.currentQuestion.answers}
              blockers={game.blockers}
              token1={null}
              token2={null}
              playerMoney={player.money}
              playerColor={player.color}
              onPlaceToken={null}
              onRemoveToken={null}
            />

            <div className="waiting-message">
              <p>Prepárate para apostar...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // FASE DE APUESTAS
  if (game.currentPhase === 'betting') {
    // Obtener jugador actualizado
    const currentPlayer = game.players.find((p) => p.id === player.id);

    return (
      <div className="player-view">
        <div className="player-container betting">
          <div className="player-header">
            <div className="round-badge">Ronda {game.currentRound}/7</div>
            <div
              className="player-badge"
              style={{ backgroundColor: player.color }}
            >
              {player.name} - ${currentPlayer.money}
            </div>
          </div>

          <div className="player-main">
            <h2 className="question-text">{game.currentQuestion.text}</h2>

            {!hasBet ? (
              <>
                <PlayerBettingBoard
                  answers={game.currentQuestion.answers}
                  blockers={game.blockers}
                  token1={token1}
                  token2={token2}
                  playerMoney={currentPlayer.money}
                  playerColor={player.color}
                  onPlaceToken={handlePlaceToken}
                  onRemoveToken={handleRemoveToken}
                />

                {error && <div className="error-message">{error}</div>}

                {(token1 || token2) && (
                  <button
                    className="btn btn-success btn-large"
                    onClick={handleConfirmBets}
                  >
                    ✓ Confirmar Apuestas ({(token1 ? 1 : 0) + (token2 ? 1 : 0)} ficha{(token1 && token2) ? 's' : ''})
                  </button>
                )}
              </>
              </>
            ) : (
              <div className="waiting-message">
                <div className="success-icon">✓</div>
                <h3>Apuestas confirmadas</h3>
                <p>Esperando a los demás jugadores...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // OTROS ESTADOS (results, finished, etc.)
  return (
    <div className="player-view">
      <div className="container">
        <div className="card">
          <h1 className="title">⏳ Esperando...</h1>
          <p>Fase actual: {game.currentPhase}</p>
        </div>
      </div>
    </div>
  );
};

export default PlayerView;
