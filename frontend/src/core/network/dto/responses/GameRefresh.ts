import { DTOType, type DTO } from "../DTO";
import { EntitiesRefreshLoader, type EntitiesRefresh } from "./EntityServer";

export class GameRefreshDTO implements DTO {
  type = DTOType.GameRefresh

  public entities: EntitiesRefresh;
  public scoreBoard: Array<[string, number, number, number]>;

  constructor(json: any) {
    this.entities = EntitiesRefreshLoader(json.entities);
    this.scoreBoard = json.scoreBoard;
  }
}
