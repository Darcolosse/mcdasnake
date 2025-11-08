"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Apple = void 0;
class Apple {
    id;
    name = "Apple";
    cases;
    dead;
    constructor(id, cases) {
        this.id = id;
        this.cases = cases;
        this.dead = false;
    }
    getHead() {
        return this.cases[0];
    }
}
exports.Apple = Apple;
