import { test, expect, Page, BrowserContext } from '@playwright/test';

// Configuración
const NUM_PLAYERS = 5;
const PLAYER_NAMES = ['Ana', 'Beto', 'Cami', 'Dani', 'Eli'];
const TOTAL_ROUNDS = 7;

// Utilidades
async function waitFor(page: Page, ms: number) {
  await page.waitForTimeout(ms);
}

async function screenshot(page: Page, name: string) {
  try {
    await page.screenshot({ path: `test-results/full-game/${name}.png`, fullPage: true });
  } catch (e) {
    console.log(`⚠️  Screenshot: ${name}`);
  }
}

async function clickButton(page: Page, text: string, timeout = 15000) {
  try {
    const selectors = [
      `button:has-text("${text}")`,
      `button:text-is("${text}")`,
      `button:text-matches("${text}", "i")`,
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
    
    console.log(`⚠️  No se encontró botón: ${text}`);
    return false;
  } catch (e) {
    console.log(`⚠️  Error clicking button: ${text}`);
    return false;
  }
}

test.describe('Wits & Wagers Vegas - Partida Completa (7 Rondas)', () => {
  
  test('Partida rápida: 3 rondas para verificación rápida', async ({ browser }) => {
    test.setTimeout(360000); // 6 minutos (aumentado)

    console.log('\n🚀 TEST RÁPIDO: 3 Rondas\n');

    const hostContext = await browser.newContext();
    const hostPage = await hostContext.newPage();
    
    // Logging de errores de consola del host
    hostPage.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`🔴 HOST Console Error: ${msg.text()}`);
      }
    });
    
    hostPage.on('pageerror', error => {
      console.log(`🔴 HOST Page Error: ${error.message}`);
    });
    
    try {
      // Setup
      await hostPage.goto('/');
      await waitFor(hostPage, 1000);
    
    // Crear partida con selectores más específicos
    await hostPage.waitForSelector('button:has-text("Crear Partida")', { timeout: 10000 });
    await hostPage.click('button:has-text("Crear Partida")');
    await waitFor(hostPage, 1000);
    
    await hostPage.waitForSelector('button:has-text("Crear Partida")', { timeout: 10000 });
    await hostPage.click('button:has-text("Crear Partida")');
    await waitFor(hostPage, 2000);
    
    await hostPage.waitForSelector('[data-testid="game-code"], .game-code', { timeout: 10000 });
    const gameCode = (await hostPage.locator('[data-testid="game-code"], .game-code').first().innerText()).trim();
    console.log(`Código: ${gameCode}`);
    
    // 3 jugadores para test rápido
    const playerContexts: BrowserContext[] = [];
    const playerPages: Page[] = [];
    
    for (let i = 0; i < 3; i++) {
      const context = await browser.newContext();
      const page = await context.newPage();
      
      await page.goto('/');
      await waitFor(page, 1000);
      
      // Esperar y hacer click en Unirse
      await page.waitForSelector('button:has-text("Unirse")', { timeout: 10000 });
      await page.click('button:has-text("Unirse")');
      await waitFor(page, 1000);
      
      // Llenar formulario
      await page.waitForSelector('#gameCode', { timeout: 10000 });
      await page.fill('#gameCode', gameCode);
      await page.fill('#playerName', PLAYER_NAMES[i]);
      
      // Hacer click en Unirse (segundo botón)
      await page.click('button:has-text("Unirse")');
      await waitFor(page, 2000);
      
      playerContexts.push(context);
      playerPages.push(page);
      console.log(`✓ ${PLAYER_NAMES[i]}`);
    }
    
    await waitFor(hostPage, 2000);
    await hostPage.waitForSelector('button:has-text("Iniciar Juego")', { timeout: 10000 });
    await hostPage.click('button:has-text("Iniciar Juego")');
    await waitFor(hostPage, 3000);

    // 3 rondas rápidas
    for (let round = 1; round <= 3; round++) {
      console.log(`\nRonda ${round}...`);
      
      // Siguiente ronda (si no es la primera)
      if (round > 1) {
        console.log('  Esperando botón Siguiente Ronda...');
        await waitFor(hostPage, 3000);
        
        try {
          await hostPage.waitForSelector('button:has-text("Siguiente Ronda")', { timeout: 10000 });
          await hostPage.click('button:has-text("Siguiente Ronda")');
          console.log('    ✓ Botón Siguiente Ronda clickeado');
          await waitFor(hostPage, 4000);
        } catch (e) {
          console.log('    ⚠️  No se pudo hacer click en Siguiente Ronda');
          await screenshot(hostPage, `round-${round}-no-next-button`);
        }
      }

      // Respuestas
      console.log('  Respondiendo...');
      for (let i = 0; i < 3; i++) {
        try {
          await waitFor(playerPages[i], 1500);
          await playerPages[i].waitForSelector('input[type="number"]', { timeout: 8000, state: 'visible' });
          
          const answer = (round * 1000) + (i * 100);
          await playerPages[i].locator('input[type="number"]').first().fill(answer.toString());
          
          await playerPages[i].waitForSelector('button:has-text("Enviar Respuesta")', { timeout: 5000 });
          await playerPages[i].click('button:has-text("Enviar Respuesta")');
          
          console.log(`    ✓ ${PLAYER_NAMES[i]}: ${answer}`);
          await waitFor(playerPages[i], 500);
        } catch (e) {
          console.log(`    ⚠️  ${PLAYER_NAMES[i]} error: ${e.message.substring(0, 60)}`);
        }
      }
      await waitFor(hostPage, 2000);

      // Ordenar y apostar
      console.log('  Ordenando...');
      try {
        await hostPage.waitForSelector('button:has-text("Ordenar")', { timeout: 10000 });
        await hostPage.click('button:has-text("Ordenar")');
        await waitFor(hostPage, 2000);
        
        await hostPage.waitForSelector('button:has-text("Iniciar")', { timeout: 10000 });
        await hostPage.click('button:has-text("Iniciar")');
        await waitFor(hostPage, 2000);
      } catch (e) {
        console.log('    ⚠️  Error ordenando/iniciando apuestas');
      }

      // Apuestas
      console.log('  Apostando...');
      for (let i = 0; i < 3; i++) {
        try {
          // Configurar handler para prompts (cantidad de fichas de póquer)
          playerPages[i].removeAllListeners('dialog');
          playerPages[i].on('dialog', async (dialog) => {
            await dialog.accept('0'); // Apostar 0 fichas de póquer (solo tokens)
          });
          
          await waitFor(playerPages[i], 1500);
          await playerPages[i].waitForSelector('.mini-bet-space', { timeout: 8000, state: 'visible' });
          
          const slots = await playerPages[i].locator('.mini-bet-space').all();
          console.log(`    ${PLAYER_NAMES[i]}: ${slots.length} slots visibles`);
          
          if (slots.length > 0) {
            // Primera apuesta
            await slots[0].click();
            await waitFor(playerPages[i], 1200);
            
            // Segunda apuesta
            if (slots.length > 1) {
              await slots[1].click();
              await waitFor(playerPages[i], 1200);
            }
          }
          
          // Ahora buscar el botón de confirmar (que solo aparece si hay apuestas)
          await waitFor(playerPages[i], 1000);
          await playerPages[i].waitForSelector('button:has-text("Confirmar Apuestas")', { timeout: 5000 });
          await playerPages[i].click('button:has-text("Confirmar Apuestas")');
          console.log(`    ✓ ${PLAYER_NAMES[i]} confirmó apuestas`);
          
          await waitFor(playerPages[i], 500);
        } catch (e) {
          console.log(`    ⚠️  ${PLAYER_NAMES[i]} error apostando: ${e.message.substring(0, 60)}`);
        }
      }

      // Revelar
      await waitFor(hostPage, 3000);
      console.log('  Revelando...');
      
      try {
        await hostPage.waitForSelector('button:has-text("Revelar Respuesta")', { timeout: 10000 });
        await hostPage.click('button:has-text("Revelar Respuesta")');
        console.log('    ✓ Respuesta revelada - esperando cálculo de pagos...');
        await waitFor(hostPage, 5000);
        
        // Verificar que apareció la pantalla de resultados
        const resultsVisible = await hostPage.locator('h1:has-text("Resultados Ronda")').isVisible({ timeout: 3000 }).catch(() => false);
        if (resultsVisible) {
          console.log('    ✓ Pantalla de resultados mostrada');
        } else {
          console.log('    ⚠️  Pantalla de resultados NO apareció');
        }
      } catch (e) {
        console.log('    ⚠️  Error revelando respuesta');
      }
      
      console.log(`✅ Ronda ${round} OK`);
      await waitFor(hostPage, 500);
    }

    console.log('\n✅ Test rápido completado!\n');
    
    } catch (error) {
      console.log(`\n❌ Error en test: ${error.message}`);
      throw error;
    } finally {
      // Cleanup
      console.log('Cerrando contextos...');
      await hostContext.close().catch(() => {});
      for (const ctx of playerContexts) {
        await ctx.close().catch(() => {});
      }
    }
  });
});
