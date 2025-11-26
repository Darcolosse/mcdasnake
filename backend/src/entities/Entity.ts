import { GameDeadPlayerDTO } from "@/network/dto/responses/GameDeadPlayerDTO";

export interface Entity {
    id: string;
    cases: [number, number][];
    name: string;
    dead: [boolean, GameDeadPlayerDTO | undefined];
    design: [string, string];

    getHead(): [number, number];
    getBody(): [number, number][];
}

