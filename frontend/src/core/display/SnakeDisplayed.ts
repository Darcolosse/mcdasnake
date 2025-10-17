import { DisplayManager } from './DisplayManager.ts';
import { EntityDisplayed } from './EntityDisplayed.ts';

type BoxSide = "TOP" | "RIGHT" | "BOTTOM" | "LEFT" | "UNKNOW";
type BoxType = "QUEUE" | "CORPS" | "TETE" | "ALONE";

interface BoxInfo{
    firstSide : BoxSide,
    lastSide : BoxSide,
    type: BoxType
}

export class SnakeDisplayed extends EntityDisplayed{

    protected boxesInfo = new Map() as Map<string, BoxInfo>;

    constructor(display : DisplayManager, boxes : [number,number][], speedAnimation : number, design : Design, animationTime=0){
        super(display, boxes, speedAnimation, design, animationTime);
        for(let i=0; i<this.boxes.length; i++){
            this.setBoxInfo(i);
        }
    }

    // ============================ Override ============================ \\

    public clearChange(time = this.lastAnimation as number): void{
        let boxChange = this.moveModel(time) as [number, number][];
        boxChange.forEach(box => {
            this.display.clearBox(box);
        });
    }

    public animate(time = this.lastAnimation as number): void{
        const ctx = this.display.getCtx();
        const boxSize = this.display.getBoxSize();
        ctx.fillStyle = this.design.getColor();

        this.moveModel(time) as [number, number][];
        let boxChange : [number, number][]

        if (this.fullAnimation){
            boxChange = this.boxes;
        } else {
            boxChange = this.getboxChange();
        }

        boxChange.forEach(box => {
            this.animateBox(ctx, boxSize, box);
        });
        this.setFullAnimation(false);
    }

    // ============================ Animate ============================ \\

    private animateBox(ctx: CanvasRenderingContext2D, boxSize: number, box : [number, number]){
        ctx.fillRect(
            box[0]*boxSize,
            box[1]*boxSize,
            boxSize,
            boxSize
        );
    }

    // ============================ Get ============================ \\

    private getboxChange(): [number, number][]{
        let modifiedboxes = [] as [number, number][];
        this.boxes.forEach(box => {
            if (this.display.existeModifiedBox(box)){
                modifiedboxes.push(box);
            }
        });
        return modifiedboxes;
    }


    // ============================ Change Model ============================ \\

    private moveModel(time: number) : [number, number][]{
        const nbStep = Math.floor((this.animationTime + (time - this.lastAnimation)) / this.speedAnimation);
        this.animationTime = ((this.animationTime + (time - this.lastAnimation))) % this.speedAnimation;
        this.lastAnimation = time;
        let boxChange = [] as [number, number][];
        for (let i=0; i<nbStep; i++){
            boxChange.push(...this.nextStep());
        }
        
        const size = this.boxes.length;
        if (size>0) {boxChange.push(this.boxes[0]!);}
        if (size>1) { boxChange.push(this.boxes[size-1]!); }
        return boxChange;
    }


    private nextStep() : [number, number][]{     ;
        // add head
        const head = this.boxes[this.boxes.length-1] as [number, number];
        const headInfo = this.getBoxInfo(head) as BoxInfo;
        const vector = SnakeDisplayed.sideToVector(headInfo.lastSide) as [number, number];
        const newHead = [head[0]+vector[0], head[1]+vector[1]] as [number, number];

        // remove Queue
        const tail = this.boxes.shift() as [number, number];
        this.removeBoxInfo(tail);

        this.boxes.push(newHead);
        this.setBoxInfo(this.boxes.length-1);

        return [tail, head];
    }


    // ============================ Box info ============================ \\

    private getBoxInfo(box: [number, number]) : (BoxInfo | undefined){
        return this.boxesInfo.get(box.join(","));
    }
    

    private removeBoxInfo(box: [number, number]) : void{
        this.boxesInfo.delete(box.join(","));
    }

    private setBoxInfo(index: number): void {
        if (this.boxes[index] === undefined){return}

        const key = this.boxes[index].join(",") as string;
        const hasPrev = (index - 1) >= 0 as boolean;
        const hasNext = (index + 1) < this.boxes.length as boolean;
        let firstVec! : [number, number];
        let lastVec! : [number, number];

        if (!hasPrev && !hasNext) {
            this.boxesInfo.set(key,{
                type: "ALONE" as BoxType,
                firstSide: "UNKNOW" as BoxSide,
                lastSide: "UNKNOW" as BoxSide 
            });
            return;
        }

        const current = this.boxes[index] as [number, number];
        if (hasPrev){
            const prev = this.boxes[index - 1] as [number, number];
            firstVec = [prev[0] - current[0], prev[1] - current[1]];
        }
        if (hasNext){
            const next = this.boxes[index + 1] as [number, number];
            lastVec  = [next[0] - current[0], next[1] - current[1]]
        }
        
        if (!hasPrev){
            firstVec = [-lastVec[0],-lastVec[1]];
        }
        if (!hasNext){
            lastVec = [-firstVec[0],-firstVec[1]];
        }

        let type: BoxType;
        
        if (!hasPrev) {
            type = "QUEUE" as BoxType;
        } else if (!hasNext) {
            type = "TETE" as BoxType;
        } else {
            type = "CORPS" as BoxType;
        }

        this.boxesInfo.set(key,{
            type : type,
            firstSide: SnakeDisplayed.vectorToSide(firstVec),
            lastSide: SnakeDisplayed.vectorToSide(lastVec),
        });
    }

    // ============================ Convert ============================ \\

    private static vectorToSide (vector: [number, number]): BoxSide {
        const dirs: Record<string, BoxSide> = {
            "0,-1": "TOP" as BoxSide,
            "0,1": "BOTTOM" as BoxSide,
            "-1,0": "LEFT" as BoxSide,
            "1,0": "RIGHT" as BoxSide,
        };
        return dirs[vector.join(",")] ?? "UNKNOW" as BoxSide;
    }

    private static sideToVector (lastSide: BoxSide): [number, number] {
        switch (lastSide) {
            case "TOP" as BoxSide: return [0,-1];
            case "BOTTOM" as BoxSide: return [0,1];
            case "LEFT" as BoxSide: return [-1,0];
            case "RIGHT" as BoxSide: return [1,0];
            default: return [0,0];
        }
    }

}