// ===================================
//   PREMIUM BATTLESHIP - GAME LOGIC
// ===================================

// Game State
const gameState = {
    playerBoard: createEmptyBoard(),
    computerBoard: createEmptyBoard(),
    computerShips: [],
    playerShips: [],
    currentShip: null,
    currentOrientation: 'horizontal',
    gamePhase: 'setup',
    currentPlayer: 'player',
    difficulty: 'medium',
    opponent: 'hannah',
    stats: {
        shotsFired: 0,
        hits: 0,
        misses: 0
    },
    shipsToPlace: [
        { name: 'carrier', size: 5, placed: false },
        { name: 'battleship', size: 4, placed: false },
        { name: 'cruiser', size: 3, placed: false },
        { name: 'submarine', size: 3, placed: false },
        { name: 'destroyer', size: 2, placed: false }
    ],
    shipSunk: { player: 0, computer: 0 },
    soundEnabled: true,
    computerTargetQueue: [], // Queue of adjacent cells to try after a hit
    computerLastHit: null, // Last successful hit position
    computerFirstHit: null, // First hit of current ship (for going opposite direction)
    computerHitDirection: null // Direction of ship once we know it (dr, dc)
};

// Sound System using Web Audio API
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const soundEffects = {
    // Explosion sound for hits
    explosion: () => {
        if (!gameState.soundEnabled) return;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.3);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, audioContext.currentTime);
        filter.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    },
    
    // Splash sound for misses
    splash: () => {
        if (!gameState.soundEnabled) return;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.2);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1500, audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    },
    
    // Ship placement sound
    place: () => {
        if (!gameState.soundEnabled) return;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(550, audioContext.currentTime + 0.05);
        
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    },
    
    // Ship sinking sound
    sinking: () => {
        if (!gameState.soundEnabled) return;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 1.5);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3000, audioContext.currentTime);
        filter.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 1.5);
        
        gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.5);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 1.5);
    },
    
    // Victory fanfare
    victory: () => {
        if (!gameState.soundEnabled) return;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C
        notes.forEach((freq, index) => {
            setTimeout(() => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
                
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
            }, index * 150);
        });
    },
    
    // Defeat sound
    defeat: () => {
        if (!gameState.soundEnabled) return;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.8);
        
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.8);
    },
    
    // Button click sound
    click: () => {
        if (!gameState.soundEnabled) return;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.05);
    },
    
    // Sonar ping for computer turn
    sonar: () => {
        if (!gameState.soundEnabled) return;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    }
};

// DOM Elements
const elements = {
    playerBoard: document.getElementById('player-board'),
    computerBoard: document.getElementById('computer-board'),
    message: document.getElementById('message'),
    turnText: document.getElementById('turn-text'),
    startButton: document.getElementById('start-game'),
    resetButton: document.getElementById('reset-game'),
    rotateButton: document.getElementById('rotate-ship'),
    currentOrientation: document.getElementById('current-orientation'),
    shotsFired: document.getElementById('shots-fired'),
    accuracy: document.getElementById('accuracy'),
    enemyShips: document.getElementById('enemy-ships'),
    playerShips: document.getElementById('player-ships'),
    muteToggle: document.getElementById('mute-toggle'),
    highContrastToggle: document.getElementById('high-contrast-toggle'),
    modal: document.getElementById('game-over-modal'),
    modalIcon: document.getElementById('modal-icon'),
    modalTitle: document.getElementById('modal-title'),
    modalMessage: document.getElementById('modal-message'),
    modalShots: document.getElementById('modal-shots'),
    modalAccuracy: document.getElementById('modal-accuracy'),
    modalClose: document.getElementById('modal-close'),
    loadingOverlay: document.getElementById('loading-overlay'),
    confettiContainer: document.getElementById('confetti-container')
};

// Initialize Game
function initGame() {
    createBoard(elements.playerBoard, 'player');
    createBoard(elements.computerBoard, 'computer');
    setupShipSelection();
    setupEventListeners();
    placeComputerShips();
    updateUI();
}

function createEmptyBoard() {
    return Array(10).fill().map(() => Array(10).fill(null));
}

function createBoard(boardElement, player) {
    boardElement.innerHTML = '';
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            if (player === 'player') {
                cell.addEventListener('click', () => handlePlayerBoardClick(row, col));
            } else {
                cell.addEventListener('click', () => handleComputerBoardClick(row, col));
            }
            boardElement.appendChild(cell);
        }
    }
}

function setupEventListeners() {
    elements.startButton.addEventListener('click', () => {
        soundEffects.click();
        startGame();
    });
    elements.resetButton.addEventListener('click', () => {
        soundEffects.click();
        resetGame();
    });
    elements.rotateButton.addEventListener('click', () => {
        soundEffects.click();
        toggleOrientation();
    });
    elements.muteToggle.addEventListener('click', toggleSound);
    elements.highContrastToggle.addEventListener('click', () => {
        soundEffects.click();
        toggleHighContrast();
    });
    elements.modalClose.addEventListener('click', () => {
        soundEffects.click();
        elements.modal.classList.remove('show');
        resetGame();
    });
    
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            soundEffects.click();
            document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            gameState.difficulty = e.target.dataset.difficulty;
            gameState.opponent = e.target.dataset.persona;
            console.log('Opponent selected:', gameState.opponent, '| Difficulty:', gameState.difficulty);
        });
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'r' && gameState.gamePhase === 'setup') {
            soundEffects.click();
            toggleOrientation();
        }
    });
    
    // Devin's Random Deploy button
    const devinButton = document.getElementById('devin-random');
    console.log('Devin button found:', devinButton);
    if (devinButton) {
        devinButton.addEventListener('click', () => {
            console.log('Devin button clicked! Game phase:', gameState.gamePhase);
            if (gameState.gamePhase !== 'setup') {
                console.log('Not in setup phase, ignoring click');
                return;
            }
            soundEffects.click();
            randomDeployShips();
        });
    } else {
        console.error('Devin button not found in DOM!');
    }
}

function setupShipSelection() {
    const shipOptions = document.querySelectorAll('.ship-option');
    shipOptions.forEach(option => {
        option.addEventListener('click', () => {
            if (gameState.gamePhase !== 'setup') return;
            const shipName = option.dataset.ship;
            const ship = gameState.shipsToPlace.find(s => s.name === shipName);
            if (ship && !ship.placed) {
                if (gameState.currentShip) {
                    const prevShip = document.querySelector(`[data-ship="${gameState.currentShip.name}"]`);
                    if (prevShip) prevShip.classList.remove('placing');
                }
                gameState.currentShip = ship;
                option.classList.add('placing');
                clearHighlights();
                const cells = document.querySelectorAll('#player-board .cell');
                cells.forEach(cell => {
                    cell.addEventListener('mouseover', handleCellHover);
                    cell.addEventListener('mouseout', clearHighlights);
                });
                elements.message.textContent = `Place your ${shipName}. Press R to rotate.`;
            }
        });
    });
}

function handleCellHover(e) {
    if (!gameState.currentShip || gameState.currentShip.placed) return;
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    const size = gameState.currentShip.size;
    const isHorizontal = gameState.currentOrientation === 'horizontal';
    clearHighlights();
    const canPlace = canPlaceShip(row, col, size, isHorizontal, 'player');
    for (let i = 0; i < size; i++) {
        const r = isHorizontal ? row : row + i;
        const c = isHorizontal ? col + i : col;
        if (r >= 10 || c >= 10) {
            clearHighlights();
            return;
        }
        const cell = document.querySelector(`#player-board [data-row="${r}"][data-col="${c}"]`);
        if (cell) cell.classList.add(canPlace ? 'ship' : 'hit');
    }
}

function clearHighlights() {
    document.querySelectorAll('#player-board .cell').forEach(cell => {
        cell.classList.remove('ship', 'hit');
    });
}

function canPlaceShip(row, col, size, isHorizontal, player) {
    const board = player === 'player' ? gameState.playerBoard : gameState.computerBoard;
    for (let i = 0; i < size; i++) {
        const r = isHorizontal ? row : row + i;
        const c = isHorizontal ? col + i : col;
        if (r >= 10 || c >= 10) return false;
        if (board[r][c] !== null) return false;
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const nr = r + dr;
                const nc = c + dc;
                if (nr >= 0 && nr < 10 && nc >= 0 && nc < 10 && board[nr][nc] !== null) {
                    return false;
                }
            }
        }
    }
    return true;
}

function handlePlayerBoardClick(row, col) {
    if (gameState.gamePhase !== 'setup' || !gameState.currentShip || gameState.currentShip.placed) return;
    const size = gameState.currentShip.size;
    const isHorizontal = gameState.currentOrientation === 'horizontal';
    if (!canPlaceShip(row, col, size, isHorizontal, 'player')) {
        elements.message.textContent = 'Invalid placement. Try another position.';
        return;
    }
    const ship = {
        name: gameState.currentShip.name,
        size: size,
        hits: 0,
        positions: [],
        isHorizontal: isHorizontal
    };
    for (let i = 0; i < size; i++) {
        const r = isHorizontal ? row : row + i;
        const c = isHorizontal ? col + i : col;
        gameState.playerBoard[r][c] = { ship: ship, hit: false };
        ship.positions.push({ row: r, col: c });
        const cell = document.querySelector(`#player-board [data-row="${r}"][data-col="${c}"]`);
        if (cell) {
            cell.classList.add('ship', 'placed');
            // Hide individual cell styling for ship image
            if (i > 0) cell.style.borderLeft = 'none';
        }
    }
    
    // Add ship image overlay
    addShipImage('player', ship, row, col);
    gameState.playerShips.push(ship);
    gameState.currentShip.placed = true;
    gameState.currentShip = null;
    soundEffects.place();
    
    updateShipSelectionUI();
    if (gameState.shipsToPlace.every(ship => ship.placed)) {
        elements.message.textContent = 'All ships placed! Click "Start Battle" to begin.';
        elements.startButton.disabled = false;
    } else {
        elements.message.textContent = 'Select another ship to place.';
    }
    const cells = document.querySelectorAll('#player-board .cell');
    cells.forEach(cell => {
        cell.removeEventListener('mouseover', handleCellHover);
        cell.removeEventListener('mouseout', clearHighlights);
    });
}

function updateShipSelectionUI() {
    const shipOptions = document.querySelectorAll('.ship-option');
    shipOptions.forEach(option => {
        const shipName = option.dataset.ship;
        const ship = gameState.shipsToPlace.find(s => s.name === shipName);
        option.classList.remove('placing', 'placed');
        if (ship) {
            if (ship.placed) {
                option.classList.add('placed');
            } else if (gameState.currentShip && gameState.currentShip.name === shipName) {
                option.classList.add('placing');
            }
        }
    });
}

function toggleOrientation() {
    gameState.currentOrientation = gameState.currentOrientation === 'horizontal' ? 'vertical' : 'horizontal';
    elements.currentOrientation.textContent = gameState.currentOrientation.charAt(0).toUpperCase() + gameState.currentOrientation.slice(1);
}

function placeComputerShips() {
    const ships = [
        { name: 'carrier', size: 5 },
        { name: 'battleship', size: 4 },
        { name: 'cruiser', size: 3 },
        { name: 'submarine', size: 3 },
        { name: 'destroyer', size: 2 }
    ];
    ships.forEach(ship => {
        let placed = false;
        while (!placed) {
            const row = Math.floor(Math.random() * 10);
            const col = Math.floor(Math.random() * 10);
            const isHorizontal = Math.random() > 0.5;
            if (canPlaceShip(row, col, ship.size, isHorizontal, 'computer')) {
                const computerShip = {
                    name: ship.name,
                    size: ship.size,
                    hits: 0,
                    positions: [],
                    isHorizontal: isHorizontal
                };
                for (let i = 0; i < ship.size; i++) {
                    const r = isHorizontal ? row : row + i;
                    const c = isHorizontal ? col + i : col;
                    gameState.computerBoard[r][c] = { ship: computerShip, hit: false };
                    computerShip.positions.push({ row: r, col: c });
                }
                gameState.computerShips.push(computerShip);
                
                // Add ship image for computer (hidden until sunk)
                addShipImage('computer', computerShip, row, col);
                
                placed = true;
            }
        }
    });
}

function randomDeployShips() {
    console.log('randomDeployShips called!');
    // Clear existing player ships
    gameState.playerBoard = createEmptyBoard();
    gameState.playerShips = [];
    gameState.shipsToPlace.forEach(ship => ship.placed = false);
    gameState.currentShip = null;
    
    // Clear visual board
    const playerBoardElement = document.getElementById('player-board');
    playerBoardElement.innerHTML = '';
    createBoard(playerBoardElement, 'player');
    
    // Place ships randomly
    const ships = [
        { name: 'carrier', size: 5 },
        { name: 'battleship', size: 4 },
        { name: 'cruiser', size: 3 },
        { name: 'submarine', size: 3 },
        { name: 'destroyer', size: 2 }
    ];
    
    ships.forEach(ship => {
        let placed = false;
        let attempts = 0;
        while (!placed && attempts < 100) {
            const row = Math.floor(Math.random() * 10);
            const col = Math.floor(Math.random() * 10);
            const isHorizontal = Math.random() > 0.5;
            
            if (canPlaceShip(row, col, ship.size, isHorizontal, 'player')) {
                const playerShip = {
                    name: ship.name,
                    size: ship.size,
                    hits: 0,
                    positions: [],
                    isHorizontal: isHorizontal
                };
                
                for (let i = 0; i < ship.size; i++) {
                    const r = isHorizontal ? row : row + i;
                    const c = isHorizontal ? col + i : col;
                    gameState.playerBoard[r][c] = { ship: playerShip, hit: false };
                    playerShip.positions.push({ row: r, col: c });
                    
                    // Update visual board
                    const cell = document.querySelector(`#player-board [data-row="${r}"][data-col="${c}"]`);
                    if (cell) {
                        cell.classList.add('ship', 'placed');
                    }
                }
                
                gameState.playerShips.push(playerShip);
                addShipImage('player', playerShip, row, col);
                
                // Mark ship as placed
                const shipToPlace = gameState.shipsToPlace.find(s => s.name === ship.name);
                if (shipToPlace) shipToPlace.placed = true;
                
                placed = true;
            }
            attempts++;
        }
    });
    
    // Update UI
    updateShipSelectionUI();
    elements.startButton.disabled = false;
    elements.message.textContent = '🦦 Devin deployed your fleet! Ready to commence operation?';
    soundEffects.place();
    
    // Add a fun animation to the otter
    const otterEmoji = document.querySelector('.otter-emoji');
    if (otterEmoji) {
        otterEmoji.style.animation = 'none';
        setTimeout(() => {
            otterEmoji.style.animation = 'otter-swim 2s ease-in-out infinite, otter-celebrate 0.5s ease-in-out';
        }, 10);
    }
}

function startGame() {
    if (gameState.gamePhase !== 'setup') return;
    gameState.gamePhase = 'playing';
    gameState.currentPlayer = 'player';
    elements.message.textContent = 'Your turn! Attack the enemy fleet.';
    elements.turnText.textContent = 'Your Turn';
    elements.startButton.disabled = true;
    document.getElementById('ship-selection-panel').style.display = 'none';
    document.getElementById('difficulty-selector').style.display = 'none';
}

function handleComputerBoardClick(row, col) {
    if (gameState.gamePhase !== 'playing' || gameState.currentPlayer !== 'player') return;
    const cell = gameState.computerBoard[row][col];
    if (cell && cell.hit) return;
    gameState.stats.shotsFired++;
    if (cell) {
        cell.hit = true;
        cell.ship.hits++;
        gameState.stats.hits++;
        const cellElement = document.querySelector(`#computer-board [data-row="${row}"][data-col="${col}"]`);
        if (cellElement) {
            cellElement.classList.add('hit');
            soundEffects.explosion();
            if (cell.ship.hits === cell.ship.size) {
                setTimeout(() => {
                    cell.ship.positions.forEach(pos => {
                        const sunkCell = document.querySelector(`#computer-board [data-row="${pos.row}"][data-col="${pos.col}"]`);
                        if (sunkCell) sunkCell.classList.add('sunk');
                    });
                    soundEffects.sinking();
                    // Show ship image when sunk
                    if (cell.ship.imageElement) {
                        cell.ship.imageElement.style.opacity = '1';
                    }
                }, 300);
                gameState.shipSunk.computer++;
                showSinkingNotification(cell.ship.name, 'enemy');
                elements.message.textContent = `You sunk the enemy's ${cell.ship.name}!`;
                if (gameState.shipSunk.computer === gameState.computerShips.length) {
                    setTimeout(() => endGame('player'), 2000);
                    return;
                }
            } else {
                elements.message.textContent = 'Direct hit!';
            }
        }
    } else {
        gameState.computerBoard[row][col] = { hit: false };
        gameState.stats.misses++;
        const cellElement = document.querySelector(`#computer-board [data-row="${row}"][data-col="${col}"]`);
        if (cellElement) {
            cellElement.classList.add('miss');
            soundEffects.splash();
        }
        elements.message.textContent = 'Miss!';
    }
    updateStats();
    gameState.currentPlayer = 'computer';
    elements.turnText.textContent = 'Enemy Turn';
    setTimeout(computerTurn, 1500);
}

function showSinkingNotification(shipName, owner) {
    const notification = document.createElement('div');
    notification.className = 'sinking-notification';
    notification.innerHTML = `${owner === 'enemy' ? 'ENEMY' : 'YOUR'} ${shipName.toUpperCase()}<br>DESTROYED!`;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 2000);
}

function computerTurn() {
    if (gameState.gamePhase !== 'playing' || gameState.currentPlayer !== 'computer') return;
    elements.loadingOverlay.classList.add('show');
    soundEffects.sonar();
    setTimeout(() => {
        try {
        let row, col;
        let foundValidTarget = false;
        
        console.log('=== COMPUTER TURN ===');
        console.log('Opponent:', gameState.opponent, '| Difficulty:', gameState.difficulty);
        console.log('Target queue:', gameState.computerTargetQueue.length, 'cells');
        console.log('Last hit:', gameState.computerLastHit);
        console.log('Hit direction:', gameState.computerHitDirection);
        console.log('First hit:', gameState.computerFirstHit);
        
        // SCOTT MODE: 80% chance to hit a ship (CEO advantage)
        if (gameState.difficulty === 'scott' && Math.random() < 0.8) {
            // Find all unhit ship cells
            const unhitShipCells = [];
            for (let r = 0; r < 10; r++) {
                for (let c = 0; c < 10; c++) {
                    const cell = gameState.playerBoard[r][c];
                    if (cell && cell.ship && !cell.hit) {
                        unhitShipCells.push({ row: r, col: c });
                    }
                }
            }
            
            // If there are unhit ships, target one
            if (unhitShipCells.length > 0) {
                const target = unhitShipCells[Math.floor(Math.random() * unhitShipCells.length)];
                row = target.row;
                col = target.col;
                foundValidTarget = true;
                console.log('SCOTT MODE: CEO using superior tactics to target ship at', row, col);
            }
        }
        
        // SMART AI: If we know the direction (got 2 hits in a row), continue in that line
        if (!foundValidTarget && gameState.difficulty !== 'easy' && gameState.computerHitDirection && gameState.computerLastHit) {
            const dir = gameState.computerHitDirection;
            const nextRow = gameState.computerLastHit.row + dir.dr;
            const nextCol = gameState.computerLastHit.col + dir.dc;
            
            // Check if next cell in direction is valid
            if (nextRow >= 0 && nextRow < 10 && nextCol >= 0 && nextCol < 10) {
                const cell = gameState.playerBoard[nextRow][nextCol];
                if (!cell || !cell.hit) {
                    row = nextRow;
                    col = nextCol;
                    foundValidTarget = true;
                    console.log('Following ship direction to:', row, col);
                }
            }
            
            // If we hit a wall or already-hit cell, try opposite direction from first hit
            if (!foundValidTarget && gameState.computerFirstHit) {
                const oppRow = gameState.computerFirstHit.row - dir.dr;
                const oppCol = gameState.computerFirstHit.col - dir.dc;
                if (oppRow >= 0 && oppRow < 10 && oppCol >= 0 && oppCol < 10) {
                    const cell = gameState.playerBoard[oppRow][oppCol];
                    if (!cell || !cell.hit) {
                        row = oppRow;
                        col = oppCol;
                        foundValidTarget = true;
                        // Reverse direction
                        gameState.computerHitDirection = { dr: -dir.dr, dc: -dir.dc };
                        gameState.computerLastHit = gameState.computerFirstHit;
                        console.log('Hit wall, trying opposite direction:', row, col);
                    }
                }
            }
        }
        
        // If we have queued adjacent cells from a hit, try those (NOT for easy mode)
        if (!foundValidTarget && gameState.difficulty !== 'easy' && gameState.computerTargetQueue.length > 0) {
            while (gameState.computerTargetQueue.length > 0 && !foundValidTarget) {
                const target = gameState.computerTargetQueue.shift();
                const cell = gameState.playerBoard[target.row][target.col];
                // Only target if not already hit
                if (!cell || !cell.hit) {
                    row = target.row;
                    col = target.col;
                    foundValidTarget = true;
                    console.log('Targeting adjacent cell from queue:', row, col);
                }
            }
        }
        
        // Fall back to random targeting
        if (!foundValidTarget) {
            ({ row, col } = getRandomTarget());
            console.log('Using random targeting at:', row, col);
        } else {
            console.log('Using smart targeting at:', row, col);
        }
        
        // Final safety check - ensure we never hit the same cell twice
        const cell = gameState.playerBoard[row][col];
        if (cell && cell.hit) {
            // This cell was already hit, get a random target instead
            console.warn('Computer selected already-hit cell, getting new target');
            let retries = 0;
            while (retries < 5) {
                ({ row, col } = getRandomTarget());
                const newCell = gameState.playerBoard[row][col];
                if (!newCell || !newCell.hit) {
                    break; // Found valid cell
                }
                retries++;
            }
        }
        
        const finalCell = gameState.playerBoard[row][col];
        
        // Handle hit on ship
        if (finalCell && finalCell.ship && !finalCell.hit) {
            finalCell.hit = true;
            finalCell.ship.hits++;
            
            console.log('HIT! Ship:', finalCell.ship.name, 'at', row, col);
            
            // Track hits to determine ship direction
            if (gameState.difficulty !== 'easy') {
                if (gameState.computerLastHit) {
                    // Second hit! Determine direction of ship
                    const dr = row - gameState.computerLastHit.row;
                    const dc = col - gameState.computerLastHit.col;
                    gameState.computerHitDirection = { dr, dc };
                    console.log('Second hit! Ship direction determined:', dr === 0 ? 'HORIZONTAL' : 'VERTICAL');
                    
                    // Clear queue - we know direction now, don't need to try all adjacent
                    gameState.computerTargetQueue = [];
                } else {
                    // First hit - queue adjacent cells to find direction
                    gameState.computerFirstHit = { row, col };
                    const adjacent = getAdjacentCells(row, col);
                    adjacent.forEach(pos => {
                        const cell = gameState.playerBoard[pos.row][pos.col];
                        const alreadyHit = cell && cell.hit;
                        if (!alreadyHit) {
                            gameState.computerTargetQueue.push(pos);
                        }
                    });
                    console.log('First hit! Queued', gameState.computerTargetQueue.length, 'adjacent cells');
                }
                
                // Always update last hit
                gameState.computerLastHit = { row, col };
            } else {
                console.log('Easy mode - NOT tracking hits');
            }
            const cellElement = document.querySelector(`#player-board [data-row="${row}"][data-col="${col}"]`);
            if (cellElement) {
                cellElement.classList.add('hit');
                soundEffects.explosion();
                if (finalCell.ship.hits === finalCell.ship.size) {
                    setTimeout(() => {
                        finalCell.ship.positions.forEach(pos => {
                            const sunkCell = document.querySelector(`#player-board [data-row="${pos.row}"][data-col="${pos.col}"]`);
                            if (sunkCell) {
                                sunkCell.classList.add('sunk');
                            }
                        });
                        soundEffects.sinking();
                    }, 300);
                    gameState.shipSunk.player++;
                    // Clear all tracking when ship is sunk - back to random searching
                    gameState.computerTargetQueue = [];
                    gameState.computerLastHit = null;
                    gameState.computerFirstHit = null;
                    gameState.computerHitDirection = null;
                    console.log('Ship sunk! Cleared all tracking, back to random search');
                    showSinkingNotification(finalCell.ship.name, 'player');
                    const opponentName = gameState.opponent.charAt(0).toUpperCase() + gameState.opponent.slice(1);
                    elements.message.textContent = `${opponentName} sunk your ${finalCell.ship.name}!`;
                    if (gameState.shipSunk.player === gameState.playerShips.length) {
                        elements.loadingOverlay.classList.remove('show');
                        setTimeout(() => endGame('computer'), 2000);
                        return;
                    }
                } else {
                    const opponentName = gameState.opponent.charAt(0).toUpperCase() + gameState.opponent.slice(1);
                    elements.message.textContent = `${opponentName} hit your ship!`;
                }
            }
        } else {
            // Handle miss (empty water or already hit cell)
            if (!finalCell) {
                gameState.playerBoard[row][col] = { hit: true }; // Mark as hit so we don't target again
            } else if (finalCell && !finalCell.hit) {
                finalCell.hit = true;
            }
            
            const cellElement = document.querySelector(`#player-board [data-row="${row}"][data-col="${col}"]`);
            if (cellElement && !cellElement.classList.contains('miss')) {
                cellElement.classList.add('miss');
                soundEffects.splash();
            }
            const opponentName = gameState.opponent.charAt(0).toUpperCase() + gameState.opponent.slice(1);
            elements.message.textContent = `${opponentName} missed!`;
            
            // If we were following a direction and missed, try opposite direction
            if (gameState.computerHitDirection && gameState.computerFirstHit) {
                console.log('Missed while following direction - will try opposite next turn');
                // Direction reversal is handled in the targeting logic above
            }
            
            console.log('Miss at', row, col, '- Queue still has', gameState.computerTargetQueue.length, 'targets');
        }
        updateStats();
        elements.loadingOverlay.classList.remove('show');
        gameState.currentPlayer = 'player';
        elements.turnText.textContent = 'Your Turn';
        } catch (error) {
            console.error('Error in computerTurn:', error);
            elements.loadingOverlay.classList.remove('show');
            gameState.currentPlayer = 'player';
            elements.turnText.textContent = 'Your Turn';
            elements.message.textContent = 'Enemy turn completed.';
        }
    }, 1000);
}

function getRandomTarget() {
    let row, col;
    let validMove = false;
    let attempts = 0;
    const maxAttempts = 200; // Safety limit to prevent infinite loop
    
    while (!validMove && attempts < maxAttempts) {
        row = Math.floor(Math.random() * 10);
        col = Math.floor(Math.random() * 10);
        const cell = gameState.playerBoard[row][col];
        
        // Check if this cell has already been shot at
        // Valid if: no cell exists (empty water) OR cell exists but hasn't been hit yet
        if (!cell) {
            // Empty water, never shot before
            validMove = true;
            console.log('Random target: empty water at', row, col);
        } else if (cell.hit === false || cell.hit === undefined) {
            // Cell exists (ship or previously marked empty water) and not hit
            validMove = true;
            console.log('Random target: cell at', row, col, 'has ship?', !!cell.ship);
        } else if (cell.hit === true) {
            // Already shot here, try again
            console.log('Already hit', row, col, 'trying again...');
        }
        attempts++;
    }
    
    // Fallback: if we couldn't find a valid target after max attempts, find first available
    if (!validMove) {
        console.warn('getRandomTarget: Max attempts reached, finding first available cell');
        for (let r = 0; r < 10; r++) {
            for (let c = 0; c < 10; c++) {
                const cell = gameState.playerBoard[r][c];
                if (!cell || !cell.hit) {
                    console.log('Fallback target:', r, c);
                    return { row: r, col: c };
                }
            }
        }
        // Ultimate fallback - return 0,0 (should never happen in normal gameplay)
        console.error('getRandomTarget: No valid cells found!');
        return { row: 0, col: 0 };
    }
    
    return { row, col };
}

function getAdjacentCells(row, col) {
    const adjacent = [];
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    directions.forEach(([dr, dc]) => {
        const newRow = row + dr;
        const newCol = col + dc;
        if (newRow >= 0 && newRow < 10 && newCol >= 0 && newCol < 10) {
            adjacent.push({ row: newRow, col: newCol });
        }
    });
    return adjacent;
}

function endGame(winner) {
    gameState.gamePhase = 'gameOver';
    if (winner === 'player') {
        elements.modalIcon.textContent = '🏆';
        elements.modalTitle.textContent = 'Victory!';
        elements.modalMessage.textContent = "Congratulations! You've defeated the enemy fleet!";
        soundEffects.victory();
        createConfetti();
    } else {
        elements.modalIcon.textContent = '💀';
        elements.modalTitle.textContent = 'Defeat';
        elements.modalMessage.textContent = 'Your fleet has been destroyed. Better luck next time!';
        soundEffects.defeat();
    }
    elements.modalShots.textContent = gameState.stats.shotsFired;
    const accuracy = gameState.stats.shotsFired > 0 ? Math.round((gameState.stats.hits / gameState.stats.shotsFired) * 100) : 0;
    elements.modalAccuracy.textContent = accuracy + '%';
    elements.modal.classList.add('show');
}

function createConfetti() {
    const colors = ['#FFD700', '#00FFFF', '#FF1493', '#00FF00', '#FF6347', '#FF69B4', '#FFA500', '#9B59B6'];
    for (let i = 0; i < 150; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            confetti.style.width = (Math.random() * 8 + 8) + 'px';
            confetti.style.height = (Math.random() * 8 + 8) + 'px';
            confetti.style.boxShadow = `0 0 10px ${colors[Math.floor(Math.random() * colors.length)]}`;
            elements.confettiContainer.appendChild(confetti);
            setTimeout(() => confetti.remove(), 4000);
        }, i * 15);
    }
}

function resetGame() {
    gameState.playerBoard = createEmptyBoard();
    gameState.computerBoard = createEmptyBoard();
    gameState.computerShips = [];
    gameState.playerShips = [];
    gameState.currentShip = null;
    gameState.currentOrientation = 'horizontal';
    gameState.gamePhase = 'setup';
    gameState.currentPlayer = 'player';
    gameState.shipSunk = { player: 0, computer: 0 };
    gameState.stats = { shotsFired: 0, hits: 0, misses: 0 };
    gameState.computerLastHit = null;
    gameState.computerTargetQueue = [];
    gameState.shipsToPlace = [
        { name: 'carrier', size: 5, placed: false },
        { name: 'battleship', size: 4, placed: false },
        { name: 'cruiser', size: 3, placed: false },
        { name: 'submarine', size: 3, placed: false },
        { name: 'destroyer', size: 2, placed: false }
    ];
    createBoard(elements.playerBoard, 'player');
    createBoard(elements.computerBoard, 'computer');
    document.querySelectorAll('.ship-option').forEach(option => {
        option.classList.remove('placing', 'placed');
    });
    elements.message.textContent = 'Place your ships! Click on a ship to select it, then click on the board to place it.';
    elements.turnText.textContent = 'Setup Phase';
    elements.startButton.disabled = true;
    document.getElementById('ship-selection-panel').style.display = 'block';
    document.getElementById('difficulty-selector').style.display = 'block';
    elements.currentOrientation.textContent = 'Horizontal';
    elements.modal.classList.remove('show');
    placeComputerShips();
    updateStats();
}

function updateStats() {
    elements.shotsFired.textContent = gameState.stats.shotsFired;
    const accuracy = gameState.stats.shotsFired > 0 ? Math.round((gameState.stats.hits / gameState.stats.shotsFired) * 100) : 0;
    elements.accuracy.textContent = accuracy + '%';
    elements.enemyShips.textContent = gameState.computerShips.length - gameState.shipSunk.computer;
    elements.playerShips.textContent = gameState.playerShips.length - gameState.shipSunk.player;
}

function updateUI() {
    updateShipSelectionUI();
    updateStats();
    elements.currentOrientation.textContent = gameState.currentOrientation.charAt(0).toUpperCase() + gameState.currentOrientation.slice(1);
}

function toggleSound() {
    gameState.soundEnabled = !gameState.soundEnabled;
    elements.muteToggle.textContent = gameState.soundEnabled ? '🔊' : '🔇';
}

// Ship SVG silhouettes
const shipSVGs = {
    carrier: {
        horizontal: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgNDAiPjxwYXRoIGQ9Ik0gMTAgMjAgTCAxNSAxMiBMIDE4NSAxMiBMIDE5MCAyMCBMIDE4NSAyOCBMIDE1IDI4IFoiIGZpbGw9IiM0YTU1NjIiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48cmVjdCB4PSIzMCIgeT0iOCIgd2lkdGg9IjE1IiBoZWlnaHQ9IjEyIiBmaWxsPSIjNjA2ODcwIi8+PHJlY3QgeD0iNjAiIHk9IjYiIHdpZHRoPSIxMCIgaGVpZ2h0PSI4IiBmaWxsPSIjNjA2ODcwIi8+PHJlY3QgeD0iMTYwIiB5PSI4IiB3aWR0aD0iMjAiIGhlaWdodD0iMTIiIGZpbGw9IiM2MDY4NzAiLz48L3N2Zz4=',
        vertical: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MCAyMDAiPjxwYXRoIGQ9Ik0gMjAgMTAgTCAxMiAxNSBMIDEyIDE4NSBMIDIwIDE5MCBMIDI4IDE4NSBMIDI4IDE1IFoiIGZpbGw9IiM0YTU1NjIiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48cmVjdCB5PSIzMCIgeD0iOCIgaGVpZ2h0PSIxNSIgd2lkdGg9IjEyIiBmaWxsPSIjNjA2ODcwIi8+PHJlY3QgeT0iNjAiIHg9IjYiIGhlaWdodD0iMTAiIHdpZHRoPSI4IiBmaWxsPSIjNjA2ODcwIi8+PHJlY3QgeT0iMTYwIiB4PSI4IiBoZWlnaHQ9IjIwIiB3aWR0aD0iMTIiIGZpbGw9IiM2MDY4NzAiLz48L3N2Zz4='
    },
    battleship: {
        horizontal: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNjAgNDAiPjxwYXRoIGQ9Ik0gMTAgMjAgTCAxNCAxMyBMIDE0NiAxMyBMIDE1MCAyMCBMIDE0NiAyNyBMIDE0IDI3IFoiIGZpbGw9IiM0YTU1NjIiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48cmVjdCB4PSIzMCIgeT0iNyIgd2lkdGg9IjEyIiBoZWlnaHQ9IjEyIiBmaWxsPSIjNjA2ODcwIi8+PHJlY3QgeD0iNzAiIHk9IjciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiIgZmlsbD0iIzYwNjg3MCIvPjxyZWN0IHg9IjExMCIgeT0iNyIgd2lkdGg9IjE1IiBoZWlnaHQ9IjEyIiBmaWxsPSIjNjA2ODcwIi8+PC9zdmc+',
        vertical: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MCAxNjAiPjxwYXRoIGQ9Ik0gMjAgMTAgTCAxMyAxNCBMIDEzIDE0NiBMIDIwIDE1MCBMIDI3IDE0NiBMIDI3IDE0IFoiIGZpbGw9IiM0YTU1NjIiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48cmVjdCB5PSIzMCIgeD0iNyIgaGVpZ2h0PSIxMiIgd2lkdGg9IjEyIiBmaWxsPSIjNjA2ODcwIi8+PHJlY3QgeT0iNzAiIHg9IjciIGhlaWdodD0iMTIiIHdpZHRoPSIxMiIgZmlsbD0iIzYwNjg3MCIvPjxyZWN0IHk9IjExMCIgeD0iNyIgaGVpZ2h0PSIxNSIgd2lkdGg9IjEyIiBmaWxsPSIjNjA2ODcwIi8+PC9zdmc+'
    },
    cruiser: {
        horizontal: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjAgNDAiPjxwYXRoIGQ9Ik0gMTAgMjAgTCAxMyAxNCBMIDEwNyAxNCBMIDExMCAyMCBMIDEwNyAyNiBMIDEzIDI2IFoiIGZpbGw9IiM0YTU1NjIiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48cmVjdCB4PSIyNSIgeT0iOCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjNjA2ODcwIi8+PHJlY3QgeD0iNTUiIHk9IjgiIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMCIgZmlsbD0iIzYwNjg3MCIvPjxyZWN0IHg9Ijg1IiB5PSI4IiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiM2MDY4NzAiLz48L3N2Zz4=',
        vertical: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MCAxMjAiPjxwYXRoIGQ9Ik0gMjAgMTAgTCAxNCAxMyBMIDE0IDEwNyBMIDIwIDExMCBMIDI2IDEwNyBMIDI2IDEzIFoiIGZpbGw9IiM0YTU1NjIiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48cmVjdCB5PSIyNSIgeD0iOCIgaGVpZ2h0PSIxMCIgd2lkdGg9IjEwIiBmaWxsPSIjNjA2ODcwIi8+PHJlY3QgeT0iNTUiIHg9IjgiIGhlaWdodD0iMTIiIHdpZHRoPSIxMCIgZmlsbD0iIzYwNjg3MCIvPjxyZWN0IHk9Ijg1IiB4PSI4IiBoZWlnaHQ9IjEwIiB3aWR0aD0iMTAiIGZpbGw9IiM2MDY4NzAiLz48L3N2Zz4='
    },
    submarine: {
        horizontal: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjAgNDAiPjxlbGxpcHNlIGN4PSI2MCIgY3k9IjIwIiByeD0iNTUiIHJ5PSIxMCIgZmlsbD0iIzQwNDg1MCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjEuNSIvPjxyZWN0IHg9IjQ1IiB5PSIxMCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iIzUwNTg2MCIvPjxyZWN0IHg9IjU1IiB5PSI4IiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiM1MDU4NjAiLz48L3N2Zz4=',
        vertical: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MCAxMjAiPjxlbGxpcHNlIGN5PSI2MCIgY3g9IjIwIiByeT0iNTUiIHJ4PSIxMCIgZmlsbD0iIzQwNDg1MCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjEuNSIvPjxyZWN0IHk9IjQ1IiB4PSIxMCIgaGVpZ2h0PSI4IiB3aWR0aD0iOCIgZmlsbD0iIzUwNTg2MCIvPjxyZWN0IHk9IjU1IiB4PSI4IiBoZWlnaHQ9IjEwIiB3aWR0aD0iMTAiIGZpbGw9IiM1MDU4NjAiLz48L3N2Zz4='
    },
    destroyer: {
        horizontal: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA0MCI+PHBhdGggZD0iTSAxMCAyMCBMIDEyIDE1IEwgNjggMTUgTCA3MCAyMCBMIDY4IDI1IEwgMTIgMjUgWiIgZmlsbD0iIzRhNTU2MiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjEuNSIvPjxyZWN0IHg9IjI1IiB5PSI5IiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiM2MDY4NzAiLz48cmVjdCB4PSI1MCIgeT0iOSIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjNjA2ODcwIi8+PC9zdmc+',
        vertical: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MCA4MCI+PHBhdGggZD0iTSAyMCAxMCBMIDE1IDEyIEwgMTUgNjggTCAyMCA3MCBMIDI1IDY4IEwgMjUgMTIgWiIgZmlsbD0iIzRhNTU2MiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjEuNSIvPjxyZWN0IHk9IjI1IiB4PSI5IiBoZWlnaHQ9IjEwIiB3aWR0aD0iMTAiIGZpbGw9IiM2MDY4NzAiLz48cmVjdCB5PSI1MCIgeD0iOSIgaGVpZ2h0PSIxMCIgd2lkdGg9IjEwIiBmaWxsPSIjNjA2ODcwIi8+PC9zdmc+'
    }
};

// Add ship image overlay
function addShipImage(boardType, ship, startRow, startCol) {
    const boardId = boardType === 'player' ? 'player-board' : 'computer-board';
    const board = document.getElementById(boardId);
    
    const shipImg = document.createElement('img');
    shipImg.className = 'ship-image';
    shipImg.dataset.shipName = ship.name;
    shipImg.dataset.boardType = boardType;
    
    // Get ship SVG
    const orientation = ship.isHorizontal ? 'horizontal' : 'vertical';
    shipImg.src = shipSVGs[ship.name][orientation];
    
    // Calculate position and size
    const cellSize = 39;
    const padding = 1;
    const width = ship.isHorizontal ? (ship.size * cellSize - 2) : (cellSize - 2);
    const height = ship.isHorizontal ? (cellSize - 2) : (ship.size * cellSize - 2);
    const left = padding + (startCol * cellSize);
    const top = padding + (startRow * cellSize);
    
    shipImg.style.position = 'absolute';
    shipImg.style.width = width + 'px';
    shipImg.style.height = height + 'px';
    shipImg.style.left = left + 'px';
    shipImg.style.top = top + 'px';
    shipImg.style.pointerEvents = 'none';
    shipImg.style.zIndex = '50';
    
    // Hide for computer until sunk
    if (boardType === 'computer') {
        shipImg.style.opacity = '0';
    }
    
    board.appendChild(shipImg);
    ship.imageElement = shipImg;
}

function toggleHighContrast() {
    document.body.classList.toggle('high-contrast');
}

window.addEventListener('DOMContentLoaded', initGame);
