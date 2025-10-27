import { DTOType, type DTO } from "@network/dto/DTO";

export class GameAddPlayerDTO implements DTO {
  type = DTOType.AddPlayer;

  public name: string;

  constructor(data: any) {
    this.name = data.name;
  }
}
