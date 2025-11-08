"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameScoreBoardDTO = void 0;
const DTO_1 = require("@network/dto/DTO");
class GameScoreBoardDTO {
    type = DTO_1.DTOType.GameScoreBoard;
    scoreBoard;
    constructor(scoreBoard) {
        this.scoreBoard = scoreBoard;
    }
}
exports.GameScoreBoardDTO = GameScoreBoardDTO;
