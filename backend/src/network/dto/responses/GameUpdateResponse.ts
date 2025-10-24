import { DTOType, type DTO } from "../DTO";

export class GameUpdateResponseDTO implements DTO {
  type = DTOType.GameUpdate

  constructor(json: any) {
    console.log(json)
  }
}
