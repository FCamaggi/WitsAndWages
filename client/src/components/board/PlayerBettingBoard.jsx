import React, { useState } from 'react';
import './PlayerBettingBoard.css';

/**
 * TABLERO DE APUESTAS PARA JUGADORES - CON MODAL DE INVENTARIO
 * Click en espacio → Abre inventario con fichas disponibles
 */

const PlayerBettingBoard = ({
  answers = [],
  blockers = [],
  token1 = null, // { position, pokerChips }
  token2 = null, // { position, pokerChips }
  playerMoney = 0,
  playerColor = 'red',
  onPlaceToken,
  onRemoveToken,
}) => {
  const [showBetModal, setShowBetModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [showMoneyModal, setShowMoneyModal] = useState(false);
  const [selectedTokenNumber, setSelectedTokenNumber] = useState(null); // 1 o 2
  const [moneyToAdd, setMoneyToAdd] = useState(0);

  // Todas las posiciones en orden horizontal
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

  // Abrir modal para manejar fichas
  const handlePositionClick = (positionId) => {
    const isBlocked = blockers && blockers.some((b) => b.position === positionId && b.active);
    if (isBlocked) return;

    setSelectedPosition(positionId);
    setShowBetModal(true);
  };

  // Colocar ficha en posición
  const handlePlaceToken = (tokenNumber) => {
    if (onPlaceToken) {
      onPlaceToken(tokenNumber, selectedPosition);
    }
    setShowBetModal(false);
    setSelectedPosition(null);
  };

  // Quitar ficha de posición
  const handleRemoveTokenFromModal = (tokenNumber) => {
    if (onRemoveToken) {
      onRemoveToken(tokenNumber);
    }
    setShowBetModal(false);
    setSelectedPosition(null);
  };

  // Abrir modal para agregar dinero a una ficha específica
  const handleOpenMoneyModal = (tokenNumber) => {
    const token = tokenNumber === 1 ? token1 : token2;
    setSelectedTokenNumber(tokenNumber);
    setMoneyToAdd(token?.pokerChips || 0);
    setShowMoneyModal(true);
  };

  // Confirmar dinero agregado
  const handleConfirmMoney = () => {
    if (selectedTokenNumber === null) return;

    if (moneyToAdd < 0 || moneyToAdd > playerMoney) {
      alert(`Cantidad inválida. Tienes $${playerMoney} disponibles.`);
      return;
    }

    const token = selectedTokenNumber === 1 ? token1 : token2;
    if (!token) return;

    // Remover y re-colocar con nuevo dinero
    if (onRemoveToken) onRemoveToken(selectedTokenNumber);
    if (onPlaceToken) onPlaceToken(selectedTokenNumber, token.position, moneyToAdd);

    setShowMoneyModal(false);
    setSelectedTokenNumber(null);
  };

  const renderBetSpace = (pos) => {
    const answer = answersMap[pos.id];
    const isBlocked = blockers && blockers.some((b) => b.position === pos.id && b.active);
    
    // Verificar qué fichas están aquí
    const hasToken1 = token1 && token1.position === pos.id;
    const hasToken2 = token2 && token2.position === pos.id;
    const hasBet = hasToken1 || hasToken2;
    const totalTokens = (hasToken1 ? 1 : 0) + (hasToken2 ? 1 : 0);
    const totalPokerChips = (hasToken1 ? (token1.pokerChips || 0) : 0) + (hasToken2 ? (token2.pokerChips || 0) : 0);

    return (
      <div
        key={pos.id}
        className={`mini-bet-space ${pos.color} ${isBlocked ? 'blocked' : ''} ${hasBet ? 'has-bet' : ''}`}
        data-position={pos.id}
        onClick={() => handlePositionClick(pos.id)}
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
            <div className="visual-chip">
              <span className="chip-count">{totalTokens}</span>
            </div>
            {totalPokerChips > 0 && (
              <div className="poker-chips-badge">+${totalPokerChips}</div>
            )}
          </div>
        )}

        {isBlocked && <div className="blocked-icon">🚫</div>}
      </div>
    );
  };

  // Apuestas especiales
  const renderSpecialBet = (id, label) => {
    const hasToken1 = token1 && token1.position === id;
    const hasToken2 = token2 && token2.position === id;
    const hasBet = hasToken1 || hasToken2;
    const totalTokens = (hasToken1 ? 1 : 0) + (hasToken2 ? 1 : 0);
    const totalPokerChips = (hasToken1 ? (token1.pokerChips || 0) : 0) + (hasToken2 ? (token2.pokerChips || 0) : 0);

    return (
      <div
        className={`mini-special-bet ${id === '1to1-red' ? 'red-special' : 'black-special'} ${hasBet ? 'has-bet' : ''}`}
        onClick={() => handlePositionClick(id)}
      >
        <div className="mini-special-title">{label} 1:1</div>
        <div className="mini-special-desc">Gana {label}</div>
        {hasBet && (
          <div className="mini-bet-indicator">
            <div className="visual-chip">
              <span className="chip-count">{totalTokens}</span>
            </div>
            {totalPokerChips > 0 && (
              <div className="poker-chips-badge">+${totalPokerChips}</div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="player-betting-board">
      {/* Header */}
      <div className="betting-header">
        <div className="money-info">
          <div className="money-label">Tu dinero</div>
          <div className="money-amount">${playerMoney}</div>
        </div>
        <div className="tokens-info">
          <div className="tokens-label">Fichas disponibles</div>
          <div className="tokens-remaining">
            {token1 ? '❌' : '✓'} {token2 ? '❌' : '✓'}
          </div>
        </div>
      </div>

      {/* Tablero principal */}
      <div className="mini-board-main-row">
        {mainPositions.map((pos) => renderBetSpace(pos))}
      </div>

      {/* Apuestas especiales */}
      <div className="mini-board-special">
        <div className="spacer"></div>
        {renderSpecialBet('1to1-red', 'ROJO')}
        <div className="spacer-middle"></div>
        {renderSpecialBet('1to1-black', 'NEGRO')}
      </div>

      {/* Lista de fichas colocadas */}
      {(token1 || token2) && (
        <div className="current-bets-display">
          <div className="current-bets-title">Tus Fichas Colocadas:</div>
          
          {token1 && (
            <div className="current-bet-item">
              <div className="current-bet-main">
                <div className="current-bet-name">
                  🎲 Ficha 1 → {token1.position}
                </div>
                <div className="current-bet-details">
                  {token1.pokerChips > 0 && <span className="money-indicator">+ ${token1.pokerChips}</span>}
                  {token1.pokerChips === 0 && <span className="no-money">Sin dinero adicional</span>}
                </div>
              </div>
              <div className="current-bet-actions">
                <button
                  className="btn-add-money"
                  onClick={() => handleOpenMoneyModal(1)}
                  title="Agregar dinero a esta ficha"
                >
                  + $
                </button>
                <button
                  className="btn-remove-bet"
                  onClick={() => onRemoveToken && onRemoveToken(1)}
                  title="Quitar ficha"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {token2 && (
            <div className="current-bet-item">
              <div className="current-bet-main">
                <div className="current-bet-name">
                  🎲 Ficha 2 → {token2.position}
                </div>
                <div className="current-bet-details">
                  {token2.pokerChips > 0 && <span className="money-indicator">+ ${token2.pokerChips}</span>}
                  {token2.pokerChips === 0 && <span className="no-money">Sin dinero adicional</span>}
                </div>
              </div>
              <div className="current-bet-actions">
                <button
                  className="btn-add-money"
                  onClick={() => handleOpenMoneyModal(2)}
                  title="Agregar dinero a esta ficha"
                >
                  + $
                </button>
                <button
                  className="btn-remove-bet"
                  onClick={() => onRemoveToken && onRemoveToken(2)}
                  title="Quitar ficha"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {!token1 && !token2 && (
        <div className="no-bets">🎯 Haz click en una casilla para colocar tus fichas</div>
      )}

      {/* Modal de inventario - Colocar/Quitar fichas */}
      {showBetModal && (
        <div className="bet-modal-overlay" onClick={() => setShowBetModal(false)}>
          <div className="bet-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🎲 Gestionar Fichas</h3>
              <button className="modal-close" onClick={() => setShowBetModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="position-info">
                Posición: <strong>{selectedPosition}</strong>
              </div>

              {/* Fichas ya colocadas en esta posición */}
              {((token1 && token1.position === selectedPosition) || (token2 && token2.position === selectedPosition)) && (
                <div className="tokens-here-section">
                  <label className="section-title">Fichas aquí:</label>
                  <div className="tokens-here-list">
                    {token1 && token1.position === selectedPosition && (
                      <div className="token-here-item">
                        <span>🎲 Ficha 1</span>
                        <button
                          className="btn-remove-small"
                          onClick={() => handleRemoveTokenFromModal(1)}
                        >
                          Quitar
                        </button>
                      </div>
                    )}
                    {token2 && token2.position === selectedPosition && (
                      <div className="token-here-item">
                        <span>🎲 Ficha 2</span>
                        <button
                          className="btn-remove-small"
                          onClick={() => handleRemoveTokenFromModal(2)}
                        >
                          Quitar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Fichas disponibles para colocar */}
              {(!token1 || !token2) && (
                <div className="token-selection">
                  <label className="section-title">Colocar ficha:</label>
                  <div className="token-options">
                    {!token1 && (
                      <button
                        className="token-btn"
                        onClick={() => handlePlaceToken(1)}
                      >
                        <div className={`token-visual ${playerColor}`}>1</div>
                        <span>Ficha 1</span>
                      </button>
                    )}
                    {!token2 && (
                      <button
                        className="token-btn"
                        onClick={() => handlePlaceToken(2)}
                      >
                        <div className={`token-visual ${playerColor}`}>2</div>
                        <span>Ficha 2</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {token1 && token2 && (
                <div className="modal-note">
                  ✓ Ambas fichas están colocadas
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowBetModal(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de agregar dinero */}
      {showMoneyModal && (
        <div className="bet-modal-overlay" onClick={() => setShowMoneyModal(false)}>
          <div className="bet-modal money-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>💵 Agregar Dinero</h3>
              <button className="modal-close" onClick={() => setShowMoneyModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              {selectedTokenNumber !== null && (
                <>
                  <div className="position-info">
                    Ficha: <strong>{selectedTokenNumber}</strong>
                  </div>
                  <div className="tokens-info-modal">
                    Posición: {selectedTokenNumber === 1 ? token1?.position : token2?.position}
                  </div>

                  <div className="money-input-section">
                    <label className="section-title">
                      Dinero a apostar (Poker Chips):
                    </label>
                    <div className="money-input-wrapper">
                      <span className="currency-symbol">$</span>
                      <input
                        type="number"
                        min="0"
                        max={playerMoney}
                        value={moneyToAdd}
                        onChange={(e) => setMoneyToAdd(parseInt(e.target.value) || 0)}
                        className="money-input"
                      />
                    </div>
                    <div className="money-available">
                      Dinero disponible: ${playerMoney}
                    </div>
                  </div>

                  <div className="modal-warning">
                    ⚠️ El dinero apostado se pierde si fallas la apuesta
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowMoneyModal(false)}>
                Cancelar
              </button>
              <button
                className="btn-confirm"
                onClick={handleConfirmMoney}
              >
                ✓ Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerBettingBoard;
