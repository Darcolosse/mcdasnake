export interface Entity {
    id: string;
    cases: [number, number][];
    name: string;
    dead: boolean;


    getHead(): [number, number];
}

