import { Entity } from "@/Entity"
import { Game } from "@game/Game";

export class Apple implements Entity {
    public readonly id: string;
    public readonly name: string = "Apple";
    public cases: [number, number][];
    public dead: boolean;

    constructor(id: string, cases: [number, number][]) {
        this.id = id;
        this.cases = cases;
        this.dead = false;
    }

    public generate(x: number, y: number) {
        this.cases = [[x, y]]
    }

    public generateRandom(x: number, y: number) {
        this.cases = [[Game.random(0, x), Game.random(0, y)]]
    }

    public getHead(): [number, number] {
        return this.cases[0];
    }
}

