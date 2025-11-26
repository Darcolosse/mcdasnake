import { DTOType, type DTO } from "@network/dto/DTO";

export class GameAddPlayerDTO implements DTO {
  type = DTOType.AddPlayer;

  public name: string;
  public design: string;

  constructor(data: any) {
    this.name = data.name;
    this.design = data.design;
  }
}
