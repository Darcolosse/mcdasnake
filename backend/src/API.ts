import { Express } from 'express';
import express from 'express';

import { PrismaClient } from '@prisma/client';
import { logger } from './app';


export class API {
  private readonly app: Express;
  private readonly prisma: PrismaClient = new PrismaClient();

  constructor() {
    this.app = express();
    this.prisma = new PrismaClient();
  }

  // ===================== Management layer ====================== \\

  public start(hostIP: string, portAPI: number) {
    this.app.listen(portAPI, hostIP, () => logger.info(`McdaSnakeAPI available at http://${hostIP}:${portAPI}`));
  }

  public registeringAllRoutes() {
    this.baseRoute();
    this.healthRoute();
    this.scoreboardRoutes();
    this.topScoresRoute();
    this.userNameScoreboardRoute();
    this.scoreboardByIdRoute();
    logger.debug("API Routes registered");
  }

  // ========================== Private =========================== \\

  private baseRoute() {
    this.app.get('/', async (_req, res) => {
      res.send('Welcome to McdaSnake API');
      logger.debug("Sending response for base route requested");
    });
  }

  private healthRoute() {
    this.app.get('/health', async (_req, res) => {
      res.send('Service is healthy');
      logger.debug("Sending response for health route requested");
    });
  }

  private scoreboardRoutes() {
    this.app.get('/scoreboard', async (req, res) => {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      logger.debug("Retrieving scoreboard from database");
      const scoreboard = await this.prisma.scoreBoard.findMany({
        take: limit,
        orderBy: {
          score: 'desc',
        },
      });
      res.send(scoreboard);
      logger.debug("Sending response for general scoreboard request");
    });
  }

  private userNameScoreboardRoute() {
    this.app.get('/scoreboard/:userName', async (req, res) => {
      const name = req.params.userName;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      logger.debug(`Retrieving scoreboard for username "${name}" from database`);
      const scoreboard = await this.prisma.scoreBoard.findMany({
        where: {
          userName: { contains: name }
        },
        take: limit,
        orderBy: {
          score: 'desc',
        },
      });

      res.send(scoreboard);
      logger.debug(`Sending response for username "${name}" based scoreboard request`);
    });
  }

  private topScoresRoute() {
    this.app.get('/scoreboard/top', async (_req, res) => {
      logger.debug("Retrieving top 10 scores from database");
      const topScores = await this.prisma.scoreBoard.findMany({
        take: 10,
        orderBy: {
          score: 'desc',
        },
      });
      res.send(topScores);
      logger.debug("Sending response for top 10 scores request");
    });
  }

  private scoreboardByIdRoute() {
    this.app.get('/scoreboard/:id', async (req, res) => {
      const id = req.params.id;
      logger.debug("Retrieving id based scoreboard from database");
      const scoreboard = await this.prisma.scoreBoard.findUnique({
        where:
        {
          id: id
        },
      });
      res.send(scoreboard);
      logger.debug("Sending response for id based scoreboard request");
    });
  }
}
