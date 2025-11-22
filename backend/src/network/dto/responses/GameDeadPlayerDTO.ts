import { DTOType, type DTO } from "@network/dto/DTO";

export class GameDeadPlayerDTO implements DTO {
    type = DTOType.GameDeadPlayer;

    readonly playerId: string;
    readonly reason: string;

    constructor(playerId: string, reason: string = "YOU ARE DEAD.") {
        this.playerId = playerId;
        this.reason = reason;
    }
}
