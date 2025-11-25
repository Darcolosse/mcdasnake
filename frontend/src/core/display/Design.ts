import type { SpriteName } from "./SpriteManager";

export type Graphism = (typeof Graphism)[keyof typeof Graphism];
export const Graphism = {
  VERY_LOW:"VERY_LOW",
  LOW:"LOW",
  NORMAL:"NORMAL"
} as const;

export class Design {

    private color1: string | undefined;
    private color2: string | undefined;
    private graphism: Graphism;
    private head!: SpriteName | undefined;
    private texture!: SpriteName | undefined;

    constructor(color1: string, head : SpriteName, graphism : Graphism){
        this.color1 = color1;
        this.head = head;
        this.graphism = graphism;
    }

    // ============================ Set ============================ \\

    public setColor1(color : string | undefined) : void {
        this.color1 = color;
    }

    public setColor2(color : string | undefined) : void {
        this.color2 = color;
    }

    public setHead(head : SpriteName | undefined) : void {
        this.head = head;
    }

    public setTexture(texture : SpriteName| undefined) : void {
        this.texture = texture;
    }

    public setGraphism(graphism : Graphism) : void {
        this.graphism = graphism;
    }

    // ============================ Get ============================ \\

    public getColor1() : string | undefined{
        if (this.color1){
            return this.color1;
        }
        return "#000000"
        
    }

    public getColor2() : string | undefined{
        return this.color2;
    }

    public getTexture() : SpriteName | undefined{
        return this.texture;
    }

    public getHead() : SpriteName | undefined{
        return this.head;
    }

    public getGraphism() : Graphism{
        return this.graphism;
    }
    
}