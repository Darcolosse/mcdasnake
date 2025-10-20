import { DTOType, type DTO } from "../DTO";
import { EntityLoader, type EntityServer } from "./EntityServer";

export class GameUpdateResponseDTO implements DTO {
  type = DTOType.GameUpdate

  public boxSize: number
  public entities: EntityServer[]

  constructor(json: any) {
    this.boxSize = json.boxSize as number
    this.entities = (json.entities as any[]).map((entity: any) => EntityLoader(entity))
  }
}
