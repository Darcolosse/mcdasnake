import { Snake } from "@/Snake";
import { Apple } from "@/Apple";
import { DTOType, type DTO } from "@network/dto/DTO";
import { Entity } from "@/Entity";

export class GameRefreshResponseDTO implements DTO {
    type = DTOType.GameRefresh;

    public entities: { snakes: Array<Entity>, apples: Array<Entity>, removed: Array<string> };

    constructor(snakes: Array<Snake> = [], apples: Array<Apple> = [], removed: Array<string> = []) {
        this.entities = { snakes: snakes, apples: apples, removed: removed };
    }

    public isEmpty(): boolean {
        return this.entities.snakes.length === 0 && this.entities.apples.length === 0 && this.entities.removed.length === 0;
    }
}
