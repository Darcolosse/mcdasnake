import { DTOType, type DTO } from "../DTO";

export const Direction = {
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  UP: 'UP',
  DOWN: 'DOWN',
}

export type Direction = typeof Direction[keyof typeof Direction]

export class GameUpdateSnakeDirectionDTO implements DTO {
  type = DTOType.SnakeTurn;

  public direction: Direction;

  constructor(dir: Direction) {
    this.direction = dir;
  }
}
