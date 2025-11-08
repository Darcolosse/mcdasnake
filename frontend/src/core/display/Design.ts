export type SpriteName = "APPLE" | "HEAD" | "SCALE";
export type Graphism = (typeof Graphism)[keyof typeof Graphism];
export const Graphism = {
  VERY_LOW:"VERY_LOW",
  LOW:"LOW",
  NORMAL:"NORMAL"
} as const;

export class Design {

    private color: string;
    private graphism: Graphism;
    private head!: SpriteName;

    constructor(color: string, head : SpriteName, graphism : Graphism){
        this.color = color;
        this.head = head;
        this.graphism = graphism;
    }

    // ============================ Set ============================ \\

    public setColor(color : string) : void {
        this.color = color;
    }

    public setHead(head : SpriteName) : void {
        this.head = head;
    }

    public setGraphism(graphism : Graphism) : void {
        this.graphism = graphism;
    }

    // ============================ Get ============================ \\

    public getColor() : string{
        return this.color
    }

    public getHead() : SpriteName{
        return this.head;
    }

    public getGraphism() : Graphism{
        return this.graphism;
    }
    
}