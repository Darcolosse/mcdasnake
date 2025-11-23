export interface Entity {
    id: string;
    cases: [number, number][];
    name: string;
    dead: boolean;
    design: [string, string];

    getHead(): [number, number];
    getBody(): [number, number][];
}

