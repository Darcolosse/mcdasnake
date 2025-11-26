import { DTOType, type DTO } from "../DTO";

export class GameAddPlayerDTO implements DTO {
  type = DTOType.AddPlayer;

  public name: string;
  public design: string;

  constructor(name: string, design: string) {
    this.name = name;
    this.design = design;
  }
}
