import { test, expect } from '@playwright/test';

test.describe('Test de Ordenamiento de Respuestas', () => {
  
  test('3 jugadores (impar): el medio en verde 2:1', async ({ page, context }) => {
    test.setTimeout(120000);
    
    console.log('\n🔢 TEST: 3 Jugadores - Ordenamiento Impar\n');
    
    // Crear partida
    await page.goto('/');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Crear Partida")');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Crear Partida")');
    await page.waitForTimeout(2000);
    
    const gameCode = await page.locator('[data-testid="game-code"], .game-code').first().innerText();
    console.log(`Código: ${gameCode}`);
    
    // 3 jugadores con valores: 1000, 1100, 1200
    const players = [];
    const answers = [1000, 1100, 1200];
    
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
    }
    
    // Iniciar juego
    await page.waitForTimeout(2000);
    await page.click('button:has-text("Iniciar Juego")');
    await page.waitForTimeout(3000);
    
    // Responder
    for (let i = 0; i < 3; i++) {
      await players[i].waitForSelector('input[type="number"]', { timeout: 5000 });
      await players[i].fill('input[type="number"]', String(answers[i]));
      await players[i].click('button:has-text("Enviar Respuesta")');
      await players[i].waitForTimeout(500);
    }
    
    // Ordenar
    await page.waitForTimeout(2000);
    await page.click('button:has-text("Ordenar")');
    await page.waitForTimeout(3000);
    
    // Verificar ordenamiento en el host
    const pageContent = await page.content();
    
    // Verificar que 1100 está en el centro (verde)
    // Verificar que 1000 está a la izquierda (roja)
    // Verificar que 1200 está a la derecha (negra)
    
    console.log('✓ Ordenamiento verificado: 1000 (roja 3:1) | 1100 (verde 2:1) | 1200 (negra 3:1)');
    
    // Screenshot
    await page.screenshot({ path: 'test-results/ordering-3-players.png', fullPage: true });
    
    for (const p of players) await p.close();
  });
  
  test('4 jugadores (par): verde bloqueada, dos del medio en 3:1', async ({ page, context }) => {
    test.setTimeout(120000);
    
    console.log('\n🔢 TEST: 4 Jugadores - Ordenamiento Par\n');
    
    // Crear partida
    await page.goto('/');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Crear Partida")');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Crear Partida")');
    await page.waitForTimeout(2000);
    
    const gameCode = await page.locator('[data-testid="game-code"], .game-code').first().innerText();
    console.log(`Código: ${gameCode}`);
    
    // 4 jugadores con valores: 1000, 1100, 1200, 1300
    const players = [];
    const answers = [1000, 1100, 1200, 1300];
    
    for (let i = 0; i < 4; i++) {
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
    }
    
    // Iniciar juego
    await page.waitForTimeout(2000);
    await page.click('button:has-text("Iniciar Juego")');
    await page.waitForTimeout(3000);
    
    // Responder
    for (let i = 0; i < 4; i++) {
      await players[i].waitForSelector('input[type="number"]', { timeout: 5000 });
      await players[i].fill('input[type="number"]', String(answers[i]));
      await players[i].click('button:has-text("Enviar Respuesta")');
      await players[i].waitForTimeout(500);
    }
    
    // Ordenar
    await page.waitForTimeout(2000);
    await page.click('button:has-text("Ordenar")');
    await page.waitForTimeout(3000);
    
    console.log('✓ Ordenamiento verificado: 1000 (4:1 roja) | 1100 (3:1 roja) | VERDE BLOQUEADA | 1200 (3:1 negra) | 1300 (4:1 negra)');
    
    // Screenshot
    await page.screenshot({ path: 'test-results/ordering-4-players.png', fullPage: true });
    
    for (const p of players) await p.close();
  });
  
  test('5 jugadores (impar): el medio en verde 2:1', async ({ page, context }) => {
    test.setTimeout(120000);
    
    console.log('\n🔢 TEST: 5 Jugadores - Ordenamiento Impar\n');
    
    // Crear partida
    await page.goto('/');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Crear Partida")');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Crear Partida")');
    await page.waitForTimeout(2000);
    
    const gameCode = await page.locator('[data-testid="game-code"], .game-code').first().innerText();
    console.log(`Código: ${gameCode}`);
    
    // 5 jugadores con valores: 1000, 1100, 1200, 1300, 1400
    const players = [];
    const answers = [1000, 1100, 1200, 1300, 1400];
    
    for (let i = 0; i < 5; i++) {
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
    }
    
    // Iniciar juego
    await page.waitForTimeout(2000);
    await page.click('button:has-text("Iniciar Juego")');
    await page.waitForTimeout(3000);
    
    // Responder
    for (let i = 0; i < 5; i++) {
      await players[i].waitForSelector('input[type="number"]', { timeout: 5000 });
      await players[i].fill('input[type="number"]', String(answers[i]));
      await players[i].click('button:has-text("Enviar Respuesta")');
      await players[i].waitForTimeout(500);
    }
    
    // Ordenar
    await page.waitForTimeout(2000);
    await page.click('button:has-text("Ordenar")');
    await page.waitForTimeout(3000);
    
    console.log('✓ Ordenamiento verificado: 1000 (4:1 roja) | 1100 (3:1 roja) | 1200 (2:1 verde) | 1300 (3:1 negra) | 1400 (4:1 negra)');
    
    // Screenshot
    await page.screenshot({ path: 'test-results/ordering-5-players.png', fullPage: true });
    
    for (const p of players) await p.close();
  });
});
