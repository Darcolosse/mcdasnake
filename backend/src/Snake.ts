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
		let head = this.getHead();
		if (this.newDirection !== this.direction) {
			this.direction = this.newDirection;
			gameRefresh.entities.snakes.push(this);
		}
		// Add head
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
				for (let i = 0; i < 10; i++) {
					this.cases.push([head[0] + i, head[1]]);
				}
		}

		// Remove tail
		head = this.getHead();
		for (const [_id, entity] of entities) {
			if (head === entity.cases[0]) {
				this.cases.shift(); // Delete tail
				break;
			}
		}
	}

	public setDirection(direction: Direction) {
		this.direction = direction;
	}

	public getHead(): [number, number] {
		return this.cases[this.cases.length - 1];
	}
}
