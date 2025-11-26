import { GameDeadPlayerDTO } from "@/network/dto/responses/GameDeadPlayerDTO";
import { Entity } from "@entities/Entity"

export class Apple implements Entity {
	public readonly id: string;
	public readonly name: string = "Apple";
	public readonly design: string;

	public cases: [number, number][];
	public deathState: GameDeadPlayerDTO | null;

	constructor(id: string, cases: [number, number][]) {
		this.id = id;
		this.design = "";

		this.cases = cases;
		this.deathState = null;
	}

	public getHead(): [number, number] {
		return this.cases[0];
	}

	public getBody(): [number, number][] {
		return [this.getHead()];
	}
}

