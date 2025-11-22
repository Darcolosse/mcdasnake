import { DTOType, type DTO } from "../DTO";

export class GameAddPlayerDTO implements DTO {
  type = DTOType.AddPlayer;

  public name: string;
  public design: [string, string];

  constructor(name: string, color: string, headSprite: string) {
    this.name = name;
    this.design = [color, headSprite];
  }
}
