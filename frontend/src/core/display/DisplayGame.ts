import { DisplayManager } from './DisplayManager.ts';
import { EntityDisplayed } from './EntityDisplayed.ts';
import { Design, Graphism } from './Design.ts';
import type { EntityServer } from '../network/dto/responses/EntityServer.ts';
import type { GameUpdateResponseDTO } from '../network/dto/responses/GameUpdateResponse.ts';
import { AppleDisplayed } from './AppleDisplayed.ts';
import { SpriteManager, SpriteName } from './SpriteManager.ts';
import type { GameRefreshDTO } from '../network/dto/responses/GameRefresh.ts';
import { SnakeDisplayed } from './SnakeDisplayed.ts';
import { CookieType, getCookie } from '../../util/cookies.ts';
import { SettingsAction } from '../../components/SettingsAction.ts';

type EntityType = "SNAKE" | "APPLE" | "ENTITY";

export class DisplayGame {

  private displayManager: DisplayManager;
  protected entities: Map<string, EntityDisplayed> = new Map(); // liste des entités présente dans le jeu
  protected zindex: string[] = [];
  private modifiedboxes: Set<string> = new Set(); // liste des cases changé lors d'une animation  (ex: "3,6")
  private inLoop: boolean = false;
  private spriteManager: SpriteManager;
  private gameSpeed : number = 500;
  private graphism : Graphism;

  constructor(displayManager: DisplayManager) {
    this.displayManager = displayManager;
    this.spriteManager = new SpriteManager();
    if (displayManager) {this.spriteManager.setGameManager(displayManager.gameManager)}
    this.spriteManager.onReady(() => this.animate());
    this.loop = this.loop.bind(this);

    // graphism parameter
    this.graphism = this.getGraphismFromCookie();
    console.log(this.graphism);
  }

  // ============================ Get ============================ \\

  /**
   * @returns renvoie le pinceau permettant d'afficher des éléments sur la grille
   */
  public getCtx(): CanvasRenderingContext2D {
    return this.displayManager.getCtx();
  }

  public getCanvas(): HTMLCanvasElement {
    return this.displayManager.getCanvas();
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
  public existeModifiedBox(coordinate: number[]): boolean {
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

  public refresh(dto : GameRefreshDTO | GameUpdateResponseDTO){
    const snakes = dto.entities.snakes;
    const apples = dto.entities.apples;
    console.log(apples)

    if ("speed" in dto){
      this.gameSpeed = dto.speed;
    }
    
    if ("removed" in dto.entities){
      this.removeEntities(dto.entities.removed);
    }

    this.setEntities("SNAKE", snakes);
    this.setEntities("APPLE", apples);
  }

  // ============================ Requete DTO ============================ \\

  /**
   * Update les entités affichées
   * @param enities // objets entité données par le serveur
   */
  private setEntities(entityType: EntityType, entites: EntityServer[]): void {

    entites.forEach(entity => {
      const entityBoxes = entity.boxes;
      const entityID = entity.id;
      //const entityName = entity.name;

      if (entityID && entityBoxes) {
        let entityObject: EntityDisplayed;
        switch (entityType) {
          case ("SNAKE"):
            const design = this.getEntityDesign(entity);
            console.log(design);
            entityObject = new SnakeDisplayed(
              this,
              entityBoxes,
              this.gameSpeed,
              design,
              1
            );
            break;
          case ("APPLE"):
            entityObject = new AppleDisplayed(
              this,
              entityBoxes,
              1000,
              new Design("red", SpriteName.APPLE, this.graphism),
              0,
            );
            break;

          default:
            console.log("default")
            entityObject = new EntityDisplayed(
              this,
              entityBoxes,
              1000,
              new Design("black", SpriteName.HEAD_CLASSIC, this.graphism),
              -1,
            );
            break;
        }
        this.setEntity(entityID, entityObject);
      }
    });
  }

  private removeEntities(ids: string[]){
    ids.forEach(id => {
      this.removeEntity(id);
    });
  }

  private removeEntity(id: string){
    const oldEntity = this.entities.get(id);
    if (oldEntity) {
      this.removeFromZindex(id)
      oldEntity.clear()
      this.entities.delete(id)
    } else {
      console.log("unknow entity " + id);
    }
  }

  /**
   * @param id identifié de l'entité à ajouter / ou  à modifier
   * @param entity objet représentant l'entité
   */
  protected setEntity(id: string, entity: EntityDisplayed): void {
    const oldEntity = this.entities.get(id) as EntityDisplayed;
    if (oldEntity) {
      oldEntity.clear();
      this.removeFromZindex(id);
    }
    this.entities.set(id,entity);
    this.insertInZindex(id, entity.getZindex());
  }

  private insertInZindex(id: string, layer: number) {
    let insertionIndex = 0;
    for (const [index, otherId] of this.zindex.entries()) {
      const otherEntity = this.entities.get(otherId) as EntityDisplayed;
      if (otherEntity.getZindex() >= layer) {
        break;
      }
      insertionIndex = index+1
    }

    this.zindex.splice(insertionIndex, 0, id);
  }

  private removeFromZindex(id: string) {
    const index = this.zindex.indexOf(id)
    if (index !== -1){
      this.zindex.splice(index, 1)
    }
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
    const canvas = this.getCanvas();

    if (canvas) {
      this.getCtx().clearRect(0, 0, canvas.width, canvas.height)
      for (const id of this.zindex) {
        const entity = this.entities.get(id)
        entity?.setFullAnimation(true)
        entity?.animate(Date.now())
      }
    }
  }

  /**
   * Update les partie qui ont changé sur la grille de jeu
   */
  public animate(): void {
    this.clearModifiedboxes()
    for (const id of this.zindex) {
      this.entities.get(id)?.clearChange(Date.now())
    }
    for (const id of this.zindex) {
      this.entities.get(id)?.animate()
    }
    this.clearModifiedboxes()
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
    if (this.graphism === "NORMAL"){
      this.show();
    }
    else{
      this.animate();
    }
    
    if (this.inLoop){
      setTimeout(this.loop, 1000 / 60);
    }
  }

  private getEntityDesign(entity: EntityServer): Design {
    const DEFAULT_COLOR = "lightblue";
    const DEFAULT_HEAD: SpriteName = "HEAD_CLASSIC";

    const [design, useless] = entity.design ?? [];
    try{
      
      if (design){
        const designObject = JSON.parse(design);
        const result = new Design(
          designObject.color1,
          designObject.head,
          //designObject.graphism,
          this.graphism
        );
        if (designObject.color2){
          result.setColor2(designObject.color2);
        }
        if (designObject.texture){
          result.setTexture(designObject.texture);
        }
        return result;
      }
    }
    catch(e){
      console.log(e);
    }
    return new Design(DEFAULT_COLOR, DEFAULT_HEAD, this.graphism)
    
  }

  private getGraphismFromCookie(): Graphism {
    const DEFAULT_GRAPHISM = Graphism.NORMAL;

    const designStr = SettingsAction.getStringDesign(getCookie(CookieType.Design) as string);
    if (!designStr) return DEFAULT_GRAPHISM;

    try {
      const design = JSON.parse(designStr) as { graphism?: string };
      return (design.graphism as Graphism) ?? DEFAULT_GRAPHISM;
    } catch {
      return DEFAULT_GRAPHISM; // sécurité en cas de JSON invalide
    }
  }
}
