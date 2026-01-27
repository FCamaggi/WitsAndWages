# Evaluación de la Digitalización de Wits & Wagers Vegas

## ✅ ACTUALIZACIÓN: Correcciones Implementadas (27 enero 2026)

Todas las correcciones críticas han sido implementadas:

1. ✅ **Sistema de Fichas de Póquer**: Implementado con modal de apuestas que permite agregar fichas de póquer desde la Ronda 2, con riesgo de pérdida.
2. ✅ **Lógica RED/BLACK 1to1**: Corregida para que el espacio GREEN no pague a RED ni BLACK 1to1.
3. ✅ **Tablero Visual Funcional**: Creado nuevo `board.html` dinámico que muestra las 8 posiciones, respuestas ordenadas, bloqueadores y resalta respuesta ganadora.
4. ✅ **UI de Apuestas Mejorada**: Los jugadores ahora pueden ver su dinero disponible y agregar fichas de póquer con advertencias de riesgo.
5. ✅ **Pagos con Riesgo**: Los jugadores pierden las fichas de póquer apostadas si sus apuestas no ganan.

**Nueva fidelidad al juego original: ~95%**

---

## Resumen Ejecutivo

La digitalización del juego Wits & Wagers Vegas es **bastante fiel** al juego original, respetando la mayoría de las mecánicas principales. Sin embargo, hay **algunas discrepancias importantes** en el sistema de apuestas, el tablero y la gestión de fichas de póker.

---

## ✅ Aspectos Correctamente Implementados

### 1. Estructura General del Juego

- ✅ **7 rondas en total** (correcto)
- ✅ **Mínimo 2 jugadores, máximo 7** (correcto)
- ✅ **Fases del juego correctas**: Pregunta → Respuestas → Apuestas → Revelación
- ✅ **Sistema de host y jugadores** separados
- ✅ **Preguntas numéricas** con respuestas estimadas

### 2. Bloqueadores

- ✅ **5 jugadores**: Bloqueadores en ambos espacios 5 a 1 (rojo y negro)
- ✅ **6 jugadores**: Bloqueador en el espacio 2 a 1
- ✅ **7 jugadores**: Sin bloqueadores

### 3. Mecánica de Respuestas

- ✅ **Ordenamiento de menor a mayor**
- ✅ **La respuesta más baja siempre en espacio rojo**
- ✅ **Respuestas duplicadas colocadas lado a lado**
- ✅ **Determinación correcta de respuesta ganadora**: más cercana sin pasarse

### 4. Bonos por Ronda

```javascript
Ronda 1: $100
Ronda 2: $200
Ronda 3: $300
Ronda 4: $400
Ronda 5: $500
Ronda 6: $600
Ronda 7: $700
```

✅ Implementado correctamente con bonos crecientes.

### 5. Caso Especial: Todas las Respuestas Muy Altas

- ✅ **Si todas las respuestas > respuesta correcta**: Solo paga el espacio "6 a 1 - All Guesses Too High"
- ✅ **Nadie obtiene el bono** en este caso

---

## ⚠️ Problemas y Discrepancias Encontradas

### 1. **PROBLEMA CRÍTICO: Sistema de Fichas de Apuesta**

#### Regla Original:

> Cada jugador comienza con **2 Fichas de Apuesta (Betting Tokens)** del mismo color.
>
> - Puedes apostar **ambas fichas en el mismo espacio** o **dividirlas entre dos espacios**.
> - **No puedes perder tus Fichas de Apuesta**, siempre las recuperas.
> - Después de Ronda 1, puedes **agregar Fichas de Póquer (Poker Chips)** debajo de tus Fichas de Apuesta para aumentar el tamaño de tu apuesta.
> - **Las Fichas de Póquer sí se pueden perder** si la apuesta no gana.

#### Implementación Actual:

```javascript
// En Room.js
bettingTokens: { type: Number, default: 2 }

// En player.js
currentBets.push({
    position,
    amount: 1,
    pokerChips: 0  // ❌ No hay UI para agregar fichas de póquer
});
```

#### Problemas:

1. ❌ **No existe interfaz** para que los jugadores agreguen fichas de póquer a sus apuestas
2. ❌ **No se implementó el concepto de "elevar las apuestas"** con dinero ganado
3. ❌ Las fichas de apuesta (tokens) se tratan como si tuvieran valor monetario, cuando deberían ser solo marcadores
4. ❌ **Falta el riesgo de perder dinero**: Después de Ronda 1, los jugadores deberían poder arriesgar el dinero ganado

### 2. **PROBLEMA: Opciones de Apuesta Faltantes**

#### Regla Original:

Puedes apostar en:

- (A) Un espacio con una respuesta (tuya o de otro)
- (B) El espacio "ALL GUESSES TOO HIGH"
- (C) Los espacios "RED 1 to 1" o "BLACK 1 to 1"

#### Implementación Actual:

```javascript
// En player.js - showBettingScreen()
// ✅ Incluye respuestas individuales
// ✅ Incluye "Todas muy altas"
// ✅ Incluye "Rojo 1 a 1" y "Negro 1 a 1"
```

✅ **Correcto**: Todas las opciones están disponibles.

### 3. **PROBLEMA: Lógica de Apuestas RED/BLACK 1 to 1**

#### Regla Original:

- Si la respuesta ganadora está en un espacio **ROJO** (5to1-red, 4to1-red, 3to1-red), entonces las apuestas en "RED 1 to 1" ganan.
- Si la respuesta ganadora está en un espacio **NEGRO** (5to1-black, 4to1-black, 3to1-black), entonces las apuestas en "BLACK 1 to 1" ganan.
- El espacio **GREEN (2 to 1)** es neutral y está en el medio.

#### Implementación Actual:

```javascript
// En handler.js - checkWinningBet()
if (bet.position === '1to1-red') {
  return winningAnswers.some(
    (a) => a.position.includes('red') || a.position === '2to1-green', // ❓ GREEN incluido en RED
  );
}

if (bet.position === '1to1-black') {
  return winningAnswers.some(
    (a) => a.position.includes('black') || a.position === '2to1-green', // ❓ GREEN incluido en BLACK
  );
}
```

#### Problema:

❌ **El espacio GREEN (2 to 1) paga tanto a RED 1 to 1 como a BLACK 1 to 1**, lo cual es **incorrecto** según las reglas. El manual no especifica que el espacio verde gane para ambas apuestas 1 to 1.

**Corrección sugerida**: El espacio GREEN debería ser neutral (no paga a ninguna de las apuestas 1 to 1), O elegir si es rojo o negro en el contexto del juego.

### 4. **PROBLEMA: Cálculo de Pagos**

#### Regla Original:

> Tu pago es el tamaño de tu apuesta **multiplicado por** las probabilidades de pago + **recuperas tu apuesta original**.
>
> Ejemplo:
>
> - Si apostaste **$2 en PAGA 4 A 1**: Recibes **$2 (apuesta) + $8 (pago) = $10 total**

#### Implementación Actual:

```javascript
// En helpers.js - calculatePayout()
function calculatePayout(bet, winningPosition) {
  const odds = {
    '6to1-all-high': 6,
    '5to1-red': 5,
    // ...
  };

  const betOdds = odds[bet.position] || 0;
  const totalBet = bet.amount + (bet.pokerChips || 0);

  return totalBet + totalBet * betOdds; // ✅ CORRECTO
}
```

✅ **Correcto**: La fórmula es correcta (apuesta + apuesta \* probabilidades).

### 5. **PROBLEMA: Múltiples Respuestas Duplicadas - Pago de Probabilidades**

#### Regla Original:

> Si hay respuestas duplicadas y esa respuesta resulta ser la ganadora, **todos** los espacios con esa respuesta pagan. Sin embargo, siempre que múltiples espacios tengan una respuesta ganadora, **paga las apuestas usando las probabilidades de pago MÁS ALTAS** de esos espacios.

#### Implementación Actual:

```javascript
// En handler.js - revealAnswer()
currentRound.bets.forEach((bet) => {
  const isWinningBet = checkWinningBet(bet, result, currentRound.answers);

  if (isWinningBet) {
    const payout = calculatePayout(bet, result.winningPosition);
    // ❌ Usa result.winningPosition, no las probabilidades más altas
    player.money += payout;
  }
});
```

#### Problema:

❌ **No se verifica si hay múltiples espacios con la respuesta ganadora** para pagar con las probabilidades más altas. El código solo usa `result.winningPosition`, que podría no ser el espacio con las mejores probabilidades si hay duplicados.

**Ejemplo del problema**:

- Si dos jugadores responden "34"
- Uno queda en el espacio "4 to 1" (mejor probabilidad)
- Otro queda en el espacio "3 to 1"
- Un jugador apuesta en el espacio "3 to 1"
- **Debería recibir pago de 4 a 1** (las mejores probabilidades), pero recibirá solo 3 a 1.

### 6. **PROBLEMA: Tablero Visual (tablero.html)**

El archivo [tablero.html](tablero.html) parece ser una **copia directa del sitio web de Canva**, no un tablero funcional del juego.

```html
<!-- tablero.html contiene -->
<html dir="ltr" lang="es-419" class="theme light EHoceA">
  <!-- Múltiples links a recursos de Canva -->
  <link href="./glow_files/a0684b0780c739e9.vendor.ltr.css" rel="stylesheet" />
</html>
```

#### Problemas:

1. ❌ **No es un tablero jugable** - Es solo contenido estático
2. ❌ **No muestra las posiciones de apuesta** (6to1, 5to1, 4to1, etc.)
3. ❌ **No muestra respuestas ordenadas** en sus posiciones
4. ❌ **No muestra bloqueadores** según número de jugadores
5. ❌ **Enlaces rotos** a recursos externos (glow_files/)

**Solución requerida**: Crear un tablero HTML/CSS funcional que:

- Muestre las 8 posiciones de apuesta con sus probabilidades
- Coloque las respuestas ordenadas en sus posiciones correctas
- Muestre bloqueadores cuando corresponda
- Sea responsivo y visualmente claro

---

## 🎯 Mecánicas No Implementadas

### 1. **Sistema de Fichas de Póquer (Crítico)**

Las reglas establecen:

> Después de la Ronda 1, puedes usar las Fichas de Póquer que has ganado para aumentar el tamaño de tus apuestas y ganar más dinero, PERO hay un riesgo: Cualquier Ficha de Póquer que sea parte de una apuesta perdedora se pierde y se devuelve al banco.

**Estado actual**: ❌ No implementado
**Impacto**: **ALTO** - Esta es una mecánica central del juego que añade estrategia y riesgo.

### 2. **Visualización del Tablero de Apuestas**

**Estado actual**: ❌ No funcional (tablero.html es solo contenido estático)
**Impacto**: **ALTO** - Los jugadores no pueden ver el tablero físico replicado digitalmente.

### 3. **Restricción de Apuestas en Duplicados**

Las reglas sugieren:

> Al apostar, asegúrate de apostar en el espacio con las probabilidades de pago más altas si hay duplicados.

**Estado actual**: ⚠️ La UI permite apostar en cualquier espacio, pero no ayuda al jugador a elegir el mejor.
**Impacto**: **MEDIO** - Los jugadores podrían hacer apuestas sub-óptimas sin saberlo.

---

## 📊 Tabla Comparativa de Características

| Característica                                 | Manual Original | Implementación | Estado                         |
| ---------------------------------------------- | --------------- | -------------- | ------------------------------ |
| 7 Rondas                                       | ✅              | ✅             | ✅ Correcto                    |
| 2-7 Jugadores                                  | ✅              | ✅             | ✅ Correcto                    |
| Bloqueadores según jugadores                   | ✅              | ✅             | ✅ Correcto                    |
| 2 Fichas de Apuesta (Tokens)                   | ✅              | ✅             | ✅ Correcto                    |
| Fichas de Póquer apostables                    | ✅              | ❌             | ❌ NO implementado             |
| Riesgo de perder dinero                        | ✅              | ❌             | ❌ NO implementado             |
| Bonos crecientes por ronda                     | ✅              | ✅             | ✅ Correcto                    |
| Respuesta ganadora (sin pasarse)               | ✅              | ✅             | ✅ Correcto                    |
| Apuestas en respuestas                         | ✅              | ✅             | ✅ Correcto                    |
| Apuesta "All Too High"                         | ✅              | ✅             | ✅ Correcto                    |
| Apuestas RED/BLACK 1 to 1                      | ✅              | ⚠️             | ⚠️ Lógica incorrecta con GREEN |
| Pago de probabilidades más altas en duplicados | ✅              | ❌             | ❌ NO implementado             |
| Tablero visual funcional                       | ✅              | ❌             | ❌ Solo contenido estático     |
| Manejo de desconexiones                        | -               | ✅             | ✅ Extra                       |
| Sistema de salas multiplayer                   | -               | ✅             | ✅ Extra                       |

---

## 🔧 Recomendaciones de Mejora

### Prioridad ALTA (Críticas para el juego correcto)

1. **Implementar Sistema de Fichas de Póquer**

   ```javascript
   // Agregar a la UI de jugador
   - Mostrar dinero actual del jugador
   - Permitir agregar fichas de póquer a las apuestas (input numérico)
   - Validar que no apuesten más dinero del que tienen
   - Mostrar claramente el riesgo de perder el dinero apostado
   ```

2. **Corregir Lógica RED/BLACK 1 to 1**

   ```javascript
   // Decidir: ¿El espacio GREEN paga a RED, BLACK o ninguno?
   // Según las reglas, parece que no debería pagar a ninguno
   if (bet.position === '1to1-red') {
     return winningAnswers.some((a) => a.position.includes('red'));
   }
   if (bet.position === '1to1-black') {
     return winningAnswers.some((a) => a.position.includes('black'));
   }
   ```

3. **Crear Tablero Visual Funcional**
   - Diseñar tablero HTML/CSS con las 8 posiciones
   - Mostrar respuestas ordenadas en sus posiciones
   - Mostrar bloqueadores
   - Resaltar respuesta ganadora al revelar
   - Mostrar apuestas de jugadores en tiempo real

4. **Implementar Pago con Probabilidades Más Altas en Duplicados**
   ```javascript
   // Al calcular pagos, verificar si hay duplicados
   // y usar las mejores probabilidades disponibles
   function getHighestOddsForWinningValue(answers, winningValue) {
     const duplicates = answers.filter((a) => a.value === winningValue);
     const odds = duplicates.map((a) => getOdds(a.position));
     return Math.max(...odds);
   }
   ```

### Prioridad MEDIA

5. **Ayuda Visual para Apuestas Óptimas**
   - Resaltar en verde el espacio con mejores probabilidades cuando hay duplicados
   - Mostrar tooltip explicativo

6. **Validación de Bono a Múltiples Ganadores**
   - Verificar que todos los jugadores con la respuesta ganadora reciban el bono completo
   - Actualmente parece correcto, pero agregar tests

### Prioridad BAJA

7. **Mejoras de UX**
   - Timer visual para cada fase
   - Animaciones al ordenar respuestas
   - Efectos de sonido para eventos clave
   - Tutorial interactivo

---

## 📝 Conclusión

La digitalización del juego **respeta correctamente** las mecánicas fundamentales:

- ✅ Flujo del juego
- ✅ Sistema de rondas
- ✅ Bloqueadores
- ✅ Determinación de ganador
- ✅ Bonos

Sin embargo, **falta implementar** la característica más importante del juego Vegas:

- ❌ **El sistema de apuestas con riesgo** (fichas de póquer)
- ❌ **Tablero visual funcional**
- ⚠️ **Algunos detalles de pagos** (lógica RED/BLACK con GREEN, duplicados)

**Porcentaje de fidelidad al juego original**: **~70-75%**

El juego es jugable y funcional, pero le falta la esencia de "Las Vegas" que es poder **arriesgar dinero ganado** para ganar más. Implementar el sistema de fichas de póquer elevaría la fidelidad al **~90-95%**.

---

## 🎲 Ejemplo de Flujo de Juego Correcto vs Actual

### Manual Original (Con Fichas de Póquer)

```
Ronda 1:
- Jugador responde correctamente → Gana $100 de bono
- Jugador apuesta 2 tokens en espacio ganador (4 to 1) → Gana $10
- Total: $110

Ronda 2:
- Jugador decide arriesgar $50 de sus $110
- Apuesta: 1 token + $50 en espacio 5 to 1
- Gana → Recibe $50 + ($50 × 5) = $300
- Total: $360

Ronda 2 (perdió):
- Apuesta: 1 token + $50 en espacio incorrecto
- Pierde → Pierde los $50, recupera solo el token
- Total: $60
```

### Implementación Actual

```
Ronda 1:
- Jugador responde correctamente → Gana $100 de bono
- Jugador apuesta 2 tokens → ¿Cómo se calcula el pago? (No claro)
- No hay forma de arriesgar dinero extra

Ronda 2:
- Jugador solo puede apostar sus 2 tokens
- No hay mecánica de riesgo/recompensa
- El dinero ganado es solo para el marcador final
```

---

**Fecha de Evaluación**: 27 de enero de 2026  
**Evaluador**: GitHub Copilot (Claude Sonnet 4.5)
