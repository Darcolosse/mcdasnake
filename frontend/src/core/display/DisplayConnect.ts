import { Colors } from "./colors"
import { DisplayManager } from "./DisplayManager"

export class DisplayConnect {
  
  private readonly displayManager: DisplayManager

  constructor(displayManager: DisplayManager) {
    this.displayManager = displayManager
  }

  public show() {
    this.displayManager.clearGameCanvas()
    this.drawText()
  }

  // ========================== Private ========================== \\

  private drawText() {
    const canvas = this.displayManager.getCanvas()
    const ctx = this.displayManager.getCtx()

    if(!canvas || !ctx) return

    // Rectangle
    ctx.fillStyle = Colors.DARK
    ctx.fillRect(
      canvas.width/2 - (canvas.width/3)/2,
      canvas.height/2 - (canvas.height/10)/2,
      Math.ceil(canvas.width/3),
      Math.ceil(canvas.height/10),
    )

    
    // Text
    ctx.fillStyle = Colors.SAND
    ctx.font = `${Math.ceil(canvas.height/40)}px serif`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(
      "Connecting to the server...",
      canvas.width/2,
      canvas.height/2,
    )
  }

}
