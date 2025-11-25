import { GameDeadPlayerDTO } from "@/network/dto/responses/GameDeadPlayerDTO";
import { Entity } from "@entities/Entity"

export class Apple implements Entity {
    public readonly id: string;
    public readonly name: string = "Apple";
    public cases: [number, number][];
    public dead: [boolean, GameDeadPlayerDTO | undefined];
    public design: [string, string];

    constructor(id: string, cases: [number, number][]) {
        this.id = id;
        this.cases = cases;
        this.dead = [false, undefined];
        this.design = ["", ""]
    }

    public getHead(): [number, number] {
        return this.cases[0];
    }

    public getBody(): [number, number][] {
        return [this.getHead()];
    }
}

