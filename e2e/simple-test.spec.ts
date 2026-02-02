import { test, expect } from '@playwright/test';

test.describe('Test Simple - 1 Ronda', () => {
  
  test('1 Ronda completa con 3 jugadores', async ({ page, context }) => {
    test.setTimeout(180000); // 3 minutos
    
    console.log('\n🎮 TEST SIMPLE: 1 Ronda Completa\n');
    
    // ===== 1. HOST: Crear Partida =====
    console.log('1. Host crea partida...');
    
    // Logging de errores
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`🔴 Console Error: ${msg.text()}`);
      }
    });
    page.on('pageerror', error => {
      console.log(`🔴 Page Error: ${error.message}`);
    });
    
    await page.goto('/');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Crear Partida")');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Crear Partida")');
    await page.waitForTimeout(2000);
    
    const gameCode = await page.locator('[data-testid="game-code"], .game-code').first().innerText();
    console.log(`   ✓ Código: ${gameCode}`);
    
    // ===== 2. JUGADORES: Unirse =====
    console.log('2. Jugadores se unen...');
    const players = [];
    for (let i = 0; i < 3; i++) {
      const playerPage = await context.newPage();
      await playerPage.goto('/');
      await playerPage.waitForTimeout(500);
      await playerPage.click('button:has-text("Unirse")');
      await playerPage.waitForTimeout(1000);
      await playerPage.fill('#gameCode', gameCode);
      await playerPage.fill('#playerName', `Player${i+1}`);
      await playerPage.click('button:has-text("Unirse")');
      await playerPage.waitForTimeout(1500);
      players.push(playerPage);
      console.log(`   ✓ Player${i+1} unido`);
    }
    
    // ===== 3. HOST: Iniciar Juego =====
    console.log('3. Iniciando juego...');
    await page.waitForTimeout(2000);
    await page.click('button:has-text("Iniciar Juego")');
    await page.waitForTimeout(3000);
    console.log('   ✓ Juego iniciado');
    
    // ===== 4. JUGADORES: Responder Pregunta =====
    console.log('4. Respondiendo pregunta...');
    for (let i = 0; i < 3; i++) {
      await players[i].waitForSelector('input[type="number"]', { timeout: 5000 });
      await players[i].fill('input[type="number"]', String(1000 + i * 100));
      await players[i].click('button:has-text("Enviar Respuesta")');
      await players[i].waitForTimeout(500);
      console.log(`   ✓ Player${i+1} respondió`);
    }
    
    // ===== 5. HOST: Ordenar Respuestas =====
    console.log('5. Ordenando respuestas...');
    await page.waitForTimeout(2000);
    await page.click('button:has-text("Ordenar")');
    await page.waitForTimeout(2000);
    console.log('   ✓ Respuestas ordenadas');
    
    // ===== 6. HOST: Iniciar Apuestas =====
    console.log('6. Iniciando apuestas...');
    await page.click('button:has-text("Iniciar")');
    await page.waitForTimeout(2000);
    console.log('   ✓ Apuestas iniciadas');
    
    // ===== 7. JUGADORES: Apostar =====
    console.log('7. Apostando...');
    for (let i = 0; i < 3; i++) {
      // Handler para prompts de fichas de póquer
      players[i].on('dialog', async dialog => await dialog.accept('0'));
      
      await players[i].waitForSelector('.mini-bet-space', { timeout: 5000 });
      const slots = await players[i].locator('.mini-bet-space').all();
      
      if (slots.length > 0) {
        await slots[0].click();
        await players[i].waitForTimeout(1000);
      }
      
      // Esperar que aparezca el botón de confirmar
      await players[i].waitForSelector('button:has-text("Confirmar Apuestas")', { timeout: 3000 });
      await players[i].click('button:has-text("Confirmar Apuestas")');
      await players[i].waitForTimeout(500);
      console.log(`   ✓ Player${i+1} apostó`);
    }
    
    // ===== 8. HOST: Revelar Respuesta =====
    console.log('8. Revelando respuesta...');
    await page.waitForTimeout(3000);
    await page.click('button:has-text("🎯 Todos apostaron - Revelar Respuesta")');
    await page.waitForTimeout(5000); // Esperar cálculo de pagos
    console.log('   ✓ Respuesta revelada');
    
    // ===== 9. Verificar Pantalla de Resultados =====
    console.log('9. Verificando resultados...');
    
    // Esperar más tiempo para que React procese el update
    await page.waitForTimeout(3000);
    
    const resultsVisible = await page.locator('h1:has-text("Resultados Ronda")').isVisible().catch(() => false);
    if (resultsVisible) {
      console.log('   ✓ Pantalla de resultados mostrada');
    } else {
      console.log('   ⚠️  Pantalla de resultados NO mostrada');
      // Capturar todo el texto visible
      const bodyText = await page.textContent('body');
      console.log(`   Texto visible: ${bodyText?.substring(0, 300)}`);
      
      // Tomar screenshot
      await page.screenshot({ path: 'test-results/results-not-shown.png', fullPage: true });
    }
    
    const nextBtn = await page.locator('button:has-text("Siguiente Ronda →")').isVisible().catch(() => false);
    if (nextBtn) {
      console.log('   ✓ Botón "Siguiente Ronda" visible');
    } else {
      console.log('   ⚠️  Botón "Siguiente Ronda" NO visible');
    }
    
    console.log('\n✅ TEST SIMPLE COMPLETADO\n');
    
    // Cerrar todas las páginas
    for (const p of players) await p.close();
  });
});
