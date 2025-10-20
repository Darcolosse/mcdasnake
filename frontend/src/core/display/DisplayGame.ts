import { DisplayManager } from './DisplayManager.ts';
import { EntityDisplayed } from './EntityDisplayed.ts';
import { Design } from './Design.ts';
import { SnakeDisplayed } from './SnakeDisplayed.ts';
import type { EntityServer, EntityType } from '../network/dto/responses/EntityServer.ts';
import type { GameUpdateResponseDTO } from '../network/dto/responses/GameUpdateResponse.ts';

export class DisplayGame {

  private displayManager: DisplayManager;
  private gridWidth : number = 0;
  private gridHeight : number = 0;
  private boxSize : [number, number] = 0;
  private entities: Map<number, EntityDisplayed> = new Map(); // liste des entités présente dans le jeu
  private modifiedboxes: Set<string> = new Set(); // liste des cases changé lors d'une animation  (ex: "3,6")
  private inLoop: boolean = false;

  constructor(displayManager: DisplayManager) {
    this.displayManager = displayManager;
    this.loop = this.loop.bind(this);
  }

  // ============================ Get ============================ \\

  /**
   * @returns renvoie le pinceau permettant d'afficher des éléments sur la grille
   */
  public getCtx(): CanvasRenderingContext2D {
    return this.displayManager.getCtx();
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
  public existeModifiedBox(coordinate: number[]): boolean {console
    return this.modifiedboxes.has(coordinate.join(","));
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

  public resize(){
    // TODO
    const canvas = this.displayManager.getCanvas();
    if (canvas){
      const drawnWidth = Math.ceil(canvas.width/this.width);
      const drawnHeight = Math.ceil(canvas.width/this.width);
      this.boxSize = drawnWidth;
      this.show();
    }
  }

  public refresh(dto : GameUpdateResponseDTO){
    this.boxSize = dto.boxSize;

    const canvas = this.displayManager.getCanvas();
    if (canvas){
      this.gridWidth = canvas.width / this.boxSize;
      this.gridHeight = canvas.height / this.boxSize;
    }
    
    this.setEntities(dto.entities);
  }

  // ============================ Requete DTO ============================ \\

  /**
   * Update les entités affichées
   * @param enities // objets entité données par le serveur
   */
  private setEntities(enities: EntityServer[]): void {
    enities.forEach(entity => {
      const entityBoxes = entity.boxes;
      const entityID = entity.id;
      const entityType = entity.type;



      if (entityID && entityBoxes && entityType) {
        let entityObject: EntityDisplayed;
        switch (entityType) {
          case ("SNAKE" as EntityType):
            entityObject = new SnakeDisplayed(this, entityBoxes, 1000, new Design("green"), 0);
            break;

        
          default:
            entityObject = new EntityDisplayed(this, entityBoxes, 1000, new Design("black"), 0);
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
  private setEntity(id: number, entity: EntityDisplayed): void {
    const oldEntity = this.entities.get(id) as EntityDisplayed;
    if (oldEntity) {
      oldEntity.clear();
    }
    this.entities.set(id,entity);
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
    const canvas = this.displayManager.getCanvas()

    if (canvas) {
      this.getCtx().clearRect(0, 0, canvas.width, canvas.height);
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
      setTimeout(this.loop, 1000 / 30);
    }
  }
}
