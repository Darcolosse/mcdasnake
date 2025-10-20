import { Colors } from "./colors"
import type { DisplayManager } from "./DisplayManager"

export class DisplayGrid {

  private readonly displayManager: DisplayManager

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

  // ========================== Private ========================== \\

  private drawCases() {
    const canvas = this.displayManager.getBackground()
    const ctx = this.displayManager.getBgCtx()

    if(!canvas || !ctx) return

    const helper = this.displayManager.getGridHelper()
    for(let y = 0; y<helper.getRows(); y++) {
      for(let x = 0; x<helper.getCols(); x++) {
        ctx.fillStyle = (x+y) % 2 == 0 ? Colors.DARKLIME : Colors.LIME
        ctx.fillRect(
          x * helper.getCasePixelWidth(),
          y * helper.getCasePixelHeight(),
          helper.getCasePixelWidth(),
          helper.getCasePixelHeight()
        )
      }
    }
  }

}
