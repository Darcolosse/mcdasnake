import { Direction } from "./Direction.ts";

export class Snake implements Entity {
    public readonly id: string;
    public readonly cases: [[number, number]];
    public readonly direction: Direction;

    constructor(id: string, cases: [[number, number]], direction: Direction) {
        this.id = id;
        this.cases = cases;
        this.direction = direction;
    }
}
