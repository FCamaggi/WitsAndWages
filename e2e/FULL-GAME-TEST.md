# 🎮 Test de Partida Completa

## Descripción

Test E2E exhaustivo que simula una partida completa de Wits & Wagers Vegas de principio a fin.

## 🎯 Qué Se Prueba

### Test Principal: Partida Completa (7 Rondas)

✅ **Setup Inicial**
- Host crea partida
- 5 jugadores se unen (Ana, Beto, Cami, Dani, Eli)
- Verificación del lobby

✅ **7 Rondas Completas**
Cada ronda incluye:
1. **Pregunta**: Host inicia ronda, pregunta se muestra a todos
2. **Respuestas**: Los 5 jugadores responden con valores diferentes
3. **Ordenamiento**: Host ordena respuestas en el tablero
4. **Apuestas**: 
   - Ronda 1: Solo fichas base (2 por jugador)
   - Rondas 2-7: Fichas base + fichas de póquer ganadas
5. **Revelación**: Host revela respuesta correcta
6. **Resultados**: Cálculo de ganadores y distribución de premios
7. **Puntajes**: Actualización del ranking

✅ **Final del Juego**
- Ranking final después de 7 rondas
- Identificación del ganador
- Verificación de que todos los jugadores ven el resultado

### Test Secundario: Partida Rápida (3 Rondas)

Versión acelerada con:
- 3 jugadores en lugar de 5
- 3 rondas en lugar de 7
- Útil para verificaciones rápidas

## 🚀 Ejecución

### Opción 1: Script Interactivo (Recomendado)
```bash
./run-test.sh
```

Menú con opciones:
1. Partida completa (7 rondas) - 8-10 minutos
2. Partida rápida (3 rondas) - 3-4 minutos
3. Test básico (1 ronda) - 1-2 minutos
4. Todos los tests
5. Ver reporte

### Opción 2: Comandos Directos

```bash
# Partida completa (7 rondas)
npm run test:full

# Partida completa con navegador visible
npm run test:full:headed

# Partida rápida (3 rondas)
npm run test:quick

# Test básico (1 ronda)
npm run test:e2e

# Todos los tests
npm run test:all

# Ver reporte
npm run test:report
```

## ⏱️ Tiempos Estimados

| Test | Jugadores | Rondas | Tiempo |
|------|-----------|--------|---------|
| Básico | 5 | 1 | 1-2 min |
| Rápido | 3 | 3 | 3-4 min |
| Completo | 5 | 7 | 8-10 min |

## 📸 Screenshots Generados

Para el test completo se generan ~40 screenshots en `test-results/full-game/`:

**Por ronda (x7)**:
- `ronda-X-pregunta.png` - Pregunta mostrada
- `ronda-X-tablero.png` - Tablero ordenado
- `ronda-X-resultados.png` - Resultados en host
- `ronda-X-resultado-[Jugador].png` - Vista de cada jugador

**Finales**:
- `setup-lobby-completo.png` - Lobby inicial
- `ranking-final.png` - Ranking final
- `final-[Jugador].png` - Vista final de cada jugador

## 📊 Logs Durante Ejecución

El test genera logs detallados:

```
═══════════════════════════════════════════════════════
   WITS & WAGERS VEGAS - TEST DE PARTIDA COMPLETA
═══════════════════════════════════════════════════════

📍 SETUP: Creando juego y uniendo jugadores...
✅ Código de juego: 123456
   ✓ Ana unido
   ✓ Beto unido
   ...

══════════════════════════════════════════════════════
  RONDA 1 de 7
══════════════════════════════════════════════════════

📍 Iniciando juego...
📍 Jugadores respondiendo...
   ✓ Ana: 1100
   ✓ Beto: 1150
   ...
📍 Ordenando respuestas...
📍 Jugadores apostando...
   ✓ Ana apostó
   ...
📍 Revelando respuesta...
📊 Puntajes actuales:
   Ana: $5
   Beto: $8
   ...
✅ Ronda 1 completada

[... Rondas 2-7 ...]

══════════════════════════════════════════════════════
  RANKING FINAL
══════════════════════════════════════════════════════

🏆 Clasificación Final:
   1. Beto: $45
   2. Ana: $38
   ...

══════════════════════════════════════════════════════
  ✅ PARTIDA COMPLETA FINALIZADA
══════════════════════════════════════════════════════
  • 5 jugadores
  • 7 rondas completadas
  • Todas las fases funcionaron correctamente
  • Sistema de apuestas verificado
  • Ranking final generado
══════════════════════════════════════════════════════

🎉 TEST COMPLETO EXITOSO!
```

## 🔍 Verificaciones

El test verifica automáticamente:

✅ Todas las fases de cada ronda se ejecutan
✅ Transiciones entre rondas funcionan
✅ Sistema de apuestas con fichas de póquer (rondas 2-7)
✅ Cálculo correcto de puntajes
✅ Generación del ranking final
✅ Identificación del ganador
✅ Sincronización entre host y jugadores

## ⚙️ Configuración

**Timeout del test completo**: 10 minutos
**Timeout del test rápido**: 5 minutos

Puedes modificar estos valores en el archivo `e2e/full-game.spec.ts`:

```typescript
test.setTimeout(600000); // 10 minutos para test completo
test.setTimeout(300000); // 5 minutos para test rápido
```

## 🐛 Troubleshooting

### Test timeout
Si el test se queda sin tiempo:
1. Ejecuta el test rápido primero: `npm run test:quick`
2. Verifica que los servidores inician correctamente
3. Revisa la velocidad de tu conexión a MongoDB Atlas

### Navegadores no cierran
```bash
# Matar todos los procesos de Chromium
pkill -f chromium
```

### Ver qué está pasando
```bash
# Ejecutar con navegadores visibles
npm run test:full:headed
```

### Errores de socket
- Verifica que MongoDB Atlas está accesible
- Revisa el archivo `.env`
- Comprueba que no hay otro servidor corriendo

## 📝 Notas Importantes

1. **Primera ejecución**: Puede tardar más por inicialización de servidores

2. **Apuestas con fichas**: A partir de la ronda 2, los jugadores pueden apostar fichas ganadas. El test simula diferentes cantidades para cada jugador.

3. **Respuestas variadas**: Cada ronda usa respuestas diferentes para probar el algoritmo de ordenamiento.

4. **Screenshots**: Útiles para debugging visual. Revisa `test-results/full-game/` después del test.

5. **Logs detallados**: El test imprime progreso continuo. Útil para identificar en qué fase falla.

## 🎯 Casos de Uso

**Antes de deploy a producción**:
```bash
npm run test:full
```

**Desarrollo rápido** (verificar cambios):
```bash
npm run test:quick
```

**Debug de una fase específica**:
```bash
npm run test:e2e
```

**Verificación visual**:
```bash
npm run test:full:headed
```

## ✅ Criterios de Éxito

El test es exitoso si:
- ✅ Los 5 jugadores se unen correctamente
- ✅ Las 7 rondas se completan sin errores
- ✅ El sistema de apuestas funciona en todas las rondas
- ✅ Los puntajes se actualizan correctamente
- ✅ Se genera un ranking final
- ✅ Todos los jugadores ven los resultados finales

## 🚀 Próximos Pasos

Después de que este test pase:
1. ✅ El juego está listo para producción
2. Considera tests adicionales para:
   - 6 y 7 jugadores
   - Respuestas duplicadas
   - Caso "todas las respuestas muy altas"
   - Reconexión de jugadores

---

**¿Listo para probar?** Ejecuta: `./run-test.sh`
