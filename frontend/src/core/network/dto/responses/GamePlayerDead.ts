import { DTOType, type DTO } from "../DTO";

export class GameDeadPlayerResponseDTO implements DTO {
  type = DTOType.GameDeadPlayer;

  readonly playerId: string;
  readonly reason: string;

  constructor(json: any) {
    this.playerId = json.playerId;
    this.reason = json.reason;
  }
}
