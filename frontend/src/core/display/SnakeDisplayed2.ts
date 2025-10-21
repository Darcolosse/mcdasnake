import { DisplayGame } from './DisplayGame.ts';
import { Design } from './Design.ts';
import { EntityDisplayed } from './EntityDisplayed.ts';

export class SnakeDisplayed2 extends EntityDisplayed {


  constructor(display: DisplayGame, boxes: [number, number][], speedAnimation: number, design: Design, animationTime = 0) {
    super(display, boxes, speedAnimation, design, animationTime);
  }

  // ============================ Override ============================ \\

  public clearChange(time: number = this.lastAnimation): void {
    let boxChange = this.updateModel(time);
    boxChange.forEach(box => {
      this.display.clearBox(box);
    });
  }

  public animate(time: number = this.lastAnimation): void {
    this.updateModel(time);

    const ctx = this.display.getCtx();
    const boxSize = this.display.getBoxSize();

    // dessin du trait point par point
    if (this.boxes.length >= 2) {
      this.drawBody();
      this.drawHead();
    }
  }

  private drawBody() {
    const ctx = this.display.getCtx();
    const boxSize = this.display.getBoxSize();

    if (ctx) {
      ctx.lineWidth = boxSize[0] * 0.8;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.strokeStyle = this.design.getColor();
    
      ctx.beginPath();
      const startPoint = this.getMovedPoint(0);
      if (startPoint) {
        ctx.moveTo(startPoint[0], startPoint[1]);
      }
      for (let i = 1; i < this.boxes.length - 1; i++) {
        const currentBox = this.boxes[i];
        if (currentBox) {
          const currentPoint = this.getMiddlePoint(currentBox);
          ctx.lineTo(currentPoint[0], currentPoint[1]);
        }
      }
      const lastPoint = this.getMovedPoint(this.boxes.length - 1);
      if (lastPoint) {
        ctx.lineTo(lastPoint[0], lastPoint[1]);
      }
      ctx.stroke();
    }
  }

  private drawHead() {
    const ctx = this.display.getCtx();
    const boxSize = this.display.getBoxSize();
    const head = this.display.getSprite("HEAD");
    const headSize = 1.6;
    const lastPoint = this.getMovedPoint(this.boxes.length-1, false, headSize);
    const direction = this.vectorToRadian(this.getDirection(this.boxes.length-1)) - (Math.PI/2);
    console.log(direction);
    if (head && lastPoint) {
      this.drawRotatedImage(ctx, head, lastPoint, [boxSize[0]*headSize,boxSize[1]*headSize], direction);
    }
  }

  // ============================ Change Model ============================ \\

  private updateModel(time: number): [number, number][] {
    const nbStep = this.updateAnimationTime(time);
    let boxChange: [number, number][] = [];
    for (let i = 0; i < nbStep; i++) {
      boxChange.push(...this.nextStep());
    }

    const size = this.boxes.length;
    if (size > 0) { boxChange.push(this.boxes[0]!); }
    if (size > 1) { boxChange.push(this.boxes[size - 1]!); }
    return boxChange;
  }


  private nextStep(): [number, number][] {
    const snakeSize = this.boxes.length;
    const boxChange: [number, number][] = [];

    if (snakeSize > 1) {
      // add head
      const oldHead = this.boxes[snakeSize - 1];
      const oldHead2 = this.boxes[snakeSize - 2];
      if (oldHead && oldHead2) {
        const newHead: [number, number] = [
          oldHead[0] + (oldHead[0] - oldHead2[0]),
          oldHead[1] + (oldHead[1] - oldHead2[1]),
        ];
        this.boxes.push(newHead);
      }
      // remove queue
      const oldTail = this.boxes.shift();
      if (oldTail) {
        boxChange.push(oldTail);
      }
    }
    //return changement
    return boxChange;
  }


  // ============================ Methode utile ============================ \\

  private getMiddlePoint(box: [number, number]): [number, number] {
    const boxSize = this.display.getBoxSize();
    return [
      (box[0] + 0.5) * boxSize[0],
      (box[1] + 0.5) * boxSize[1],
    ];
  }

  private getMovedPoint(index: number, middle: boolean=true, size: number=1): [number, number] | undefined {
    const box = this.boxes[index];
    if (!box) {
      return undefined;
    }
    const direction = this.getDirection(index);
    const boxSize = this.display.getBoxSize();
    let boxPoint: [number, number]
    if (middle) {
      boxPoint = this.getMiddlePoint(box);
    } else{
      boxPoint = [
        (box[0]+0.5-size/2) * boxSize[0],
        (box[1]+0.5-size/2) * boxSize[1],
      ];
    }
    const vector: [number, number] = [
      direction[0] * boxSize[0],
      direction[1] * boxSize[1]
    ];
    const rapport = this.animationTime / this.speedAnimation;
    return [
      boxPoint[0] + (vector[0] * rapport),
      boxPoint[1] + (vector[1] * rapport),
    ];
  }

  private getDirection(index: number): [number, number] {
    const current = this.boxes[index];
    if (!current) {
      return [0, 0];
    }

    const next = this.boxes[index + 1];
    if (!next) {
      const previous = this.boxes[index - 1];
      if (previous) {
        return [
          current[0] - previous[0],
          current[1] - previous[1]
        ];
      }
      return [0, 0];
    }
    return [
      next[0] - current[0],
      next[1] - current[1]
    ];
  }

  private vectorToRadian([x,y]: [number, number]): number{
    return Math.atan2(y, x);
  }

  private drawRotatedImage(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    [x,y]: [number, number],
    [sizeX,sizeY]: [number, number],
    angle: number // en radians
  ) {
    ctx.save();

    ctx.translate(x + sizeX / 2, y + sizeY / 2);
    ctx.rotate(angle);
    ctx.drawImage(img, -sizeX / 2, -sizeY / 2, sizeX, sizeY);

    ctx.restore();
  }

}