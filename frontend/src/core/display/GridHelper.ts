import type { DisplayManager } from "./DisplayManager";

export class GridHelper {

  private displayManager: DisplayManager

  private cols: number = 1
  private rows: number = 1

  private casePixelWidth: number = 0
  private casePixelHeight: number = 0

  constructor(displayManager: DisplayManager) {
    this.displayManager = displayManager;
  }

  // ============================ Get ============================ \\

  public getRows() {
    return this.rows
  }

  public getCols() {
    return this.cols
  }

  public getCasePixelWidth() {
    return this.casePixelWidth
  }

  public getCasePixelHeight() {
    return this.casePixelHeight
  }

  // ============================ Set ============================ \\

  public setSize(casesOnX: number, casesOnY: number) {
    this.cols = casesOnX
    this.rows = casesOnY
    this.reevaluate()
  }

  // =========================== Util ============================ \\

  public reevaluate() {
    const reference: HTMLCanvasElement = this.displayManager.getCanvas()
    this.casePixelWidth= Math.floor(reference.width/this.cols)
    this.casePixelHeight = Math.floor(reference.height/this.rows)
  }

}
