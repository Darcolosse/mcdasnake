export const SpriteName = {
  APPLE:"APPLE",
  HEAD_BETA:"HEAD_BETA",
  HEAD_FUN:"HEAD_FUN",
  HEAD_CLASSIC:"HEAD_CLASSIC",
} as const;
export type SpriteName = typeof SpriteName[keyof typeof SpriteName];


export class SpriteManager {
  private static SPRITE_FOLDER = "/src/core/display/sprite/";

  private sprites: Map<string, HTMLImageElement> = new Map();
  private loadedCount = 0;
  private totalToLoad = 0;
  private isReady = false;
  private onReadyCallback?: () => void;

  private spritesPath: Record<SpriteName, string>;

  constructor() {
    this.spritesPath = {
      [SpriteName.APPLE] : SpriteManager.SPRITE_FOLDER + "apple.png",
      [SpriteName.HEAD_BETA]: SpriteManager.SPRITE_FOLDER + "head.png",
      [SpriteName.HEAD_FUN]: SpriteManager.SPRITE_FOLDER + "head2.jpg",
      [SpriteName.HEAD_CLASSIC]: SpriteManager.SPRITE_FOLDER + "head3.svg",
    };
    this.totalToLoad = Object.keys(this.spritesPath).length;
    this.loadAllSprites(this.spritesPath);
  }

  /** Charge toutes les images du dictionnaire */
  private loadAllSprites(spritePaths: Record<string, string>): void {
    for (const [name, path] of Object.entries(spritePaths)) {
      const img = new Image();
      img.src = path;
      img.onload = () => this.handleLoaded(name, img);
      img.onerror = () => console.warn(`Erreur de chargement du sprite "${name}" (${path})`);
    }
  }

  /** Appelé à chaque image chargée */
  private handleLoaded(name: string, img: HTMLImageElement): void {
    this.sprites.set(name, img);
    this.loadedCount++;
    console.log(name + " loaded " + this.loadedCount);

    if (this.loadedCount === this.totalToLoad) {
      this.isReady = true;
      console.log(`Tous les ${this.totalToLoad} sprites sont chargés.`);
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
