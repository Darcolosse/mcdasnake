
export class Apple implements Entity {
    public readonly id: string;
    public readonly cases: [[number, number]];

    constructor(id: string, cases: [[number, number]]) {
        this.id = id;
        this.cases = cases;
    }
}

