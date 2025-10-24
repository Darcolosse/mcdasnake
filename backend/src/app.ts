import express from 'express';

import { GameManager } from '@game/GameManager';


const portAPI: number = 5000;
const port: number = 5001;

const gameManager: GameManager = new GameManager(port);


const app = express();


app.get('/health', async (req, res) => {
  res.send('Service is healthy');
});

app.listen(portAPI, () => console.log(`McdaSnakeAPI available at http://localhost:${portAPI}`));

