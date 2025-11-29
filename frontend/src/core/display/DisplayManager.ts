<<<<<<< Updated upstream
import { GameManager } from '../GameManager.ts'
import type { GameRefreshDTO } from '../network/dto/responses/GameRefresh.ts'
import type { GameUpdateResponseDTO } from '../network/dto/responses/GameUpdateResponse.ts'
import { DisplayConnect } from './DisplayConnect.ts'
import { DisplayGame } from './DisplayGame.ts'
import { DisplayGrid } from './DisplayGrid.ts'
import { GridHelper } from './GridHelper.ts'

export class DisplayManager {

  public readonly gameManager: GameManager
  private readonly gridHelper: GridHelper
=======
import { GameManager } from '../GameManager.ts';
import { EntityDisplayed } from './EntityDisplayed.ts';
import { Design } from './Design.ts';
import { SnakeDisplayed } from './SnakeDisplayed.ts';
import { DisplayConnect } from './DisplayConnect.ts';

export type EntityType = "SNAKE" | "APPLE" | "ENTITY";

// interface utilisé pour les entités données par le serveur
export interface EntityServer {
  id: number;
  boxes: [[number,number]];
  type: EntityType
}

export class DisplayManager {

  private gameManager: GameManager;
  private displayConnect : DisplayConnect;
>>>>>>> Stashed changes

  private readonly displayConnect : DisplayConnect
  private readonly displayGame : DisplayGame
  private readonly displayGrid : DisplayGrid

  private background!: HTMLCanvasElement | null // canvas ou est affiché le jeu
  private bgCtx: CanvasRenderingContext2D | null = null // pinceau permettant d'afficher le jeu

  private canvas!: HTMLCanvasElement | null // canvas ou est affiché le jeu
  private ctx: CanvasRenderingContext2D | null = null // pinceau permettant d'afficher le jeu

  constructor(gameManager: GameManager) {
    this.gameManager = gameManager
<<<<<<< Updated upstream
    this.gridHelper = new GridHelper(this)
    this.displayConnect = new DisplayConnect(this)
    this.displayGame = new DisplayGame(this)
    this.displayGrid = new DisplayGrid(this)
    window.addEventListener('resize', this.handleResize.bind(this))
    window.addEventListener('orientationchange', this.handleResize.bind(this))
=======
    this.displayConnect = new DisplayConnect(this)
    this.loop = this.loop.bind(this); // bind obligatoire
>>>>>>> Stashed changes
  }

  // ======================== Life Cycle ========================= \\

  public initialize(background: HTMLCanvasElement, canvas: HTMLCanvasElement) {
    this.gameManager.log(this, "Initializing background and game canvas")
    this.setBackground(background)
    this.setCanvas(canvas)
    this.synchronizeCanvasToCSS()
  }

  public clearBackgroundCanvas(){
    this.gameManager.log(this, "Clearing background canvas")
    this.clearCanvas(this.background, this.bgCtx)
  }

  public clearGameCanvas(){
    this.gameManager.log(this, "Clearing game canvas")
    this.clearCanvas(this.canvas, this.ctx)
  }

  public refreshGame(dto : GameRefreshDTO) {
    this.gameManager.log(this, "Refreshing game with new information")
    this.displayGame.refresh(dto)
  }

  public updateGameLayers(dto: GameUpdateResponseDTO) {
    this.gameManager.log(this, "Updating game and grid with most recent information")
    this.gridHelper.setSize(dto.gridSize[0], dto.gridSize[1])
    this.displayGame.refresh(dto)
  }

  public destroy() {
    this.gameManager.log(this, "Cleaning")
    this.displayGame.stopLoop()
    this.background = this.bgCtx = this.canvas = this.ctx = null
  }

  // =========================== Show ============================ \\

  public showGame() {
    this.gameManager.log(this, "Showing game screen")
    this.displayGrid.show()
    this.displayGame.show()
    this.displayGame.startLoop()
  }

  public showConnection() {
    this.gameManager.log(this, "Showing connection screen")
    this.gridHelper.setSize(2, 2)
    this.displayGrid.show()
    this.displayConnect.show()
  }

  // =========================== Show ============================ \\

  public showConnection() {
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

<<<<<<< Updated upstream
  public getCtx(): CanvasRenderingContext2D {
    this.raiseErrorOnCond(!this.ctx, "Tried getting the background context without it being initialized first.")
    return this.ctx as CanvasRenderingContext2D
=======
  /**
   * @returns renvoie le canvas pour avoir des mesures
   */
  public getCanvas(): HTMLCanvasElement | undefined {
    if (!this.canvas) {
      this.gameManager.raiseError("Tried getting a canvas from DisplayManager without the canvas initialized.");
      return undefined
    }
    return this.canvas
  }

  /**
   * @returns renvoie le pinceau permettant d'afficher des éléments sur la grille
   */
  public getCtx(): CanvasRenderingContext2D {
    if (!this.ctx) {
      this.gameManager.raiseError("ContsetEntitiesexte 2D non initialisé. Assurez-vous d'appeler setCanvas avant.");
      throw new Error("ContsetEntitiesexte 2D non initialisé. Assurez-vous d'appeler setCanvas avant.");
    }
    return this.ctx
>>>>>>> Stashed changes
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
      return
    }
    this.gameManager.log(this, "Synchronizing canvas to CSS realtime pixels")
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
