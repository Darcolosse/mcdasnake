import { Colors } from "./colors"
import { DisplayManager } from "./DisplayManager"

export class DisplayConnect {
  
  private readonly displayManager: DisplayManager

  constructor(displayManager: DisplayManager) {
    this.displayManager = displayManager
  }

  public show() {
    this.drawCases()
    this.drawText()
  }

  // ========================== Private ========================== \\

  private drawCases() {
    const canvas = this.displayManager.getCanvas()
    const ctx = this.displayManager.getCtx()

    if(!canvas || !ctx) return

    const cases = [ { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }, ]

    cases.map((coords: { x: number, y: number }, index: number) => {
      console.log(coords)
      ctx.fillStyle = index % 2 == 0 ? Colors.DARKLIME : Colors.LIME
      ctx.fillRect(
        coords.x * canvas.width/2,
        coords.y * canvas.height/2,
        Math.ceil(canvas.width/2),
        Math.ceil(canvas.height/2),
      )
    })
  }

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
