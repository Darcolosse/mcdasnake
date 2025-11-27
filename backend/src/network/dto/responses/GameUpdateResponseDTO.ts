import { DTOType, type DTO } from "@network/dto/DTO";
import { Entity } from "@entities/Entity";

export class GameUpdateResponseDTO implements DTO {
  type = DTOType.GameUpdate;

  readonly gridSize: [number, number];
  readonly speed: number;
  readonly entities: { snakes: Array<Entity>, apples: Array<Entity> };
  readonly scoreBoard: Array<[string, number, number, number]>;
  readonly dateEndGame: number;
  readonly timeBetweenGames: number;
  
  constructor(snakes: Map<string, Entity>, apples: Map<string, Entity>, gridSize: [number, number], speed: number, scoreBoard: Array<[string, number, number, number]>, dateEndGame: number, timeBetweenGames: number) {
    this.gridSize = gridSize;
    this.speed = speed;
    this.entities = { snakes: Array.from(snakes.values()), apples: Array.from(apples.values()) };
    this.scoreBoard = scoreBoard;
    this.dateEndGame = dateEndGame;
    this.timeBetweenGames = timeBetweenGames
  }
}
