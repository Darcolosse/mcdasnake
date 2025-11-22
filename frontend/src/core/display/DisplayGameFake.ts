import { DisplayGame } from './DisplayGame.ts';
import { DisplayManager } from './DisplayManager.ts';
import type { EntityDisplayed } from './EntityDisplayed.ts';

export class DisplayGameFake extends DisplayGame{

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gridSize: [number, number];


  constructor(canvas: HTMLCanvasElement, gridSize : [number, number]) {
    console.log("new DisplayGameFake");
    let test = undefined as unknown
    super(test as DisplayManager);
    this.gridSize = gridSize;
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
  }

  // ============================ Get ============================ \\


  /**
   * @returns Renvoie la taille en pixel d'une case de jeu
   */
  public getBoxSize(): [number, number] {
    return [
      this.canvas.width / this.gridSize[0],
      this.canvas.height / this.gridSize[1],
    ];
  }

  // ========================= Override ============================ \\

  public setEntity2(id: string, entity: EntityDisplayed): void {
    this.setEntity(id, entity);
  }

  public show(): void {
    const canvas = this.canvas

    if (canvas) {
      this.ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const id of this.zindex) {
        const entity = this.entities.get(id)
        entity?.setFullAnimation(true)
        entity?.animate(Date.now())
      }
    }
  }

  /**
   * @returns Renvoie la taille en pixel d'une case de jeu
   */
  public getCtx(): CanvasRenderingContext2D {
    return this.ctx;
  }

  /**
   * @returns Renvoie la taille en pixel d'une case de jeu
   */
  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

}
