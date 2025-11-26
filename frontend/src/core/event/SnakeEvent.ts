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

  private boundEventInput: (e: KeyboardEvent) => void;
  private boundEventOutput: (e: KeyboardEvent) => void;
  private boundEventTouchstart: (e: TouchEvent) => void;
  private boundEventTouchmove: (e: TouchEvent) => void;
  
  constructor(eventManager: EventManager){
    this.eventManager = eventManager
    this.lastDirection = null

    
    this.boundEventInput = this.eventInput.bind(this);
    this.boundEventOutput = this.eventOutput.bind(this);
    this.boundEventTouchstart = this.eventTouchstart.bind(this);
    this.boundEventTouchmove = this.eventTouchmove.bind(this);
  }

  // ============================ Pullic methods ============================ \\

  public listen(): void {
    document.addEventListener('keydown', this.boundEventInput);
    document.addEventListener('keyup', this.boundEventOutput);
    document.addEventListener('touchstart', this.boundEventTouchstart);
    document.addEventListener('touchmove', this.boundEventTouchmove, { passive: false });
  }

  public stopListening(): void {
    document.removeEventListener('keydown', this.boundEventInput);
    document.removeEventListener('keyup', this.boundEventOutput);
    document.removeEventListener('touchstart', this.boundEventTouchstart);
    document.removeEventListener('touchmove', this.boundEventTouchmove);
  }

  public clearSavedInputs() {
    this.lastDirection = null
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
