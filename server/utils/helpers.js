const fs = require('fs');
const path = require('path');

// Cargar preguntas
let questionsData = null;

function loadQuestions() {
    if (!questionsData) {
        const filePath = path.join(__dirname, '../../docs/data/preguntas_consolidadas.json');
        const rawData = fs.readFileSync(filePath, 'utf8');
        questionsData = JSON.parse(rawData);
    }
    return questionsData;
}

// Obtener categorías disponibles
function getCategories() {
    const data = loadQuestions();
    return data.categorias
        .filter(cat => cat && cat.id && cat.nombre) // Filtrar categorías inválidas
        .map(cat => ({
            id: cat.id,
            nombre: cat.nombre,
            descripcion: cat.descripcion || '',
            totalPreguntas: cat.preguntas ? cat.preguntas.length : 0
        }));
}

// Obtener pregunta aleatoria excluyendo categorías
function getRandomQuestion(excludedCategories = [], usedQuestionIds = []) {
    const data = loadQuestions();

    // Filtrar categorías no excluidas
    const availableCategories = data.categorias.filter(
        cat => !excludedCategories.includes(cat.id)
    );

    if (availableCategories.length === 0) {
        throw new Error('No hay categorías disponibles');
    }

    // Recopilar todas las preguntas disponibles
    const availableQuestions = [];
    availableCategories.forEach(cat => {
        cat.preguntas.forEach(q => {
            if (!usedQuestionIds.includes(q.id)) {
                availableQuestions.push({
                    ...q,
                    categoria: cat.nombre,
                    categoriaId: cat.id
                });
            }
        });
    });

    if (availableQuestions.length === 0) {
        throw new Error('No hay más preguntas disponibles');
    }

    // Seleccionar pregunta aleatoria
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    return availableQuestions[randomIndex];
}

// Generar código de sala (6 caracteres alfanuméricos)
function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sin I, O, 0, 1 para evitar confusión
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Calcular bloqueadores según número de jugadores
function calculateBlockers(playerCount) {
    const blockers = [];

    if (playerCount === 5) {
        blockers.push({ position: '5to1-red', playerCount: 5 });
        blockers.push({ position: '5to1-black', playerCount: 5 });
    } else if (playerCount === 6) {
        blockers.push({ position: '2to1', playerCount: 6 });
    }
    // 7 jugadores: sin bloqueadores

    return blockers;
}

// Ordenar respuestas y asignar posiciones
function sortAnswersAndAssignPositions(answers, blockers = []) {
    // Ordenar respuestas de menor a mayor
    const sorted = [...answers].sort((a, b) => a.value - b.value);

    // Posiciones disponibles en el tablero
    const positions = [
        '6to1-all-high',
        '5to1-red',
        '4to1-red',
        '3to1-red',
        '2to1-green',
        '3to1-black',
        '4to1-black',
        '5to1-black'
    ];

    // Filtrar posiciones bloqueadas
    const blockedPositions = blockers.map(b => b.position);
    const availablePositions = positions.filter(p => !blockedPositions.includes(p));

    // Asignar posiciones (empezando desde red)
    const assignedAnswers = sorted.map((answer, index) => ({
        ...answer,
        position: availablePositions[index + 1] || availablePositions[availablePositions.length - 1]
    }));

    return assignedAnswers;
}

// Determinar respuesta ganadora
function determineWinningAnswer(answers, correctAnswer) {
    const sorted = [...answers].sort((a, b) => a.value - b.value);

    // Encontrar la respuesta más cercana sin pasarse
    let winningAnswer = null;

    for (let i = sorted.length - 1; i >= 0; i--) {
        if (sorted[i].value <= correctAnswer) {
            winningAnswer = sorted[i];
            break;
        }
    }

    // Si todas las respuestas son muy altas
    if (!winningAnswer) {
        return {
            allTooHigh: true,
            winningPosition: '6to1-all-high',
            winningValue: null,
            winners: []
        };
    }

    // Encontrar todos los jugadores con la respuesta ganadora
    const winners = answers.filter(a => a.value === winningAnswer.value);

    return {
        allTooHigh: false,
        winningPosition: winningAnswer.position,
        winningValue: winningAnswer.value,
        winners: winners.map(w => w.playerId)
    };
}

// Calcular pago de apuesta
function calculatePayout(bet, winningPosition) {
    const odds = {
        '6to1-all-high': 6,
        '5to1-red': 5,
        '5to1-black': 5,
        '4to1-red': 4,
        '4to1-black': 4,
        '3to1-red': 3,
        '3to1-black': 3,
        '2to1-green': 2,
        '1to1-red': 1,
        '1to1-black': 1
    };

    const betOdds = odds[bet.position] || 0;
    const totalBet = bet.amount + (bet.pokerChips || 0);

    return totalBet + (totalBet * betOdds);
}

module.exports = {
    loadQuestions,
    getCategories,
    getRandomQuestion,
    generateRoomCode,
    calculateBlockers,
    sortAnswersAndAssignPositions,
    determineWinningAnswer,
    calculatePayout
};
