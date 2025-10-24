import { Direction } from "@/Direction";
import { DTOType, type DTO } from "@network/dto/DTO";

export class GameUpdateSnakeDirectionDTO implements DTO {
  type = DTOType.GameUpdateSnakeDirection;

  public direction: Direction;

  constructor(data: any) {
    this.direction = data.direction;
  }
}
