import { test, expect, Page, BrowserContext } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * TEST VISUAL SIMPLIFICADO: Captura completa del flujo con manejo manual
 */

const SCREENSHOT_DIR = 'test-results/player-journey-manual';

async function waitFor(page: Page, ms: number) {
  await page.waitForTimeout(ms);
}

async function capturePlayerView(page: Page, stageName: string, description: string) {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
  
  const filename = `${stageName}.png`;
  const filepath = path.join(SCREENSHOT_DIR, filename);
  
  await waitFor(page, 1500);
  await page.screenshot({ 
    path: filepath, 
    fullPage: true 
  });
  
  console.log(`\n📸 ${stageName}`);
  console.log(`   ${description}`);
}

async function clickButton(page: Page, text: string) {
  const selectors = [
    `button:has-text("${text}")`,
    `button:text-is("${text}")`,
  ];
  
  for (const selector of selectors) {
    try {
      await page.waitForSelector(selector, { timeout: 5000, state: 'visible' });
      await page.click(selector);
      return true;
    } catch (e) {
      continue;
    }
  }
  console.log(`⚠️ No encontrado: ${text}`);
  return false;
}

test.describe('🎮 Flujo Completo Manual', () => {
  
  test('Capturar TODO el juego paso a paso', async ({ browser }) => {
    test.setTimeout(600000); // 10 minutos

    console.log('\n🎬 CAPTURA COMPLETA DEL FLUJO DE JUEGO\n');
    console.log('INSTRUCCIONES:');
    console.log('1. El test abrirá el navegador en modo "headed"');
    console.log('2. Seguirás las instrucciones en consola');
    console.log('3. El test capturará cada etapa automáticamente\n');
    console.log('=' .repeat(60));

    const playerContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    const playerPage = await playerContext.newPage();

    try {
      // ===== FASE 1: INICIO =====
      console.log('\n📱 FASE 1: INICIO');
      await playerPage.goto('/');
      await waitFor(playerPage, 2000);
      
      await capturePlayerView(playerPage, '01-home-screen', 'Home con tema Vegas');
      
      await clickButton(playerPage, 'Unirse');
      await waitFor(playerPage, 1500);
      
      await capturePlayerView(playerPage, '02-join-form', 'Formulario de entrada');

      // INSTRUCCIÓN MANUAL
      console.log('\n\n🎮 INSTRUCCIONES MANUALES:');
      console.log('─────────────────────────────────────');
      console.log('1. En OTRA PESTAÑA/VENTANA, abre: http://localhost:5173');
      console.log('2. Haz click en "Crear Partida"');
      console.log('3. Haz click de nuevo en "Crear Partida"');
      console.log('4. Copia el código de 6 dígitos que aparece');
      console.log('5. Vuelve a esta ventana del test');
      console.log('');
      console.log('Esperando 30 segundos para que crees la partida...');
      console.log('─────────────────────────────────────\n');
      
      await waitFor(playerPage, 30000);

      // Llenar formulario
      console.log('\n📝 Llenando formulario...');
      console.log('INGRESA EN EL TEST:');
      console.log('- Código: (el que copiaste)');
      console.log('- Nombre: Ana');
      console.log('- Color: Rojo (primer botón)\n');
      
      const codeInput = playerPage.locator('input[type="text"]').first();
      console.log('Ingresa el código y presiona ENTER cuando termines...');
      await playerPage.pause(); // Pausa para entrada manual
      
      const nameInput = playerPage.locator('input[placeholder*="nombre" i]').first();
      await nameInput.fill('Ana');
      
      const colorButton = playerPage.locator('.color-selector button, button[data-color]').first();
      await colorButton.click();
      await waitFor(playerPage, 1000);
      
      await capturePlayerView(playerPage, '03-form-filled', 'Formulario completado');
      
      await clickButton(playerPage, 'Unirse');
      await waitFor(playerPage, 2000);
      
      await capturePlayerView(playerPage, '04-waiting-room', 'Sala de espera');

      // AGREGAR MÁS JUGADORES MANUALMENTE
      console.log('\n\n🎮 SIGUIENTE PASO:');
      console.log('─────────────────────────────────────');
      console.log('En 4 PESTAÑAS/VENTANAS más, repite:');
      console.log('1. Abre http://localhost:5173');
      console.log('2. Click en "Unirse a Partida"');
      console.log('3. Ingresa el mismo código');
      console.log('4. Nombres: Beto, Cami, Dani, Eli');
      console.log('5. Elige diferentes colores');
      console.log('');
      console.log('Esperando 60 segundos...');
      console.log('─────────────────────────────────────\n');
      
      await waitFor(playerPage, 60000);
      
      await capturePlayerView(playerPage, '05-waiting-room-full', '5 jugadores conectados');

      // INICIAR JUEGO
      console.log('\n\n🎮 INICIAR JUEGO:');
      console.log('─────────────────────────────────────');
      console.log('En la ventana del HOST:');
      console.log('1. Haz click en "Iniciar Juego"');
      console.log('');
      console.log('Esperando 20 segundos...');
      console.log('─────────────────────────────────────\n');
      
      await waitFor(playerPage, 20000);
      
      await capturePlayerView(playerPage, '06-question-display', 'Pregunta de la ronda');

      // RESPONDER
      console.log('\n\n🎮 RESPONDER:');
      console.log('─────────────────────────────────────');
      console.log('En la ventana del JUGADOR (Ana):');
      console.log('1. Ingresa una respuesta numérica (ej: 1500)');
      console.log('2. Click en "Enviar Respuesta"');
      console.log('');
      console.log('Pausa para que respondas...');
      console.log('─────────────────────────────────────\n');
      
      await playerPage.pause();
      
      await capturePlayerView(playerPage, '07-answer-input', 'Ingresando respuesta');
      await capturePlayerView(playerPage, '08-answer-submitted', 'Respuesta enviada');

      // OTROS RESPONDEN
      console.log('\n\n🎮 OTROS JUGADORES:');
      console.log('─────────────────────────────────────');
      console.log('En las ventanas de los OTROS 4 JUGADORES:');
      console.log('1. Haz que cada uno responda (números diferentes)');
      console.log('');
      console.log('En la ventana del HOST:');
      console.log('2. Click en "Mostrar Respuestas"');
      console.log('');
      console.log('Esperando 30 segundos...');
      console.log('─────────────────────────────────────\n');
      
      await waitFor(playerPage, 30000);
      
      await capturePlayerView(playerPage, '09-betting-board', 'Tablero de apuestas');

      // APOSTAR
      console.log('\n\n🎮 APOSTAR:');
      console.log('─────────────────────────────────────');
      console.log('En la ventana del JUGADOR (Ana):');
      console.log('1. Haz click en una casilla del tablero');
      console.log('2. Click en otra casilla (2 apuestas total)');
      console.log('');
      console.log('Pausa para que apuestes...');
      console.log('─────────────────────────────────────\n');
      
      await playerPage.pause();
      
      await capturePlayerView(playerPage, '10-first-bet-placed', 'Primera apuesta');
      await waitFor(playerPage, 2000);
      await capturePlayerView(playerPage, '11-second-bet-placed', 'Segunda apuesta');

      // REVELAR
      console.log('\n\n🎮 REVELAR RESPUESTA:');
      console.log('─────────────────────────────────────');
      console.log('Haz que TODOS LOS JUGADORES apuesten.');
      console.log('');
      console.log('En la ventana del HOST:');
      console.log('1. Ingresa la respuesta correcta');
      console.log('2. Click en "Revelar Respuesta"');
      console.log('');
      console.log('Esperando 20 segundos...');
      console.log('─────────────────────────────────────\n');
      
      await waitFor(playerPage, 20000);
      
      await capturePlayerView(playerPage, '12-round-results', 'Resultados de la ronda');
      await waitFor(playerPage, 3000);
      await capturePlayerView(playerPage, '13-leaderboard', 'Tabla de posiciones');

      // SIGUIENTE RONDA
      console.log('\n\n🎮 SIGUIENTE RONDA:');
      console.log('─────────────────────────────────────');
      console.log('En la ventana del HOST:');
      console.log('1. Click en "Siguiente Ronda"');
      console.log('');
      console.log('Esperando 10 segundos...');
      console.log('─────────────────────────────────────\n');
      
      await waitFor(playerPage, 10000);
      
      await capturePlayerView(playerPage, '14-new-round', 'Nueva ronda');

      console.log('\n' + '='.repeat(60));
      console.log('✅ CAPTURA COMPLETA');
      console.log(`📁 Revisa: ${SCREENSHOT_DIR}/`);
      console.log('='.repeat(60) + '\n');

    } catch (error) {
      console.error('\n❌ Error:', error);
      await playerPage.screenshot({ 
        path: path.join(SCREENSHOT_DIR, 'ERROR.png'),
        fullPage: true 
      });
    } finally {
      console.log('\nPresiona cualquier tecla para cerrar...');
      await waitFor(playerPage, 5000);
      await playerContext.close();
    }
  });
});
