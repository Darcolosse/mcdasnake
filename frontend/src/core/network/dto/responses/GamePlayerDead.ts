import { DTOType, type DTO } from "../DTO";

export class GameDeadPlayerResponseDTO implements DTO {
  type = DTOType.GameDeadPlayer;

    readonly deadPlayerId: string;
    readonly typeDeadPlayer: string;
    readonly killerId: string;
    readonly typeKiller: string;
    readonly reason: string;

    constructor(deadPlayerId: string, typeDeadPlayer: string, killerId: string, typeKiller: string, reason: string = "YOU ARE DEAD.") {
        this.deadPlayerId = deadPlayerId;
        this.typeDeadPlayer = typeDeadPlayer;
        this.killerId = killerId;
        this.typeKiller = typeKiller;
        this.reason = reason;
    }
}