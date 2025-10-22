import { DisplayManager } from './DisplayManager.ts';
import { EntityDisplayed } from './EntityDisplayed.ts';
import { Design } from './Design.ts';
import { SnakeDisplayed } from './SnakeDisplayed.ts';
import { SnakeDisplayed2 } from './SnakeDisplayed2.ts';
import type { EntityServer } from '../network/dto/responses/EntityServer.ts';
import type { GameUpdateResponseDTO } from '../network/dto/responses/GameUpdateResponse.ts';
import { AppleDisplayed } from './AppleDisplayed.ts';
import { SpriteManager } from './SpriteManager.ts';

export type SpriteName = "APPLE" | "HEAD" | "SCALE";

export class DisplayGame {

  private displayManager: DisplayManager;
  private entities: Map<number, EntityDisplayed> = new Map(); // liste des entités présente dans le jeu
  private zindex: EntityDisplayed[] = [];
  private modifiedboxes: Set<string> = new Set(); // liste des cases changé lors d'une animation  (ex: "3,6")
  private inLoop: boolean = false;
  private spriteManager: SpriteManager;

  constructor(displayManager: DisplayManager) {
    this.displayManager = displayManager;
    this.spriteManager = new SpriteManager();
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
  public getBoxSize(): [number, number] {
    const helper = this.displayManager.getGridHelper();
    return [
      helper.getCasePixelWidth(),
      helper.getCasePixelHeight()
    ];
  }

  public getSprite(sprite: SpriteName) : HTMLImageElement | undefined{
    return this.spriteManager.get(sprite);
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
    this.show();
  }

  public refresh(dto : GameUpdateResponseDTO){
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
          case ("SNAKE"):
            entityObject = new SnakeDisplayed2(this, entityBoxes, 500, new Design("green"), 1, 0);
            break;
          case ("APPLE"):
            entityObject = new AppleDisplayed(this, entityBoxes, 1000, new Design("red"), 0, 0);
            break;

          default:
            entityObject = new EntityDisplayed(this, entityBoxes, 1000, new Design("black"), -1, 0);
            break;
        }
        this.setEntity(entityID, entityObject);
      }
    });
  }

  public removeEntity(id: number){
    const oldEntity = this.entities.get(id);
    if (oldEntity) {
      this.entities.delete(id);
      const index = this.zindex.indexOf(oldEntity);
      if (index !== -1) this.zindex.splice(index, 1);
    }
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
    this.updateZindex(entity);
  }

  private updateZindex(entity: EntityDisplayed){
    if (this.zindex.indexOf(entity) === -1){
      this.zindex.push(entity)
    }
    this.zindex.sort((a, b) => a.getZindex() - b.getZindex());
  }

  // ============================ Méthodes d'affichage ============================ \\

  /**
   * Efface une case de la grille de jeu
   */
  public clearBox(coordinate: [number, number]): void {
    if (!this.existeModifiedBox(coordinate)) {
      this.getCtx().clearRect(
        coordinate[0] * this.getBoxSize()[0],
        coordinate[1] * this.getBoxSize()[1],
        this.getBoxSize()[0],
        this.getBoxSize()[1]
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
      for (const entity of this.zindex) {
        entity.setFullAnimation(true);
        entity.animate(Date.now());
      }
    }
  }

  /**
   * Update les partie qui ont changé sur la grille de jeu
   */
  public animate(): void {
    this.clearModifiedboxes();
    for (const entity of this.zindex) {
      entity.clearChange(Date.now());
    }
    for (const entity of this.zindex) {
      entity.animate();
    }
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

  // ============================ other private methodes ============================ \\

  /**
   * La boucle de jeu
   */
  private loop() {
    //this.animate();
    this.show();
    if (this.inLoop){
      setTimeout(this.loop, 1000 / 30);
    }
  }
}
