import { Direction } from "@/Direction";
import { Entity } from "@/Entity"
import { GameRefreshResponseDTO } from "./network/dto/responses/GameRefreshResponseDTO";

export class Snake implements Entity {
	public readonly id: string;
	public readonly cases: [number, number][];
	public readonly name: string;
	public direction: Direction;
	public newDirection: Direction;
	public dead: boolean;


	constructor(id: string, name:string, cases: [number, number][], direction: Direction) {
		this.id = id;
		this.name = name;
		this.cases = cases;
		this.direction = direction;
		this.newDirection = direction;
		this.dead = false;
	}

	public move(entities: Map<string, Entity>, gameRefresh: GameRefreshResponseDTO) {
    let shouldRefresh = false;
		if (this.newDirection !== this.direction) {
			this.direction = this.newDirection;
      shouldRefresh = true;
		}
    
		// Add head
		let head = this.getHead();
		switch (this.direction) {
			case Direction.UP:
				this.cases.push([head[0], head[1] - 1]);
				break;
			case Direction.DOWN:
				this.cases.push([head[0], head[1] + 1]);
				break;
			case Direction.RIGHT:
				this.cases.push([head[0] + 1, head[1]]);
				break;
			case Direction.LEFT:
				this.cases.push([head[0] - 1, head[1]]);
				break;
			default:
        console.log("moving")
				for (let i = 0; i < 10; i++) {
					this.cases.push([head[0] + i, head[1]]);
				}
        break;
		}

		// Remove tail
		head = this.getHead();
    let headOnSomething: boolean = false;
		for (const [_id, entity] of entities) {
      for(const [x, y] of entity.cases) {
        if (head[0] === x && head[1] === y) {
          headOnSomething = true;
          break;
        }
      }
      if(headOnSomething) break;
		}
    if(!headOnSomething) {
      this.cases.shift(); // Delete tail
    } else {
      shouldRefresh = true;
    }

    if(shouldRefresh) {
			gameRefresh.entities.snakes.push(this);
    }
	}

	public setDirection(direction: Direction) {
		this.newDirection = direction;
	}

	public getHead(): [number, number] {
		return this.cases[this.cases.length - 1];
	}
}
