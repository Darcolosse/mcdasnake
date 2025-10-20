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
        
        if (snakeSize > 0){
            // add head
            const oldHead = this.boxes[snakeSize-1];
            if (oldHead){
                const oldHeadInfo = this.getBoxInfo(oldHead);
                if (oldHeadInfo){
                    const vector = SnakeDisplayed.sideToVector(oldHeadInfo.lastSide);
                    const newHead: [number, number] = [oldHead[0]+vector[0], oldHead[1]+vector[1]];
                    this.boxes.push(newHead);
                    this.initBoxInfo(newHead);
                } else{
                    throw("Erreur la tete n'a pas de direction. il faut la recalculer");
                }
                
            }
            // remove queue
            const oldTail = this.boxes.shift();
            if (oldTail){
                this.removeBoxInfo(oldTail);
                boxChange.push(oldTail);
            }
            // Change l'ancienne tete en body
            if (snakeSize > 1 && oldHead){
                const newType = this.calculTypeBoxInfo(snakeSize-2);
                this.setAttributBoxInfo(oldHead, "type", newType);
                boxChange.push(oldHead);
            }
            // change la nouvelle queue en queue
            if (snakeSize > 2){
                const newTail = this.boxes[0];
                if (newTail){
                    const newType = this.calculTypeBoxInfo(0);
                    this.setAttributBoxInfo(newTail, "type", newType);
                }
            }
        }
        //return changement
        return boxChange;
    }

    // ============================ Animate ============================ \\




    // ============================ Methode utile ============================ \\

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