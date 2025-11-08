"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Snake = void 0;
const Direction_1 = require("@entities/Direction");
class Snake {
    id;
    cases;
    name;
    direction;
    newDirection;
    dead;
    constructor(id, name, cases, direction) {
        this.id = id;
        this.name = name;
        this.cases = cases;
        this.direction = direction;
        this.newDirection = direction;
        this.dead = false;
    }
    move(entities, gameRefresh) {
        let shouldRefresh = false;
        if (this.newDirection !== this.direction && this.checkIncorrectTurn(this.newDirection) === false) {
            this.direction = this.newDirection;
            shouldRefresh = true;
        }
        // Add head
        let head = this.getHead();
        switch (this.direction) {
            case Direction_1.Direction.UP:
                this.cases.push([head[0], head[1] - 1]);
                break;
            case Direction_1.Direction.DOWN:
                this.cases.push([head[0], head[1] + 1]);
                break;
            case Direction_1.Direction.RIGHT:
                this.cases.push([head[0] + 1, head[1]]);
                break;
            case Direction_1.Direction.LEFT:
                this.cases.push([head[0] - 1, head[1]]);
                break;
            default:
                for (let i = 0; i < 10; i++) {
                    this.cases.push([head[0] + i, head[1]]);
                }
                break;
        }
        // Remove tail
        head = this.getHead();
        let headOnSomething = false;
        for (const [_id, entity] of entities) {
            for (const [x, y] of entity.cases) {
                if (head[0] === x && head[1] === y) {
                    headOnSomething = true;
                    break;
                }
            }
            if (headOnSomething)
                break;
        }
        if (!headOnSomething) {
            this.cases.shift(); // Delete tail
        }
        else {
            shouldRefresh = true;
        }
        if (shouldRefresh) {
            gameRefresh.entities.snakes.push(this);
        }
    }
    setDirection(direction) {
        this.newDirection = direction;
    }
    getHead() {
        return this.cases[this.cases.length - 1];
    }
    checkIncorrectTurn(newDirection) {
        if (this.direction === Direction_1.Direction.UP && newDirection === Direction_1.Direction.DOWN)
            return true;
        if (this.direction === Direction_1.Direction.DOWN && newDirection === Direction_1.Direction.UP)
            return true;
        if (this.direction === Direction_1.Direction.LEFT && newDirection === Direction_1.Direction.RIGHT)
            return true;
        if (this.direction === Direction_1.Direction.RIGHT && newDirection === Direction_1.Direction.LEFT)
            return true;
        return false;
    }
}
exports.Snake = Snake;
