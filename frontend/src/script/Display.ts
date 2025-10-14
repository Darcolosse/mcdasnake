import { EntityDisplayed } from './EntityDisplayed.ts';

export class Display{

    private entities : Map<number, EntityDisplayed> = new Map(); // liste des entités présente dans le jeu
    private canvas! : HTMLCanvasElement; // canvas ou est affiché le jeu
    private ctx : CanvasRenderingContext2D | null = null; // pinceau permettant d'afficher le jeu
    private boxSize : number = 0; // taille en pixel des cases
    private modifiedboxes : Set<string> = new Set(); // liste des cases changé lors d'une animation  (ex: "3,6")
    
    constructor(canvas : HTMLCanvasElement, boxSize : number){
        this.boxSize = boxSize;
        this.setCanvas(canvas);
    }

    // ============================ Set ============================ \\

    /**
     * Change le canvas utilisé pour le jeu et update l'affichage
     * @param canvas le nouveau canvas
     */
    public setCanvas(canvas : HTMLCanvasElement) : void{
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.show();
    }

    /**
     * Change la taille des cases et update l'affichage
     * @param boxSize nouvelle taille de case en pixel
     */
    public setboxSize(boxSize: number) : void{
        this.boxSize = boxSize;
        this.show();
    }

    /**
     * @param id identifié de l'entité à ajouter / ou  à modifier
     * @param entity objet représentant l'entité
     */
    public setEntity(id : number, entity : EntityDisplayed) : void{
        if (this.entities[id]){
            this.entities[id].clear();
        }
        this.entities[id] = entity;
    }

    // ============================ Get ============================ \\

    /**
     * @returns renvoie le pinceau permettant d'afficher des éléments sur la grille
     */
    public getCtx() : CanvasRenderingContext2D {
        if (!this.ctx) {
            throw new Error("Contexte 2D non initialisé. Assurez-vous d'appeler setCanvas avant.");
        }
        return this.ctx
    }
    
    /**
     * @returns Renvoie la taille en pixel d'une case de jeu
     */
    public getBoxSize() : number{
        return this.boxSize;
    }

    // ============================ Methodes publiques de case modifié ============================ \\
    
    /**
     * Vérifie si une case à été effacé pendant l'animation
     * @param coordinate Coordonnée de la case à vérifier
     * @returns si la case à été effacé ou non
     */
    public existeModifiedBox(coordinate : number[]): boolean{
        return this.modifiedboxes.has(coordinate.join("_"));
    }

    // ============================ Méthodes d'affichage ============================ \\

    /**
     * Efface une case de la grille de jeu
     */
    public clearBox(coordinate : number[]) : void{
        if (!this.existeModifiedBox(coordinate)){
            this.getCtx().clearRect(
                coordinate[0]*this.getBoxSize(),
                coordinate[1]*this.getBoxSize(),
                this.getBoxSize(),
                this.getBoxSize()
            );
            this.addModifiedbox(coordinate);
        }
    }

    /**
     * Update entièrement la grille de jeu
     */
    public show() : void{
        this.getCtx().clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (const entity of this.entities.values()) {
            entity.setFullAnimation(true);
            entity.animate();
        };
    }

    /**
     * Update les partie qui ont changé sur la grille de jeu
     */
    public animate() : void{
        this.clearModifiedboxes();
        for (const entity of this.entities.values()) {
            entity.clearChange();
        };
        for (const entity of this.entities.values()) {
            entity.animate(Date.now());
        };
        this.clearModifiedboxes();
    };

    // ============================ Methodes privées de case modifié ============================ \\

    /**
     * Signal qu'une case à été effacé
     * @param coordinate coordonnée de la case effacée
     */
    private addModifiedbox(coordinate : number[]) : void{
        this.modifiedboxes.add(coordinate.join(","));
    }

    /**
     * reset l'attribut modifiedboxes, pour indiquer qu'ancune case n'a été effacé
     */
    private clearModifiedboxes() : void{
        this.modifiedboxes = new Set();
    }
}