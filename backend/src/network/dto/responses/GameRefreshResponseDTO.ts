import { Snake } from "@entities/Snake";
import { Apple } from "@entities/Apple";
import { DTOType, type DTO } from "@network/dto/DTO";
import { Entity } from "@entities/Entity";

export class GameRefreshResponseDTO implements DTO {
    type = DTOType.GameRefresh;

    public entities: { snakes: Array<Entity>, apples: Array<Entity>, removed: Array<string> };
    public scoreBoard: Array<[string, number, number, number]>;

    constructor(snakes: Array<Snake> = [], apples: Array<Apple> = [], removed: Array<string> = [], scoreBoard: Map<string, [string, number, number, number]> = new Map()) {
        this.entities = { snakes: snakes, apples: apples, removed: removed };
        this.scoreBoard = Array.from(scoreBoard.values()).sort((a, b) => (b[1]+b[2]*10+b[3]) - (a[1]+a[2]*10+a[3])).splice(0, 10);
    }

    public isEmpty(): boolean {
        return this.entities.snakes.length === 0 && this.entities.apples.length === 0 && this.entities.removed.length === 0;
    }
}
