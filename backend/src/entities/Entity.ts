import { GameDeadPlayerDTO } from "@/network/dto/responses/GameDeadPlayerDTO";

export type EntityType = 'SNAKE' | 'APPLE' | 'BORDER' | 'NOTDEFINED';
export const EntityType = {
    SNAKE: 'SNAKE',
    APPLE: 'APPLE',
    BORDER: 'BORDER',
    NOTDEFINED: 'NOTDEFINED',
} as const;

//export type Position = [x: number, y: number];

export interface Entity {
    readonly id: string;
    readonly name: string;
    readonly design: string;
    readonly type: EntityType;

    positions: [number, number][];
    deathState: GameDeadPlayerDTO | null;

    getHead(): [number, number];
    getBody(): [number, number][];
}
