import { test, expect } from '@playwright/test';

test.describe('Test Rápido - 1 Ronda Simple', () => {
  
  test('1 ronda con 3 jugadores - verificación básica', async ({ page, context }) => {
    test.setTimeout(180000);
    
    console.log('\n🎮 TEST BÁSICO: 1 Ronda\n');
    
    // 1. Host crea partida
    console.log('1. Creando partida...');
    await page.goto('/');
    await page.waitForTimeout(1000);
    await page.waitForSelector('button:has-text("Crear Partida")', { timeout: 10000 });
    await page.click('button:has-text("Crear Partida")');
    await page.waitForTimeout(1000);
    await page.waitForSelector('button:has-text("Crear Partida")', { timeout: 10000 });
    await page.click('button:has-text("Crear Partida")');
    await page.waitForTimeout(2000);
    
    const gameCode = await page.locator('[data-testid="game-code"], .game-code').first().innerText();
    console.log(`   Código: ${gameCode}`);
    
    // 2. Jugadores se unen
    console.log('2. Jugadores uniéndose...');
    const players = [];
    for (let i = 0; i < 3; i++) {
      const playerPage = await context.newPage();
      await playerPage.goto('/');
      await playerPage.waitForTimeout(1000);
      await playerPage.waitForSelector('button:has-text("Unirse")', { timeout: 10000 });
      await playerPage.click('button:has-text("Unirse")');
      await playerPage.waitForTimeout(1000);
      await playerPage.fill('#gameCode', gameCode);
      await playerPage.fill('#playerName', `Player${i+1}`);
      await playerPage.click('button:has-text("Unirse")');
      await playerPage.waitForTimeout(2000);
      players.push(playerPage);
      console.log(`   ✓ Player${i+1}`);
    }
    
    // 3. Iniciar juego
    console.log('3. Iniciando juego...');
    await page.waitForTimeout(2000);
    await page.waitForSelector('button:has-text("Iniciar Juego")', { timeout: 10000 });
    await page.click('button:has-text("Iniciar Juego")');
    await page.waitForTimeout(3000);
    console.log('   ✓ Juego iniciado');
    
    // 4. Responder
    console.log('4. Respondiendo...');
    for (let i = 0; i < 3; i++) {
      await players[i].waitForSelector('input[type="number"]', { timeout: 8000 });
      await players[i].fill('input[type="number"]', String(1000 + i * 100));
      await players[i].waitForSelector('button:has-text("Enviar Respuesta")', { timeout: 5000 });
      await players[i].click('button:has-text("Enviar Respuesta")');
      await players[i].waitForTimeout(500);
      console.log(`   ✓ Player${i+1}: ${1000 + i * 100}`);
    }
    
    // 5. Ordenar
    console.log('5. Ordenando...');
    await page.waitForTimeout(2000);
    await page.waitForSelector('button:has-text("Ordenar")', { timeout: 10000 });
    await page.click('button:has-text("Ordenar")');
    await page.waitForTimeout(2000);
    console.log('   ✓ Ordenado');
    
    // 6. Iniciar apuestas
    console.log('6. Iniciando apuestas...');
    await page.waitForSelector('button:has-text("Iniciar")', { timeout: 10000 });
    await page.click('button:has-text("Iniciar")');
    await page.waitForTimeout(2000);
    console.log('   ✓ Apuestas iniciadas');
    
    // 7. Apostar
    console.log('7. Apostando...');
    for (let i = 0; i < 3; i++) {
      players[i].on('dialog', async dialog => await dialog.accept('0'));
      await players[i].waitForSelector('.mini-bet-space', { timeout: 8000 });
      const slots = await players[i].locator('.mini-bet-space').all();
      if (slots.length > 0) await slots[0].click();
      await players[i].waitForTimeout(1200);
      await players[i].waitForSelector('button:has-text("Confirmar Apuestas")', { timeout: 5000 });
      await players[i].click('button:has-text("Confirmar Apuestas")');
      console.log(`   ✓ Player${i+1}`);
    }
    
    // 8. Revelar
    console.log('8. Revelando...');
    await page.waitForTimeout(3000);
    await page.waitForSelector('button:has-text("Revelar Respuesta")', { timeout: 10000 });
    await page.click('button:has-text("Revelar Respuesta")');
    await page.waitForTimeout(5000);
    console.log('   ✓ Revelado');
    
    // 9. Verificar resultados
    console.log('9. Verificando...');
    const resultsVisible = await page.locator('h1:has-text("Resultados Ronda")').isVisible({ timeout: 5000 }).catch(() => false);
    const nextVisible = await page.locator('button:has-text("Siguiente Ronda")').isVisible({ timeout: 3000 }).catch(() => false);
    
    console.log(`   Resultados: ${resultsVisible ? '✓' : '✗'}`);
    console.log(`   Botón siguiente: ${nextVisible ? '✓' : '✗'}`);
    
    expect(resultsVisible).toBe(true);
    expect(nextVisible).toBe(true);
    
    console.log('\n✅ TEST COMPLETADO\n');
    
    for (const p of players) await p.close();
  });
});
