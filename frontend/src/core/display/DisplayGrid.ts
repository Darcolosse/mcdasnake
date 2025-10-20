import { Colors } from "./colors"
import type { DisplayManager } from "./DisplayManager"

export class DisplayGrid {

  private readonly displayManager: DisplayManager
  private casesOnX: number = 0
  private casesOnY: number = 0

  constructor(displayManager: DisplayManager) {
    this.displayManager = displayManager
  }

  // =========================== Show ============================ \\

  public show() {
    this.displayManager.clearBackgroundCanvas()
    this.drawCases()
  }

  public resize() {
    this.show()
  }

  // ============================ Set ============================ \\

  public setSize(casesOnX: number, casesOnY: number) {
    this.casesOnX = casesOnX
    this.casesOnY = casesOnY
  }

  // ========================== Private ========================== \\

  private drawCases() {
    const canvas = this.displayManager.getBackground()
    const ctx = this.displayManager.getBgCtx()

    if(!canvas || !ctx) return

    for(let i = 0; i<this.casesOnY; i++) {
      for(let j = 0; j<this.casesOnX; j++) {
        const drawnWidth = Math.floor(canvas.width/this.casesOnX)
        const drawnHeight = Math.floor(canvas.height/this.casesOnY)
        ctx.fillStyle = (i+j) % 2 == 0 ? Colors.DARKLIME : Colors.LIME
        ctx.fillRect(
          j * drawnWidth,
          i * drawnHeight,
          drawnWidth,
          drawnHeight
        )
      }
    }
  }

}
