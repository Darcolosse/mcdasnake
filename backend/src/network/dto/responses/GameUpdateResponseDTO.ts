import { DTOType, type DTO } from "@network/dto/DTO";
import { Entity } from "@entities/Entity";

export class GameUpdateResponseDTO implements DTO {
  type = DTOType.GameUpdate;

  public gridSize: [number, number];
  public speed: number;
  public entities: { snakes: Array<Entity>, apples: Array<Entity> };
  public scoreBoard: Array<[string, number, number, number]>;
  
  constructor(snakes: Map<string, Entity>, apples: Map<string, Entity>, gridSize: [number, number], speed: number, scoreBoard: Array<[string, number, number, number]>) {
    this.gridSize = gridSize;
    this.speed = speed;
    this.entities = { snakes: Array.from(snakes.values()), apples: Array.from(apples.values()) };
    this.scoreBoard = scoreBoard;
  }
}
