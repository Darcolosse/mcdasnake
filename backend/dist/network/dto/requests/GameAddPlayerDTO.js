"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameAddPlayerDTO = void 0;
const DTO_1 = require("@network/dto/DTO");
class GameAddPlayerDTO {
    type = DTO_1.DTOType.AddPlayer;
    name;
    constructor(data) {
        this.name = data.name;
    }
}
exports.GameAddPlayerDTO = GameAddPlayerDTO;
