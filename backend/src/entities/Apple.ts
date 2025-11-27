import { GameDeadPlayerDTO } from "@/network/dto/responses/GameDeadPlayerDTO";
import { Entity, EntityType } from "@entities/Entity"

export class Apple implements Entity {
	public readonly id: string;
	public readonly name: string = "Apple";
	public readonly design: string;
	public readonly type: EntityType;

	public positions: [number, number][];
	public deathState: GameDeadPlayerDTO | null;

	constructor(id: string, positions: [number, number][]) {
		this.id = id;
		this.design = "";
		this.type = EntityType.APPLE;

		this.positions = positions;
		this.deathState = null;
	}

	public getHead(): [number, number] {
		return this.positions[0];
	}

	public getBody(): [number, number][] {
		return [this.getHead()];
	}
}

