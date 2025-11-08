"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.API = void 0;
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const app_1 = require("./app");
class API {
    app;
    prisma = new client_1.PrismaClient();
    constructor() {
        this.app = (0, express_1.default)();
        this.prisma = new client_1.PrismaClient();
    }
    // ===================== Management layer ====================== \\
    start(hostIP, portAPI) {
        this.app.listen(portAPI, hostIP, () => app_1.logger.info(`McdaSnakeAPI available at http://${hostIP}:${portAPI}`));
    }
    registeringAllRoutes() {
        this.baseRoute();
        this.healthRoute();
        this.scoreboardRoutes();
        this.userNameScoreboardRoute();
        this.scoreboardByIdRoute();
        app_1.logger.debug("API Routes registered");
    }
    // ========================== Private =========================== \\
    baseRoute() {
        this.app.get('/', async (_req, res) => {
            res.send('Welcome to McdaSnake API');
            app_1.logger.debug("Sending response for base route requested");
        });
    }
    healthRoute() {
        this.app.get('/health', async (_req, res) => {
            res.send('Service is healthy');
            app_1.logger.debug("Sending response for health route requested");
        });
    }
    scoreboardRoutes() {
        this.app.get('/scoreboard', async (_req, res) => {
            app_1.logger.debug("Retrieving scoreboard from database");
            const scoreboard = await this.prisma.scoreBoard.findMany({});
            res.send(scoreboard);
            app_1.logger.debug("Sending response for general scoreboard request");
        });
    }
    userNameScoreboardRoute() {
        this.app.get('/scoreboard/:userName', async (req, res) => {
            const name = req.params.userName;
            app_1.logger.debug("Retrieving username based scoreboard from database");
            const scoreboard = await this.prisma.scoreBoard.findMany({
                where: {
                    userName: { contains: name }
                },
            });
            res.send(scoreboard);
            app_1.logger.debug("Sending response for username based scoreboard request");
        });
    }
    scoreboardByIdRoute() {
        this.app.get('/scoreboard/:id', async (req, res) => {
            const id = req.params.id;
            app_1.logger.debug("Retrieving id based scoreboard from database");
            const scoreboard = await this.prisma.scoreBoard.findUnique({
                where: {
                    id: id
                },
            });
            res.send(scoreboard);
            app_1.logger.debug("Sending response for id based scoreboard request");
        });
    }
}
exports.API = API;
