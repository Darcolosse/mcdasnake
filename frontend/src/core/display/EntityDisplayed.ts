import { DisplayGame } from './DisplayGame.ts';
import { Design } from './Design.ts';

export class EntityDisplayed{

    protected speedAnimation : number; // durée de l'animation (en ms)
    protected animationTime : number; // temps depuis le début de l'animation (en ms)
    protected lastAnimation : number; // instant du dernier affichage (en ms)
    protected boxes : [number, number][]; // liste des cases occupées par l'entitées
    protected display : DisplayGame; // objet qui contient le canvas, et la taille des cases
    protected design : Design; // objet qui contient le design de l'entité
    protected fullAnimation : boolean = false; // indique si l'entité doit être entièrement affiché ou si on n'affiche que se qui change

    constructor(display : DisplayGame, boxes : [number,number][], speedAnimation : number, design : Design, animationTime=0){
        this.display = display;
        this.boxes = boxes;
        this.speedAnimation = speedAnimation;
        this.animationTime = animationTime;
        this.lastAnimation = Date.now();
        this.design = design;
        this.setFullAnimation(true);
    }

    // ============================ Set ============================ \\

    /**
     * @param value nouvelle valeur de l'attribut "fullAnimation"
     */
    public setFullAnimation(value : boolean): void {
        this.fullAnimation = value;
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
        this.boxes.forEach(box => {
            this.display.clearBox(box);
        });
    }

    /**
     * Affiche les cases qui ont changées
     * @param {integer} time
     */
    public animate(time = this.animationTime as number): void{
        this.updateAnimationTime(time);
        const ctx = this.display.getCtx();
        const boxSize = this.display.getBoxSize();
        ctx.fillStyle = this.design.getColor();
        this.boxes.forEach(box => {
            ctx.fillRect(
                box[0]*boxSize[0],
                box[1]*boxSize[1],
                boxSize[0],
                boxSize[1]
            );
        });
        this.setFullAnimation(false);
    }

    protected updateAnimationTime(time = this.animationTime as number) : number{
        const nbStep = Math.floor((this.animationTime + (time - this.lastAnimation)) / this.speedAnimation);
        this.animationTime = ((this.animationTime + (time - this.lastAnimation))) % this.speedAnimation;
        this.lastAnimation = time;
        return nbStep;
    }
}
