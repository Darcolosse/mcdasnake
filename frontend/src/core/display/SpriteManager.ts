import type { GameManager } from "../GameManager";

export const SpriteName = {
  APPLE:"APPLE",
  SCALE:"SCALE",
  SCALE2:"SCALE2",
  HEAD_BETA:"HEAD_BETA",
  HEAD_HUGOAT:"HEAD_HUGOAT",
  HEAD_DARCO:"HEAD_DARCO",
  HEAD_MCDALA:"HEAD_MCDALA",
  HEAD_CLASSIC:"HEAD_CLASSIC",
} as const;
export type SpriteName = typeof SpriteName[keyof typeof SpriteName];


export class SpriteManager {
  private static SPRITE_FOLDER = "sprites/";

  private gameManager?: GameManager;
  private sprites: Map<string, HTMLImageElement> = new Map();
  private loadedCount = 0;
  private totalToLoad = 0;
  private isReady = false;
  private onReadyCallback?: () => void;

  private spritesPath: Record<SpriteName, string>;

  constructor() {
    this.spritesPath = {
      [SpriteName.APPLE] : SpriteManager.SPRITE_FOLDER + "apple.png",
      [SpriteName.SCALE] : SpriteManager.SPRITE_FOLDER + "scale.jpg",
      [SpriteName.SCALE2] : SpriteManager.SPRITE_FOLDER + "scale2.jpg",
      [SpriteName.HEAD_BETA]: SpriteManager.SPRITE_FOLDER + "head.png",
      [SpriteName.HEAD_HUGOAT]: SpriteManager.SPRITE_FOLDER + "head_hugoat.jpg",
      [SpriteName.HEAD_DARCO]: SpriteManager.SPRITE_FOLDER + "head_darco.jpg",
      [SpriteName.HEAD_MCDALA]: SpriteManager.SPRITE_FOLDER + "head_mcdala.jpg",
      [SpriteName.HEAD_CLASSIC]: SpriteManager.SPRITE_FOLDER + "head3.svg",
    };
    this.totalToLoad = Object.keys(this.spritesPath).length;
    this.loadAllSprites(this.spritesPath);
  }

  public setGameManager(gameManager: GameManager){
    this.gameManager = gameManager;
  }

  /** Charge toutes les images du dictionnaire */
  private loadAllSprites(spritePaths: Record<string, string>): void {
    this.gameManager?.log(this, `Loading ${this.totalToLoad} sprites`);
    for (const [name, path] of Object.entries(spritePaths)) {
      const img = new Image();
      img.src = path;
      img.onload = () => this.handleLoaded(name, img);
      img.onerror = () => this.gameManager?.raiseError(`Erreur de chargement du sprite "${name}" (${path})`);
    }
  }

  /** Appelé à chaque image chargée */
  private handleLoaded(name: string, img: HTMLImageElement): void {
    this.sprites.set(name, img);
    this.loadedCount++;

    if (this.loadedCount === this.totalToLoad) {
      this.isReady = true;
      this.gameManager?.log(this, `All ${this.totalToLoad} sprites loaded.`);
      if (this.onReadyCallback) {
        this.onReadyCallback();
        this.onReadyCallback = undefined; // évite les doubles appels
      }
    }
  }

  /** Retourne le sprite demandé */
  public get(name: SpriteName): HTMLImageElement | undefined {
    return this.sprites.get(name);
  }

  /** Retourne le chemin du sprite */
  public getPath(name: SpriteName): string {
    return this.spritesPath[name];
  }

  /** Appelle une fonction dès que tous les sprites sont chargés */
  public onReady(cb: () => void): void {
    if (this.isReady) cb();
    else this.onReadyCallback = cb;
  }
}
