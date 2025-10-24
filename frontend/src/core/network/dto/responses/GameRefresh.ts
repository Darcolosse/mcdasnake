import { DTOType, type DTO } from "../DTO";
import { EntitiesRefreshLoader, type EntitiesRefresh } from "./EntityServer";


export class GameRefreshDTO implements DTO {
  type = DTOType.GameRefresh

  public entities: EntitiesRefresh;

  constructor(json: any) {
    this.entities = EntitiesRefreshLoader(json.entities);
  }
}
