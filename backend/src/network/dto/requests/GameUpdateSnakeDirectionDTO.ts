import { DTOType, type DTO } from "@network/dto/DTO";
import { Direction } from "@entities/Snake";

export class GameUpdateSnakeDirectionDTO implements DTO {
  type = DTOType.SnakeTurn;

  public direction: Direction;

  constructor(data: any) {
    this.direction = data.direction;
  }
}
