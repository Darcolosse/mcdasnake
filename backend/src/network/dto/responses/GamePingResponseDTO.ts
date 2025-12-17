import { DTOType, type DTO } from "@network/dto/DTO";

export class GamePingResponseDTO implements DTO {
  type = DTOType.GamePing;
  time: Number;

  constructor(time: Number) {
    this.time = time;
  }
}
