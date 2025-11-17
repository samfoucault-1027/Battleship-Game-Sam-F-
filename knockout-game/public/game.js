// ===================================
//   KNOCKOUT - CLIENT GAME LOGIC
// ===================================

let ws = null;
let gameState = {
    gameId: null,
    playerId: null,
    playerName: null,
    currentScreen: 'menu',
    isLocalMode: false
};

let localGame = {
    players: [],
    currentPlayerIndex: 0,
    round: 1,
    currentSpotIndex: 0,
    spots: [
        { name: 'Layup', distance: 0 },
        { name: 'Free Throw', distance: 1 },
        { name: 'Top of Key', distance: 2 },
        { name: 'Wing 3', distance: 3 },
        { name: 'Corner 3', distance: 3 }
    ],
    shotsThisSpot: []
};

let powerLevel = 0;
let powerDirection = 1;
let powerInterval = null;

// DOM Elements
const screens = {
    menu: document.getElementById('menu-screen'),
    localSetup: document.getElementById('local-setup-screen'),
    lobby: document.getElementById('lobby-screen'),
    game: document.getElementById('game-screen'),
    gameover: document.getElementById('gameover-screen')
};

const elements = {
    playerNameInput: document.getElementById('player-name'),
    createGameBtn: document.getElementById('create-game-btn'),
    joinGameBtn: document.getElementById('join-game-btn'),
    joinGameForm: document.getElementById('join-game-form'),
    gameCodeInput: document.getElementById('game-code'),
    joinSubmitBtn: document.getElementById('join-submit-btn'),
    cancelJoinBtn: document.getElementById('cancel-join-btn'),
    
    lobbyGameCode: document.getElementById('lobby-game-code'),
    copyCodeBtn: document.getElementById('copy-code-btn'),
    lobbyPlayers: document.getElementById('lobby-players'),
    playerCount: document.getElementById('player-count'),
    startGameBtn: document.getElementById('start-game-btn'),
    leaveLobbyBtn: document.getElementById('leave-lobby-btn'),
    
    roundNumber: document.getElementById('round-number'),
    currentSpot: document.getElementById('current-spot'),
    gamePlayers: document.getElementById('game-players'),
    basketball: document.getElementById('basketball'),
    currentTurnText: document.getElementById('current-turn-text'),
    shootBtn: document.getElementById('shoot-btn'),
    powerFill: document.getElementById('power-fill'),
    powerMarker: document.getElementById('power-marker'),
    resultDisplay: document.getElementById('result-display'),
    resultIcon: document.getElementById('result-icon'),
    resultText: document.getElementById('result-text'),
    
    winnerIcon: document.getElementById('winner-icon'),
    winnerText: document.getElementById('winner-text'),
    finalStandings: document.getElementById('final-standings'),
    newGameBtn: document.getElementById('new-game-btn'),
    
    toastContainer: document.getElementById('toast-container')
};

// Initialize
function init() {
    setupEventListeners();
    connectWebSocket();
}

function setupEventListeners() {
    // Local multiplayer
    document.getElementById('local-game-btn').addEventListener('click', showLocalSetup);
    document.getElementById('add-player-btn').addEventListener('click', addLocalPlayer);
    document.getElementById('start-local-game-btn').addEventListener('click', startLocalGame);
    document.getElementById('back-to-menu-btn').addEventListener('click', () => showScreen('menu'));
    
    // Online multiplayer
    elements.createGameBtn.addEventListener('click', createGame);
    elements.joinGameBtn.addEventListener('click', showJoinForm);
    elements.joinSubmitBtn.addEventListener('click', joinGame);
    elements.cancelJoinBtn.addEventListener('click', hideJoinForm);
    elements.copyCodeBtn.addEventListener('click', copyGameCode);
    elements.startGameBtn.addEventListener('click', startGame);
    elements.leaveLobbyBtn.addEventListener('click', leaveLobby);
    elements.shootBtn.addEventListener('click', shoot);
    elements.newGameBtn.addEventListener('click', returnToMenu);
    
    elements.gameCodeInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.toUpperCase();
    });
}

// WebSocket Connection
function connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
        console.log('Connected to server');
        showToast('Connected to server', 'success');
    };
    
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleServerMessage(data);
    };
    
    ws.onclose = () => {
        console.log('Disconnected from server');
        showToast('Disconnected from server', 'error');
        setTimeout(connectWebSocket, 3000);
    };
    
    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
}

function sendMessage(data) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
    }
}

// Server Message Handling
function handleServerMessage(data) {
    console.log('Received:', data);
    
    switch (data.type) {
        case 'game_created':
            handleGameCreated(data);
            break;
        case 'player_joined':
            handlePlayerJoined(data);
            break;
        case 'player_left':
            handlePlayerLeft(data);
            break;
        case 'game_started':
            handleGameStarted(data);
            break;
        case 'shot_result':
            handleShotResult(data);
            break;
        case 'game_over':
            handleGameOver(data);
            break;
        case 'error':
            showToast(data.message, 'error');
            break;
    }
}

// Game Actions
function createGame() {
    const playerName = elements.playerNameInput.value.trim() || 'Player';
    gameState.playerName = playerName;
    
    sendMessage({
        type: 'create_game',
        playerName: playerName
    });
}

function showJoinForm() {
    elements.joinGameForm.classList.remove('hidden');
    elements.createGameBtn.style.display = 'none';
    elements.joinGameBtn.style.display = 'none';
}

function hideJoinForm() {
    elements.joinGameForm.classList.add('hidden');
    elements.createGameBtn.style.display = 'inline-flex';
    elements.joinGameBtn.style.display = 'inline-flex';
}

function joinGame() {
    const gameCode = elements.gameCodeInput.value.trim().toUpperCase();
    const playerName = elements.playerNameInput.value.trim() || 'Player';
    
    if (gameCode.length !== 6) {
        showToast('Please enter a valid 6-character game code', 'error');
        return;
    }
    
    gameState.playerName = playerName;
    
    sendMessage({
        type: 'join_game',
        gameId: gameCode,
        playerName: playerName
    });
}

function startGame() {
    sendMessage({
        type: 'start_game'
    });
}

function leaveLobby() {
    ws.close();
    setTimeout(() => {
        window.location.reload();
    }, 500);
}

function returnToMenu() {
    ws.close();
    setTimeout(() => {
        window.location.reload();
    }, 500);
}

function shoot() {
    if (!elements.shootBtn.disabled) {
        stopPowerMeter();
        
        // Calculate if shot is made based on power level
        // Sweet spot is between 45-55%
        const accuracy = 100 - Math.abs(50 - powerLevel);
        const made = Math.random() * 100 < accuracy;
        
        animateShot(made);
        
        elements.shootBtn.disabled = true;
        
        setTimeout(() => {
            if (gameState.isLocalMode) {
                handleLocalShot(made);
            } else {
                sendMessage({
                    type: 'shoot',
                    made: made
                });
            }
        }, 1500);
    }
}

// Game State Handlers
function handleGameCreated(data) {
    gameState.gameId = data.gameId;
    gameState.playerId = data.playerId;
    
    showScreen('lobby');
    updateLobby(data.gameState);
    
    showToast(`Game created! Code: ${data.gameId}`, 'success');
}

function handlePlayerJoined(data) {
    updateLobby(data.gameState);
    showToast(`${data.playerName} joined the game`, 'info');
}

function handlePlayerLeft(data) {
    updateLobby(data.gameState);
    showToast('A player left the game', 'info');
}

function handleGameStarted(data) {
    showScreen('game');
    updateGameState(data.gameState);
    showToast('Game started!', 'success');
}

function handleShotResult(data) {
    updateGameState(data.gameState);
    
    const player = data.gameState.players.find(p => p.id === data.playerId);
    const playerName = player ? player.name : 'Player';
    
    if (data.made) {
        showToast(`${playerName} made the shot! ✅`, 'success');
    } else {
        showToast(`${playerName} missed! ❌`, 'error');
    }
    
    if (data.result.type === 'game_over') {
        setTimeout(() => {
            handleGameOver(data.result);
        }, 2000);
    }
}

function handleGameOver(data) {
    showScreen('gameover');
    
    if (data.winner) {
        elements.winnerIcon.textContent = '🏆';
        elements.winnerText.textContent = `${data.winner.name} Wins!`;
    } else {
        elements.winnerIcon.textContent = '🤝';
        elements.winnerText.textContent = 'Draw!';
    }
    
    // Show final standings
    const gameStateData = data.gameState || data;
    if (gameStateData.players) {
        const sortedPlayers = [...gameStateData.players].sort((a, b) => b.lives - a.lives);
        
        elements.finalStandings.innerHTML = sortedPlayers.map((player, index) => `
            <div class="standing-item">
                <span>${index + 1}. ${player.name}</span>
                <span>${player.lives} ❤️</span>
            </div>
        `).join('');
    }
}

// UI Updates
function showScreen(screenName) {
    Object.values(screens).forEach(screen => screen.classList.remove('active'));
    screens[screenName].classList.add('active');
    gameState.currentScreen = screenName;
}

function updateLobby(state) {
    elements.lobbyGameCode.textContent = state.gameId;
    elements.playerCount.textContent = state.players.length;
    
    elements.lobbyPlayers.innerHTML = state.players.map(player => `
        <div class="player-card">
            <div class="player-icon">👤</div>
            <div class="player-name">${player.name}</div>
        </div>
    `).join('');
    
    elements.startGameBtn.disabled = state.players.length < 2;
}

function updateGameState(state) {
    elements.roundNumber.textContent = state.round;
    elements.currentSpot.textContent = state.currentSpot.name;
    
    // Update players list
    elements.gamePlayers.innerHTML = state.players.map(player => {
        const isCurrentPlayer = player.id === state.currentPlayer;
        const hearts = '❤️'.repeat(player.lives);
        
        return `
            <div class="game-player-card ${isCurrentPlayer ? 'active' : ''} ${player.eliminated ? 'eliminated' : ''}">
                <div class="player-name">${player.name}</div>
                <div class="player-lives">${hearts}</div>
            </div>
        `;
    }).join('');
    
    // Update turn indicator
    const currentPlayer = state.players.find(p => p.id === state.currentPlayer);
    if (currentPlayer) {
        elements.currentTurnText.textContent = currentPlayer.id === gameState.playerId 
            ? "Your Turn!" 
            : `${currentPlayer.name}'s Turn`;
        
        // Enable shoot button if it's player's turn
        if (currentPlayer.id === gameState.playerId && !currentPlayer.eliminated) {
            elements.shootBtn.disabled = false;
            startPowerMeter();
        } else {
            elements.shootBtn.disabled = true;
            stopPowerMeter();
        }
    }
}

function copyGameCode() {
    const code = elements.lobbyGameCode.textContent;
    navigator.clipboard.writeText(code).then(() => {
        showToast('Game code copied!', 'success');
    });
}

// Power Meter
function startPowerMeter() {
    powerLevel = 0;
    powerDirection = 1;
    
    powerInterval = setInterval(() => {
        powerLevel += powerDirection * 2;
        
        if (powerLevel >= 100) {
            powerLevel = 100;
            powerDirection = -1;
        } else if (powerLevel <= 0) {
            powerLevel = 0;
            powerDirection = 1;
        }
        
        elements.powerFill.style.width = powerLevel + '%';
    }, 20);
}

function stopPowerMeter() {
    if (powerInterval) {
        clearInterval(powerInterval);
        powerInterval = null;
    }
}

// Shot Animation
function animateShot(made) {
    elements.basketball.classList.remove('make', 'miss');
    
    setTimeout(() => {
        elements.basketball.classList.add(made ? 'make' : 'miss');
        showResult(made);
    }, 100);
    
    setTimeout(() => {
        elements.basketball.classList.remove('make', 'miss');
        elements.basketball.style.bottom = '20%';
        elements.basketball.style.left = '50%';
        elements.basketball.style.opacity = '1';
    }, 2000);
}

function showResult(made) {
    elements.resultIcon.textContent = made ? '✅' : '❌';
    elements.resultText.textContent = made ? 'MADE IT!' : 'MISSED!';
    elements.resultDisplay.classList.remove('hidden');
    
    setTimeout(() => {
        elements.resultDisplay.classList.add('hidden');
    }, 1500);
}

// Toast Notifications
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    elements.toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ===================================
//   LOCAL MULTIPLAYER MODE
// ===================================

function showLocalSetup() {
    showScreen('localSetup');
}

function addLocalPlayer() {
    const playerRows = document.querySelectorAll('.player-input-row');
    for (let row of playerRows) {
        if (row.classList.contains('hidden')) {
            row.classList.remove('hidden');
            break;
        }
    }
    
    const visibleRows = document.querySelectorAll('.player-input-row:not(.hidden)');
    if (visibleRows.length >= 4) {
        document.getElementById('add-player-btn').disabled = true;
    }
}

function startLocalGame() {
    const playerInputs = document.querySelectorAll('.player-input-row:not(.hidden) .local-player-input');
    localGame.players = [];
    
    playerInputs.forEach((input, index) => {
        const name = input.value.trim() || `Player ${index + 1}`;
        localGame.players.push({
            id: `local-${index}`,
            name: name,
            lives: 3,
            eliminated: false
        });
    });
    
    if (localGame.players.length < 2) {
        showToast('Need at least 2 players!', 'error');
        return;
    }
    
    gameState.isLocalMode = true;
    localGame.currentPlayerIndex = 0;
    localGame.round = 1;
    localGame.currentSpotIndex = 0;
    localGame.shotsThisSpot = [];
    
    showScreen('game');
    updateLocalGameState();
    showToast('Local game started!', 'success');
}

function updateLocalGameState() {
    elements.roundNumber.textContent = localGame.round;
    elements.currentSpot.textContent = localGame.spots[localGame.currentSpotIndex].name;
    
    // Update players list
    elements.gamePlayers.innerHTML = localGame.players.map((player, index) => {
        const isCurrentPlayer = index === localGame.currentPlayerIndex;
        const hearts = '❤️'.repeat(player.lives);
        
        return `
            <div class="game-player-card ${isCurrentPlayer ? 'active' : ''} ${player.eliminated ? 'eliminated' : ''}">
                <div class="player-name">${player.name}</div>
                <div class="player-lives">${hearts}</div>
            </div>
        `;
    }).join('');
    
    // Update turn indicator
    const currentPlayer = localGame.players[localGame.currentPlayerIndex];
    elements.currentTurnText.textContent = `${currentPlayer.name}'s Turn!`;
    
    // Enable shoot button
    if (!currentPlayer.eliminated) {
        elements.shootBtn.disabled = false;
        startPowerMeter();
    }
}

function handleLocalShot(made) {
    const currentPlayer = localGame.players[localGame.currentPlayerIndex];
    localGame.shotsThisSpot.push({ playerId: currentPlayer.id, made });
    
    if (made) {
        showToast(`${currentPlayer.name} made it! ✅`, 'success');
    } else {
        showToast(`${currentPlayer.name} missed! ❌`, 'error');
    }
    
    // Check if all active players have shot
    const activePlayers = localGame.players.filter(p => !p.eliminated);
    if (localGame.shotsThisSpot.length === activePlayers.length) {
        setTimeout(() => evaluateLocalRound(), 2000);
    } else {
        setTimeout(() => nextLocalPlayer(), 2000);
    }
}

function nextLocalPlayer() {
    do {
        localGame.currentPlayerIndex = (localGame.currentPlayerIndex + 1) % localGame.players.length;
    } while (localGame.players[localGame.currentPlayerIndex].eliminated);
    
    updateLocalGameState();
}

function evaluateLocalRound() {
    const shots = localGame.shotsThisSpot;
    
    // Find who missed
    shots.forEach(shot => {
        if (!shot.made) {
            const player = localGame.players.find(p => p.id === shot.playerId);
            if (player) {
                player.lives--;
                if (player.lives <= 0) {
                    player.eliminated = true;
                    showToast(`${player.name} is eliminated!`, 'error');
                }
            }
        }
    });
    
    // Check for winner
    const remainingPlayers = localGame.players.filter(p => !p.eliminated);
    if (remainingPlayers.length === 1) {
        setTimeout(() => endLocalGame(remainingPlayers[0]), 1000);
        return;
    }
    
    if (remainingPlayers.length === 0) {
        setTimeout(() => endLocalGame(null), 1000);
        return;
    }
    
    // Move to next spot
    localGame.shotsThisSpot = [];
    localGame.currentSpotIndex++;
    
    if (localGame.currentSpotIndex >= localGame.spots.length) {
        localGame.currentSpotIndex = 0;
        localGame.round++;
    }
    
    localGame.currentPlayerIndex = 0;
    while (localGame.players[localGame.currentPlayerIndex].eliminated) {
        localGame.currentPlayerIndex++;
    }
    
    updateLocalGameState();
}

function endLocalGame(winner) {
    showScreen('gameover');
    
    if (winner) {
        elements.winnerIcon.textContent = '🏆';
        elements.winnerText.textContent = `${winner.name} Wins!`;
    } else {
        elements.winnerIcon.textContent = '🤝';
        elements.winnerText.textContent = 'Draw!';
    }
    
    // Show final standings
    const sortedPlayers = [...localGame.players].sort((a, b) => b.lives - a.lives);
    
    elements.finalStandings.innerHTML = sortedPlayers.map((player, index) => `
        <div class="standing-item">
            <span>${index + 1}. ${player.name}</span>
            <span>${player.lives} ❤️</span>
        </div>
    `).join('');
}

// Start the app
init();
