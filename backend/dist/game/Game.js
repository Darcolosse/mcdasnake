"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const Snake_1 = require("@entities/Snake");
const Apple_1 = require("@entities/Apple");
const GameManager_1 = require("@game/GameManager");
const GameUpdateResponseDTO_1 = require("@network/dto/responses/GameUpdateResponseDTO");
const ScoreBoard_1 = require("@game/ScoreBoard");
const app_1 = require("@/app");
class Game {
    rows;
    cols;
    snakes;
    apples;
    scoreBoard;
    sessionId;
    maxBonus;
    constructor(size, db) {
        app_1.logger.info("Initializing a new game session...");
        this.cols = size[0];
        this.rows = size[1];
        this.snakes = new Map();
        this.apples = new Map();
        this.sessionId = GameManager_1.GameManager.generateUUID();
        app_1.logger.info("Creating a scoreboard in base for the game session...");
        this.scoreBoard = new ScoreBoard_1.ScoreBoard(db);
        this.scoreBoard.createGameSession(this.sessionId);
        this.maxBonus = (this.cols * this.rows) * (Number(process.env.BONUS_PERCENTAGE_MAX) / 100);
        app_1.logger.info("Initialized successfully a new game on session id " + this.sessionId + " with max bonus set to " + this.maxBonus);
    }
    // ==================== Available Actions ====================== \\
    // ### SNAKES ###
    addSnake(snakeId, name) {
        app_1.logger.debug("Adding a new snake in game for player '" + name + "'...");
        const newSnake = new Snake_1.Snake(snakeId, name, this.generateRandomSpawn(Number(process.env.SNAKE_SPAWNING_LENGTH), 100 / 3, 200 / 3), process.env.SNAKE_SPAWNING_DIRECTION);
        app_1.logger.info("Spawing a snake on " + newSnake.cases + " for player " + name);
        app_1.logger.info("Creating an empty score in the scoreboard for the player '" + name + "'...");
        this.snakes.set(snakeId, newSnake);
        this.scoreBoard.createScore(snakeId, name, this.sessionId);
        return newSnake;
    }
    removeSnake(id) {
        app_1.logger.info("Deleting snake of id " + id);
        this.snakes.delete(id);
    }
    updateDirection(snakeId, direction) {
        this.snakes.get(snakeId)?.setDirection(direction);
    }
    // ### COMMON ###
    getState() {
        app_1.logger.debug("Retrieving game state in a dto");
        return new GameUpdateResponseDTO_1.GameUpdateResponseDTO(Array.from(this.snakes.values()), Array.from(this.apples.values()), [this.cols, this.rows], Number(process.env.GAME_SPEED_MS), this.scoreBoard.getAllScores());
    }
    getSize() {
        return [this.cols, this.rows];
    }
    // ### GAME EVENTS ###
    processGenerateBonus(gameRefresh) {
        app_1.logger.debug("Generating bonus...");
        const random = Math.random();
        if (this.snakes.size > 0 && this.apples.size < this.maxBonus) {
            if (random <= Number(process.env.BONUS_PROBABILITY_SPAWN_APPLE)) {
                let uuid = GameManager_1.GameManager.generateUUID();
                gameRefresh.entities.apples.push(this.addApple(uuid));
            }
        }
        app_1.logger.debug("Generated bonus");
    }
    processMove(gameRefresh) {
        app_1.logger.debug("Moving snakes...");
        this.snakes.forEach(snake => snake.move(this.apples, gameRefresh));
        app_1.logger.debug("Moved snakes");
    }
    processCollisions(gameRefresh) {
        app_1.logger.debug("Checking collisions...");
        const map = new Map();
        this.apples.forEach(apple => map.set(JSON.stringify(apple.getHead()), apple));
        this.snakes.forEach(snake => this.checkCollisions(snake, map, (entityCollided) => {
            app_1.logger.debug("Snake collided with an entity");
            if (entityCollided instanceof Apple_1.Apple) {
                const eaten_apple = entityCollided;
                this.removeApple(eaten_apple.id);
                app_1.logger.info(snake.name + " ate an apple. Current length of " + snake.cases.length);
                app_1.logger.debug("Snake on id " + snake.id + " ate apple on id " + eaten_apple.id);
                gameRefresh.entities.removed.push(eaten_apple.id);
                app_1.logger.debug("Updating database score of snake " + snake.name);
                this.scoreBoard.updateScore(snake.id, 100, 0, 1);
            }
            else if (entityCollided instanceof Snake_1.Snake) {
                const collided_snake = entityCollided;
                app_1.logger.debug("Snake on id " + snake.id + " was killed by " + collided_snake.id);
                if (!snake.dead) {
                    app_1.logger.info(snake.name + " died from " + collided_snake.name + ". Last registered length of " + snake.cases.length);
                    app_1.logger.debug("Updating database score of snake " + snake.name);
                    this.scoreBoard.updateScore(snake.id, 1000, 1, 0);
                }
                snake.dead = true;
                gameRefresh.entities.removed.push(snake.id);
            }
            else {
                app_1.logger.warn("Couldn't figure what snake on id " + snake.id + " and name " + snake.name + " collided. Game state on tick unstable.");
            }
        }));
        app_1.logger.debug("Checked collisions");
    }
    // ======================== Collisions ========================= \\
    checkCollisions(element, entityMap, onCollision) {
        const isEntity = element.id;
        const cases = isEntity ? element.cases : element;
        cases.forEach((_case) => {
            const key = this.createCollideKey(_case);
            const entityAtKey = entityMap.get(key);
            if (entityAtKey) {
                onCollision(entityAtKey);
            }
            else {
                if (isEntity) {
                    entityMap.set(key, element);
                }
            }
        });
    }
    buildMap(includeApples, includeSnakes) {
        const map = new Map();
        if (includeApples)
            this.apples.forEach(apple => map.set(this.createCollideKey(apple.getHead()), apple));
        if (includeSnakes)
            this.snakes.forEach(snake => snake.cases.forEach(_case => map.set(this.createCollideKey(_case), snake)));
        return map;
    }
    createCollideKey(_case) {
        return `[${_case[0]},${_case[1]}]`;
    }
    // ========================== Random =========================== \\
    generateRandomSpawn(length, minPercentage = 100, maxPercentage = 100) {
        let success = false;
        let cases = [];
        const map = this.buildMap(true, true);
        while (!success) {
            cases = this.generateRandomSpawnUnchecked(length, minPercentage, maxPercentage);
            success = true;
            this.checkCollisions(cases, map, (_) => success = false);
        }
        return cases;
    }
    generateRandomSpawnUnchecked(length, minPercentage, maxPercentage) {
        const cases = [[this.random(true, minPercentage, maxPercentage), this.random(false, minPercentage, maxPercentage)]];
        for (let _ = 1; _ < length; _++) {
            const lastCase = cases[cases.length - 1];
            cases.push([lastCase[0], lastCase[1] + 1]);
        }
        return cases;
    }
    random(x_axis, minPercentage = 100, maxPercentage = 100) {
        const ref = x_axis ? this.cols : this.rows;
        const upperBound = Math.round(ref * maxPercentage / 100);
        const lowerBound = Math.round(minPercentage == 100 ? 0 : ref * minPercentage / 100);
        return Math.floor(Math.random() * (upperBound - lowerBound)) + lowerBound;
    }
    // ========================= Private =========================== \\
    // ### APPLES ###
    addApple(id) {
        app_1.logger.debug("Adding a new apple in game");
        const newApple = new Apple_1.Apple(id, this.generateRandomSpawn(1));
        app_1.logger.info("Spawing an apple on " + newApple.cases[0]);
        this.apples.set(id, newApple);
        return newApple;
    }
    removeApple(id) {
        app_1.logger.debug("Deleting apple of id " + id);
        this.apples.delete(id);
    }
}
exports.Game = Game;
