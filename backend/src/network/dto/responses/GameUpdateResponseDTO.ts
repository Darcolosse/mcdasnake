import { Snake } from "@/Snake";
import { DTOType, type DTO } from "../DTO";
import { Apple } from "@/Apple";

export class GameUpdateResponseDTO implements DTO {
  type = DTOType.GameUpdateResponse;

  public gridSize: [number, number];
  public speed: number;
  public entities: { snakes: Array<Snake>, apples: Array<Apple> };

  constructor(snakes: Array<Snake>, apples: Array<Apple>, gridSize: [number, number], speed: number) {
    this.gridSize = gridSize;
    this.speed = speed;
    this.entities = { snakes: snakes, apples: apples };
  }
}
