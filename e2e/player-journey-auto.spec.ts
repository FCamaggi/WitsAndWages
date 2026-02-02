import { test, expect, Page, BrowserContext } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * TEST AUTOMÁTICO COMPLETO - Sin intervención manual
 * Simula una partida completa y captura todas las etapas
 */

const SCREENSHOT_DIR = 'test-results/player-journey-auto';
const PLAYER_NAMES = ['Ana', 'Beto', 'Cami', 'Dani', 'Eli'];
const PLAYER_COLORS = ['red', 'blue', 'green', 'yellow', 'purple'];

async function waitFor(page: Page, ms: number) {
  await page.waitForTimeout(ms);
}

async function capturePlayerView(page: Page, stageName: string, description: string) {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
  
  const filename = `${stageName}.png`;
  const filepath = path.join(SCREENSHOT_DIR, filename);
  
  await waitFor(page, 500); // Reducido de 1000ms
  await page.screenshot({ 
    path: filepath, 
    fullPage: true 
  });
  
  console.log(`📸 ${stageName.padEnd(25)} | ${description}`);
}

async function clickButton(page: Page, text: string, timeout = 5000) { // Reducido de 10000
  const selectors = [
    `button:has-text("${text}")`,
    `button:text-is("${text}")`,
    `.btn:has-text("${text}")`
  ];
  
  for (const selector of selectors) {
    try {
      await page.waitForSelector(selector, { timeout: timeout / selectors.length, state: 'visible' });
      await page.click(selector);
      return true;
    } catch (e) {
      continue;
    }
  }
  return false;
}

test.describe('🎰 Captura Automática Completa', () => {
  
  test('Simular partida completa y capturar todas las etapas', async ({ browser }) => {
    test.setTimeout(180000); // 3 minutos

    console.log('\n' + '='.repeat(70));
    console.log('🎬 INICIANDO CAPTURA AUTOMÁTICA DEL FLUJO COMPLETO');
    console.log('='.repeat(70) + '\n');

    // Crear contextos para host y jugadores
    const hostContext = await browser.newContext();
    const hostPage = await hostContext.newPage();
    
    const playerContexts: BrowserContext[] = [];
    const playerPages: Page[] = [];
    
    // Crear 5 jugadores (viewport móvil)
    for (let i = 0; i < 5; i++) {
      const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      });
      const page = await context.newPage();
      
      // Suprimir logs innecesarios
      page.on('console', () => {});
      page.on('pageerror', () => {});
      
      // Handler global para dialogs de apuestas
      page.on('dialog', async dialog => {
        if (dialog.type() === 'prompt') {
          await dialog.accept('0'); // Apostar 0 fichas de póquer (solo token)
        } else if (dialog.type() === 'alert') {
          await dialog.accept();
        }
      });
      
      playerContexts.push(context);
      playerPages.push(page);
    }

    const mainPlayerPage = playerPages[0]; // Ana - para capturas

    try {
      console.log('📱 FASE 1: INICIO Y CONEXIÓN\n');

      // ========== 1. HOME SCREEN ==========
      await mainPlayerPage.goto('/');
      await waitFor(mainPlayerPage, 1500); // Reducido
      await capturePlayerView(mainPlayerPage, '01-home-screen', 'Pantalla inicial con tema Vegas');

      // ========== 2. FORMULARIO VACÍO ==========
      await clickButton(mainPlayerPage, 'Unirse');
      await waitFor(mainPlayerPage, 1000); // Reducido
      await capturePlayerView(mainPlayerPage, '02-join-form-empty', 'Formulario de entrada vacío');

      // ========== 3. CREAR PARTIDA (HOST) ==========
      await hostPage.goto('/');
      await waitFor(hostPage, 500);
      await clickButton(hostPage, 'Crear Partida');
      await waitFor(hostPage, 300);
      await clickButton(hostPage, 'Crear Partida');
      await waitFor(hostPage, 1500); // Reducido
      
      await hostPage.waitForSelector('[data-testid="game-code"], .game-code', { timeout: 5000 });
      const gameCode = (await hostPage.locator('[data-testid="game-code"], .game-code').first().innerText()).trim();
      console.log(`\n🎮 Código de partida: ${gameCode}\n`);

      // ========== 4. FORMULARIO COMPLETADO ==========
      // Llenar datos del jugador principal
      const codeInput = mainPlayerPage.locator('input[type="text"]').first();
      await codeInput.fill(gameCode);
      await waitFor(mainPlayerPage, 200);
      
      const nameInput = mainPlayerPage.locator('input[placeholder*="nombre" i]').first();
      await nameInput.fill('Ana');
      await waitFor(mainPlayerPage, 200);
      
      // Intentar seleccionar color
      try {
        const colorButtons = mainPlayerPage.locator('.color-selector button, button[data-color], .color-option');
        const count = await colorButtons.count();
        if (count > 0) {
          await colorButtons.first().click();
        }
      } catch (e) {}
      
      await waitFor(mainPlayerPage, 500);
      await capturePlayerView(mainPlayerPage, '03-form-filled', 'Formulario completado listo para enviar');

      // ========== 5. SALA DE ESPERA (1 jugador) ==========
      await clickButton(mainPlayerPage, 'Unirse');
      await waitFor(mainPlayerPage, 1500); // Reducido
      await capturePlayerView(mainPlayerPage, '04-waiting-room-1player', 'Sala de espera - 1 jugador conectado');

      // ========== 6. CONECTAR RESTO DE JUGADORES ==========
      console.log('\n🤖 Conectando 4 jugadores más...\n');
      
      for (let i = 1; i < 5; i++) {
        const page = playerPages[i];
        
        await page.goto('/');
        await waitFor(page, 300);
        await clickButton(page, 'Unirse');
        await waitFor(page, 300);
        
        const pCodeInput = page.locator('input[type="text"]').first();
        await pCodeInput.fill(gameCode);
        
        const pNameInput = page.locator('input[placeholder*="nombre" i]').first();
        await pNameInput.fill(PLAYER_NAMES[i]);
        
        try {
          const colorButtons = page.locator('.color-selector button, button[data-color]');
          const count = await colorButtons.count();
          if (count > i) {
            await colorButtons.nth(i).click();
          }
        } catch (e) {}
        
        await clickButton(page, 'Unirse');
        await waitFor(page, 800); // Reducido
      }

      // ========== 7. SALA DE ESPERA (5 jugadores) ==========
      await waitFor(mainPlayerPage, 1500); // Reducido
      await capturePlayerView(mainPlayerPage, '05-waiting-room-5players', 'Sala de espera - 5 jugadores conectados');

      // ========== 8. INICIAR JUEGO ==========
      console.log('\n📱 FASE 2: RONDA DE JUEGO\n');
      await clickButton(hostPage, 'Iniciar Juego');
      await waitFor(hostPage, 3000);

      // ========== 9. PREGUNTA ==========
      await waitFor(mainPlayerPage, 2000);
      await capturePlayerView(mainPlayerPage, '06-question-display', 'Pregunta de la ronda 1');

      // ========== 10. INGRESANDO RESPUESTA ==========
      try {
        const answerInput = mainPlayerPage.locator('input[type="number"], input[type="text"]').last();
        await answerInput.waitFor({ state: 'visible', timeout: 5000 });
        await answerInput.click();
        await answerInput.fill('1500');
        await waitFor(mainPlayerPage, 1500);
        await capturePlayerView(mainPlayerPage, '07-answer-typing', 'Ingresando respuesta numérica');
      } catch (e) {
        console.log('⚠️  Nota: No se encontró input de respuesta');
      }

      // ========== 11. ENVIAR RESPUESTA ==========
      await clickButton(mainPlayerPage, 'Enviar');
      await waitFor(mainPlayerPage, 2000);
      await capturePlayerView(mainPlayerPage, '08-answer-submitted', 'Respuesta enviada - esperando a otros');

      // ========== 12. OTROS JUGADORES RESPONDEN ==========
      console.log('🤖 Simulando respuestas de otros jugadores...\n');
      const answers = [1000, 1200, 1800, 2000];
      
      for (let i = 1; i < 5; i++) {
        const page = playerPages[i];
        try {
          const input = page.locator('input[type="number"], input[type="text"]').last();
          await input.waitFor({ state: 'visible', timeout: 3000 });
          await input.fill(answers[i - 1].toString());
          await clickButton(page, 'Enviar');
          await waitFor(page, 300);
        } catch (e) {
          console.log(`⚠️  Jugador ${i + 1} no pudo responder`);
        }
      }

      // Esperar a que el host detecte todas las respuestas y aparezca el botón
      await waitFor(hostPage, 2000);
      
      // El botón aparece cuando todos responden: "✓ Todos respondieron - Ordenar Respuestas"
      try {
        await hostPage.waitForSelector('button:has-text("Todos respondieron")', {
          timeout: 10000,
          state: 'visible'
        });
        console.log('✅ Host: Botón "Ordenar Respuestas" visible');
        await clickButton(hostPage, 'Todos respondieron');
        await waitFor(hostPage, 3000);
      } catch (e) {
        console.log('⚠️  Host: No apareció el botón de ordenar respuestas');
        console.log(`    Respuestas en juego: ${await hostPage.locator('.progress-count').textContent()}`);
      }

      // ========== 13. TABLERO DE APUESTAS ==========
      console.log('\n📱 FASE 3: APUESTAS\n');
      
      // Host debe iniciar las apuestas (fase ordering → betting)
      try {
        await hostPage.waitForSelector('button:has-text("Iniciar Apuestas")', {
          timeout: 5000,
          state: 'visible'
        });
        console.log('✅ Host: Botón "Iniciar Apuestas" visible');
        await clickButton(hostPage, 'Iniciar Apuestas');
        console.log('🔄 Host: Click en "Iniciar Apuestas" ejecutado');
        await waitFor(hostPage, 3000);
        
        // Verificar que el host ahora esté en fase betting
        const hostBettingStatus = await hostPage.locator('.betting-status, h1:has-text("APUESTAS")').count();
        if (hostBettingStatus > 0) {
          console.log('✅ Host: Ahora en fase de apuestas');
        } else {
          console.log('⚠️  Host: No cambió a fase de apuestas');
        }
      } catch (e) {
        console.log('⚠️  Host: No apareció el botón "Iniciar Apuestas"');
      }
      
      // Esperar a que aparezca el tablero de apuestas en el jugador
      try {
        await mainPlayerPage.waitForSelector('.bet-space, .betting-board, .player-betting-board', { 
          timeout: 10000,
          state: 'visible' 
        });
        console.log('✅ Jugador: Tablero de apuestas visible');
        await waitFor(mainPlayerPage, 1500);
        await capturePlayerView(mainPlayerPage, '09-betting-board', 'Tablero de apuestas con todas las respuestas');
      } catch (e) {
        console.log('⚠️  El tablero de apuestas no apareció en el jugador');
        
        // Debug: ver qué hay en la página del jugador
        const bodyText = await mainPlayerPage.locator('body').textContent();
        console.log('📝 Contenido en jugador:', bodyText?.substring(0, 200));
        
        await capturePlayerView(mainPlayerPage, '09-ERROR-no-betting-board', 'Error: tablero no visible');
      }

      // ========== 14. PRIMERA APUESTA ==========
      try {
        const betSpaces = mainPlayerPage.locator('.mini-bet-space:not(.blocked):not(.has-bet)');
        await betSpaces.first().waitFor({ state: 'visible', timeout: 5000 });
        
        const count = await betSpaces.count();
        console.log(`🎲 Espacios de apuesta disponibles: ${count}`);
        
        if (count >= 2) {
          // Primera apuesta
          await betSpaces.first().click();
          await waitFor(mainPlayerPage, 1000);
          await capturePlayerView(mainPlayerPage, '10-first-bet-placed', 'Primera ficha apostada');
          
          // ========== 15. SEGUNDA APUESTA ==========
          await waitFor(mainPlayerPage, 500);
          const betSpaces2 = mainPlayerPage.locator('.mini-bet-space:not(.blocked):not(.has-bet)');
          const count2 = await betSpaces2.count();
          
          if (count2 >= 1) {
            await betSpaces2.first().click();
            await waitFor(mainPlayerPage, 1000);
            await capturePlayerView(mainPlayerPage, '11-second-bet-placed', 'Segunda ficha apostada - apuestas completas');
          }
          
          // CONFIRMAR APUESTAS
          await waitFor(mainPlayerPage, 500);
          await clickButton(mainPlayerPage, 'Confirmar Apuestas');
          console.log('✅ Ana: Apuestas confirmadas');
          await waitFor(mainPlayerPage, 1000);
        }
      } catch (e) {
        console.log('⚠️  No se pudieron realizar apuestas:', e.message);
      }

      // ========== 16. OTROS JUGADORES APUESTAN ==========
      console.log('🤖 Simulando apuestas de otros jugadores...\n');
      
      for (let i = 1; i < 5; i++) {
        const page = playerPages[i];
        try {
          await waitFor(page, 500);
          const betSpaces = page.locator('.mini-bet-space:not(.blocked):not(.has-bet)');
          await betSpaces.first().waitFor({ state: 'visible', timeout: 3000 });
          
          const count = await betSpaces.count();
          if (count >= 2) {
            // Primera apuesta
            await betSpaces.first().click();
            await waitFor(page, 500);
            
            // Segunda apuesta
            const betSpaces2 = page.locator('.mini-bet-space:not(.blocked):not(.has-bet)');
            const count2 = await betSpaces2.count();
            if (count2 >= 1) {
              await betSpaces2.first().click();
              await waitFor(page, 500);
            }
            
            // CONFIRMAR APUESTAS
            await clickButton(page, 'Confirmar Apuestas');
            await waitFor(page, 300);
            console.log(`✅ Jugador ${i + 1} (${PLAYER_NAMES[i]}) apostó y confirmó`);
          }
        } catch (e) {
          console.log(`⚠️  Jugador ${i + 1} no pudo apostar:`, e.message);
        }
      }

      // ========== 17. REVELAR RESPUESTA CORRECTA ==========
      console.log('\n📱 FASE 4: RESULTADOS\n');
      
      // Dar tiempo para que los sockets se sincronicen
      await waitFor(hostPage, 3000);
      
      // Verificar estado de apuestas en el host
      try {
        const bettingStatus = await hostPage.locator('.betting-status').textContent();
        console.log(`📊 Estado de apuestas: ${bettingStatus}`);
      } catch (e) {}
      
      // El host espera a que todos apuesten, luego aparece el botón "🎯 Todos apostaron - Revelar Respuesta"
      try {
        await hostPage.waitForSelector('button:has-text("Todos apostaron")', {
          timeout: 15000,
          state: 'visible'
        });
        console.log('✅ Host: Todos los jugadores apostaron - botón visible');
        await clickButton(hostPage, 'Todos apostaron');
        console.log('🔄 Host: Click en "Revelar Respuesta" ejecutado');
        await waitFor(hostPage, 3000);
      } catch (e) {
        console.log('⚠️  Host: No apareció el botón de revelar respuesta después de 15s');
        
        // Debug: ver qué botones hay disponibles
        const buttons = await hostPage.locator('button').allTextContents();
        console.log('📝 Botones disponibles en host:', buttons);
      }

      // ========== 18. RESULTADOS ==========
      // El jugador ve una pantalla de espera mientras el host revisa los resultados
      await waitFor(mainPlayerPage, 2000);
      await capturePlayerView(mainPlayerPage, '12-waiting-for-next', 'Esperando siguiente ronda');

      // ========== 19. LEADERBOARD ==========
      await waitFor(mainPlayerPage, 1500);
      await capturePlayerView(mainPlayerPage, '13-leaderboard', 'Tabla de posiciones después de ronda 1');

      // ========== 20. SIGUIENTE RONDA ==========
      console.log('\n📱 FASE 5: NUEVA RONDA\n');
      try {
        const nextBtn = await hostPage.locator('button:has-text("Siguiente")').count();
        if (nextBtn > 0) {
          await clickButton(hostPage, 'Siguiente');
          console.log('✅ Host: Iniciando siguiente ronda');
          
          // Esperar a que aparezca nueva pregunta
          await waitFor(mainPlayerPage, 3000);
          await capturePlayerView(mainPlayerPage, '14-round-2-question', 'Ronda 2 - Nueva pregunta y fichas restauradas');
        } else {
          console.log('⚠️  Host: No se encontró botón Siguiente Ronda');
        }
      } catch (e) {
        console.log('⚠️  No se pudo iniciar ronda 2');
      }

      console.log('\n' + '='.repeat(70));
      console.log('✅ CAPTURA AUTOMÁTICA COMPLETADA');
      console.log(`📁 Carpeta: ${SCREENSHOT_DIR}/`);
      console.log('='.repeat(70) + '\n');

    } catch (error) {
      console.error('\n❌ Error durante captura automática:', error.message);
      
      await mainPlayerPage.screenshot({ 
        path: path.join(SCREENSHOT_DIR, 'ERROR.png'),
        fullPage: true 
      });
    } finally {
      // Cerrar todo al final
      await hostContext.close();
      for (const context of playerContexts) {
        await context.close();
      }
    }
  });
});
