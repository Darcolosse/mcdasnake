import { DTOType, type DTO } from "@network/dto/DTO";

export class GamePingDTO implements DTO {
  type = DTOType.GamePing;
  constructor() {}
}
