import { DisplayManager } from './DisplayManager.ts';
import { Design } from './Design.ts';

export class EntityDisplayed{

    private speedAnimation : number; // durée de l'animation (en ms)
    private animationTime : number; // temps depuis le début de l'animation (en ms)
    private lastAnimation : number; // instant du dernier affichage (en ms)
    private boxes : [[number, number]]; // liste des cases occupées par l'entitées
    private display : DisplayManager; // objet qui contient le canvas, et la taille des cases
    private design : Design; // objet qui contient le design de l'entité
    private fullAnimation : boolean = false; // indique si l'entité doit être entièrement affiché ou si on n'affiche que se qui change

    constructor(display : DisplayManager, boxes : [[number,number]], speedAnimation : number, design : Design, animationTime=0){
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
        this.animationTime = (this.animationTime + (time - this.lastAnimation)) % this.speedAnimation;
        this.boxes.forEach(box => {
            this.display.clearBox(box);
        });
    }

    /**
     * Affiche les cases qui ont changées
     * @param {integer} time
     */
    public animate(time = this.animationTime as number): void{
        const ctx = this.display.getCtx();
        const boxSize = this.display.getBoxSize();
        ctx.fillStyle = this.design.getColor();
        this.animationTime = (this.animationTime + (time - this.lastAnimation)) % this.speedAnimation;
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
}
