import { test, expect, Page, BrowserContext } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * TEST VISUAL: Captura screenshots del flujo del jugador en cada etapa
 * Objetivo: Mostrar qué ve un jugador en cada parte del juego
 */

const SCREENSHOT_DIR = 'test-results/player-journey';

async function waitFor(page: Page, ms: number) {
  await page.waitForTimeout(ms);
}

async function capturePlayerView(page: Page, stageName: string, description: string) {
  // Crear directorio si no existe
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
  
  const filename = `${stageName}.png`;
  const filepath = path.join(SCREENSHOT_DIR, filename);
  
  await waitFor(page, 1000); // Esperar a que se rendericen animaciones
  await page.screenshot({ 
    path: filepath, 
    fullPage: true 
  });
  
  console.log(`\n📸 ${stageName}`);
  console.log(`   ${description}`);
  console.log(`   → ${filepath}\n`);
}

async function clickButton(page: Page, text: string, timeout = 10000) {
  const selectors = [
    `button:has-text("${text}")`,
    `button:text-is("${text}")`,
    `[role="button"]:has-text("${text}")`
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

test.describe('👁️ Viaje Visual del Jugador', () => {
  
  test('Capturar todas las etapas del jugador', async ({ browser }) => {
    test.setTimeout(300000); // 5 minutos

    console.log('\n🎬 INICIANDO CAPTURA VISUAL DEL VIAJE DEL JUGADOR\n');
    console.log('=' .repeat(60));

    // ========== SETUP ==========
    const hostContext = await browser.newContext();
    const hostPage = await hostContext.newPage();
    
    const playerContext = await browser.newContext({
      viewport: { width: 390, height: 844 }, // iPhone 12 Pro size
      isMobile: true,
      hasTouch: true,
    });
    const playerPage = await playerContext.newPage();

    try {
      // ========== ETAPA 1: HOME SCREEN ==========
      console.log('\n📱 ETAPA 1: HOME SCREEN');
      await playerPage.goto('/');
      await waitFor(playerPage, 2000);
      
      await capturePlayerView(
        playerPage,
        '01-home-screen',
        'Pantalla inicial con opciones "Crear Partida" y "Unirse a Partida"'
      );

      // ========== ETAPA 2: UNIRSE A PARTIDA - FORMULARIO ==========
      console.log('\n📱 ETAPA 2: FORMULARIO DE ENTRADA');
      await clickButton(playerPage, 'Unirse');
      await waitFor(playerPage, 1500);
      
      await capturePlayerView(
        playerPage,
        '02-join-form',
        'Formulario para ingresar código y nombre + selector de color'
      );

      // Crear partida del host
      await hostPage.goto('/');
      await waitFor(hostPage, 1000);
      await clickButton(hostPage, 'Crear Partida');
      await waitFor(hostPage, 1000);
      await clickButton(hostPage, 'Crear Partida');
      await waitFor(hostPage, 2000);
      
      // Obtener código
      await hostPage.waitForSelector('[data-testid="game-code"], .game-code', { timeout: 10000 });
      const gameCode = (await hostPage.locator('[data-testid="game-code"], .game-code').first().innerText()).trim();
      console.log(`\n🎮 Código de partida: ${gameCode}\n`);

      // ========== ETAPA 3: FORMULARIO COMPLETADO ==========
      console.log('\n📱 ETAPA 3: FORMULARIO COMPLETADO');
      
      // Llenar código
      const codeInput = playerPage.locator('input[placeholder*="código" i], input[type="text"]').first();
      await codeInput.fill(gameCode);
      await waitFor(playerPage, 500);
      
      // Llenar nombre
      const nameInput = playerPage.locator('input[placeholder*="nombre" i], input[placeholder*="tu nombre" i]').first();
      await nameInput.fill('Ana');
      await waitFor(playerPage, 500);
      
      // Seleccionar color
      const colorButton = playerPage.locator('button[data-color="red"], .color-option[data-color="red"], .color-selector button').first();
      await colorButton.click();
      await waitFor(playerPage, 1000);
      
      await capturePlayerView(
        playerPage,
        '03-form-filled',
        'Formulario completado: código, nombre y color seleccionado'
      );

      // ========== ETAPA 4: SALA DE ESPERA ==========
      console.log('\n📱 ETAPA 4: SALA DE ESPERA');
      await clickButton(playerPage, 'Unirse');
      await waitFor(playerPage, 2000);
      
      await capturePlayerView(
        playerPage,
        '04-waiting-room',
        'Sala de espera: viendo otros jugadores conectarse'
      );

      // Agregar más jugadores
      for (let i = 0; i < 4; i++) {
        const tempContext = await browser.newContext({ isMobile: true });
        const tempPage = await tempContext.newPage();
        
        await tempPage.goto('/');
        await waitFor(tempPage, 500);
        await clickButton(tempPage, 'Unirse');
        await waitFor(tempPage, 500);
        
        const tempCodeInput = tempPage.locator('input[type="text"]').first();
        await tempCodeInput.fill(gameCode);
        
        const tempNameInput = tempPage.locator('input[placeholder*="nombre" i]').first();
        await tempNameInput.fill(['Beto', 'Cami', 'Dani', 'Eli'][i]);
        
        await clickButton(tempPage, 'Unirse');
        await waitFor(tempPage, 1000);
        
        await tempContext.close();
      }

      await waitFor(playerPage, 2000);
      
      await capturePlayerView(
        playerPage,
        '05-waiting-room-full',
        'Sala de espera con 5 jugadores conectados'
      );

      // Iniciar juego desde host
      console.log('\n🎮 Host iniciando el juego...');
      await clickButton(hostPage, 'Iniciar Juego');
      await waitFor(hostPage, 3000);

      // ========== ETAPA 5: RONDA INICIADA - VER PREGUNTA ==========
      console.log('\n📱 ETAPA 6: PREGUNTA DE LA RONDA');
      await waitFor(playerPage, 3000);
      
      await capturePlayerView(
        playerPage,
        '06-question-display',
        'Viendo la pregunta de la ronda actual'
      );

      // ========== ETAPA 6: ENVIANDO RESPUESTA ==========
      console.log('\n📱 ETAPA 7: ENVIANDO RESPUESTA');
      
      // Esperar que aparezca el input de respuesta
      try {
        await playerPage.waitForSelector('input[type="number"], input[type="text"]', { 
          timeout: 10000,
          state: 'visible' 
        });
        
        const answerInput = playerPage.locator('input[type="number"], input[type="text"]').first();
        await answerInput.click();
        await waitFor(playerPage, 500);
        await answerInput.fill('1500');
        await waitFor(playerPage, 1500);
        
        await capturePlayerView(
          playerPage,
          '07-answer-input',
          'Ingresando respuesta numérica'
        );

        // Enviar respuesta
        await clickButton(playerPage, 'Enviar');
        await waitFor(playerPage, 2000);
        
        await capturePlayerView(
          playerPage,
          '08-answer-submitted',
          'Respuesta enviada - esperando a otros jugadores'
        );
      } catch (e) {
        console.log('⚠️ No se pudo capturar fase de respuesta:', e.message);
        await playerPage.screenshot({ path: `${SCREENSHOT_DIR}/07-error-answer.png` });
      }

      // Simular respuestas de todos los demás jugadores desde el host
      console.log('\n🤖 Simulando respuestas de otros jugadores...');
      await waitFor(hostPage, 2000);
      
      // Verificar que estamos en la fase correcta
      await clickButton(hostPage, 'Mostrar Respuestas');
      await waitFor(hostPage, 3000);

      // ========== ETAPA 7: VER TABLERO DE APUESTAS ==========
      console.log('\n📱 ETAPA 9: TABLERO DE APUESTAS');
      await waitFor(playerPage, 3000);
      
      try {
        await playerPage.waitForSelector('.bet-space, .betting-board', { 
          timeout: 10000,
          state: 'visible' 
        });
        
        await capturePlayerView(
          playerPage,
          '09-betting-board',
          'Tablero con respuestas ordenadas - fase de apuestas'
        );

        // ========== ETAPA 8: REALIZANDO PRIMERA APUESTA ==========
        console.log('\n📱 ETAPA 10: REALIZANDO PRIMERA APUESTA');
        
        // Esperar y hacer click en una casilla
        const betSpace = playerPage.locator('.bet-space').nth(2);
        await betSpace.waitFor({ state: 'visible', timeout: 5000 });
        await betSpace.click();
        await waitFor(playerPage, 2000);
        
        await capturePlayerView(
          playerPage,
          '10-first-bet-placed',
          'Primera ficha apostada en una casilla'
        );

        // ========== ETAPA 9: SEGUNDA APUESTA ==========
        console.log('\n📱 ETAPA 11: REALIZANDO SEGUNDA APUESTA');
        
        const secondBetSpace = playerPage.locator('.bet-space').nth(4);
        await secondBetSpace.waitFor({ state: 'visible', timeout: 5000 });
        await secondBetSpace.click();
        await waitFor(playerPage, 2000);
        
        await capturePlayerView(
          playerPage,
          '11-second-bet-placed',
          'Segunda ficha apostada - todas las fichas usadas'
        );
      } catch (e) {
        console.log('⚠️ No se pudo capturar fase de apuestas:', e.message);
        await playerPage.screenshot({ path: `${SCREENSHOT_DIR}/09-error-betting.png` });
      }

      // Revelar respuesta correcta desde el host
      console.log('\n🎯 Host revelando respuesta correcta...');
      await waitFor(hostPage, 2000);
      
      try {
        const correctAnswerInput = hostPage.locator('input[type="number"]').last();
        await correctAnswerInput.waitFor({ state: 'visible', timeout: 5000 });
        await correctAnswerInput.fill('1600');
        await clickButton(hostPage, 'Revelar');
        await waitFor(hostPage, 3000);
      } catch (e) {
        console.log('⚠️ Host: error al revelar respuesta');
      }

      // ========== ETAPA 10: RESULTADOS DE LA RONDA ==========
      console.log('\n📱 ETAPA 12: RESULTADOS DE LA RONDA');
      await waitFor(playerPage, 3000);
      
      try {
        await capturePlayerView(
          playerPage,
          '12-round-results',
          'Resultados: respuesta correcta revelada + ganancias'
        );

        // ========== ETAPA 11: LEADERBOARD ==========
        console.log('\n📱 ETAPA 13: TABLA DE POSICIONES');
        await waitFor(playerPage, 2000);
        
        await capturePlayerView(
          playerPage,
          '13-leaderboard',
          'Tabla de posiciones actual del juego'
        );
      } catch (e) {
        console.log('⚠️ No se pudo capturar resultados:', e.message);
        await playerPage.screenshot({ path: `${SCREENSHOT_DIR}/12-error-results.png` });
      }

      // Siguiente ronda
      console.log('\n🔄 Host iniciando siguiente ronda...');
      try {
        await clickButton(hostPage, 'Siguiente');
        await waitFor(playerPage, 3000);

        // ========== ETAPA 12: NUEVA RONDA ==========
        console.log('\n📱 ETAPA 14: NUEVA RONDA');
        
        await capturePlayerView(
          playerPage,
          '14-new-round',
          'Inicio de nueva ronda - fichas restauradas'
        );
      } catch (e) {
        console.log('⚠️ No se pudo capturar nueva ronda:', e.message);
      }

      console.log('\n' + '='.repeat(60));
      console.log('✅ CAPTURA COMPLETA - Revisa la carpeta:');
      console.log(`   ${SCREENSHOT_DIR}/`);
      console.log('='.repeat(60) + '\n');

    } catch (error) {
      console.error('\n❌ Error durante captura:', error);
      
      // Screenshot de error
      await playerPage.screenshot({ 
        path: path.join(SCREENSHOT_DIR, 'ERROR.png'),
        fullPage: true 
      });
      
      throw error;
    } finally {
      await hostContext.close();
      await playerContext.close();
    }
  });
});
