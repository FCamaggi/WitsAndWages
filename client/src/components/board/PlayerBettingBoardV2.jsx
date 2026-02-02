import React, { useState } from 'react';
import BettingToken from './BettingToken';
import './PlayerBettingBoardV2.css';

/**
 * TABLERO DE APUESTAS V2 - CON DRAG & DROP
 * Sistema intuitivo basado en la mecánica física del juego
 */

const PlayerBettingBoardV2 = ({
  answers = [],
  blockers = [],
  playerMoney = 0,
  playerColor = 'red',
  onConfirmBets, // callback cuando se confirman las apuestas
}) => {
  // Estado de las 2 fichas de apuesta del jugador
  const [tokens, setTokens] = useState([
    { id: 1, placed: false, position: null, pokerChips: 0 },
    { id: 2, placed: false, position: null, pokerChips: 0 },
  ]);

  const [draggedToken, setDraggedToken] = useState(null);
  const [showPokerChipsModal, setShowPokerChipsModal] = useState(null);

  // Todas las posiciones en orden horizontal
  const mainPositions = [
    { id: '6to1-all-high', odds: '6:1', label: 'TODAS\nALTAS', color: 'all-high' },
    { id: '5to1-red', odds: '5:1', label: '', color: 'red' },
    { id: '4to1-red', odds: '4:1', label: '', color: 'red' },
    { id: '3to1-red', odds: '3:1', label: '', color: 'red' },
    { id: '2to1-green', odds: '2:1', label: '', color: 'green' },
    { id: '3to1-black', odds: '3:1', label: '', color: 'black' },
    { id: '4to1-black', odds: '4:1', label: '', color: 'black' },
    { id: '5to1-black', odds: '5:1', label: '', color: 'black' },
  ];

  // Posiciones especiales (1 a 1)
  const specialPositions = [
    { id: 'red-1to1', odds: '1:1', label: 'ROJO', color: 'red-special' },
    { id: 'black-1to1', odds: '1:1', label: 'NEGRO', color: 'black-special' },
  ];

  // Crear mapa de respuestas
  const answersMap = {};
  answers.forEach((answer) => {
    if (answer && answer.position) {
      answersMap[answer.position] = answer;
    }
  });

  // Manejar inicio de arrastre
  const handleDragStart = (tokenId) => {
    setDraggedToken(tokenId);
  };

  const handleDragEnd = () => {
    setDraggedToken(null);
  };

  // Manejar drop en posición
  const handleDrop = (e, positionId) => {
    e.preventDefault();
    
    if (!draggedToken) return;

    // Verificar si la posición está bloqueada
    const isBlocked = blockers.some((b) => b.position === positionId && b.active);
    if (isBlocked) return;

    // Colocar la ficha en esta posición
    setTokens(tokens.map(token => {
      if (token.id === draggedToken) {
        return {
          ...token,
          placed: true,
          position: positionId,
        };
      }
      return token;
    }));

    setDraggedToken(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Remover ficha de una posición (click derecho o doble click)
  const handleRemoveToken = (tokenId) => {
    setTokens(tokens.map(token => {
      if (token.id === tokenId) {
        return {
          ...token,
          placed: false,
          position: null,
          pokerChips: 0,
        };
      }
      return token;
    }));
  };

  // Agregar fichas de póquer a una apuesta
  const handleAddPokerChips = (tokenId, amount) => {
    if (amount < 0 || amount > playerMoney) {
      alert('Cantidad inválida');
      return;
    }

    setTokens(tokens.map(token => {
      if (token.id === tokenId) {
        return { ...token, pokerChips: amount };
      }
      return token;
    }));

    setShowPokerChipsModal(null);
  };

  // Confirmar todas las apuestas
  const handleConfirm = () => {
    const placedTokens = tokens.filter(t => t.placed);
    
    if (placedTokens.length === 0) {
      alert('Debes colocar al menos 1 ficha de apuesta');
      return;
    }

    // Formato para el servidor: agrupar fichas en la misma posición
    const betsMap = {};
    placedTokens.forEach(token => {
      if (!betsMap[token.position]) {
        betsMap[token.position] = { position: token.position, pokerChips: 0 };
      }
      betsMap[token.position].pokerChips += token.pokerChips;
    });

    const bets = Object.values(betsMap);

    if (onConfirmBets) {
      onConfirmBets(bets);
    }
  };

  // Obtener fichas colocadas en una posición
  const getTokensAtPosition = (positionId) => {
    return tokens.filter(t => t.placed && t.position === positionId);
  };

  // Renderizar espacio de apuesta
  const renderBetSpace = (pos) => {
    const answer = answersMap[pos.id];
    const isBlocked = blockers.some((b) => b.position === pos.id && b.active);
    const tokensHere = getTokensAtPosition(pos.id);
    const hasTokens = tokensHere.length > 0;

    return (
      <div
        key={pos.id}
        className={`bet-space-v2 ${pos.color} ${isBlocked ? 'blocked' : ''} ${hasTokens ? 'has-tokens' : ''} ${draggedToken ? 'drop-target' : ''}`}
        data-position={pos.id}
        onDrop={(e) => handleDrop(e, pos.id)}
        onDragOver={handleDragOver}
      >
        <div className="odds-display">{pos.odds}</div>
        {pos.label && <div className="position-label">{pos.label}</div>}

        {answer && (
          <div className="answer-display">
            <div className="answer-value">{answer.value}</div>
            <div className="answer-player">{answer.playerName}</div>
          </div>
        )}

        {/* Mostrar fichas colocadas aquí */}
        {tokensHere.length > 0 && (
          <div className="placed-tokens">
            {tokensHere.map(token => (
              <div 
                key={token.id} 
                className="placed-token-indicator"
                onDoubleClick={() => handleRemoveToken(token.id)}
                onClick={() => playerMoney > 0 && setShowPokerChipsModal(token.id)}
              >
                <span className="token-num">{token.id}</span>
                {token.pokerChips > 0 && (
                  <span className="poker-chips">+${token.pokerChips}</span>
                )}
              </div>
            ))}
          </div>
        )}

        {isBlocked && <div className="blocked-indicator">🚫</div>}
      </div>
    );
  };

  const availableTokens = tokens.filter(t => !t.placed);
  const allTokensPlaced = tokens.every(t => t.placed);

  return (
    <div className="player-betting-board-v2">
      {/* Header con información */}
      <div className="betting-header-v2">
        <div className="info-box">
          <span className="label">Tu dinero</span>
          <span className="value">${playerMoney}</span>
        </div>
        <div className="info-box">
          <span className="label">Fichas disponibles</span>
          <span className="value">{availableTokens.length}/2</span>
        </div>
      </div>

      {/* Instrucciones */}
      {availableTokens.length > 0 && (
        <div className="instructions">
          🎯 Arrastra tus fichas a los espacios de apuesta
        </div>
      )}

      {/* Tablero principal */}
      <div className="main-board-v2">
        {mainPositions.map(pos => renderBetSpace(pos))}
      </div>

      {/* Posiciones especiales 1:1 */}
      <div className="special-positions-v2">
        {specialPositions.map(pos => (
          <div
            key={pos.id}
            className={`special-bet-space ${pos.color} ${draggedToken ? 'drop-target' : ''}`}
            onDrop={(e) => handleDrop(e, pos.id)}
            onDragOver={handleDragOver}
          >
            <div className="special-label">{pos.label} {pos.odds}</div>
            {getTokensAtPosition(pos.id).length > 0 && (
              <div className="placed-tokens">
                {getTokensAtPosition(pos.id).map(token => (
                  <div 
                    key={token.id} 
                    className="placed-token-indicator"
                    onDoubleClick={() => handleRemoveToken(token.id)}
                  >
                    {token.id}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bandeja de fichas disponibles */}
      <div className="tokens-tray-v2">
        <div className="tray-label">Tus fichas de apuesta:</div>
        <div className="tokens-container">
          {availableTokens.map(token => (
            <BettingToken
              key={token.id}
              id={token.id}
              color={playerColor}
              isPlaced={false}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            />
          ))}
          {availableTokens.length === 0 && (
            <div className="no-tokens-message">
              ✅ Todas las fichas colocadas
            </div>
          )}
        </div>
      </div>

      {/* Botón confirmar */}
      {allTokensPlaced && (
        <button 
          className="btn btn-success btn-large confirm-bets-btn"
          onClick={handleConfirm}
        >
          ✓ Confirmar Apuestas
        </button>
      )}

      {/* Modal para agregar fichas de póquer */}
      {showPokerChipsModal !== null && (
        <div className="poker-chips-modal-overlay" onClick={() => setShowPokerChipsModal(null)}>
          <div className="poker-chips-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Agregar Fichas de Póquer</h3>
            <p>¿Cuántas fichas quieres agregar a esta apuesta?</p>
            <p className="available">Disponible: ${playerMoney}</p>
            <input
              type="number"
              min="0"
              max={playerMoney}
              placeholder="0"
              id="poker-chips-input"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const value = parseInt(e.target.value) || 0;
                  handleAddPokerChips(showPokerChipsModal, value);
                }
              }}
            />
            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowPokerChipsModal(null)}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-success"
                onClick={() => {
                  const value = parseInt(document.getElementById('poker-chips-input').value) || 0;
                  handleAddPokerChips(showPokerChipsModal, value);
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerBettingBoardV2;
