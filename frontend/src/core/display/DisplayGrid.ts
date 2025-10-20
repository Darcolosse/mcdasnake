import { Colors } from "./colors"
import type { DisplayManager } from "./DisplayManager"

export class DisplayGrid {

  private readonly displayManager: DisplayManager
  private width: number = 0
  private height: number = 0

  constructor(displayManager: DisplayManager) {
    this.displayManager = displayManager
  }

  // =========================== Show ============================ \\

  public show() {
    this.displayManager.clearBackgroundCanvas()
    this.drawCases()
  }

  // ============================ Set ============================ \\

  public setSize(width: number, height: number) {
    this.width = width
    this.height = height
  }

  // ========================== Private ========================== \\

  private drawCases() {
    const canvas = this.displayManager.getBackground()
    const ctx = this.displayManager.getBgCtx()

    if(!canvas || !ctx) return

    for(let i = 0; i<this.height; i++) {
      for(let j = 0; j<this.width; j++) {
        const drawnWidth = Math.ceil(canvas.width/this.width)
        const drawnHeight = Math.ceil(canvas.width/this.width)
        ctx.fillStyle = i+j % 2 == 0 ? Colors.DARKLIME : Colors.LIME
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
