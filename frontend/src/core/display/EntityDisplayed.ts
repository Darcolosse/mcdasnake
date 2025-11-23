import { DisplayGame } from './DisplayGame.ts';
import { Design } from './Design.ts';

export class EntityDisplayed{

    protected speedAnimation : number; // durée de l'animation (en ms)
    protected animationTime : number; // temps depuis le début de l'animation (en ms)
    protected lastAnimation : number; // instant du dernier affichage (en ms)
    protected boxes : [number, number][]; // liste des cases occupées par l'entitées
    protected display : DisplayGame; // objet qui contient le canvas, et la taille des cases
    protected design : Design; // objet qui contient le design de l'entité
    protected zindex : number; // plan sur laquel l'entité doit être dessiné
    protected fullAnimation : boolean = false; // indique si l'entité doit être entièrement affiché ou si on n'affiche que se qui change

    constructor(
        display : DisplayGame,
        boxes : [number,number][],
        speedAnimation : number,
        design : Design,
        zindex : number,
        animationTime=0,
    ){
        this.display = display;
        this.boxes = boxes;
        this.speedAnimation = speedAnimation;
        this.animationTime = animationTime;
        this.lastAnimation = Date.now();
        this.design = design;
        this.zindex = zindex;
        this.setFullAnimation(true);
    }

    // ============================ Override ============================ \\

    public toString(): string {
        return "{" +
            "boxes : " + this.boxes +
            "}"
    }

    // ============================ Set ============================ \\

    /**
     * @param value nouvelle valeur de l'attribut "fullAnimation"
     */
    public setFullAnimation(value : boolean): void {
        this.fullAnimation = value;
    }

    public setDesign(design : Design){
        this.design = design;
    }

    // ============================ Get ============================ \\

    public getZindex(): number {
        return this.zindex;
    }

    protected getboxChange(): [number, number][]{
        
        if (this.fullAnimation){
            return this.boxes;
        } else {
            let modifiedboxes: [number, number][] = [];
            this.boxes.forEach(box => {
                if (this.display.existeModifiedBox(box)){
                    modifiedboxes.push(box);
                }
            });
            return modifiedboxes;
        }
    }

    // ============================ Methode d'affichage ============================ \\

    /**
     * Fait disparaitre entièrement les cases ou se trouve l'entité.
     */
    public clear(): void{
      this.boxes.forEach(box => {
        this.display.clearBox(box);
      });
    }

    /**
     * Fait disparaitre les cases de l'entité qui ont changé.
     */
    public clearChange(time = this.animationTime as number): void{
        this.updateAnimationTime(time);
        // this.boxes.forEach(box => {
        //     this.display.clearBox(box);
        // });
    }

    /**
     * Affiche les cases qui ont changées
     * @param {integer} time
     */
    public animate(time = this.animationTime as number): void{
        this.updateAnimationTime(time);
        const graphism = this.design.getGraphism();
        switch (graphism) {
            case "VERY_LOW":
                this.drawVeryLowGraphism();
                break;
            
            case "LOW":
                this.drawLowGraphism();
                break;

            case "NORMAL":
                this.drawNormalGraphism();
                break;
        
            default:
                break;
        }

    }

    protected drawVeryLowGraphism() : void{
        const ctx = this.display.getCtx();
        const boxSize = this.display.getBoxSize();
        ctx.fillStyle = this.design.getColor1() as string;
        const boxChange = this.getboxChange();
        boxChange.forEach(box => {
            ctx.fillRect(
                Math.ceil(box[0]*boxSize[0]),
                Math.ceil(box[1]*boxSize[1]),
                Math.ceil(boxSize[0]),
                Math.ceil(boxSize[1])
            );
        });
        this.setFullAnimation(false);
    }

    protected drawLowGraphism() : void{
        this.drawVeryLowGraphism();
    }

    protected drawNormalGraphism() : void{
        this.drawVeryLowGraphism();
    }

    // ============================ Methodes Utile ============================ \\

    protected getRatio(){
        if (this.speedAnimation === 0){
            return 0;
        }
        return (this.animationTime / this.speedAnimation);
    }

    protected updateAnimationTime(time = this.animationTime as number) : number{
        if (this.speedAnimation === 0){
            return 0;
        }
        const nbStep = Math.floor((this.animationTime + (time - this.lastAnimation)) / this.speedAnimation);
        this.animationTime = ((this.animationTime + (time - this.lastAnimation))) % this.speedAnimation;
        this.lastAnimation = time;
        return nbStep;
    }
}
