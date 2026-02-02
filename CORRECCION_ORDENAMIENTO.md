# Corrección del Algoritmo de Ordenamiento de Respuestas

## Problema Identificado
El algoritmo anterior asignaba las respuestas secuencialmente desde la izquierda (posición 5:1 roja), lo cual no respetaba las reglas del manual que indican que el ordenamiento debe partir desde el centro.

## Solución Implementada

### Reglas del Manual
Según el manual de Wits & Wagers Vegas:

1. **Número IMPAR de respuestas únicas**: 
   - La respuesta del medio va en la casilla verde (2:1)
   - Las respuestas menores se distribuyen hacia la izquierda (rojas)
   - Las respuestas mayores se distribuyen hacia la derecha (negras)

2. **Número PAR de respuestas únicas**:
   - La casilla verde (2:1) se bloquea
   - Las dos respuestas del medio van en las casillas 3:1 (una roja, una negra)
   - Las demás se distribuyen hacia los extremos

### Ejemplos

#### 3 Jugadores (1000, 1100, 1200)
```
[5:1]  [4:1]  [3:1]   [2:1]   [3:1]  [4:1]  [5:1]
 Red    Red    Red    Green   Black  Black  Black
        
               1000    1100    1200
              (3:1R)  (2:1G)  (3:1B)
```

#### 4 Jugadores (1000, 1100, 1200, 1300)
```
[5:1]  [4:1]  [3:1]   [2:1]   [3:1]  [4:1]  [5:1]
 Red    Red    Red    Green   Black  Black  Black
        
        1000   1100  BLOQ.    1200   1300
       (4:1R) (3:1R)          (3:1B) (4:1B)
```

#### 5 Jugadores (1000, 1100, 1200, 1300, 1400)
```
[5:1]  [4:1]  [3:1]   [2:1]   [3:1]  [4:1]  [5:1]
 Red    Red    Red    Green   Black  Black  Black
        
        1000   1100   1200    1300   1400
       (4:1R) (3:1R) (2:1G)  (3:1B) (4:1B)
```

## Archivos Modificados

### `server/services/gameLogic.js`
- Función `orderAnswers()` completamente reescrita
- Implementa la lógica de distribución desde el centro
- Maneja correctamente casos pares e impares

## Tests de Verificación

Se crearon tests específicos en `e2e/ordering-test.spec.ts` que verifican:
- ✅ Ordenamiento con 3 jugadores (impar)
- ✅ Ordenamiento con 4 jugadores (par)
- ✅ Ordenamiento con 5 jugadores (impar)

Los screenshots generados confirman visualmente el ordenamiento correcto.

## Resultado

El juego ahora ordena las respuestas correctamente según las reglas del manual, partiendo desde el centro y distribuyendo hacia los lados, respetando las diferencias entre cantidades pares e impares de respuestas.
