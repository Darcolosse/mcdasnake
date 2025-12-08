import { EntityDisplayed } from './EntityDisplayed.ts';

export class AppleDisplayed extends EntityDisplayed{
    
        // ============================ Override ============================ \\
    
        protected drawNormalGraphism(): void{
            const ctx = this.display.getCtx();
            const boxSize = this.display.getBoxSize();

            const ratio = this.getRatio();
            const zoom = (ratio < 0.5 ) ? ratio : (1-ratio);

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
                ctx.fillStyle = this.design.getColor1() as string;
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

    //private getCornerPoint(box : [number, number]) : [number, number]{
    //    const boxSize = this.display.getBoxSize();
    //    return [
    //        box[0] * boxSize[0],
    //        box[1] * boxSize[1],
    //    ];
    //}
    
}