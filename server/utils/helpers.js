import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Generar código de juego único de 6 dígitos
export const generateGameCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Validar si un número es positivo
export const isPositiveNumber = (value) => {
    return !isNaN(value) && Number(value) >= 0;
};

// Formatear dinero
export const formatMoney = (amount) => {
    return `$${amount}`;
};

// Obtener elemento aleatorio de un array
export const getRandomElement = (array) => {
    return array[Math.floor(Math.random() * array.length)];
};

// Mezclar array (Fisher-Yates shuffle)
export const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

// Seleccionar N elementos aleatorios sin repetir
export const selectRandomElements = (array, count) => {
    const shuffled = shuffleArray(array);
    return shuffled.slice(0, count);
};

// Obtener categorías disponibles
export function getCategories() {
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
export function getRandomQuestion(excludedCategories = [], usedQuestionIds = []) {
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

// Generar código de sala (6 caracteres alfanuméricos) - DEPRECADO, usar generateGameCode
export function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sin I, O, 0, 1 para evitar confusión
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Calcular bloqueadores según número de jugadores
export function calculateBlockers(playerCount) {
    const blockers = [];

    if (playerCount === 5) {
        blockers.push({ position: '5to1-red', playerCount: 5 });
        blockers.push({ position: '5to1-black', playerCount: 5 });
    } else if (playerCount === 6) {
        blockers.push({ position: '2to1-green', playerCount: 6 });
    }
    // 7 jugadores: sin bloqueadores

    return blockers;
}

// Ordenar respuestas y asignar posiciones
export function sortAnswersAndAssignPositions(answers, blockers = []) {
    // Ordenar respuestas de menor a mayor
    const sorted = [...answers].sort((a, b) => a.value - b.value);

    // Agrupar respuestas duplicadas
    const groupedAnswers = [];
    for (const answer of sorted) {
        const existing = groupedAnswers.find(g => g.value === answer.value);
        if (existing) {
            existing.duplicates.push(answer);
        } else {
            groupedAnswers.push({ value: answer.value, duplicates: [answer] });
        }
    }

    const uniqueCount = groupedAnswers.length;
    console.log(`Total de respuestas únicas: ${uniqueCount}`);
    console.log('Respuestas agrupadas:', groupedAnswers);

    // Posiciones del tablero (índices 0-6)
    // [5:1-red, 4:1-red, 3:1-red, 2:1-green, 3:1-black, 4:1-black, 5:1-black]
    const allPositions = [
        '5to1-red',     // 0 - extremo izquierdo (rojo)
        '4to1-red',     // 1
        '3to1-red',     // 2
        '2to1-green',   // 3 - CENTRO (verde)
        '3to1-black',   // 4
        '4to1-black',   // 5
        '5to1-black'    // 6 - extremo derecho (negro)
    ];

    // Filtrar posiciones bloqueadas
    const blockedPositions = blockers.map(b => b.position);
    const availableIndices = allPositions
        .map((pos, idx) => ({ pos, idx }))
        .filter(item => !blockedPositions.includes(item.pos))
        .map(item => item.idx);

    console.log('Posiciones bloqueadas:', blockedPositions);
    console.log('Índices disponibles:', availableIndices);

    // Asignar posiciones: encontrar el medio y expandir hacia los lados
    const assignedAnswers = [];

    // Determinar índices de posiciones según número de respuestas únicas
    let targetIndices = [];

    if (uniqueCount % 2 === 1) {
        // NÚMERO IMPAR: la del medio va en el centro (verde, índice 3)
        const middleIndex = Math.floor(uniqueCount / 2);
        const centerPos = 3; // índice del verde

        // Expandir desde el centro
        targetIndices = [centerPos]; // primero el centro

        // Agregar posiciones alternando hacia los lados
        for (let offset = 1; offset <= middleIndex; offset++) {
            targetIndices.unshift(centerPos - offset); // izquierda (rojos)
            targetIndices.push(centerPos + offset);     // derecha (negros)
        }
    } else {
        // NÚMERO PAR: las dos del medio en los 3:1 (índices 2 y 4), el verde (3) queda vacío
        const leftMiddleIndex = (uniqueCount / 2) - 1;
        const centerLeft = 2;  // 3:1-red
        const centerRight = 4; // 3:1-black

        // Expandir desde los dos centros
        targetIndices = [centerLeft, centerRight]; // primero los dos del medio

        // Agregar posiciones hacia los extremos
        for (let offset = 1; offset <= leftMiddleIndex; offset++) {
            targetIndices.unshift(centerLeft - offset);  // izquierda (más rojos)
            targetIndices.push(centerRight + offset);    // derecha (más negros)
        }
    }

    console.log('Índices objetivo (antes de ajustar por bloqueados):', targetIndices);

    // Ajustar índices para solo usar posiciones disponibles (no bloqueadas)
    const finalIndices = [];
    for (let targetIdx of targetIndices) {
        // Encontrar la posición disponible más cercana al objetivo
        const closest = availableIndices.reduce((prev, curr) => {
            return Math.abs(curr - targetIdx) < Math.abs(prev - targetIdx) ? curr : prev;
        }, availableIndices[0]);
        finalIndices.push(closest);
    }

    console.log('Índices finales ajustados:', finalIndices);

    // Asignar respuestas a posiciones, manejando duplicados
    let currentPositionOffset = 0;
    groupedAnswers.forEach((group, groupIndex) => {
        const duplicateCount = group.duplicates.length;

        for (let i = 0; i < duplicateCount; i++) {
            const answer = group.duplicates[i];

            // Obtener el índice base para este grupo
            let positionIndex = finalIndices[groupIndex];

            // Para duplicados, intentar colocarlos en posiciones adyacentes
            if (i > 0 && positionIndex + i < allPositions.length) {
                // Intentar la posición siguiente si está disponible
                const nextIndex = positionIndex + i;
                if (availableIndices.includes(nextIndex)) {
                    positionIndex = nextIndex;
                }
            }

            const position = allPositions[positionIndex];

            assignedAnswers.push({
                ...answer,
                position,
                isDuplicate: duplicateCount > 1,
                duplicateGroup: group.value
            });
        }
    });

    console.log('Respuestas con posiciones asignadas:', assignedAnswers);

    return assignedAnswers;
}

// Determinar respuesta ganadora
export function determineWinningAnswer(answers, correctAnswer) {
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
export function calculatePayout(bet, winningPosition) {
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
