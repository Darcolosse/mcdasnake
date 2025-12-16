import { Graphism, type Design } from './Design.ts';
import { DisplayGame} from './DisplayGame.ts';
import { EntityDisplayed } from './EntityDisplayed.ts';
import type { SpriteName } from './SpriteManager.ts';

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
        this.boxesInfo = new Map();
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
      this.initBoxesInfo();
    }
  }

  public animate(time: number = this.lastAnimation): void {
    this.updateModel(time);
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
                this.drawNormalGraphism();
                break;
        }
  }

  protected drawNormalGraphism(): void {
    if (this.boxes.length >= 2) {
      let ctx = this.setCtx({
        size:0.9,
        color1: "black",
        color2: "black",
        shapeCap: "round",
        shapeJoin: "round",
      });
      if (ctx) {this.drawBody(ctx)};
      ctx = this.setCtx({
        size:0.8,
        shapeCap: "round",
        shapeJoin: "round",
      });
      if (ctx) {this.drawBody(ctx)};
      this.drawHead();
    }
  }

  protected drawLowGraphism(): void {
    const ctx = this.setCtx();
    const boxSize = this.display.getBoxSize();

    let boxChange = this.getboxChange();
    if (ctx){
      boxChange.forEach(box => {
        this.animateBox(ctx, boxSize, box);
        this.display.removeModifiedBox(box);
      });
    }
    
    this.setFullAnimation(false);
  }

  public setBoxes(boxes: [number, number][]){
    super.setBoxes(boxes);
    this.initBoxesInfo();
  }

  // ============================ Methodes utile pour Affichage (Normal) ============================ \\
  private setCtx(
    {
      size = 1,
      color1 = this.design.getColor1(),
      color2 = this.design.getColor2(),
      texture = this.design.getTexture(),
      shapeCap = undefined,
      shapeJoin = undefined,
    }: {
      size?: number,
      color1?: string,
      color2?: string,
      texture?: SpriteName,
      shapeCap?: CanvasLineCap,
      shapeJoin?: CanvasLineJoin,
    } = {})
    :CanvasRenderingContext2D | undefined
    {
    
    const ctx = this.display.getCtx();
    const boxSize = this.display.getBoxSize();
    if (ctx) {
      ctx.lineWidth = boxSize[0] * size;
      if (shapeJoin){
        ctx.lineJoin = shapeJoin;
      }
      if (shapeCap){
        ctx.lineCap = shapeCap;
      }
      
      if (texture){
        const scale = this.display.getSprite(texture);
        if (scale){
          const pattern = ctx.createPattern(scale, 'repeat');
          if (pattern){
            ctx.strokeStyle = pattern;
            ctx.fillStyle = pattern;
            return ctx;
          }
        }
      }
      else if (color1){
        if (color2){
          const startPoint = this.getMovedPoint(0);
          const endPoint = this.getMovedPoint(this.boxes.length - 2);
          if (startPoint && endPoint && (startPoint[0] !== endPoint[0] || startPoint[1] !== endPoint[1])){
            const grad = ctx.createLinearGradient(startPoint[0], startPoint[1], endPoint[0], endPoint[1]);
            grad.addColorStop(0, color1);
            grad.addColorStop(1, color2);
            ctx.strokeStyle = grad;
            ctx.fillStyle = grad;
            return ctx;
          }
        }
        ctx.strokeStyle = color1;
        ctx.fillStyle = color1;
        return ctx;
      }
      ctx.strokeStyle = "black";
      ctx.fillStyle = "black"
      return ctx;
    }
    return ctx;
  }

  private drawBody(ctx : CanvasRenderingContext2D){
      const startPoint = this.getMovedPoint(0);
      const endPoint = this.getMovedPoint(this.boxes.length - 2);
      if (ctx){
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
    if (headName){
      const head = this.display.getSprite(headName);
      const headSize = 1;
      const lastPoint = this.getMovedPoint(this.boxes.length-2, false, headSize);
      const direction = this.vectorToRadian(this.getDirection(this.boxes.length-1));// - (Math.PI/2);
      if (head && lastPoint) {
        this.drawRotatedImage(ctx, head, lastPoint, [boxSize[0]*headSize,boxSize[1]*headSize], direction);
      }
    }
    
  }

  // ============================ Methodes utile pour Affichage (Low) ============================ \\

  private animateBox(
    ctx: CanvasRenderingContext2D,
    boxSize: [number, number],
    box: [number, number]
) {
    const boxInfo = this.getBoxInfo(box);

    const x = box[0] * boxSize[0];
    const y = box[1] * boxSize[1];
    const w = boxSize[0];
    const h = boxSize[1];

    // Cas simple : aucun boxInfo => on dessine juste avec le style déjà défini
    if (!boxInfo) {
        ctx.fillRect(x, y, w, h);
        return;
    }

    // --- Calcul direction ---
    let direction: BoxSide;

    switch (boxInfo.type) {
        case "QUEUE": direction = boxInfo.lastSide; break;
        case "HEAD":  direction = boxInfo.firstSide; break;
        default:      direction = "UNKNOW"; break;
    }

    // --- Ratio ---
    let ratio = this.getRatio();

    if ((direction === "RIGHT" || direction === "BOTTOM") && boxInfo.type === "HEAD") {
        ratio = 1 - ratio;
    }
    if ((direction === "LEFT" || direction === "TOP") && boxInfo.type === "QUEUE") {
        ratio = 1 - ratio;
    }

    // --- Dessin : seulement fillRect avec styles du ctx déjà préparé ---
    switch (direction) {
        case "LEFT":
            ctx.fillRect(x, y, w * ratio, h);
            break;

        case "TOP":
            ctx.fillRect(x, y, w, h * ratio);
            break;

        case "RIGHT":
            ctx.fillRect(
                x + w * ratio, y, w * (1 - ratio), h);
            break;

        case "BOTTOM":
            ctx.fillRect(x, y + h * ratio,w,h * (1 - ratio));
            break;

        default:
            ctx.fillRect(x, y, w, h);
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

        private initBoxesInfo(){
          for(let i=0; i<this.boxes.length; i++){
            const current = this.boxes[i];
            if (current !== undefined){
                this.initBoxInfo(current);
            }
          }
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
