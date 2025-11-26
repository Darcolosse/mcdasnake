import { DTOType, type DTO } from "../DTO";

export class GameDeadPlayerResponseDTO implements DTO {
  type = DTOType.GameDeadPlayer;

    readonly deadPlayerId: string;
    readonly typeDeadPlayer: string;
    readonly killerId: string;
    readonly typeKiller: string;
    readonly reason: string;
    readonly deathMessage: string;

    constructor(json: any) {
        this.deadPlayerId = json.deadPlayerId;
        this.typeDeadPlayer = json.typeDeadPlayer;
        this.killerId = json.killerId;
        this.typeKiller = json.typeKiller;
        this.reason = json.reason;
        this.deathMessage = json.deathMessage;
    }
}