import { DTOType, type DTO } from "@network/dto/DTO";
import { Entity } from "@entities/Entity";

export class GameUpdateResponseDTO implements DTO {
  type = DTOType.GameUpdate;

  public gridSize: [number, number];
  public speed: number;
  public entities: { snakes: Array<Entity>, apples: Array<Entity> };
  public scoreBoard: Map<string, [number, number, number]>;

  constructor(snakes: Array<Entity>, apples: Array<Entity>, gridSize: [number, number], speed: number, scoreBoard: Map<string, [number, number, number]>) {
    this.gridSize = gridSize;
    this.speed = speed;
    this.entities = { snakes: snakes, apples: apples };
    this.scoreBoard = scoreBoard;
  }
}
