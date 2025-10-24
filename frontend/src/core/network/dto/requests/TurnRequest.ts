import { DTOType, type DTO } from "../DTO";

export const Direction = {
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  UP: 'UP',
  DOWN: 'DOWN',
}

export type Direction = typeof Direction[keyof typeof Direction]

export class TurnRequestDTO implements DTO {
  type = DTOType.Turn
  public direction: Direction


  constructor(direction: Direction) {
    this.direction = direction
  }
}
