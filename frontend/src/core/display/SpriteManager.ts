import type { SpriteName } from './DisplayGame.ts'

export class SpriteManager {
    private static SPRITE_FOLDER = "/src/core/display/sprite/"

    private sprites: Map<string, HTMLImageElement> = new Map();
    private loadedCount = 0;
    private totalToLoad = 0;
    //private isReady = false;
    //private onReadyCallback?: () => void;

    constructor() {
        const sprites : Record<SpriteName, string> = {
            "APPLE": SpriteManager.SPRITE_FOLDER + "apple.png",
            "HEAD": SpriteManager.SPRITE_FOLDER + "head.png",
            // other sprites ...
        };
        this.totalToLoad = Object.keys(sprites).length;
        this.loadAllSprites(sprites);
    }

    /** Charge toutes les images du dictionnaire */
    private loadAllSprites(spritePaths : Record<string, string>): void {
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

        if (this.loadedCount === this.totalToLoad) {
            this.isReady = true;
            console.log(`Tous les ${this.totalToLoad} sprites sont chargés.`);
            //if (this.onReadyCallback) this.onReadyCallback();
        }
    }

    /** Retourne le sprite demandé */
    public get(name: SpriteName): HTMLImageElement | undefined {
        return this.sprites.get(name);
    }

    // /** Informe si toutes les images sont prêtes */
    // public ready(): boolean {
    //     return this.isReady;
    // }

    // /** Appelle une fonction dès que tous les sprites sont chargés */
    // public onReady(cb: () => void): void {
    //     if (this.isReady) cb();
    //     else this.onReadyCallback = cb;
    // }
}
