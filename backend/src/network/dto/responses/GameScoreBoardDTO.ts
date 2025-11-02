
import { DTOType, type DTO } from "@network/dto/DTO";

export class GameScoreBoardDTO implements DTO {
    type = DTOType.GameScoreBoard;

    private readonly scoreBoard: Map<string, [number, number, number]>;

    constructor(scoreBoard:  Map<string, [number, number, number]>) {
        this.scoreBoard = scoreBoard;
    }
}
