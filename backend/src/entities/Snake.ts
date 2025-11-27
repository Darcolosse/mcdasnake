import { GameDeadPlayerDTO } from "@/network/dto/responses/GameDeadPlayerDTO";
import { Direction } from "@entities/Direction";
import { Entity, EntityType } from "@entities/Entity"
import { GameRefreshResponseDTO } from "@network/dto/responses/GameRefreshResponseDTO";

export class Snake implements Entity {
	public readonly id: string;
	public readonly name: string;
	public readonly design: string;
	public readonly type: EntityType;

	public cases: [number, number][];
	public deathState: GameDeadPlayerDTO | null;

	public direction: Direction;
	public newDirection: Array<Direction>;
	public maxBufferDirection: number;

	constructor(id: string, name: string, cases: [number, number][], direction: Direction, design: string = "LIME") {
		this.id = id;
		this.name = name;
		this.design = design;
		this.type = EntityType.SNAKE;

		this.cases = cases;
		this.deathState = null;

		this.direction = direction;
		this.newDirection = [direction];
		this.maxBufferDirection = 3;
	}

	public move(entities: Map<string, Entity>, gameRefresh: GameRefreshResponseDTO) {
		let shouldRefresh = false;
		if (this.newDirection.length > 0 && this.newDirection[0] !== this.direction && this.checkIncorrectTurn(this.newDirection[0]) === false) {
			this.direction = this.newDirection[0];
			shouldRefresh = true;
		}
		this.newDirection.shift();

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
				for (let i = 0; i < 10; i++) {
					this.cases.push([head[0] + i, head[1]]);
				}
				break;
		}

		// Remove tail
		head = this.getHead();
		let headOnSomething: boolean = false;
		for (const [_, entity] of entities) {
			const otherHead = entity.getHead();
			if (head[0] === otherHead[0] && head[1] === otherHead[1]) {
				headOnSomething = true;
				break;
			}
		}

		if (!headOnSomething) {
			this.cases.shift(); // Delete tail
		} else {
			shouldRefresh = true;
		}

		if (shouldRefresh) {
			gameRefresh.entities.snakes.push(this);
		}
	}

	public setDirection(direction: Direction) {
		if (this.newDirection.length < this.maxBufferDirection) {
			this.newDirection.push(direction);
		} else {
			this.newDirection.shift();
			this.newDirection.push(direction);
		}
	}

	public getHead(): [number, number] {
		return this.cases[this.cases.length - 1];
	}

	public getBody(): [number, number][] {
		return this.cases.slice(0, this.cases.length - 1);
	}

	private checkIncorrectTurn(newDirection: Direction): boolean {
		if (this.direction === Direction.UP && newDirection === Direction.DOWN) return true;
		if (this.direction === Direction.DOWN && newDirection === Direction.UP) return true;
		if (this.direction === Direction.LEFT && newDirection === Direction.RIGHT) return true;
		if (this.direction === Direction.RIGHT && newDirection === Direction.LEFT) return true;
		return false;
	}
}
