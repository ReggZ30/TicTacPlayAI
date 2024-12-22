// selection.js
function selectSymbol(symbol) {
    localStorage.setItem('playerSymbol', symbol);
    document.querySelectorAll('.symbol-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.textContent === symbol) {
            btn.classList.add('selected');
        }
    });
}

function startGame() {
    const symbol = localStorage.getItem('playerSymbol') || 'X';
    const difficulty = document.getElementById('difficulty').value;
    localStorage.setItem('difficulty', difficulty);
    window.location.href = 'game.html';
}