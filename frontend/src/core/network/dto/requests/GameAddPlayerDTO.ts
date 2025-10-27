import { DTOType, type DTO } from "../DTO";

export class GameAddPlayerDTO implements DTO {
  type = DTOType.AddPlayer;

  public name: string;

  constructor(name: string) {
    this.name = name;
  }
}
