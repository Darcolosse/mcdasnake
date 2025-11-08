"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameRefreshResponseDTO = void 0;
const DTO_1 = require("@network/dto/DTO");
class GameRefreshResponseDTO {
    type = DTO_1.DTOType.GameRefresh;
    entities;
    scoreBoard;
    constructor(snakes = [], apples = [], removed = [], scoreBoard = new Map()) {
        this.entities = { snakes: snakes, apples: apples, removed: removed };
        this.scoreBoard = scoreBoard;
    }
    isEmpty() {
        return this.entities.snakes.length === 0 && this.entities.apples.length === 0 && this.entities.removed.length === 0;
    }
}
exports.GameRefreshResponseDTO = GameRefreshResponseDTO;
