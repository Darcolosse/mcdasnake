import { DisplayManager } from './DisplayManager.ts';
import { EntityDisplayed } from './EntityDisplayed.ts';

enum BoxSide{
    TOP,
    RIGHT,
    BOTTOM,
    LEFT,
    UNKNOW,
}

enum BoxType{
    QUEUE,
    CORPS,
    TETE,
    ALONE,
}

interface BoxInfo{
    firstSide : BoxSide,
    lastSide : BoxSide,
    type: BoxType
}

export class SnakeDisplayed extends EntityDisplayed{

    private boxesInfo: Map<string, BoxInfo>;

    constructor(display : DisplayManager, boxes : [[number,number]], speedAnimation : number, design : Design, animationTime=0){
        super(display, boxes, speedAnimation, design, animationTime);
        for(let i=0; i<this.boxesInfo.length; i++){
            this.setBoxInfo(i);
        }
    }

    private moveBoxes(time: number) : void{
        const nbStep = Math.floor(this.animationTime + (time - this.lastAnimation) / this.speedAnimation);
        this.animationTime = (this.animationTime + (time - this.lastAnimation)) % this.speedAnimation;
        this.lastAnimation = time;

        for (let i=0; i<nbStep; i++){
            this.nextStep();
        }
        
    }

    //override
    public clearChange(time = this.animationTime as number): void{
        
    }

    //override
    public animate(time = this.animationTime as number): void{
        const ctx = this.display.getCtx();
        const boxSize = this.display.getBoxSize();
        ctx.fillStyle = this.design.getColor();

        this.animationTime = (this.animationTime + (time - this.lastAnimation)) % this.speedAnimation;
        while (this.animationTime);
        this.boxes.forEach(box => {
            ctx.fillRect(
                box[0]*boxSize,
                box[1]*boxSize,
                boxSize,
                boxSize
            );
        });
        this.setFullAnimation(false);
    }

    private nextStep(){
        // remove Queue
        const box = this.boxes.shift() as [number, number];
        this.removeBoxInfo(box);
        this.display.addModifiedbox(box);
        
        // add head
        const head = this.boxes[this.boxesInfo.length-1] as [number, number];
        const headInfo = this.getBoxInfo(head) as BoxInfo;
        const vector = SnakeDisplayed.sideToVector(headInfo.lastSide) as [number, number];
        const newHead = [head[0]+vector[0], head[1]+vector[1]] as [number, number];

        this.boxes.push(newHead);
        this.display.addModifiedbox(newHead);
        this.setBoxInfo(this.boxesInfo.length-1);

    }


    // ============================ Box info ============================ \\
    
    private static vectorToSide (vector: [number, number]): BoxSide {
        const dirs: Record<string, BoxSide> = {
            "0,-1": BoxSide.TOP,
            "0,1": BoxSide.BOTTOM,
            "-1,0": BoxSide.LEFT,
            "1,0": BoxSide.RIGHT,
        };
        return dirs[vector.join(",")] ?? BoxSide.UNKNOW;
    }

    private static sideToVector (lastSide: BoxSide): [number, number] {
        switch (lastSide) {
            case BoxSide.TOP: return [0,-1];
            case BoxSide.BOTTOM: return [0,1];
            case BoxSide.LEFT: return [-1,0];
            case BoxSide.RIGHT: return [1,0];
            default: return [0,0];
        }
    }

    private getBoxInfo(box: [number, number]) : BoxInfo{
        return this.boxesInfo[box.join(",")];
    }

    private removeBoxInfo(box: [number, number]) : void{
        this.boxesInfo.remove[box.join(",")];
    }

    private setBoxInfo(index: number): void {
        const key = this.boxes[index].join(",") as string;
        const hasPrev = (index - 1) >= 0 as boolean;
        const hasNext = (index + 1) < this.boxes.length as boolean;
        let firstVec! : [number, number];
        let lastVec! : [number, number];

        if (!hasPrev && !hasNext) {
            this.boxesInfo.set(key,{
                type: BoxType.ALONE,
                firstSide: BoxSide.UNKNOW,
                lastSide: BoxSide.UNKNOW 
            });
            return;
        }

        const current = this.boxes[index];
        if (hasPrev){
            const prev = this.boxes[index - 1];
            firstVec = [prev[0] - current[0], prev[1] - current[1]];
        }
        if (hasNext){
            const next = this.boxes[index + 1];
            lastVec  = [next[0] - current[0], next[1] - current[1]]
        }
        
        if (!hasPrev){
            firstVec = [-lastVec[0],-lastVec[1],];
        }
        if (!hasNext){
            lastVec = [-firstVec[0],-firstVec[1],];
        }

        let type: BoxType;
        if (!hasPrev) {
            type = BoxType.QUEUE;
        } else if (!hasNext) {
            type = BoxType.TETE;
        } else {
            type = BoxType.CORPS;
        }

        this.boxesInfo.set(key,{
            type : type,
            firstSide: SnakeDisplayed.vectorToSide(firstVec),
            lastSide: SnakeDisplayed.vectorToSide(lastVec),
        });
    }

}