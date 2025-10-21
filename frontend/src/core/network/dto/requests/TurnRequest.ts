import { DTOType, type DTO } from "../DTO";

export const Direction = {
  LEFT: 'TURN_LEFT',
  RIGHT: 'TURN_RIGHT',
  UP: 'TURN_UP',
  DOWN: 'TURN_DOWN',
}

export type Direction = typeof Direction[keyof typeof Direction]

export class TurnRequestDTO implements DTO {
  type = DTOType.Turn
  public direction: Direction


  constructor(direction: Direction) {
    this.direction = direction
  }
}
