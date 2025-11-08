"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkManager = void 0;
const ws_1 = require("ws");
const GameManager_1 = require("@game/GameManager");
const DTO_1 = require("@network/dto/DTO");
const GameUpdateDTO_1 = require("@/network/dto/requests/GameUpdateDTO");
const GameAddPlayerDTO_1 = require("@network/dto/requests/GameAddPlayerDTO");
const GameUpdateSnakeDirectionDTO_1 = require("@network/dto/requests/GameUpdateSnakeDirectionDTO");
const ws_2 = require("ws");
const GameRemovePlayerDTO_1 = require("./dto/requests/GameRemovePlayerDTO");
const app_1 = require("@/app");
class NetworkManager {
    gameManager;
    wss;
    clients;
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.wss = null;
        this.clients = new Map();
    }
    createServer(host, port) {
        app_1.logger.info("Initializing websocket service...");
        this.wss = new ws_1.WebSocketServer({
            port: port,
            host: host
        });
        app_1.logger.info(`WebSocket server started on ws://${host}:${port}`);
        this.wss.on('connection', (ws) => {
            const snakeId = GameManager_1.GameManager.generateUUID();
            this.clients.set(snakeId, ws);
            this.emit(snakeId, { type: "Welcome to McdaSnake!" });
            this.register(ws);
            this.closeConnection(ws, snakeId);
            app_1.logger.info(`New client connected: ${snakeId}`);
        });
        app_1.logger.info("Initialized websocket service");
    }
    emit(id, message) {
        const jsonMessage = JSON.stringify(message);
        this.clients.get(id)?.send(jsonMessage);
        app_1.logger.debug(`Sent message to ${id}: ${jsonMessage}`);
    }
    register(ws) {
        ws.on('message', (message) => {
            app_1.logger.debug(`Received message: ${message}`);
            try {
                const json = JSON.parse(message);
                switch (json.type) {
                    case DTO_1.DTOType.GameUpdate:
                        this.executeOnFound(ws, (clientId) => {
                            this.gameManager.handleClientEvent(new GameUpdateDTO_1.GameUpdateDTO(), clientId);
                        });
                        break;
                    case DTO_1.DTOType.AddPlayer:
                        this.executeOnFound(ws, (clientId) => {
                            this.gameManager.handleClientEvent(new GameAddPlayerDTO_1.GameAddPlayerDTO(json), clientId);
                        });
                        break;
                    case DTO_1.DTOType.SnakeTurn:
                        this.executeOnFound(ws, (clientId) => {
                            this.gameManager.handleClientEvent(new GameUpdateSnakeDirectionDTO_1.GameUpdateSnakeDirectionDTO(json), clientId);
                        });
                        break;
                }
            }
            catch (error) {
                app_1.logger.warn("Couldn't read a suspicious or malformed received websocket event", error);
            }
        });
    }
    closeConnection(ws, snakeId) {
        ws.on('close', () => {
            app_1.logger.info(`Client disconnected: ${snakeId}`);
            this.clients.delete(snakeId);
            ws.close();
            this.gameManager.handleClientEvent(new GameRemovePlayerDTO_1.GameRemovePlayerDTO(), snakeId);
        });
    }
    broadcast(data) {
        app_1.logger.debug(`Broadcasting a websocket message...`, data);
        const jsonMessage = JSON.stringify(data);
        this.wss?.clients.forEach(function each(client) {
            if (client.readyState === ws_2.WebSocket.OPEN) {
                client.send(jsonMessage);
            }
        });
    }
    executeOnFound(ws, onFound) {
        for (const [clientId, clientWs] of this.clients) {
            if (clientWs === ws) {
                app_1.logger.debug(`Websocket client found. Ready for processing.`);
                onFound(clientId);
                return;
            }
        }
        app_1.logger.warn(`Websocket client not found in memory. Couldn't process further.`);
    }
}
exports.NetworkManager = NetworkManager;
