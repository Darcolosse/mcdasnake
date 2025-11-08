"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameScheduler = void 0;
const GameRefreshResponseDTO_1 = require("@network/dto/responses/GameRefreshResponseDTO");
const GameManager_1 = require("@game/GameManager");
class GameScheduler {
    game;
    gameManager;
    gameLoop;
    tickCount;
    constructor(gameManager, game) {
        this.gameManager = gameManager;
        this.game = game;
    }
    // ====================== Vertical layer ======================= \\
    start() {
        this.tickCount = 0;
        this.gameLoop = setInterval(this.onTick.bind(this), Number(process.env.GAME_TICKRATE_MS));
    }
    stop() {
        clearInterval(this.gameLoop);
    }
    // ===================== Management layer ====================== \\
    onTick() {
        this.tickCount += Number(process.env.GAME_TICKRATE_MS);
        // ### Game refresh barebone ###
        const gameRefresh = new GameRefreshResponseDTO_1.GameRefreshResponseDTO();
        // #                 #
        // # Realtime events #
        // #                 #
        this.gameManager.popBuffer(GameManager_1.Buffers.CONNECTION_BUFFER).forEach((connection) => {
            const snake = this.game.addSnake(connection.id, connection.dto.name);
            gameRefresh.entities.snakes.push(snake);
        });
        this.gameManager.popBuffer(GameManager_1.Buffers.DECONNECTION_BUFFER).forEach((deconnection) => {
            this.game.removeSnake(deconnection.id);
            gameRefresh.entities.removed.push(deconnection.id);
        });
        // #                  #
        // # Bonus generation #
        // #                  #
        this.game.processGenerateBonus(gameRefresh);
        // #           #
        // # Game step #
        // #           #
        if (this.tickCount % Number(process.env.GAME_SPEED_MS) == 0) {
            this.onGameStep(gameRefresh);
        }
        // #                        #
        // # Notifying game refresh #
        // #                        #
        if (!gameRefresh.isEmpty()) {
            this.gameManager.handleGameEvent(gameRefresh);
        }
    }
    onGameStep(gameRefresh) {
        this.gameManager.popBuffer(GameManager_1.Buffers.TURN_BUFFER).forEach((event) => {
            this.game.updateDirection(event.id, event.dto.direction);
        });
        this.game.processMove(gameRefresh);
        this.game.processCollisions(gameRefresh);
    }
}
exports.GameScheduler = GameScheduler;
