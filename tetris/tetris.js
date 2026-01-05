const gameArea = document.getElementById('gameArea');
const scoreDisplay = document.getElementById('score');
const ROWS = 20;
const COLS = 10;
const CELL_SIZE = 30;
const EMPTY = 'white';
let grid = [];
let currentPiece;
let score = 0;
let gameInterval;

const PIECES = [
    { color: 'cyan', shape: [[1, 1, 1, 1]] },
    { color: 'blue', shape: [[1, 1, 1], [0, 1, 0]] },
    { color: 'orange', shape: [[1, 1, 1], [1, 0, 0]] },
    { color: 'yellow', shape: [[1, 1], [1, 1]] },
    { color: 'green', shape: [[0, 1, 1], [1, 1, 0]] },
    { color: 'purple', shape: [[1, 1, 0], [0, 1, 1]] },
    { color: 'red', shape: [[1, 1, 1], [0, 0, 1]] }
];

function init() {
    createGrid();
    resetGame();
    document.addEventListener('keydown', handleKeyPress);
}

function createGrid() {
    for (let row = 0; row < ROWS; row++) {
        grid[row] = [];
        for (let col = 0; col < COLS; col++) {
            grid[row][col] = EMPTY;
        }
    }
}

function resetGame() {
    clearInterval(gameInterval);
    score = 0;
    scoreDisplay.textContent = `Puntuación: ${score}`;
    grid.forEach(row => row.fill(EMPTY));
    spawnPiece();
    gameInterval = setInterval(updateGameArea, 500); 
}

function spawnPiece() {
    const randomPiece = PIECES[Math.floor(Math.random() * PIECES.length)];
    currentPiece = {
        shape: randomPiece.shape,
        color: randomPiece.color,
        x: Math.floor(COLS / 2) - Math.ceil(randomPiece.shape[0].length / 2),
        y: 0
    };
    if (checkCollision(currentPiece)) {
        endGame();
    }
}

function updateGameArea() {
    movePieceDown();
    drawGrid();
}

function movePieceDown() {
    currentPiece.y++;
    if (checkCollision(currentPiece)) {
        currentPiece.y--;
        placePiece();
        clearLines();
        spawnPiece();
    }
}

// --- NEW HARD DROP FUNCTION ---
function hardDrop() {
    // Keep moving down until we hit a collision
    while (!checkCollision(currentPiece)) {
        currentPiece.y++;
    }
    // Step back one to the last valid position
    currentPiece.y--;
    
    // Immediately lock the piece
    placePiece();
    clearLines();
    spawnPiece();
    drawGrid();
}

function placePiece() {
    currentPiece.shape.forEach((row, i) => {
        row.forEach((value, j) => {
            if (value) {
                grid[currentPiece.y + i][currentPiece.x + j] = currentPiece.color;
            }
        });
    });
}

function clearLines() {
    for (let row = ROWS - 1; row >= 0; row--) {
        if (grid[row].every(cell => cell !== EMPTY)) {
            grid.splice(row, 1);
            grid.unshift(new Array(COLS).fill(EMPTY));
            score += 10;
            scoreDisplay.textContent = `Score: ${score}`;
        }
    }
}

function drawGrid() {
    gameArea.innerHTML = ''; 

    grid.forEach((row, i) => {
        row.forEach((cell, j) => {
            const cellElement = document.createElement('div');
            cellElement.style.width = CELL_SIZE + 'px';
            cellElement.style.height = CELL_SIZE + 'px';
            cellElement.style.backgroundColor = cell;
            cellElement.style.position = 'absolute';
            cellElement.style.left = j * CELL_SIZE + 'px';
            cellElement.style.top = i * CELL_SIZE + 'px';
            gameArea.appendChild(cellElement);
        });
    });

    currentPiece.shape.forEach((row, i) => {
        row.forEach((value, j) => {
            if (value) {
                const pieceElement = document.createElement('div');
                pieceElement.style.width = CELL_SIZE + 'px';
                pieceElement.style.height = CELL_SIZE + 'px';
                pieceElement.style.backgroundColor = currentPiece.color;
                pieceElement.style.position = 'absolute';
                pieceElement.style.left = (currentPiece.x + j) * CELL_SIZE + 'px';
                pieceElement.style.top = (currentPiece.y + i) * CELL_SIZE + 'px';
                gameArea.appendChild(pieceElement);
            }
        });
    });
}

// --- UPDATED INPUT HANDLER ---
function handleKeyPress(event) {
    switch (event.key) {
        case 'ArrowLeft':
            movePieceLeft();
            break;
        case 'ArrowRight':
            movePieceRight();
            break;
        case 'ArrowDown':
            movePieceDown();
            break;
        case 'ArrowUp':
            rotatePiece();
            break;
        case ' ': // Added Spacebar for Hard Drop
            event.preventDefault(); // Prevents page from scrolling down
            hardDrop();
            break;
    }
    drawGrid();
}

function movePieceLeft() {
    currentPiece.x--;
    if (checkCollision(currentPiece)) {
        currentPiece.x++;
    }
}

function movePieceRight() {
    currentPiece.x++;
    if (checkCollision(currentPiece)) {
        currentPiece.x--;
    }
}

function rotatePiece() {
    const originalShape = currentPiece.shape;
    const newShape = [];
    for (let col = 0; col < originalShape[0].length; col++) {
        const newRow = [];
        for (let row = originalShape.length - 1; row >= 0; row--) {
            newRow.push(originalShape[row][col]);
        }
        newShape.push(newRow);
    }
    currentPiece.shape = newShape;
    if (checkCollision(currentPiece)) {
        currentPiece.shape = originalShape;
    }
}

function checkCollision(piece) {
    return piece.shape.some((row, i) => {
        return row.some((value, j) => {
            if (value) {
                const x = piece.x + j;
                const y = piece.y + i;
                return (
                    y >= ROWS || x < 0 || x >= COLS || (y >= 0 && grid[y][x] !== EMPTY)
                );
            }
            return false;
        });
    });
}

function endGame() {
    clearInterval(gameInterval);
    alert(`¡Game ended! Final score: ${score}`);
}

init();
