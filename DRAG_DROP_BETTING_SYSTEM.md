# Sistema de Apuestas Mejorado - Drag & Drop

## Problema Actual

El sistema actual es confuso:
1. Click en espacio → prompt pidiendo cantidad de fichas de póquer
2. No es intuitivo - el jugador debe escribir "0" solo para colocar la ficha de apuesta
3. No refleja la mecánica física del juego de mesa

## Solución Propuesta

### Fase 1: Colocar Fichas de Apuesta (Betting Tokens)
- **Drag & Drop**: El jugador arrastra sus 2 fichas de apuesta a los espacios del tablero
- **Visualización clara**: Las fichas muestran el número (1 y 2) y el color del jugador
- **Flexibilidad**: Pueden colocar ambas en el mismo espacio o dividirlas
- **Confirmación**: Botón "Confirmar Apuestas" solo aparece cuando se han colocado las fichas

### Fase 2: Agregar Fichas de Póquer (Opcional, después de Ronda 1)
- **Después de colocar las fichas de apuesta**: Aparece opción para agregar más dinero
- **Click en la apuesta colocada**: Modal o input para agregar fichas de póquer
- **Visual**: Se muestra "+$X" debajo de la ficha de apuesta

## Flujo de Usuario

```
1. Jugador ve tablero con respuestas ordenadas
2. Bandeja inferior muestra sus 2 fichas de apuesta disponibles (🔴1 🔴2)
3. Arrastra ficha #1 a un espacio → Se coloca ahí
4. Arrastra ficha #2 a otro espacio (o al mismo) → Se coloca ahí
5. (Opcional) Si tiene dinero, puede click en ficha colocada para agregar $
6. Botón "Confirmar Apuestas" → Envía al servidor
```

## Componentes

- `BettingToken.jsx` - Ficha individual draggable
- `PlayerBettingBoard.jsx` - Tablero con drop zones
- `PokerChipsModal.jsx` - Modal para agregar fichas de póquer adicionales

## Estado del Jugador

```javascript
{
  bettingTokens: [
    { id: 1, placed: false, position: null, pokerChips: 0 },
    { id: 2, placed: false, position: null, pokerChips: 0 }
  ],
  availablePokerChips: 0 // dinero ganado
}
```
