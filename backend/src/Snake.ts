import { Direction } from "@/Direction";
import { Entity } from "@/Entity"

export class Snake implements Entity {
	public readonly id: string;
	public readonly cases: [number, number][];
	public readonly name: string;
	public direction: Direction;
	public grow: boolean;
	public dead: boolean;


	constructor(id: string, name:string, cases: [number, number][], direction: Direction) {
		this.id = id;
		this.name = name;
		this.cases = cases;
		this.direction = direction;
		this.grow = false;
		this.dead = false;
	}

	public move() {
		const head = this.cases[this.cases.length - 1];
		if (!this.grow) {
			this.cases.shift() // Delete the queue
		} else {
			this.grow = false;
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
	}

	public setDirection(direction: Direction) {
		this.direction = direction;
	}
}
