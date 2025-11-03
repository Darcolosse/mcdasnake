import { Express } from 'express';
import express from 'express';

import { PrismaClient } from '@prisma/client';


export class API {
    private readonly app: Express;
    private readonly prisma: PrismaClient = new PrismaClient();

    constructor() {
        this.app = express();
        this.prisma = new PrismaClient();
        this.healthRoute();
        this.scoreboardRoutes();
        this.userNameScoreboardRoute();
        this.scoreboardByIdRoute();

    }

    public start(hostIP: string, portAPI: number) {
        this.app.listen(portAPI, hostIP, () => console.log(`McdaSnakeAPI available at http://${hostIP}:${portAPI}`));
    }

    private healthRoute() {
        this.app.get('/health', async (_req, res) => {
            res.send('Service is healthy');
        });
    }

    private scoreboardRoutes() {
        this.app.get('/scoreboard', async (_req, res) => {
            const scoreboard = await this.prisma.scoreBoard.findMany({});
            res.send(scoreboard);
        });
    }

    private userNameScoreboardRoute() {
        this.app.get('/scoreboard/:userName', async (req, res) => {
            const name = req.params.userName;
            const scoreboard = await this.prisma.scoreBoard.findMany({
                where:
                {
                    userName: { contains: name }
                },
            });
            res.send(scoreboard);
        });
    }

    private scoreboardByIdRoute() {
        this.app.get('/scoreboard/:id', async (req, res) => {
            const id = parseInt(req.params.id);
            const scoreboard = await this.prisma.scoreBoard.findUnique({
                where:
                {
                    id: id
                },
            });
            res.send(scoreboard);
        });
    }
}