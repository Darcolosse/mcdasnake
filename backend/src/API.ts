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
    this.healthRoute();
    this.scoreboardRoutes();
    this.userNameScoreboardRoute();
    this.scoreboardByIdRoute();
    logger.debug("API Routes registered");
  }

  // ========================== Private =========================== \\


  private healthRoute() {
    this.app.get('/health', async (_req, res) => {
      res.send('Service is healthy');
      logger.debug("Sending response for health route requested");
    });
  }

  private scoreboardRoutes() {
      this.app.get('/scoreboard', async (_req, res) => {
        logger.debug("Retrieving scoreboard from database");
        const scoreboard = await this.prisma.scoreBoard.findMany({});
        res.send(scoreboard);
        logger.debug("Sending response for general scoreboard request");
      });
  }

  private userNameScoreboardRoute() {
    this.app.get('/scoreboard/:userName', async (req, res) => {
      const name = req.params.userName;
      logger.debug("Retrieving username based scoreboard from database");
      const scoreboard = await this.prisma.scoreBoard.findMany({
        where:
        {
          userName: { contains: name }
        },
      });
      res.send(scoreboard);
      logger.debug("Sending response for username based scoreboard request");
    });
  }

  private scoreboardByIdRoute() {
    this.app.get('/scoreboard/:id', async (req, res) => {
      const id = parseInt(req.params.id);
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
