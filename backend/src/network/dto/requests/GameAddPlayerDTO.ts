import { DTOType, type DTO } from "@network/dto/DTO";

export class GameAddPlayerDTO implements DTO {
  type = DTOType.GameAddPlayer;

  public name: string;

  constructor(data: any) {
    this.name = data.name;
  }
}
