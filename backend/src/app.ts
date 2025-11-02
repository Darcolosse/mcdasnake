import express from 'express';

import { GameManager } from '@game/GameManager';
import { PrismaClient } from '@prisma/client';


const portAPI: number = 5000;
const port: number = 5001;

const gameManager = new GameManager(port);
gameManager.start();


const app = express();
const prisma = new PrismaClient();


app.get('/health', async (_req, res) => {
  res.send('Service is healthy');
});

app.get('/scoreboard', async (_req, res) => {
  const scoreboard = await prisma.scoreBoard.findMany({});
  res.send(scoreboard);
});

app.get('/scoreboard/:userName', async (req, res) => {
  const name = req.params.userName;
  const scoreboard = await prisma.scoreBoard.findMany({
    where:
      { 
      userName: { contains: name } 
      },
    });
  res.send(scoreboard);
});

app.get('/scoreboard/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const scoreboard = await prisma.scoreBoard.findUnique({
    where:
      { 
      id: id 
      },
    });
  res.send(scoreboard);
});

app.listen(portAPI, () => console.log(`McdaSnakeAPI available at http://localhost:${portAPI}`));

