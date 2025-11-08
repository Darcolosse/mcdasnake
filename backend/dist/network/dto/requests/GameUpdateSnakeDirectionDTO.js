"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameUpdateSnakeDirectionDTO = void 0;
const DTO_1 = require("@network/dto/DTO");
class GameUpdateSnakeDirectionDTO {
    type = DTO_1.DTOType.SnakeTurn;
    direction;
    constructor(data) {
        this.direction = data.direction;
    }
}
exports.GameUpdateSnakeDirectionDTO = GameUpdateSnakeDirectionDTO;
