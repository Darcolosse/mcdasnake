import { DisplayGame } from './DisplayGame.ts';
import { DisplayManager } from './DisplayManager.ts';
import { GameManager } from '../GameManager.ts';
import type { EntityDisplayed } from './EntityDisplayed.ts';

export class DisplayGameFake extends DisplayGame{

  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private gridSize: [number, number];


  constructor(canvas: HTMLCanvasElement, gridSize : [number, number]) {
    const useless = new DisplayManager(new GameManager());
    useless.initialize(canvas, canvas);
    super(useless);
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    this.gridSize = gridSize;
  }

  // ============================ Get ============================ \\

  /**
   * @returns renvoie le pinceau permettant d'afficher des éléments sur la grille
   */
  public getCtx(): CanvasRenderingContext2D {
    return this.ctx;
  }

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

}
