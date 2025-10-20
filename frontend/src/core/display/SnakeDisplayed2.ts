import { DisplayGame } from './DisplayGame.ts';
import { Design } from './Design.ts';
import { EntityDisplayed } from './EntityDisplayed.ts';

export class SnakeDisplayed2 extends EntityDisplayed{


    constructor(display : DisplayGame, boxes : [number,number][], speedAnimation : number, design : Design, animationTime=0){
        super(display, boxes, speedAnimation, design, animationTime);
    }

    // ============================ Override ============================ \\

    public clearChange(time: number = this.lastAnimation): void{
        let boxChange = this.updateModel(time);
        boxChange.forEach(box => {
            this.display.clearBox(box);
        });
    }

    public animate(time: number = this.lastAnimation): void{
        this.updateModel(time);

        const ctx = this.display.getCtx();
        const boxSize = this.display.getBoxSize();

        if (ctx && this.boxes.length > 0){
            ctx.lineWidth = boxSize[0] * 0.8;
            ctx.lineJoin = "round";
            ctx.lineCap = "round";
            ctx.strokeStyle = this.design.getColor();


            ctx.beginPath();
            const startBox = this.boxes[0];
            if (!startBox){
                return;
            }
            const startPoint = this.getMiddlePoint(startBox);

            ctx.moveTo(startPoint[0], startPoint[1]);

            for (let i = 1; i < this.boxes.length; i++) {
                const currentBox = this.boxes[i];
                if (currentBox){
                    const currentPoint = this.getMiddlePoint(currentBox);
                    ctx.lineTo(currentPoint[0], currentPoint[1]);
                }
            }
            ctx.stroke();
        }
    }

    // ============================ Change Model ============================ \\

    private updateModel(time: number) : [number, number][]{
        const nbStep = Math.floor((this.animationTime + (time - this.lastAnimation)) / this.speedAnimation);
        this.animationTime = ((this.animationTime + (time - this.lastAnimation))) % this.speedAnimation;
        this.lastAnimation = time;
        let boxChange: [number, number][] = [];
        for (let i=0; i<nbStep; i++){
            boxChange.push(...this.nextStep());
        }
        
        const size = this.boxes.length;
        if (size>0) {boxChange.push(this.boxes[0]!);}
        if (size>1) { boxChange.push(this.boxes[size-1]!); }
        return boxChange;
    }


    private nextStep() : [number, number][]{
        const snakeSize = this.boxes.length;
        const boxChange: [number, number][] = [];
        
        if (snakeSize > 1){
            // add head
            const oldHead = this.boxes[snakeSize-1];
            const oldHead2 = this.boxes[snakeSize-2];
            if (oldHead && oldHead2){
                    const newHead: [number, number] = [
                        oldHead[0] + (oldHead[0] - oldHead2[0]),
                        oldHead[1] + (oldHead[1] - oldHead2[1]),
                    ];
                    this.boxes.push(newHead);             
            }
            // remove queue
            const oldTail = this.boxes.shift();
            if (oldTail){
                boxChange.push(oldTail);
            }
        }
        //return changement
        return boxChange;
    }

    // ============================ Animate ============================ \\




    // ============================ Methode utile ============================ \\

    private getMiddlePoint(box : [number, number]) : [number, number]{
        const boxSize = this.display.getBoxSize();
        return [
                (box[0]+0.5) * boxSize[0],
                (box[1]+0.5) * boxSize[1],
            ];
    }

    // private static vectorToSide (vector: [number, number]): BoxSide {
    //     const dirs: Record<string, BoxSide> = {
    //         "0,-1": "TOP",
    //         "0,1": "BOTTOM",
    //         "-1,0": "LEFT",
    //         "1,0": "RIGHT",
    //     };
    //     return dirs[SnakeDisplayed.getKeyBoxInfo(vector)] ?? "UNKNOW";
    // }

    // private static sideToVector (lastSide: BoxSide): [number, number] {
    //     switch (lastSide) {
    //         case "TOP": return [0,-1];
    //         case "BOTTOM": return [0,1];
    //         case "LEFT": return [-1,0];
    //         case "RIGHT": return [1,0];
    //         default: return [0,0];
    //     }
    // }

    // private indexOfBox(box : [number, number]) : number{
    //     return this.boxes.findIndex(b => b[0] === box[0] && b[1] === box[1]);
    // }

}