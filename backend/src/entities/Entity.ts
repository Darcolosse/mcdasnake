import { GameDeadPlayerDTO } from "@/network/dto/responses/GameDeadPlayerDTO";

//export type Position = [x: number, y: number];

export interface Entity {
    readonly id: string;
    readonly name: string;
    readonly design: string;

    cases: [number, number][];
    deathState: GameDeadPlayerDTO | null;

    getHead(): [number, number];
    getBody(): [number, number][];
}
