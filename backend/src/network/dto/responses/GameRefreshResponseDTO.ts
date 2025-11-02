import { Snake } from "@/Snake";
import { Apple } from "@/Apple";
import { DTOType, type DTO } from "@network/dto/DTO";
import { Entity } from "@/Entity";

export class GameRefreshResponseDTO implements DTO {
    type = DTOType.GameRefresh;

    public entities: { snakes: Array<Entity>, apples: Array<Entity>, removed: Array<string> };
    public scoreBoard: Map<string, [number, number, number]>;

    constructor(snakes: Array<Snake> = [], apples: Array<Apple> = [], removed: Array<string> = [], scoreBoard: Map<string, [number, number, number]> = new Map()) {
        this.entities = { snakes: snakes, apples: apples, removed: removed };
        this.scoreBoard = scoreBoard;
    }

    public isEmpty(): boolean {
        return this.entities.snakes.length === 0 && this.entities.apples.length === 0 && this.entities.removed.length === 0;
    }
}
