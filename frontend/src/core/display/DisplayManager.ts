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

  private entities: Map<number, EntityDisplayed> = new Map(); // liste des entités présente dans le jeu
  private canvas!: HTMLCanvasElement | null; // canvas ou est affiché le jeu
  private ctx: CanvasRenderingContext2D | null = null; // pinceau permettant d'afficher le jeu
  private boxSize: number = 0; // taille en pixel des cases
  private modifiedboxes: Set<string> = new Set(); // liste des cases changé lors d'une animation  (ex: "3,6")
  private inLoop: boolean = false;

  constructor(gameManager: GameManager) {
    this.gameManager = gameManager
    this.displayConnect = new DisplayConnect(this)
    this.loop = this.loop.bind(this); // bind obligatoire
  }

  public initialize(canvas: HTMLCanvasElement) {
    console.log("bonjour alexis");

    this.setCanvas(canvas);
    this.synchronizeCanvasToCSS();

    window.addEventListener('resize', this.handleResize.bind(this));
    window.addEventListener('orientationchange', this.handleResize.bind(this));
  }

  public destroy() {
    this.canvas = null;
    this.ctx = null;
  }

  // =========================== Show ============================ \\

  public showConnection() {
    this.displayConnect.show()
  }

  // ============================ Set ============================ \\

  /**
   * Change le canvas utilisé pour le jeu et update l'affichage
   * @param canvas le nouveau canvas
   */
  public setCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");
  }

  /**
   * Change la taille des cases et update l'affichage
   * @param boxSize nouvelle taille de case en pixel
   */
  public setboxSize(boxSize: number): void {
    this.boxSize = boxSize;
  }



  /**
   * Update les entités affichées
   * @param enities // objets entité données par le serveur
   */
  public setEntities(enities: EntityServer[]): void {
    enities.forEach(entity => {
      const entityBoxes = entity.boxes;
      const entityID = entity.id;
      const entityType = entity.type;



      if (entityID && entityBoxes && entityType) {
        let entityObject: EntityDisplayed;
        switch (entityType) {
          case ("SNAKE" as EntityType):
            entityObject = new SnakeDisplayed(this, entityBoxes, 3000, new Design("green"), 0);
            break;

        
          default:
            entityObject = new EntityDisplayed(this, entityBoxes, 1000, new Design("green"), 0);
            break;
        }
        this.setEntity(entityID, entityObject);
      }
    });
  }

  /**
   * @param id identifié de l'entité à ajouter / ou  à modifier
   * @param entity objet représentant l'entité
   */
  public setEntity(id: number, entity: EntityDisplayed): void {
    const oldEntity = this.entities.get(id) as EntityDisplayed;
    if (oldEntity) {
      oldEntity.clear();
    }
    this.entities.set(id,entity);
  }

  // ============================ Get ============================ \\

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
  }

  /**
   * @returns Renvoie la taille en pixel d'une case de jeu
   */
  public getBoxSize(): number {
    return this.boxSize;
  }

  // ============================ Methodes publiques ============================ \\

  /**
   * Vérifie si une case à été effacé pendant l'animation
   * @param coordinate Coordonnée de la case à vérifier
   * @returns si la case à été effacé ou non
   */
  public existeModifiedBox(coordinate: number[]): boolean {
    return this.modifiedboxes.has(coordinate.join("_"));
  }

  public startLoop() : void{
    if (!this.inLoop){
      this.inLoop = true;
      this.loop();
    }
  }

  public stopLoop() : void{
    this.inLoop = false;
  }

  // ============================ Méthodes d'affichage ============================ \\

  /**
   * Efface une case de la grille de jeu
   */
  public clearBox(coordinate: [number, number]): void {
    if (!this.existeModifiedBox(coordinate)) {
      this.getCtx().clearRect(
        coordinate[0] * this.getBoxSize(),
        coordinate[1] * this.getBoxSize(),
        this.getBoxSize(),
        this.getBoxSize()
      );
      this.addModifiedbox(coordinate);
    }
  }

  /**
   * Update entièrement la grille de jeu
   */
  public show(): void {
    if (this.canvas !== null) {
      this.getCtx().clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.entities.forEach((entity : EntityDisplayed, id : number) => {
        entity.setFullAnimation(true);
        entity.animate(Date.now());
      });
    }
  }

  /**
   * Update les partie qui ont changé sur la grille de jeu
   */
  public animate(): void {
    this.clearModifiedboxes();
    this.entities.forEach((entity : EntityDisplayed) => {
      entity.clearChange(Date.now());
    });
    this.entities.forEach((entity : EntityDisplayed) => {
      entity.animate();
    });
    this.clearModifiedboxes();
  };

  // ============================ Methodes privées de case modifié ============================ \\

  /**
   * Signal qu'une case à été effacé
   * @param coordinate coordonnée de la case effacée
   */
  private addModifiedbox(coordinate: number[]): void {
    this.modifiedboxes.add(coordinate.join(","));
  }

  /**
   * reset l'attribut modifiedboxes, pour indiquer qu'ancune case n'a été effacé
   */
  private clearModifiedboxes(): void {
    this.modifiedboxes = new Set();
  }
  /**
   * La boucle de jeu
   */
  private loop() {
    this.animate();
    if (this.inLoop){
      setTimeout(this.loop, 1000 / 10);
    }
  }

  // ============================ CSS ============================ \\

  private resizeTimeout: number | null = null;
  
  private handleResize() {
    if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
    this.resizeTimeout = window.setTimeout(() => {
      this.synchronizeCanvasToCSS();
    }, 200); 
  }
  
  private synchronizeCanvasToCSS() {
    if(!this.canvas || !this.ctx) {
      this.gameManager.raiseError("Tried synchronize canvas' scale to css realtime scale on a non initialized canvas.")
      return
    }

    console.log(this.canvas.width)
    console.log(this.canvas.height)
    const realtimeRect = this.canvas.getBoundingClientRect()
    const ratio = window.devicePixelRatio || 1
    console.log(this.canvas.width)
    console.log(this.canvas.height)

    this.canvas.width = realtimeRect.width * ratio
    this.canvas.height = realtimeRect.height * ratio;
  }

}
