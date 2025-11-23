import { DTOType, type DTO } from "../DTO";
import { EntitiesUpdateLoader, type EntitiesUpdate } from "./EntityServer";

export class GameUpdateResponseDTO implements DTO {
  type = DTOType.GameUpdate;

  public speed: number;
  public gridSize: [number, number];
  public entities: EntitiesUpdate;
  public scoreBoard: Array<[string, number, number, number]>;

  constructor(json: any) {
    this.speed = json.speed as number;
    this.gridSize = json.gridSize as [number, number];
    this.entities = EntitiesUpdateLoader(json.entities);
    this.scoreBoard = json.scoreBoard;
  }
}
