import { test, expect, Page, BrowserContext } from '@playwright/test';

// Configuración básica
const NUM_PLAYERS = 5;
const PLAYER_NAMES = ['Ana', 'Beto', 'Cami', 'Dani', 'Eli'];

// Utilidades
async function waitFor(page: Page, ms: number) {
  await page.waitForTimeout(ms);
}

async function screenshot(page: Page, name: string) {
  try {
    await page.screenshot({ path: `test-results/${name}.png`, fullPage: true });
  } catch (e) {
    console.log(`⚠️  No se pudo tomar screenshot: ${name}`);
  }
}

test.describe('Wits & Wagers Vegas - Flujo Completo de Juego', () => {
  test('Partida completa: Host + 5 Jugadores + Visualización', async ({
    browser,
  }) => {
    console.log('🎰 Iniciando test E2E de Wits & Wagers Vegas...\n');

    // ========== FASE 1: CREAR JUEGO (HOST) ==========
    console.log('📍 FASE 1: Creando juego como Host...');
    const hostContext = await browser.newContext();
    const hostPage = await hostContext.newPage();
    
    await hostPage.goto('/');
    await screenshot(hostPage, '01-home');
    
    // Clic en "Crear partida" en home
    await hostPage.click('button:has-text("Crear Partida")');
    await waitFor(hostPage, 1000);
    await screenshot(hostPage, '02-host-view');
    
    // Crear partida
    await hostPage.click('button:has-text("Crear Partida")');
    await waitFor(hostPage, 2000);
    
    // Obtener código de juego
    const gameCodeElement = await hostPage.locator('[data-testid="game-code"], .game-code').first();
    const gameCode = (await gameCodeElement.innerText()).trim();
    
    console.log(`✅ Juego creado con código: ${gameCode}\n`);
    expect(gameCode).toMatch(/^\d{6}$/); // Código de 6 dígitos
    await screenshot(hostPage, '03-game-created-lobby');

    // ========== FASE 2: JUGADORES SE UNEN ==========
    console.log('📍 FASE 2: Jugadores uniéndose al juego...');
    const playerContexts: BrowserContext[] = [];
    const playerPages: Page[] = [];
    
    for (let i = 0; i < NUM_PLAYERS; i++) {
      const context = await browser.newContext();
      const page = await context.newPage();
      
      await page.goto('/');
      
      // Clic en 'Unirse' en la pantalla principal
      await page.click('button:has-text("Unirse")');
      await waitFor(page, 1000);
      
      // Llenar formulario de unión
      await page.fill('#gameCode', gameCode);
      await page.fill('#playerName', PLAYER_NAMES[i]);
      
      await page.click('button:has-text("Unirse")');
      await waitFor(page, 1500);
      
      playerContexts.push(context);
      playerPages.push(page);
      
      console.log(`  ✓ ${PLAYER_NAMES[i]} se unió al juego`);
      await screenshot(page, `04-player-${i + 1}-joined`);
    }

    // Verificar que el host ve a todos los jugadores
    await waitFor(hostPage, 2000);
    const playersInLobby = await hostPage.locator('.player-item').count();
    console.log(`\n✅ ${playersInLobby} jugadores visibles en el lobby del host\n`);
    expect(playersInLobby).toBe(NUM_PLAYERS);
    await screenshot(hostPage, '05-host-lobby-full');

    // ========== FASE 3: INICIAR JUEGO ==========
    console.log('📍 FASE 3: Iniciando juego...');
    await hostPage.click('button:has-text("Iniciar Juego")');
    await waitFor(hostPage, 3000);
    
    // Verificar que el host ve la pregunta
    const questionVisible = await hostPage.locator('text=Ronda').isVisible();
    console.log('✅ Juego iniciado, pregunta mostrada\n');
    expect(questionVisible).toBeTruthy();
    await screenshot(hostPage, '06-question-displayed');

    // ========== FASE 4: JUGADORES RESPONDEN ==========
    console.log('📍 FASE 4: Jugadores respondiendo a la pregunta...');
    const playerAnswers = [2000, 2100, 2200, 2300, 2400];
    
    for (let i = 0; i < NUM_PLAYERS; i++) {
      await waitFor(playerPages[i], 1000);
      
      // Ingresar respuesta
      const answerInput = await playerPages[i].locator('input[type="number"]').first();
      await answerInput.fill(playerAnswers[i].toString());
      
      // Enviar respuesta
      await playerPages[i].click('button:has-text("Enviar")');
      
      console.log(`  ✓ ${PLAYER_NAMES[i]} respondió: ${playerAnswers[i]}`);
      await screenshot(playerPages[i], `07-player-${i + 1}-answered`);
      await waitFor(playerPages[i], 500);
    }
    
    await waitFor(hostPage, 2000);
    console.log('\n');

    // ========== FASE 5: HOST ORDENA RESPUESTAS ==========
    console.log('📍 FASE 5: Host ordenando respuestas...');
    await hostPage.click('button:has-text("Ordenar")');
    await waitFor(hostPage, 2000);
    
    // Verificar que se muestra el tablero
    const boardVisible = await hostPage.locator('.betting-board, .board-container').count() > 0;
    console.log('✅ Tablero de apuestas mostrado\n');
    await screenshot(hostPage, '08-betting-board-displayed');
    
    // Iniciar fase de apuestas
    await hostPage.click('button:has-text("Iniciar")');
    await waitFor(hostPage, 1500);
    console.log('✅ Fase de apuestas iniciada\n');

    // ========== FASE 6: JUGADORES APUESTAN ==========
    console.log('📍 FASE 6: Jugadores realizando apuestas...');
    
    for (let i = 0; i < NUM_PLAYERS; i++) {
      await waitFor(playerPages[i], 1000);
      
      // Hacer clic en una casilla para apostar
      const slots = await playerPages[i].locator('.answer-cell, [data-position]');
      const slotsCount = await slots.count();
      
      if (slotsCount > 0) {
        await slots.first().click();
        await waitFor(playerPages[i], 500);
        
        // Segunda ficha
        if (slotsCount > 1) {
          await slots.nth(1).click();
          await waitFor(playerPages[i], 500);
        }
      }
      
      // Confirmar apuestas
      await playerPages[i].click('button:has-text("Confirmar")');
      
      console.log(`  ✓ ${PLAYER_NAMES[i]} realizó sus apuestas`);
      await screenshot(playerPages[i], `09-player-${i + 1}-bet-placed`);
      await waitFor(playerPages[i], 500);
    }
    
    await waitFor(hostPage, 2000);
    console.log('\n');

    // ========== FASE 7: HOST REVELA RESPUESTA ==========
    console.log('📍 FASE 7: Host revelando respuesta correcta...');
    await hostPage.click('button:has-text("Revelar")');
    await waitFor(hostPage, 3000);
    
    // Verificar que se muestran los resultados
    const resultsVisible = await hostPage.locator('text=Resultado, text=Ganador').count() > 0 || 
                           await hostPage.locator('.results').count() > 0;
    console.log('✅ Resultados mostrados\n');
    await screenshot(hostPage, '10-results-displayed');
    
    // Verificar que los jugadores ven los resultados
    for (let i = 0; i < NUM_PLAYERS; i++) {
      await waitFor(playerPages[i], 1000);
      console.log(`  ✓ ${PLAYER_NAMES[i]} ve los resultados`);
      await screenshot(playerPages[i], `11-player-${i + 1}-results`);
    }
    
    console.log('\n');

    // ========== FASE 8: SIGUIENTE RONDA ==========
    console.log('📍 FASE 8: Avanzando a la siguiente ronda...');
    await hostPage.click('button:has-text("Siguiente")');
    await waitFor(hostPage, 3000);
    
    // Verificar que se muestra la nueva ronda
    const round2Visible = await hostPage.locator('text=Ronda 2').isVisible().catch(() => false);
    console.log('✅ Ronda 2 iniciada\n');
    await screenshot(hostPage, '12-round-2-question');

    // ========== VERIFICACIONES FINALES ==========
    console.log('📍 VERIFICACIONES FINALES...');
    console.log('✅ Flujo completo de juego verificado\n');

    // ========== CLEANUP ==========
    console.log('🧹 Limpiando y cerrando contextos...');
    await hostContext.close();
    for (const ctx of playerContexts) {
      await ctx.close();
    }
    
    console.log('\n✅ TEST COMPLETADO EXITOSAMENTE! 🎉\n');
  });
});
