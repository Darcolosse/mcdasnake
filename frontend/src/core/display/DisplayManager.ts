import { GameManager } from '../GameManager.ts'
import type { GameUpdateResponseDTO } from '../network/dto/responses/GameUpdateResponse.ts'
import { DisplayConnect } from './DisplayConnect.ts'
import { DisplayGame } from './DisplayGame.ts'
import { DisplayGrid } from './DisplayGrid.ts'
import { GridHelper } from './GridHelper.ts'

export class DisplayManager {

  private gameManager: GameManager
  private gridHelper: GridHelper

  private displayConnect : DisplayConnect
  private displayGame : DisplayGame
  private displayGrid : DisplayGrid

  private background!: HTMLCanvasElement | null // canvas ou est affiché le jeu
  private bgCtx: CanvasRenderingContext2D | null = null // pinceau permettant d'afficher le jeu

  private canvas!: HTMLCanvasElement | null // canvas ou est affiché le jeu
  private ctx: CanvasRenderingContext2D | null = null // pinceau permettant d'afficher le jeu

  constructor(gameManager: GameManager) {
    this.gameManager = gameManager
    this.gridHelper = new GridHelper(this)
    this.displayConnect = new DisplayConnect(this)
    this.displayGame = new DisplayGame(this)
    this.displayGrid = new DisplayGrid(this)
  }

  // ======================== Life Cycle ========================= \\

  public initialize(background: HTMLCanvasElement, canvas: HTMLCanvasElement) {
    this.setBackground(background)
    this.setCanvas(canvas)
    this.synchronizeCanvasToCSS()
    window.addEventListener('resize', this.handleResize.bind(this))
    window.addEventListener('orientationchange', this.handleResize.bind(this))
  }

  public clearBackgroundCanvas(){
    if (!this.bgCtx || !this.background) {
      this.gameManager.raiseError("Tried clearing the background canvas from DisplayManager without the canvas initialized.")
      return 
    }
    this.bgCtx.clearRect(0, 0, this.background.width, this.background.height)
  }

  public clearGameCanvas(){
    if (!this.ctx || !this.canvas) {
      this.gameManager.raiseError("Tried clearing a canvas from DisplayManager without the canvas initialized.")
      return 
    }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  public refreshGame(dto: GameUpdateResponseDTO) {
    this.gridHelper.setSize(dto.boxSize, dto.boxSize)
    this.displayGame.refresh(dto)
  }

  public destroy() {
    this.background = null
    this.bgCtx = null
    this.canvas = null
    this.ctx = null
  }

  // =========================== Show ============================ \\

  public showGame() {
    this.displayGrid.show()
    this.displayGame.show()
    this.displayGame.startLoop()
  }

  public showConnection() {
    this.gridHelper.setSize(2, 2)
    this.displayGrid.show()
    this.displayConnect.show()
  }

  // ============================ Set ============================ \\

  /**
   * Change le canvas utilisé pour le jeu et update l'affichage
   * @param canvas le nouveau canvas
   */
  public setBackground(background: HTMLCanvasElement): void {
    this.background = background
    this.bgCtx = this.background.getContext("2d")
  }

  /**
   * Change le canvas utilisé pour le jeu et update l'affichage
   * @param canvas le nouveau canvas
   */
  public setCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas
    this.ctx = this.canvas.getContext("2d")
  }

  // ============================ Get ============================ \\
  
  public getGridHelper(): GridHelper {
    return this.gridHelper
  }

  public getCanvas(): HTMLCanvasElement {
    if (!this.canvas) {
      this.gameManager.raiseError("Tried getting a canvas from DisplayManager without the canvas initialized.")
      throw new Error("Tried getting a canvas from DisplayManager without the canvas initialized.")
    }
    return this.canvas
  }

  public getCtx(): CanvasRenderingContext2D {
    if (!this.ctx) {
      this.gameManager.raiseError("Tried getting the background context without it being initialized first.")
      throw new Error("Tried getting the background context without it being initialized first.")
    }
    return this.ctx
  }

  public getBackground(): HTMLCanvasElement {
    if (!this.background) {
      this.gameManager.raiseError("Tried getting a background canvas from DisplayManager without the background canvas initialized.")
      throw new Error("Tried getting a background canvas from DisplayManager without the background canvas initialized.")
    }
    return this.background
  }

  public getBgCtx(): CanvasRenderingContext2D {
    if (!this.bgCtx) {
      this.gameManager.raiseError("Tried getting the background context without it being initialized first.")
      throw new Error("Tried getting the background context without it being initialized first.")
    }
    return this.bgCtx
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
    if(!this.background || !this.bgCtx || !this.canvas || !this.ctx) {
      this.gameManager.raiseError("Tried synchronize canvas' scale to css realtime scale on a non initialized canvas.")
      return
    }
    const ratio = window.devicePixelRatio || 1
    this.scaleToRealtimePixels(this.background, ratio)
    this.scaleToRealtimePixels(this.canvas, ratio)
    this.gridHelper.reevaluate()
    this.displayGame.resize()
    this.displayGrid.resize()
  }

  private scaleToRealtimePixels(canvas: HTMLCanvasElement, ratio: number) {
    const realtimeRect = canvas.getBoundingClientRect()
    canvas.width = realtimeRect.width * ratio
    canvas.height = realtimeRect.height * ratio
  }

}
