const socket = io('https://tugas-tic-tac-toe.vercel.app', {
    transports: ['polling']
});
socket.on('connect', () => {
    console.log('Connected to server');
});
let currentBoard = Array(9).fill('');
let gameActive = true;
const playerSymbol = localStorage.getItem('playerSymbol') || 'X';
const aiSymbol = playerSymbol === 'X' ? 'O' : 'X';
const difficulty = localStorage.getItem('difficulty') || 'easy';

// Debug logs
console.log('Game initialized with:', {
    playerSymbol,
    aiSymbol,
    difficulty
});

document.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

function handleCellClick(e) {
    const index = parseInt(e.target.dataset.index);
    
    if (currentBoard[index] === '' && gameActive) {
        console.log('Player clicked cell:', index);
        makeMove(index, playerSymbol);
        
        if (!checkWinner() && !isBoardFull()) {
            console.log('Requesting AI move...');
            socket.emit('makeMove', {
                board: [...currentBoard],
                difficulty: difficulty,
                playerSymbol: playerSymbol
            });
        }
    }
}

socket.on('connect', () => {
    console.log('Connected to server');
    // If AI goes first, request its move
    if (aiSymbol === 'X' && gameActive && currentBoard.every(cell => cell === '')) {
        console.log('Requesting initial AI move...');
        socket.emit('makeMove', {
            board: [...currentBoard],
            difficulty: difficulty,
            playerSymbol: playerSymbol
        });
    }
});

socket.on('aiMove', (moveIndex) => {
    console.log('Received AI move:', moveIndex);
    if (moveIndex !== undefined && gameActive) {
        setTimeout(() => {
            makeMove(moveIndex, aiSymbol);
            checkWinner();
        }, 500);
    }
});

function makeMove(index, symbol) {
    if (index !== undefined && gameActive && currentBoard[index] === '') {
        console.log('Making move:', { index, symbol });
        currentBoard[index] = symbol;
        const cell = document.querySelector(`[data-index="${index}"]`);
        if (cell) {
            cell.textContent = symbol;
            cell.classList.add(symbol.toLowerCase());
        }
    }
}

function checkWinner() {
    const winCombos = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    for (let combo of winCombos) {
        if (currentBoard[combo[0]] &&
            currentBoard[combo[0]] === currentBoard[combo[1]] &&
            currentBoard[combo[0]] === currentBoard[combo[2]]) {
            gameActive = false;
            setTimeout(() => {
                showNotification(`${currentBoard[combo[0]]} Menang!`);
            }, 100);
            return true;
        }
    }

    if (isBoardFull()) {
        gameActive = false;
        setTimeout(() => {
            showNotification("Permainan Seri!");
        }, 100);
        return true;
    }

    return false;
}

function isBoardFull() {
    return currentBoard.every(cell => cell !== '');
}

function resetGame() {
    console.log('Resetting game...');
    currentBoard = Array(9).fill('');
    gameActive = true;
    
    document.querySelectorAll('.cell').forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o');
    });
    
    closeNotification();
    
    if (aiSymbol === 'X') {
        console.log('Requesting initial AI move after reset...');
        setTimeout(() => {
            socket.emit('makeMove', {
                board: [...currentBoard],
                difficulty: difficulty,
                playerSymbol: playerSymbol
            });
        }, 300);
    }
}

function showNotification(message) {
    const overlay = document.getElementById('notification-overlay');
    const notificationText = document.getElementById('notification-text');
    if (overlay && notificationText) {
        notificationText.textContent = message;
        overlay.classList.remove('hidden');
    }
}

function closeNotification() {
    const overlay = document.getElementById('notification-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

// Initial setup when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded, checking if AI should move first');
    if (aiSymbol === 'X' && gameActive) {
        setTimeout(() => {
            socket.emit('makeMove', {
                board: [...currentBoard],
                difficulty: difficulty,
                playerSymbol: playerSymbol
            });
        }, 300);
    }
});