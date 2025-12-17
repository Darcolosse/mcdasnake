import { DTOType, type DTO } from "../DTO";

export class GamePingResponse implements DTO {
  type = DTOType.GamePing

  public time: number

  constructor(json: any) {
    this.time = json.time
  }
}
