const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let gameState = Array(9).fill(null);
let isCircleTurn = false;

const broadcastGameState = () => {
    const state = {
        type: 'gameState',
        gameState,
        currentPlayer: isCircleTurn ? 'circle' : 'x'
    };
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(state));
        }
    });
};

wss.on('connection', (ws) => {
    console.log('New client connected');
    broadcastGameState();

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        switch (data.type) {
            case 'makeMove':
                if (gameState[data.index] === null) {
                    gameState[data.index] = isCircleTurn ? 'circle' : 'x';
                    if (checkForWin(isCircleTurn ? 'circle' : 'x')) {
                        broadcastGameState();
                        wss.clients.forEach((client) => {
                            if (client.readyState === WebSocket.OPEN) {
                                client.send(JSON.stringify({ type: 'endGame', winner: isCircleTurn ? 'circle' : 'x' }));
                            }
                        });
                        gameState = Array(9).fill(null);
                    } else if (gameState.every(cell => cell !== null)) {
                        broadcastGameState();
                        wss.clients.forEach((client) => {
                            if (client.readyState === WebSocket.OPEN) {
                                client.send(JSON.stringify({ type: 'endGame', isDraw: true }));
                            }
                        });
                        gameState = Array(9).fill(null);
                    } else {
                        isCircleTurn = !isCircleTurn;
                        broadcastGameState();
                    }
                }
                break;

            case 'startGame':
                gameState = Array(9).fill(null);
                isCircleTurn = false;
                broadcastGameState();
                break;

            case 'restartGame':
                gameState = Array(9).fill(null);
                isCircleTurn = false;
                broadcastGameState();
                break;
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

const checkForWin = (player) => {
    const winCombinations = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];
    return winCombinations.some((combination) => {
        return combination.every((index) => {
            return gameState[index] === player;
        });
    });
};

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
