import { GameManager } from '../GameManager.ts'
import type { GameUpdateResponseDTO } from '../network/dto/responses/GameUpdateResponse.ts'
import { DisplayConnect } from './DisplayConnect.ts'
import { DisplayGame } from './DisplayGame.ts'

export class DisplayManager {

  private gameManager: GameManager
  private displayConnect : DisplayConnect
  private displayGame : DisplayGame

  private canvas!: HTMLCanvasElement | null // canvas ou est affiché le jeu
  private ctx: CanvasRenderingContext2D | null = null // pinceau permettant d'afficher le jeu

  constructor(gameManager: GameManager) {
    this.gameManager = gameManager
    this.displayConnect = new DisplayConnect(this)
    this.displayGame = new DisplayGame(this)
  }

  // ======================== Life Cycle ========================= \\

  public initialize(canvas: HTMLCanvasElement) {
    this.setCanvas(canvas)
    this.synchronizeCanvasToCSS()
    window.addEventListener('resize', this.handleResize.bind(this))
    window.addEventListener('orientationchange', this.handleResize.bind(this))
  }

  public refreshGame(dto: GameUpdateResponseDTO) {
    this.displayGame.refresh(dto)
  }

  public destroy() {
    this.canvas = null
    this.ctx = null
  }

  // =========================== Show ============================ \\

  public showGame() {
    this.displayGame.show()
    this.displayGame.startLoop()
  }

  public showConnection() {
    this.displayConnect.show()
  }

  // ============================ Set ============================ \\

  /**
   * Change le canvas utilisé pour le jeu et update l'affichage
   * @param canvas le nouveau canvas
   */
  public setCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas
    this.ctx = this.canvas.getContext("2d")
  }

  // ============================ Get ============================ \\

  /**
   * @returns renvoie le canvas pour avoir des mesures
   */
  public getCanvas(): HTMLCanvasElement | undefined {
    if (!this.canvas) {
      this.gameManager.raiseError("Tried getting a canvas from DisplayManager without the canvas initialized.")
      return undefined
    }
    return this.canvas
  }

  /**
   * @returns renvoie le pinceau permettant d'afficher des éléments sur la grille
   */
  public getCtx(): CanvasRenderingContext2D {
    if (!this.ctx) {
      this.gameManager.raiseError("ContsetEntitiesexte 2D non initialisé. Assurez-vous d'appeler setCanvas avant.")
      throw new Error("ContsetEntitiesexte 2D non initialisé. Assurez-vous d'appeler setCanvas avant.")
    }
    return this.ctx
  }

  // ============================ CSS ============================ \\

  private resizeTimeout: number | null = null
  
  private handleResize() {
    if (this.resizeTimeout) clearTimeout(this.resizeTimeout)
    this.resizeTimeout = window.setTimeout(() => {
      this.synchronizeCanvasToCSS()
    }, 200)
  }
  
  private synchronizeCanvasToCSS() {
    if(!this.canvas || !this.ctx) {
      this.gameManager.raiseError("Tried synchronize canvas' scale to css realtime scale on a non initialized canvas.")
      return
    }
    const realtimeRect = this.canvas.getBoundingClientRect()
    const ratio = window.devicePixelRatio || 1
    this.canvas.width = realtimeRect.width * ratio
    this.canvas.height = realtimeRect.height * ratio
    this.displayGame.resize();
  }

}
