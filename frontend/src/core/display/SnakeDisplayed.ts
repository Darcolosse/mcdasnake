import { DisplayGame } from './DisplayGame.ts';
import { Design } from './Design.ts';
import { EntityDisplayed } from './EntityDisplayed.ts';

type BoxSide = "TOP" | "RIGHT" | "BOTTOM" | "LEFT" | "UNKNOW";
type BoxType = "QUEUE" | "BODY" | "HEAD" | "ALONE";

interface BoxInfo{
    firstSide : BoxSide,
    lastSide : BoxSide,
    type: BoxType
}

export class SnakeDisplayed extends EntityDisplayed{

    protected boxesInfo: Map<string, BoxInfo> = new Map();

    constructor(display : DisplayGame, boxes : [number,number][], speedAnimation : number, design : Design, zindex: number, animationTime=0){
        super(display, boxes, speedAnimation, design, zindex, animationTime);
        for(let i=0; i<this.boxes.length; i++){
            const current = this.boxes[i];
            if (current !== undefined){
                this.initBoxInfo(current);
            }
        }
    }

    // ============================ Override ============================ \\

    public clearChange(time: number = this.lastAnimation): void{
        let boxChange = this.updateModel(time);
        boxChange.forEach(box => {
            this.display.clearBox(box);
        });
    }

    public animate(time: number = this.lastAnimation): void{
        const ctx = this.display.getCtx();
        const boxSize = this.display.getBoxSize();
        ctx.fillStyle = this.design.getColor();

        this.updateModel(time);
        let boxChange : [number, number][]

        if (this.fullAnimation){
            boxChange = this.boxes;
        } else {
            boxChange = this.getboxChange();
        }
        //console.log(this.boxesInfo);
        boxChange.forEach(box => {
            this.animateBox(ctx, boxSize, box);
        });
        this.setFullAnimation(false);
    }

    // ============================ Change Model ============================ \\

    private updateModel(time: number) : [number, number][]{
        const nbStep = this.updateAnimationTime(time);
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

    private animateBox(ctx: CanvasRenderingContext2D, boxSize: [number, number], box : [number, number]){
        const boxInfo = this.getBoxInfo(box);
        if (!boxInfo){
            ctx.fillRect(box[0]*boxSize[0], box[1]*boxSize[1], boxSize[0], boxSize[1]);
            return;
        }
        // calcul de la direction
        let direction: BoxSide;
        switch (boxInfo.type) {
            case "QUEUE":
                direction = boxInfo.lastSide;
                break;
            case "HEAD":
                direction = boxInfo.firstSide;
                break;
            default:
                direction = "UNKNOW";
                break;
        }
        // calcul du rapport
        let rapport = this.animationTime / this.speedAnimation;
        if ((direction === "LEFT" || direction === "TOP") && boxInfo.type === "QUEUE"){
            rapport = 1 - rapport;
        }
        // dessin
        switch (direction) {
            case "LEFT":
                ctx.fillRect(box[0]*boxSize[0], box[1]*boxSize[1], boxSize[0]*rapport, boxSize[1]);
                break;
            case "TOP":
                ctx.fillRect(box[0]*boxSize[0], box[1]*boxSize[1], boxSize[0], boxSize[1]*rapport);
                break;
            case "RIGHT":
                ctx.fillRect((box[0]+rapport)*boxSize[0], box[1]*boxSize[1], boxSize[0], boxSize[1]);
                break;
            case "BOTTOM":
                ctx.fillRect(box[0]*boxSize[0], (box[1]+rapport)*boxSize[1], boxSize[0], boxSize[1]);
                break;
            default:
                ctx.fillRect(box[0]*boxSize[0], box[1]*boxSize[1], boxSize[0], boxSize[1]);
                break;
        }
    }

    // ============================ Get ============================ \\

    private getboxChange(): [number, number][]{
        let modifiedboxes: [number, number][] = [];
        this.boxes.forEach(box => {
            if (this.display.existeModifiedBox(box)){
                modifiedboxes.push(box);
            }
        });
        return modifiedboxes;
    }

    // ============================ Box info ============================ \\

    private getBoxInfo(box: [number, number]) : (BoxInfo | undefined){
        return this.boxesInfo.get(SnakeDisplayed.getKeyBoxInfo(box));
    }

    static getKeyBoxInfo(box: [number, number]) : string{
        return box.join(",");
    }

    private removeBoxInfo(box: [number, number]) : void{
        this.boxesInfo.delete(SnakeDisplayed.getKeyBoxInfo(box));
    }

    private setAttributBoxInfo<K extends keyof BoxInfo>(box: [number, number], attribut: K, value: BoxInfo[K]) : void {
        let boxInfo = this.getBoxInfo(box);
        if (!boxInfo){
            boxInfo = this.initBoxInfo(box);
        }
        const key = SnakeDisplayed.getKeyBoxInfo(box);
        boxInfo[attribut] = value;
        this.boxesInfo.set(key, boxInfo);
    }


    private initBoxInfo(box: [number,number]): BoxInfo {
        const index = this.indexOfBox(box);
        if (this.boxes[index] === undefined){
            return {type : "ALONE", firstSide: "UNKNOW", lastSide: "UNKNOW"}
        }

        const key = SnakeDisplayed.getKeyBoxInfo(box);
        const type = this.calculTypeBoxInfo(index);
        const [firstSide, lastSide] = this.calculSidesBoxInfo(index);
        const result = {
            type : type,
            firstSide: firstSide,
            lastSide: lastSide,
        }
        this.boxesInfo.set(key,result);
        return result;
    }

    private calculTypeBoxInfo(index: number) : BoxType {
        const hasPrev = (index - 1) >= 0;
        const hasNext = (index + 1) < this.boxes.length;
        if (!hasPrev) {
            if (!hasNext){
                return "ALONE";
            }
            return "QUEUE";
        }
        if (!hasNext) {
            return "HEAD";
        }
        return "BODY";
    }

    private calculSidesBoxInfo(index: number) : [BoxSide,BoxSide] {
        const hasPrev = (index - 1) >= 0
        const hasNext = (index + 1) < this.boxes.length;
        let firstVec! : [number, number];
        let lastVec! : [number, number];

        if (!hasPrev && !hasNext) {
            return ["UNKNOW", "UNKNOW"];
        }
        const current = this.boxes[index];
        if (!current){
            return ["UNKNOW", "UNKNOW"];
        }

        if (hasPrev){
            const prev = this.boxes[index - 1];
            if (!prev){
                return ["UNKNOW", "UNKNOW"];
            }
            firstVec = [prev[0] - current[0], prev[1] - current[1]];
        }
        if (hasNext){
            const next = this.boxes[index + 1];
            if (!next){
                return ["UNKNOW", "UNKNOW"];
            }
            lastVec  = [next[0] - current[0], next[1] - current[1]]
        }
        
        if (!hasPrev){
            firstVec = [-lastVec[0],-lastVec[1]];
        }
        if (!hasNext){
            lastVec = [-firstVec[0],-firstVec[1]];
        }
        return [
            SnakeDisplayed.vectorToSide(firstVec),
            SnakeDisplayed.vectorToSide(lastVec)
        ];
    }

    // ============================ Methode utile ============================ \\

    private static vectorToSide (vector: [number, number]): BoxSide {
        const dirs: Record<string, BoxSide> = {
            "0,-1": "TOP",
            "0,1": "BOTTOM",
            "-1,0": "LEFT",
            "1,0": "RIGHT",
        };
        return dirs[SnakeDisplayed.getKeyBoxInfo(vector)] ?? "UNKNOW";
    }

    private static sideToVector (lastSide: BoxSide): [number, number] {
        switch (lastSide) {
            case "TOP": return [0,-1];
            case "BOTTOM": return [0,1];
            case "LEFT": return [-1,0];
            case "RIGHT": return [1,0];
            default: return [0,0];
        }
    }

    private indexOfBox(box : [number, number]) : number{
        return this.boxes.findIndex(b => b[0] === box[0] && b[1] === box[1]);
    }

}