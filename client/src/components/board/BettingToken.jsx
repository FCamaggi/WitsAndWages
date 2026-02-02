import React from 'react';
import './BettingToken.css';

/**
 * Ficha de Apuesta (Betting Token) - draggable
 * Representa una de las 2 fichas de apuesta base de cada jugador
 */
const BettingToken = ({ 
  id, 
  color, 
  isPlaced, 
  onDragStart, 
  onDragEnd,
  pokerChips = 0  // Fichas de póquer adicionales debajo
}) => {
  
  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('tokenId', id);
    e.dataTransfer.setData('tokenType', 'betting');
    if (onDragStart) onDragStart(id);
  };

  const handleDragEnd = (e) => {
    if (onDragEnd) onDragEnd();
  };

  return (
    <div 
      className={`betting-token ${color} ${isPlaced ? 'placed' : 'available'}`}
      draggable={!isPlaced}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      data-token-id={id}
    >
      <div className="token-face">
        <span className="token-number">{id}</span>
      </div>
      
      {pokerChips > 0 && (
        <div className="poker-chips-indicator">
          <span>+${pokerChips}</span>
        </div>
      )}
    </div>
  );
};

export default BettingToken;
