import React from 'react';
import './BettingBoard.css';

/**
 * TABLERO DE APUESTAS - WITS & WAGERS VEGAS
 * Este es el tablero principal que muestra las respuestas ordenadas
 * y permite realizar apuestas en las diferentes posiciones
 */

const BettingBoard = ({
  answers = [],
  blockers = [],
  bets = [],
  isHost = false,
}) => {
  // Todas las posiciones en orden horizontal (de izquierda a derecha)
  const mainPositions = [
    {
      id: '6to1-all-high',
      odds: '6:1',
      label: 'TODAS ALTAS',
      color: 'all-high',
    },
    { id: '5to1-red', odds: '5:1', label: '', color: 'red' },
    { id: '4to1-red', odds: '4:1', label: '', color: 'red' },
    { id: '3to1-red', odds: '3:1', label: '', color: 'red' },
    { id: '2to1-green', odds: '2:1', label: '', color: 'green' },
    { id: '3to1-black', odds: '3:1', label: '', color: 'black' },
    { id: '4to1-black', odds: '4:1', label: '', color: 'black' },
    { id: '5to1-black', odds: '5:1', label: '', color: 'black' },
  ];

  // Crear mapa de respuestas por posición
  const answersMap = {};
  if (answers && Array.isArray(answers)) {
    answers.forEach((answer) => {
      if (answer && answer.position) {
        answersMap[answer.position] = answer;
      }
    });
  }

  // Obtener apuestas por posición
  const getBetsForPosition = (position) => {
    if (!bets || !Array.isArray(bets)) return [];
    return bets.filter((bet) => bet.position === position);
  };

  const renderBetSpace = (pos) => {
    const answer = answersMap[pos.id];
    const isBlocked =
      blockers && blockers.some((b) => b.position === pos.id && b.active);
    const positionBets = getBetsForPosition(pos.id);

    return (
      <div
        key={pos.id}
        className={`bet-space ${pos.color} ${isBlocked ? 'blocked' : ''}`}
        data-position={pos.id}
      >
        <div className="odds">{pos.odds}</div>
        {pos.label && <div className="label">{pos.label}</div>}

        {answer && (
          <div className="answer-display">
            <div className="answer-value">{answer.value}</div>
            <div className="answer-player">{answer.playerName || ''}</div>
          </div>
        )}

        {positionBets.length > 0 && (
          <div className="bets-indicator">
            {positionBets.map((bet, idx) => (
              <div key={idx} className="bet-chip-container">
                {/* Mostrar fichas de apuesta */}
                {Array.from({ length: bet.tokens || 1 }).map((_, tokenIdx) => (
                  <div
                    key={`token-${tokenIdx}`}
                    className="bet-chip"
                    style={{ backgroundColor: bet.playerColor || '#ffd700' }}
                    title={`${bet.playerName} - Ficha ${tokenIdx + 1}`}
                  >
                    {tokenIdx + 1}
                  </div>
                ))}
                {/* Mostrar dinero adicional si existe */}
                {bet.pokerChips > 0 && (
                  <div className="poker-chips-indicator">${bet.pokerChips}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {isBlocked && <div className="blocked-overlay">🚫</div>}
      </div>
    );
  };

  return (
    <div className={`betting-board ${isHost ? 'host-board' : 'player-board'}`}>
      {/* Fila principal horizontal - 8 casillas */}
      <div className="board-main-row">
        {mainPositions.map((pos) => renderBetSpace(pos))}
      </div>

      {/* Apuestas especiales 1:1 - alineadas con columnas */}
      <div className="special-bets">
        <div className="spacer"></div>
        <div className="special-bet red-special" data-position="1to1-red">
          <div className="special-title">ROJO 1:1</div>
          <div className="special-desc">Gana ROJO</div>
          {getBetsForPosition('1to1-red').length > 0 && (
            <div className="bets-indicator">
              {getBetsForPosition('1to1-red').map((bet, idx) => (
                <div key={idx} className="bet-chip-container">
                  {Array.from({ length: bet.tokens || 1 }).map((_, tokenIdx) => (
                    <div
                      key={`token-${tokenIdx}`}
                      className="bet-chip"
                      style={{ backgroundColor: bet.playerColor || '#ffd700' }}
                      title={`${bet.playerName} - Ficha ${tokenIdx + 1}`}
                    >
                      {tokenIdx + 1}
                    </div>
                  ))}
                  {bet.pokerChips > 0 && (
                    <div className="poker-chips-indicator">${bet.pokerChips}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="spacer-middle"></div>
        <div className="special-bet black-special" data-position="1to1-black">
          <div className="special-title">NEGRO 1:1</div>
          <div className="special-desc">Gana NEGRO</div>
          {getBetsForPosition('1to1-black').length > 0 && (
            <div className="bets-indicator">
              {getBetsForPosition('1to1-black').map((bet, idx) => (
                <div key={idx} className="bet-chip-container">
                  {Array.from({ length: bet.tokens || 1 }).map((_, tokenIdx) => (
                    <div
                      key={`token-${tokenIdx}`}
                      className="bet-chip"
                      style={{ backgroundColor: bet.playerColor || '#ffd700' }}
                      title={`${bet.playerName} - Ficha ${tokenIdx + 1}`}
                    >
                      {tokenIdx + 1}
                    </div>
                  ))}
                  {bet.pokerChips > 0 && (
                    <div className="poker-chips-indicator">${bet.pokerChips}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BettingBoard;
