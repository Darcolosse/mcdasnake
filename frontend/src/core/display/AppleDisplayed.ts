import { EntityDisplayed } from './EntityDisplayed.ts';
import { DisplayGame } from './DisplayGame.ts';
import { Design } from './Design.ts';

export class AppleDisplayed extends EntityDisplayed{

    constructor(display : DisplayGame, boxes : [number,number][], speedAnimation : number, design : Design, animationTime=0){
            super(display, boxes, speedAnimation, design, animationTime);
        }
    
        // ============================ Override ============================ \\

    
        public animate(time: number = this.lastAnimation): void{
            const ctx = this.display.getCtx();
            const boxSize = this.display.getBoxSize();
            this.updateAnimationTime(time);

            const rapport = this.animationTime / this.speedAnimation;
            const zoom = (rapport < 0.5 ) ? rapport : (1-rapport);

            const sprite = this.display.getSprite("APPLE");
            if (sprite) {
                this.boxes.forEach(box => {
                    ctx.drawImage(
                        sprite,
                        (box[0] +0.25 - zoom/2) * boxSize[0],
                        (box[1] +0.25 - zoom/2) * boxSize[1],
                        (0.5 + zoom) * boxSize[0],
                        (0.5 + zoom) * boxSize[1]
                    );
                });
            }
            else{
                ctx.fillStyle = this.design.getColor();
                const radius = (0.5 + zoom) * boxSize[0];
                this.boxes.forEach(box => {
                    const boxPoint = this.getMiddlePoint(box);
                    ctx.beginPath();
                    ctx.arc(boxPoint[0], boxPoint[1], radius, 0, Math.PI * 2);
                    ctx.fill();
                });
            }


            
        }

    // ============================ Methode utile ============================ \\

    private getMiddlePoint(box : [number, number]) : [number, number]{
        const boxSize = this.display.getBoxSize();
        return [
                (box[0]+0.5) * boxSize[0],
                (box[1]+0.5) * boxSize[1],
            ];
    }

    private getCornerPoint(box : [number, number]) : [number, number]{
        const boxSize = this.display.getBoxSize();
        return [
            box[0] * boxSize[0],
            box[1] * boxSize[1],
        ];
    }
    
}