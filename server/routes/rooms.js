const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const { generateRoomCode } = require('../utils/helpers');

// Crear nueva sala
router.post('/create', async (req, res) => {
    try {
        const { hostId, hostSocketId } = req.body;

        if (!hostId || !hostSocketId) {
            return res.status(400).json({ error: 'hostId y hostSocketId son requeridos' });
        }

        // Generar código único
        let code;
        let attempts = 0;
        while (attempts < 10) {
            code = generateRoomCode();
            const existing = await Room.findOne({ code });
            if (!existing) break;
            attempts++;
        }

        if (attempts === 10) {
            return res.status(500).json({ error: 'No se pudo generar un código único' });
        }

        const room = new Room({
            code,
            hostId,
            hostSocketId,
            players: [],
            status: 'waiting'
        });

        await room.save();

        res.status(201).json({
            success: true,
            code: room.code,
            roomId: room._id
        });
    } catch (error) {
        console.error('Error creando sala:', error);
        res.status(500).json({ error: 'Error al crear la sala' });
    }
});

// Obtener información de sala
router.get('/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const room = await Room.findOne({ code: code.toUpperCase() });

        if (!room) {
            return res.status(404).json({ error: 'Sala no encontrada' });
        }

        res.json({
            code: room.code,
            playerCount: room.players.length,
            status: room.status,
            currentRound: room.currentRound,
            totalRounds: room.totalRounds
        });
    } catch (error) {
        console.error('Error obteniendo sala:', error);
        res.status(500).json({ error: 'Error al obtener información de la sala' });
    }
});

// Validar código de sala
router.post('/validate', async (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ error: 'Código de sala requerido' });
        }

        const room = await Room.findOne({ code: code.toUpperCase() });

        if (!room) {
            return res.status(404).json({
                valid: false,
                error: 'Sala no encontrada'
            });
        }

        if (room.status === 'finished') {
            return res.status(400).json({
                valid: false,
                error: 'El juego ya terminó'
            });
        }

        if (room.status === 'playing' && room.players.length >= 7) {
            return res.status(400).json({
                valid: false,
                error: 'La sala está llena'
            });
        }

        res.json({
            valid: true,
            code: room.code,
            status: room.status,
            playerCount: room.players.length
        });
    } catch (error) {
        console.error('Error validando sala:', error);
        res.status(500).json({ error: 'Error al validar la sala' });
    }
});

module.exports = router;
