import { Graphism, type Design } from './Design.ts';
import { DisplayGame} from './DisplayGame.ts';
import { EntityDisplayed } from './EntityDisplayed.ts';

type BoxSide = "TOP" | "RIGHT" | "BOTTOM" | "LEFT" | "UNKNOW";
type BoxType = "QUEUE" | "BODY" | "HEAD" | "ALONE";

interface BoxInfo{
    firstSide : BoxSide,
    lastSide : BoxSide,
    type: BoxType
}

export class SnakeDisplayed extends EntityDisplayed {

  protected boxesInfo: Map<string, BoxInfo>;

  constructor(
          display : DisplayGame,
          boxes : [number,number][],
          speedAnimation : number,
          design : Design,
          zindex : number,
          animationTime=0,
      ){
        super(
          display,
          boxes,
          speedAnimation,
          design,
          zindex,
          animationTime,
        );
        this.boxesInfo = new Map();;
        this.setDesign(design);
      }

  // ============================ Override ============================ \\

  public clearChange(time: number = this.lastAnimation): void {
    let boxChange = this.updateModel(time);
    boxChange.forEach(box => {
      this.display.clearBox(box);
    });
  }

  public setDesign(design: Design): void {
    this.design = design;
    const graphism = this.design.getGraphism();
    this.setGraphism(graphism);
  }

  public setGraphism(graphism : Graphism){
    if (graphism === Graphism.LOW){
      this.boxesInfo.clear();
      for(let i=0; i<this.boxes.length; i++){
            const current = this.boxes[i];
            if (current !== undefined){
                this.initBoxInfo(current);
            }
        }
    }
  }

  public animate(time: number = this.lastAnimation): void {
    this.updateModel(time);
    this.updateAnimationTime(time);
    const graphism = this.design.getGraphism();
        switch (graphism) {
            case Graphism.VERY_LOW:
                this.drawVeryLowGraphism();
                break;
            
            case Graphism.LOW:
                this.drawLowGraphism();
                break;

            case Graphism.NORMAL:
                this.drawNormalGraphism();
                break;
        
            default:
                break;
        }
  }

  protected drawNormalGraphism(): void {
    if (this.boxes.length >= 2) {
      this.drawBody("black", 0.9);
      this.drawBody(this.design.getColor(), 0.8);
      this.drawHead();
    }
  }

  protected drawLowGraphism(): void {
    const ctx = this.display.getCtx();
        const boxSize = this.display.getBoxSize();
        ctx.fillStyle = this.design.getColor();

        let boxChange = this.getboxChange();
        boxChange.forEach(box => {
            this.animateBox(ctx, boxSize, box);
        });
        this.setFullAnimation(false);
  }

  // ============================ Methodes utile pour Affichage (Normal) ============================ \\

  private drawBody(color: string, size : number) {
    const ctx = this.display.getCtx();
    const boxSize = this.display.getBoxSize();
    const startPoint = this.getMovedPoint(0);
    const endPoint = this.getMovedPoint(this.boxes.length - 2);

    if (ctx) {
      ctx.lineWidth = boxSize[0] * size;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.strokeStyle = color;

      // texture
      // const scale = this.display.getSprite("SCALE");
      // if (scale){
      //   const pattern = ctx.createPattern(scale, 'repeat');
      //   if (pattern){
      //     ctx.strokeStyle = pattern;
      //   }
      // }

      // dégradé
      // if (startPoint && endPoint){
      //   const grad = ctx.createLinearGradient(startPoint[0], startPoint[1], endPoint[0], endPoint[1]);
      //   grad.addColorStop(0, this.design.getColor());
      //   grad.addColorStop(1, "lime"); 
      //   ctx.strokeStyle = grad;
      // }

      ctx.beginPath();
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
      if (endPoint) {
        ctx.lineTo(endPoint[0], endPoint[1]);
      }
      ctx.stroke();
    }
  }

  private drawHead() {
    const ctx = this.display.getCtx();
    const boxSize = this.display.getBoxSize();
    const headName = this.design.getHead();
    const head = this.display.getSprite(headName);
    console.log(headName);
    console.log(head);
    const headSize = 1;
    const lastPoint = this.getMovedPoint(this.boxes.length-2, false, headSize);
    const direction = this.vectorToRadian(this.getDirection(this.boxes.length-1));// - (Math.PI/2);
    if (head && lastPoint) {
      this.drawRotatedImage(ctx, head, lastPoint, [boxSize[0]*headSize,boxSize[1]*headSize], direction);
    }
  }

  // ============================ Methodes utile pour Affichage (Low) ============================ \\

  private animateBox(ctx: CanvasRenderingContext2D, boxSize: [number, number], box : [number, number]){
        const boxInfo = this.getBoxInfo(box);
        if (!boxInfo){
            ctx.fillRect(
              Math.ceil(box[0]*boxSize[0]), Math.ceil(box[1]*boxSize[1]),
              Math.ceil(boxSize[0]), Math.ceil(boxSize[1])
            );
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
        let ratio = this.getRatio();
        if ((direction === "RIGHT" || direction === "BOTTOM") && boxInfo.type === "HEAD"){
            ratio = 1 - ratio;
        }
        if ((direction === "LEFT" || direction === "TOP") && boxInfo.type === "QUEUE"){
            ratio = 1 - ratio;
        }
        // dessin
        switch (direction) {
            case "LEFT":
                ctx.fillRect(
                  Math.ceil(box[0]*boxSize[0]), Math.ceil(box[1]*boxSize[1]),
                  Math.ceil(boxSize[0]*ratio), Math.ceil(boxSize[1])
                );
                break;
            case "TOP":
                ctx.fillRect(
                  Math.ceil(box[0]*boxSize[0]), Math.ceil(box[1]*boxSize[1]),
                  Math.ceil(boxSize[0]), Math.ceil(boxSize[1]*ratio)
                );
                break;
            case "RIGHT":
                ctx.fillRect(
                  Math.ceil((box[0]+ratio)*boxSize[0]), Math.ceil(box[1]*boxSize[1]),
                  Math.ceil((1-ratio)*boxSize[0]), Math.ceil(boxSize[1])
                );
                break;
            case "BOTTOM":
                ctx.fillRect(
                  Math.ceil(box[0]*boxSize[0]), Math.ceil((box[1]+ratio)*boxSize[1]),
                  Math.ceil(boxSize[0]), Math.ceil((1-ratio)*boxSize[1])
                );
                break;
            default:
                ctx.fillRect(
                  Math.ceil(box[0]*boxSize[0]), Math.ceil(box[1]*boxSize[1]),
                  Math.ceil(boxSize[0]), Math.ceil(boxSize[1])
                );
                break;
        }
    }

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

    let newHead: ([number, number] | undefined);
    let oldHead: ([number, number] | undefined) = this.boxes[snakeSize - 1];
    let oldHead2: ([number, number] | undefined) = this.boxes[snakeSize - 2];
    let oldTail: ([number, number] | undefined);
    let newTail: ([number, number] | undefined);


    if (snakeSize > 1) {
      // add head
      if (oldHead && oldHead2) {
        newHead = [
          oldHead[0] + (oldHead[0] - oldHead2[0]),
          oldHead[1] + (oldHead[1] - oldHead2[1]),
        ];
        this.boxes.push(newHead);
      }
      // remove queue
      oldTail = this.boxes.shift();
      if (oldTail) {
        boxChange.push(oldTail);
      }
    }

    const graphism = this.design.getGraphism();
    if (graphism === Graphism.LOW){
      if (newHead) {this.initBoxInfo(newHead);}
      if (oldTail) {this.removeBoxInfo(oldTail);}
      if (oldHead) {
        const newType = this.calculTypeBoxInfo(this.boxes.length-1);
        this.setAttributBoxInfo(oldHead, "type", newType);
      }
      newTail = this.boxes[0];
      if (newTail) {
        const newType = this.calculTypeBoxInfo(0);
        this.setAttributBoxInfo(newTail, "type", newType);
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
    const ratio = this.getRatio();
    return [
      boxPoint[0] + (vector[0] * ratio),
      boxPoint[1] + (vector[1] * ratio),
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
