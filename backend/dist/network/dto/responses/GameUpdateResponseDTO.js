"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameUpdateResponseDTO = void 0;
const DTO_1 = require("@network/dto/DTO");
class GameUpdateResponseDTO {
    type = DTO_1.DTOType.GameUpdate;
    gridSize;
    speed;
    entities;
    scoreBoard;
    constructor(snakes, apples, gridSize, speed, scoreBoard) {
        this.gridSize = gridSize;
        this.speed = speed;
        this.entities = { snakes: snakes, apples: apples };
        this.scoreBoard = scoreBoard;
    }
}
exports.GameUpdateResponseDTO = GameUpdateResponseDTO;
