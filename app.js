const express = require('express');
const app = express();
const http = require('http').createServer(app);
const server = http.createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    transports: ['polling', 'websocket']  // Tambahkan fallback ke polling
});
const path = require('path');

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/selection.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'selection.html'));
});
app.get('/game.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'game.html'));
});

io.on('connection', (socket) => {
    console.log('User connected');

    socket.on('makeMove', (data) => {
        console.log('Received move request:', data);
        const { board, difficulty, playerSymbol } = data;
        socket.emit('aiMove');
        let nextMove;

        switch(difficulty) {
            case 'easy':
                nextMove = makeEasyMove(board);
                break;
            case 'medium':
                nextMove = makeMediumMove(board);
                break;
            case 'hard':
                nextMove = minimaxMove(board, playerSymbol === 'X' ? 'O' : 'X');
                break;
            default:
                nextMove = makeEasyMove(board);
        }

        console.log('AI chose move:', nextMove);
        socket.emit('aiMove', nextMove);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

function makeEasyMove(board) {
    const emptySpots = [];
    for (let i = 0; i < board.length; i++) {
        if (board[i] === '') {
            emptySpots.push(i);
        }
    }
    if (emptySpots.length === 0) return undefined;
    return emptySpots[Math.floor(Math.random() * emptySpots.length)];
}

function makeMediumMove(board) {
    if (Math.random() < 0.5) {
        return makeEasyMove(board);
    } else {
        return getBestMove(board, 'O');
    }
}

function minimaxMove(board, player) {
    return getBestMove(board, player);
}

function getBestMove(board, player) {
    // Get available moves
    const availableMoves = [];
    for (let i = 0; i < board.length; i++) {
        if (board[i] === '') {
            availableMoves.push(i);
        }
    }

    // Check for winning move
    for (let move of availableMoves) {
        const boardCopy = [...board];
        boardCopy[move] = player;
        if (checkWin(boardCopy, player)) {
            return move;
        }
    }

    // Check for blocking opponent's winning move
    const opponent = player === 'X' ? 'O' : 'X';
    for (let move of availableMoves) {
        const boardCopy = [...board];
        boardCopy[move] = opponent;
        if (checkWin(boardCopy, opponent)) {
            return move;
        }
    }

    // Try to take center
    if (board[4] === '') {
        return 4;
    }

    // Take random corner
    const corners = [0, 2, 6, 8].filter(i => board[i] === '');
    if (corners.length > 0) {
        return corners[Math.floor(Math.random() * corners.length)];
    }

    // Take random side
    const sides = [1, 3, 5, 7].filter(i => board[i] === '');
    if (sides.length > 0) {
        return sides[Math.floor(Math.random() * sides.length)];
    }

    // Take any available move
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

function checkWin(board, player) {
    const winCombos = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6] // Diagonals
    ];

    return winCombos.some(combo => {
        return combo.every(pos => board[pos] === player);
    });
}

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});