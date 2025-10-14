export class SnakeEvent{

    public static UP: number = 0;
    public static RIGHT: number = 1;
    public static DOWN: number = 2;
    public static LEFT: number = 3;

    public static INPUT_KEY: Record<string,number> = {
        "ArrowUp" : SnakeEvent.UP,
        "ArrowRight" : SnakeEvent.RIGHT,
        "ArrowDown" : SnakeEvent.DOWN,
        "ArrowLeft" : SnakeEvent.LEFT,
    };

    private keyPressed: boolean[] = [false, false, false, false]; // indique si les flèches du clavier sont pressées ou non
    private threshold: number = 100; // nombre de pixel à parcourir avec son doigt pour tourner
    private start : number[] = []; // point [x,y] ou le doigt est posé

    private mediator : object; // classe permettant d'interagir avec le serveur

    
    constructor(mediator : object){
        this.mediator = mediator;
        this.listen();
    }

    // ============================ Methodes publique ============================ \\

    /**
     * Ajoute des ecouteur d'évènement sur la page nécessaire au jeu
     */
    public listen() : void {
        // clavier
        document.addEventListener('keydown', this.eventInput.bind(this));
        document.addEventListener('keyup', this.eventOutput.bind(this));

        // mobile
        document.addEventListener('touchstart', this.eventTouchstart.bind(this));
        document.addEventListener('touchmove', this.eventTouchmove.bind(this), { passive: false });
    }

    /**
     * Retire les écouteur d'évènement de la page nécessaire au jeu
     */
    public stopListening() : void {
        // clavier
        document.removeEventListener('keydown', this.eventInput);
        document.removeEventListener('keyup', this.eventOutput);

        // mobile
        document.removeEventListener('touchstart', this.eventTouchstart);
        document.removeEventListener('touchmove', this.eventTouchmove);
    }

    // ============================ Call Mediator ============================ \\

    /**
     * Demmande au médiateur un changement de direction
     * @param direction la direction dans laquelle tourner
     */
    public changeDirection(direction : number) : void {
        // TODO (call this.mediator)
    }

    // ============================ Evenement Clavier ============================ \\

    /**
     * lorsqu'une touche est enfoncé
     * @param e 
     */
    private eventInput(e : KeyboardEvent) : void {
        const direction = SnakeEvent.INPUT_KEY[e.key];
        if (direction !== undefined && !this.keyPressed[direction]){
            this.changeDirection(direction);
            this.keyPressed[direction] = true;
        }
    }

    /**
     * lorsqu'une touche est relaché
     * @param e 
     */
    private eventOutput(e : KeyboardEvent) : void {
        const direction = SnakeEvent.INPUT_KEY[e.key];
        if (direction !== undefined){
            this.keyPressed[direction] = false;
        }
    }

    // ============================ Evenement Mobile ============================ \\
    
    /**
     * Lorsqu'un doigt est posé sur l'écran
     * @param e 
     */
    private eventTouchstart(e : TouchEvent) : void {
        this.start = [
            e.changedTouches[0].pageX,
            e.changedTouches[0].pageY,
        ];
    }

    /**
     * Lorsqu'un doigt glisse sur l'écran
     * @param e 
     */
    private eventTouchmove(e : TouchEvent) : void {
        e.preventDefault();
        const touch = [
            e.changedTouches[0].pageX,
            e.changedTouches[0].pageY,
        ];
        const dist = [
            touch[0] - this.start[0],
            touch[1] - this.start[1]
        ];
        if (dist[0] > this.threshold){
            this.changeDirection(SnakeEvent.RIGHT);
            this.start = touch;
        }
        if (-dist[0] > this.threshold){
            this.changeDirection(SnakeEvent.LEFT);
            this.start = touch;
        }
        if (dist[1] > this.threshold){
            this.changeDirection(SnakeEvent.DOWN);
            this.start = touch;
        }
        if (-dist[1] > this.threshold){
            this.changeDirection(SnakeEvent.UP);
            this.start = touch;
        }
    }
}