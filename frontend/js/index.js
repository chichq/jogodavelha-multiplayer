const allCell = document.querySelectorAll('.cell');
const board = document.querySelector('.board');
const winMessageTxt = document.querySelector('.winMessageTxt');
const winnerMessage = document.querySelector('.winnerMessage');
const restartBtn = document.querySelector('.restartBtn');
const startGameBtn = document.querySelector('#startGameBtn');
const currentPlayerSpan = document.querySelector('#currentPlayer');

const ws = new WebSocket('ws://localhost:3000');

let isCircleTurn;
let gameState;

ws.onopen = () => {
    console.log('Connected to the server');
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'gameState') {
        startGame(data);
    } else if (data.type === 'endGame') {
        endGame(data.isDraw, data.winner);
    }
};

const startGame = (state) => {
    isCircleTurn = state.currentPlayer === 'circle';
    gameState = state.gameState;

    allCell.forEach((cell, index) => {
        cell.classList.remove('circle', 'x');
        if (gameState[index]) {
            cell.classList.add(gameState[index]);
        }
        cell.removeEventListener('click', handleClick);
        cell.addEventListener('click', handleClick, { once: true });
    });

    setBoardHoverclass();
    winnerMessage.classList.remove('showWinnerMessage');
    updateCurrentPlayerDisplay();
}

const endGame = (isDraw, winner) => {
    if (isDraw) {
        winMessageTxt.innerText = 'Empate!';
    } else {
        winMessageTxt.innerText = winner === 'circle' ? 'O Venceu!' : 'X Venceu!';
    }

    winnerMessage.classList.add('showWinnerMessage');
}

const setBoardHoverclass = () => {
    board.classList.remove('circle', 'x');

    if (isCircleTurn) {
        board.classList.add('circle');
    } else {
        board.classList.add('x');
    }
    updateCurrentPlayerDisplay();
}

const updateCurrentPlayerDisplay = () => {
    currentPlayerSpan.innerText = isCircleTurn ? 'O' : 'X';
}

const handleClick = (e) => {
    const cell = e.target;
    const index = [...allCell].indexOf(cell);

    if (gameState[index] === null) {
        ws.send(JSON.stringify({ type: 'makeMove', index }));
    }
}

restartBtn.addEventListener('click', () => {
    ws.send(JSON.stringify({ type: 'restartGame' }));
});
