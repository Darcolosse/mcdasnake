import { DisplayGame } from './DisplayGame.ts';
import { DisplayManager } from './DisplayManager.ts';
import type { EntityDisplayed } from './EntityDisplayed.ts';

export class DisplayGameSimple extends DisplayGame{

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gridSize: [number, number];


  constructor(canvas: HTMLCanvasElement, gridSize : [number, number]) {
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

  /**
   * @returns Renvoie la taille en pixel d'une case de jeu
   */
  public setCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
  }

  // ========================= Override ============================ \\

  public getCtx(): CanvasRenderingContext2D {
    return this.ctx;
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  // ========================= Other ============================ \\

  public setEntity2(id: string, entity: EntityDisplayed): void {
    this.setNewEntity(id, entity);
    console.log(this.entities);
  }

}
