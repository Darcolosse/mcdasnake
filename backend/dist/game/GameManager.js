"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameManager = exports.Buffers = void 0;
const NetworkManager_1 = require("@network/NetworkManager");
const Game_1 = require("@game/Game");
const DTO_1 = require("@network/dto/DTO");
const crypto_1 = require("crypto");
const GameScheduler_1 = require("@game/GameScheduler");
const client_1 = require("@prisma/client");
const app_1 = require("@/app");
exports.Buffers = {
    TURN_BUFFER: 'TB',
    CONNECTION_BUFFER: 'CB',
    DECONNECTION_BUFFER: 'DB',
};
class GameManager {
    networkManager;
    game;
    gameScheduler;
    db;
    buffers = {
        TURN_BUFFER: [],
        CONNECTION_BUFFER: [],
        DECONNECTION_BUFFER: [],
    };
    constructor(host, port) {
        app_1.logger.debug(`Creating websocket server on IP ${String(process.env.BACKEND_IP)} PORT ${Number(process.env.BACKEND_PORT)} in game manager initialization`);
        this.networkManager = new NetworkManager_1.NetworkManager(this);
        this.networkManager.createServer(host, port);
        app_1.logger.debug(`Starting prisma client in game manager initialization`);
        this.db = new client_1.PrismaClient();
        this.game = new Game_1.Game([Number(process.env.GRID_COLS), Number(process.env.GRID_ROWS)], this.db);
        this.gameScheduler = new GameScheduler_1.GameScheduler(this, this.game);
    }
    // ===================== Management layer ====================== \\
    start() {
        app_1.logger.info("Starting game manager");
        this.gameScheduler.start();
    }
    handleGameEvent(eventDTO, id = '') {
        switch (eventDTO.type) {
            case DTO_1.DTOType.GameRefresh:
                app_1.logger.debug("Broadcasting", JSON.stringify(eventDTO));
                this.networkManager.broadcast(eventDTO);
                break;
            case DTO_1.DTOType.GameUpdate:
                this.networkManager.emit(id, eventDTO);
                app_1.logger.debug("Sent game update response to", id);
                break;
            default:
                app_1.logger.warn("Game tried to send to ws " + id + " a suspicious websocket:", eventDTO.type);
        }
    }
    handleClientEvent(eventDTO, id = '') {
        app_1.logger.debug('GameManager received a new client event', eventDTO);
        const event = { id: id, dto: eventDTO };
        switch (eventDTO.type) {
            case DTO_1.DTOType.AddPlayer:
                this.buffers.CONNECTION_BUFFER.push(event);
                this.networkManager.emit(id, this.game.getState());
                app_1.logger.debug('Pushed event in connection buffer');
                break;
            case DTO_1.DTOType.GameUpdate:
                this.networkManager.emit(id, this.game.getState());
                app_1.logger.debug('Emitting back the current game state');
                break;
            case DTO_1.DTOType.SnakeTurn:
                this.buffers.TURN_BUFFER.push(event);
                app_1.logger.debug('Pushed event in the turn buffer');
                break;
            case DTO_1.DTOType.RemovePlayer:
                this.buffers.DECONNECTION_BUFFER.push(event);
                app_1.logger.debug('Pushed event in deconnection buffer');
                break;
            default:
                app_1.logger.warn("Client " + id + " sent to server a suspicious websocket:", eventDTO.type);
        }
    }
    popBuffer(buffer) {
        let popped = [];
        this.getBuffer(buffer, (events) => {
            popped = events.splice(0, events.length);
        });
        return popped;
    }
    // =========================== Utils =========================== \\
    static generateUUID() {
        app_1.logger.debug("Generating a new UUID");
        return (0, crypto_1.randomUUID)();
    }
    // ========================== Private =========================== \\
    getBuffer(buffer, onFound) {
        switch (buffer) {
            case exports.Buffers.TURN_BUFFER:
                onFound(this.buffers.TURN_BUFFER);
                break;
            case exports.Buffers.CONNECTION_BUFFER:
                onFound(this.buffers.CONNECTION_BUFFER);
                break;
            case exports.Buffers.DECONNECTION_BUFFER:
                onFound(this.buffers.DECONNECTION_BUFFER);
                break;
            default:
                app_1.logger.warn("Couldn't retrieve a buffer from its enum on tick.");
        }
    }
}
exports.GameManager = GameManager;
