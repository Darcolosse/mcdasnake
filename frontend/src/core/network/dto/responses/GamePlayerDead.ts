import { DTOType, type DTO } from "../DTO";

export class GameDeadPlayerResponseDTO implements DTO {
  type = DTOType.GameDeadPlayer;

  readonly entityId: string;
  readonly reason: string;
  readonly typeDeadPlayer: string;
  readonly killerId: string;
  readonly typeKiller: string;
  readonly deathMessage: string;

  constructor(json: any) {
    this.entityId = json.deadPlayerId;
    this.reason = json.reason;
    this.typeDeadPlayer = json.typeDeadPlayer;
    this.killerId = json.killerId;
    this.typeKiller = json.typeKiller;
    this.deathMessage = json.deathMessage;
  }
}
