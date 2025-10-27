import { Direction, GameUpdateSnakeDirectionDTO } from "../network/dto/requests/GameUpdateSnakeDirectionDTO";
import { EventManager } from "./EventManager";

export class SnakeEvent {

  private eventManager : EventManager;

  private lastDirection: Direction| null;

  private static KEY_TO_DIRECTION: Record<string,Direction> = {
    "ArrowUp" : Direction.UP,
    "ArrowRight" : Direction.RIGHT,
    "ArrowDown" : Direction.DOWN,
    "ArrowLeft" : Direction.LEFT,
  }

  private static INPUT_KEY: Record<string,boolean> = {
    "ArrowUp" : false,
    "ArrowRight" : false,
    "ArrowDown" : false,
    "ArrowLeft" : false,
  };

  private threshold: number = 100;
  private start : [number, number] = [0, 0];
  
  constructor(eventManager: EventManager){
    this.eventManager = eventManager
    this.lastDirection = null
  }

  // ============================ Pullic methods ============================ \\

  public listen() : void {
    // keyboard
    document.addEventListener('keydown', this.eventInput.bind(this));
    document.addEventListener('keyup', this.eventOutput.bind(this));

    // mobile
    document.addEventListener('touchstart', this.eventTouchstart.bind(this));
    document.addEventListener('touchmove', this.eventTouchmove.bind(this), { passive: false });
  }

  public stopListening() : void {
    // keyboard
    document.removeEventListener('keydown', this.eventInput);
    document.removeEventListener('keyup', this.eventOutput);

    // mobile
    document.removeEventListener('touchstart', this.eventTouchstart);
    document.removeEventListener('touchmove', this.eventTouchmove);
  }

  // ============================ Call Mediator ============================ \\

  public changeDirection(direction : Direction | undefined) : void {
    if(direction && direction != this.lastDirection) {
      this.lastDirection = direction
      this.eventManager.raiseEvent(new GameUpdateSnakeDirectionDTO(direction))
    } 
  }

  // ============================ Evenement Clavier ============================ \\

  private eventInput(e : KeyboardEvent) : void {
    const isAlreadyPressed = SnakeEvent.INPUT_KEY[e.key];
    if (isAlreadyPressed !== undefined && !isAlreadyPressed){
      this.changeDirection(SnakeEvent.KEY_TO_DIRECTION[e.key]);
      SnakeEvent.INPUT_KEY[e.key] = true;
    }
  }

  private eventOutput(e : KeyboardEvent) : void {
    const isAlreadyPressed = SnakeEvent.INPUT_KEY[e.key];
    if (isAlreadyPressed !== undefined && isAlreadyPressed){
      SnakeEvent.INPUT_KEY[e.key] = false;
    }
  }

  // ============================ Events on Mobile ============================ \\
  
  private eventTouchstart(e : TouchEvent) : void {
    const touch = e.changedTouches[0]
    if(touch) {
      this.start = [
        touch.pageX,
        touch.pageY,
      ];
    }
  }

  private eventTouchmove(e : TouchEvent) : void {
    e.preventDefault();
    const eTouch = e.changedTouches[0]
    if(eTouch && eTouch.pageX && eTouch.pageY) {
      const touch: [number, number] = [
        eTouch.pageX,
        eTouch.pageY,
      ];
      const dist: [number, number] = [
        touch[0] - this.start[0],
        touch[1] - this.start[1]
      ];
      const notify = (direction: Direction) => {
        this.changeDirection(direction);
        this.start = touch;
      }
      if (dist[0] > this.threshold) notify(Direction.RIGHT)
      if (-dist[0] > this.threshold) notify(Direction.LEFT)
      if (dist[1] > this.threshold) notify(Direction.DOWN)
      if (-dist[1] > this.threshold) notify(Direction.UP)
    }
  }
}
