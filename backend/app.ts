import { WebSocketServer } from 'ws';
import WebSocket from 'ws';
import express from 'express';
import { randomUUID } from 'crypto';

import { Game } from './Game.ts';
import { Snake } from './Snake.ts';
import { Apple } from './Apple.ts';


const portAPI: number = 5000;
const port: number = 5001;

const game: Game = new Game();
const wss = new WebSocketServer({ port: port });

wss.on('connection', (ws: WebSocket, req: any) => {
  const snakeId = randomUUID();
  const snake = new Snake(snakeId, [[0, 0]], 'RIGHT');
  game.addSnake(snake);
  game.addClientSocket(snakeId, ws);
  console.log(`New client connected: ${snakeId} from ${req.socket.remoteAddress}`);

  ws.on('message', (message: string) => {
    console.log(`Received message from ${snakeId}: ${message}`);
    // Here you can handle messages from the client
  });

  ws.on('close', () => {  
    console.log(`Client disconnected: ${snakeId}`);
    game.removeSnake(snakeId);
    game.removeClientSocket(snakeId);
  });
});



const app = express();


app.get('/health', async (req, res) => {
  res.send('Service is healthy');
});

app.listen(portAPI, () => console.log(`McdaSnakeAPI available at http://localhost:${portAPI}`));

