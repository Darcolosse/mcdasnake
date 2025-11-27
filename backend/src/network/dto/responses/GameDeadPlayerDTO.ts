import { Death } from "@/entities/Death";
import { DTOType, type DTO } from "@network/dto/DTO";

export class GameDeadPlayerDTO implements DTO {
    type = DTOType.GameDeadPlayer;

    readonly deadPlayerId: string;
    readonly typeDeadPlayer: string;
    readonly killerId: string;
    readonly typeKiller: string;
    readonly reason: string;
    readonly deathMessage: string;

    constructor(deadPlayerId: string, typeDeadPlayer: string, killerId: string, typeKiller: string, reason: string = Death.DEFAULT, deathMessage: string = "") {
        this.deadPlayerId = deadPlayerId;
        this.typeDeadPlayer = typeDeadPlayer;
        this.killerId = killerId;
        this.typeKiller = typeKiller;
        this.reason = reason;
        this.deathMessage = deathMessage;
    }
}
