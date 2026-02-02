import React, { useState } from 'react';
import './PlayerBettingBoard.css';

/**
 * TABLERO DE APUESTAS PARA JUGADORES
 * Vista interactiva donde los jugadores realizan sus apuestas
 * Basado en RESCATE_TABLERO_JUGADOR.jsx
 */

const PlayerBettingBoard = ({
  answers = [],
  blockers = [],
  currentBets = [],
  playerMoney = 0,
  tokensRemaining = 2,
  onPlaceBet,
  onRemoveBet,
}) => {
  const [selectedAmount, setSelectedAmount] = useState(0);

  // Todas las posiciones en orden horizontal (de izquierda a derecha)
  const mainPositions = [
    { id: '6to1-all-high', odds: '6:1', label: 'TODAS', color: 'all-high' },
    { id: '5to1-red', odds: '5:1', label: '', color: 'red' },
    { id: '4to1-red', odds: '4:1', label: '', color: 'red' },
    { id: '3to1-red', odds: '3:1', label: '', color: 'red' },
    { id: '2to1-green', odds: '2:1', label: '', color: 'green' },
    { id: '3to1-black', odds: '3:1', label: '', color: 'black' },
    { id: '4to1-black', odds: '4:1', label: '', color: 'black' },
    { id: '5to1-black', odds: '5:1', label: '', color: 'black' },
  ];

  // Crear mapa de respuestas
  const answersMap = {};
  if (answers && Array.isArray(answers)) {
    answers.forEach((answer) => {
      if (answer && answer.position) {
        answersMap[answer.position] = answer;
      }
    });
  }

  // Manejar click en posición
  const handlePositionClick = (positionId) => {
    const isBlocked =
      blockers && blockers.some((b) => b.position === positionId && b.active);
    if (isBlocked) return;

    // Verificar si ya hay apuesta en esta posición
    const existingBet = currentBets.find((bet) => bet.position === positionId);
    if (existingBet) return; // No permitir múltiples apuestas en la misma posición por ahora

    // Verificar si quedan tokens
    if (tokensRemaining <= 0) {
      alert('Ya no tienes tokens de apuesta disponibles');
      return;
    }

    // Preguntar cantidad de fichas de póquer (opcional)
    const amount = prompt(
      `¿Cuántas fichas de póquer quieres apostar? (0-${playerMoney})\n0 = solo token de apuesta`,
      '0',
    );
    if (amount === null) return; // Cancelado

    const pokerChips = parseInt(amount) || 0;
    if (pokerChips < 0 || pokerChips > playerMoney) {
      alert('Cantidad inválida');
      return;
    }

    // Colocar apuesta
    if (onPlaceBet) {
      onPlaceBet(positionId, pokerChips);
    }
  };

  // Manejar apuesta especial
  const handleSpecialBet = (positionId) => {
    if (tokensRemaining <= 0) {
      alert('Ya no tienes tokens de apuesta disponibles');
      return;
    }

    const existingBet = currentBets.find((bet) => bet.position === positionId);
    if (existingBet) return;

    const amount = prompt(
      `¿Cuántas fichas de póquer quieres apostar? (0-${playerMoney})\n0 = solo token de apuesta`,
      '0',
    );
    if (amount === null) return;

    const pokerChips = parseInt(amount) || 0;
    if (pokerChips < 0 || pokerChips > playerMoney) {
      alert('Cantidad inválida');
      return;
    }

    if (onPlaceBet) {
      onPlaceBet(positionId, pokerChips);
    }
  };

  const renderBetSpace = (pos) => {
    const answer = answersMap[pos.id];
    const isBlocked =
      blockers && blockers.some((b) => b.position === pos.id && b.active);
    const hasBet = currentBets.some((bet) => bet.position === pos.id);

    return (
      <div
        key={pos.id}
        className={`mini-bet-space ${pos.color} ${isBlocked ? 'blocked' : ''} ${hasBet ? 'has-bet' : ''}`}
        data-position={pos.id}
        onClick={() => !isBlocked && onPlaceBet && handlePositionClick(pos.id)}
      >
        <div className="mini-odds">{pos.odds}</div>
        {pos.label && <div className="mini-label">{pos.label}</div>}

        {answer && (
          <>
            <div className="mini-answer-value">{answer.value}</div>
            <div className="mini-answer-player">{answer.playerName || ''}</div>
          </>
        )}

        {hasBet && (
          <div className="mini-bet-indicator">
            <div className="visual-chip">✓</div>
          </div>
        )}

        {isBlocked && <div className="blocked-icon">🚫</div>}
      </div>
    );
  };

  return (
    <div className="player-betting-board">
      {/* Header con información del jugador */}
      <div className="betting-header">
        <div className="money-info">
          <div className="money-label">Tu dinero</div>
          <div className="money-amount">${playerMoney}</div>
        </div>
        <div className="tokens-info">
          <div className="tokens-label">Tokens disponibles</div>
          <div className="tokens-remaining">{tokensRemaining}/2</div>
        </div>
      </div>

      {/* Tablero principal */}
      {/* Fila principal horizontal - 8 casillas */}
      <div className="mini-board-main-row">
        {mainPositions.map((pos) => renderBetSpace(pos))}
      </div>

      {/* Apuestas especiales - alineadas con columnas */}
      <div className="mini-board-special">
        <div className="spacer"></div>
        <div
          className="mini-special-bet red-special"
          onClick={() => handleSpecialBet('1to1-red')}
        >
          <div className="mini-special-title">ROJO 1:1</div>
          <div className="mini-special-desc">Gana ROJO</div>
          {currentBets.some((bet) => bet.position === '1to1-red') && (
            <div className="mini-bet-indicator">
              <div className="visual-chip">✓</div>
            </div>
          )}
        </div>
        <div className="spacer-middle"></div>
        <div
          className="mini-special-bet black-special"
          onClick={() => handleSpecialBet('1to1-black')}
        >
          <div className="mini-special-title">NEGRO 1:1</div>
          <div className="mini-special-desc">Gana NEGRO</div>
          {currentBets.some((bet) => bet.position === '1to1-black') && (
            <div className="mini-bet-indicator">
              <div className="visual-chip">✓</div>
            </div>
          )}
        </div>
      </div>

      {/* Lista de apuestas actuales */}
      {currentBets.length > 0 && (
        <div className="current-bets-display">
          <div className="current-bets-title">Tus Apuestas:</div>
          {currentBets.map((bet, idx) => (
            <div key={idx} className="current-bet-item">
              <div>
                <div className="current-bet-name">Posición: {bet.position}</div>
                <div className="current-bet-details">
                  Token de apuesta
                  {bet.pokerChips > 0 && <span> + ${bet.pokerChips}</span>}
                </div>
              </div>
              <button
                className="btn-remove-bet"
                onClick={() => onRemoveBet && onRemoveBet(idx)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {currentBets.length === 0 && (
        <div className="no-bets">Haz click en una casilla para apostar</div>
      )}
    </div>
  );
};

export default PlayerBettingBoard;
