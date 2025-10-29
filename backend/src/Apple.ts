import { Entity } from "@/Entity"

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

    public getHead(): [number, number] {
        return this.cases[0];
    }
}

