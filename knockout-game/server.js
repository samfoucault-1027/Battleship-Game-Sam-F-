const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files
app.use(express.static('public'));

// Game state
const games = new Map(); // gameId -> game object
const players = new Map(); // ws -> player object

class Game {
    constructor(gameId) {
        this.gameId = gameId;
        this.players = [];
        this.currentPlayerIndex = 0;
        this.round = 1;
        this.status = 'waiting'; // waiting, playing, finished
        this.spots = [
            { name: 'Corner 3', distance: 3, active: true },
            { name: 'Wing 3', distance: 3, active: true },
            { name: 'Top of Key', distance: 2, active: true },
            { name: 'Free Throw', distance: 1, active: true },
            { name: 'Layup', distance: 0, active: true }
        ];
        this.currentSpotIndex = 0;
        this.shotsThisSpot = [];
    }

    addPlayer(playerId, playerName, ws) {
        if (this.players.length >= 4) return false;
        
        const player = {
            id: playerId,
            name: playerName,
            ws: ws,
            score: 0,
            lives: 3,
            eliminated: false,
            currentShot: null
        };
        
        this.players.push(player);
        return true;
    }

    removePlayer(playerId) {
        this.players = this.players.filter(p => p.id !== playerId);
        if (this.players.length < 2 && this.status === 'playing') {
            this.status = 'finished';
        }
    }

    startGame() {
        if (this.players.length < 2) return false;
        this.status = 'playing';
        this.currentPlayerIndex = 0;
        return true;
    }

    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    recordShot(made) {
        const currentPlayer = this.getCurrentPlayer();
        this.shotsThisSpot.push({ playerId: currentPlayer.id, made });
        
        // Check if all active players have shot at this spot
        const activePlayers = this.players.filter(p => !p.eliminated);
        if (this.shotsThisSpot.length === activePlayers.length) {
            return this.evaluateRound();
        }
        
        // Move to next player
        this.nextPlayer();
        return { type: 'next_turn', currentPlayer: this.getCurrentPlayer() };
    }

    evaluateRound() {
        const activePlayers = this.players.filter(p => !p.eliminated);
        const shots = this.shotsThisSpot;
        
        // Find who missed
        const missedPlayers = shots.filter(s => !s.made).map(s => s.playerId);
        
        // If anyone missed, they lose a life
        missedPlayers.forEach(playerId => {
            const player = this.players.find(p => p.id === playerId);
            if (player) {
                player.lives--;
                if (player.lives <= 0) {
                    player.eliminated = true;
                }
            }
        });
        
        // Move to next spot
        this.shotsThisSpot = [];
        this.currentSpotIndex++;
        
        // Check if we've completed all spots
        if (this.currentSpotIndex >= this.spots.length) {
            this.currentSpotIndex = 0;
            this.round++;
        }
        
        // Check for winner
        const remainingPlayers = this.players.filter(p => !p.eliminated);
        if (remainingPlayers.length === 1) {
            this.status = 'finished';
            return { type: 'game_over', winner: remainingPlayers[0] };
        }
        
        if (remainingPlayers.length === 0) {
            this.status = 'finished';
            return { type: 'game_over', winner: null };
        }
        
        // Continue to next spot
        this.currentPlayerIndex = 0;
        return { type: 'next_spot', spot: this.spots[this.currentSpotIndex] };
    }

    nextPlayer() {
        do {
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        } while (this.getCurrentPlayer().eliminated);
    }

    getState() {
        return {
            gameId: this.gameId,
            players: this.players.map(p => ({
                id: p.id,
                name: p.name,
                score: p.score,
                lives: p.lives,
                eliminated: p.eliminated
            })),
            currentPlayerIndex: this.currentPlayerIndex,
            currentPlayer: this.getCurrentPlayer() ? this.getCurrentPlayer().id : null,
            round: this.round,
            status: this.status,
            currentSpot: this.spots[this.currentSpotIndex],
            currentSpotIndex: this.currentSpotIndex
        };
    }
}

// WebSocket connection handling
wss.on('connection', (ws) => {
    console.log('New client connected');
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            handleMessage(ws, data);
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });
    
    ws.on('close', () => {
        const player = players.get(ws);
        if (player) {
            const game = games.get(player.gameId);
            if (game) {
                game.removePlayer(player.id);
                broadcastToGame(game.gameId, {
                    type: 'player_left',
                    playerId: player.id,
                    gameState: game.getState()
                });
            }
            players.delete(ws);
        }
    });
});

function handleMessage(ws, data) {
    switch (data.type) {
        case 'create_game':
            createGame(ws, data);
            break;
        case 'join_game':
            joinGame(ws, data);
            break;
        case 'start_game':
            startGame(ws, data);
            break;
        case 'shoot':
            handleShot(ws, data);
            break;
        case 'get_state':
            sendGameState(ws, data);
            break;
    }
}

function createGame(ws, data) {
    const gameId = generateGameId();
    const game = new Game(gameId);
    games.set(gameId, game);
    
    const playerId = generatePlayerId();
    game.addPlayer(playerId, data.playerName, ws);
    
    players.set(ws, { id: playerId, gameId: gameId });
    
    ws.send(JSON.stringify({
        type: 'game_created',
        gameId: gameId,
        playerId: playerId,
        gameState: game.getState()
    }));
}

function joinGame(ws, data) {
    const game = games.get(data.gameId);
    
    if (!game) {
        ws.send(JSON.stringify({ type: 'error', message: 'Game not found' }));
        return;
    }
    
    if (game.status !== 'waiting') {
        ws.send(JSON.stringify({ type: 'error', message: 'Game already started' }));
        return;
    }
    
    const playerId = generatePlayerId();
    const success = game.addPlayer(playerId, data.playerName, ws);
    
    if (!success) {
        ws.send(JSON.stringify({ type: 'error', message: 'Game is full' }));
        return;
    }
    
    players.set(ws, { id: playerId, gameId: data.gameId });
    
    broadcastToGame(data.gameId, {
        type: 'player_joined',
        playerId: playerId,
        playerName: data.playerName,
        gameState: game.getState()
    });
}

function startGame(ws, data) {
    const player = players.get(ws);
    if (!player) return;
    
    const game = games.get(player.gameId);
    if (!game) return;
    
    if (game.startGame()) {
        broadcastToGame(player.gameId, {
            type: 'game_started',
            gameState: game.getState()
        });
    }
}

function handleShot(ws, data) {
    const player = players.get(ws);
    if (!player) return;
    
    const game = games.get(player.gameId);
    if (!game) return;
    
    const result = game.recordShot(data.made);
    
    broadcastToGame(player.gameId, {
        type: 'shot_result',
        playerId: player.id,
        made: data.made,
        result: result,
        gameState: game.getState()
    });
}

function sendGameState(ws, data) {
    const game = games.get(data.gameId);
    if (game) {
        ws.send(JSON.stringify({
            type: 'game_state',
            gameState: game.getState()
        }));
    }
}

function broadcastToGame(gameId, message) {
    const game = games.get(gameId);
    if (!game) return;
    
    game.players.forEach(player => {
        if (player.ws.readyState === WebSocket.OPEN) {
            player.ws.send(JSON.stringify(message));
        }
    });
}

function generateGameId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generatePlayerId() {
    return Math.random().toString(36).substring(2, 15);
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🏀 Knockout Game Server running on http://localhost:${PORT}`);
});
