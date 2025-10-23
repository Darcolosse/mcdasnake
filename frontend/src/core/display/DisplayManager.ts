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
    this.clearCanvas(this.background, this.bgCtx)
  }

  public clearGameCanvas(){
    this.clearCanvas(this.canvas, this.ctx)
  }

  public refreshGame(dto: GameUpdateResponseDTO) {
    this.gridHelper.setSize(dto.boxSize, dto.boxSize)
    this.displayGame.refresh(dto)
  }

  public destroy() {
    this.background = this.bgCtx = this.canvas = this.ctx = null
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

  public setBackground(background: HTMLCanvasElement): void {
    this.background = background
    this.bgCtx = this.background.getContext("2d")
  }

  public setCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas
    this.ctx = this.canvas.getContext("2d")
  }

  // ============================ Get ============================ \\
  
  public getGridHelper(): GridHelper {
    return this.gridHelper
  }

  public getCanvas(): HTMLCanvasElement {
    this.raiseErrorOnCond(!this.canvas, "Tried getting a canvas from DisplayManager without the canvas initialized.")
    return this.canvas as HTMLCanvasElement
  }

  public getCtx(): CanvasRenderingContext2D {
    this.raiseErrorOnCond(!this.ctx, "Tried getting the background context without it being initialized first.")
    return this.ctx as CanvasRenderingContext2D
  }

  public getBackground(): HTMLCanvasElement {
    this.raiseErrorOnCond(!this.background, "Tried getting a background canvas from DisplayManager without the background canvas initialized.")
    return this.background as HTMLCanvasElement
  }

  public getBgCtx(): CanvasRenderingContext2D {
    this.raiseErrorOnCond(!this.bgCtx, "Tried getting the background context without it being initialized first.")
    return this.bgCtx as CanvasRenderingContext2D
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

  // ========================== Private =========================== \\
  
  private raiseErrorOnCond(condition: boolean, errorMessage: string) {
    if (condition) {
      this.gameManager.raiseError(errorMessage)
    }
  }
  
  private clearCanvas(canvas: HTMLCanvasElement | null, context: CanvasRenderingContext2D | null) {
    if (!canvas || !context) {
      this.gameManager.raiseError("Tried clearing the background canvas from DisplayManager without the canvas initialized.")
      return 
    }
    context.clearRect(0, 0, canvas.width, canvas.height)
  }

}
