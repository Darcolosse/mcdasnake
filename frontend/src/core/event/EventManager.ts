import type { GameManager } from "../GameManager";
import { SnakeEvent } from "./SnakeEvent";

export class EventManager {

  private readonly gameManager: GameManager;
  private readonly snakeEventListener: SnakeEvent;

  constructor (gameManager: GameManager) {
    this.gameManager = gameManager
    this.snakeEventListener = new SnakeEvent(this)
  }

  // ====================== Vertical layer ======================= \\

  public startListening() {
    this.snakeEventListener.listen()
  }

  public stopListening() {
    this.snakeEventListener.stopListening()
  }
  
  // ===================== Management layer ====================== \\

  public raiseEvent(todo: string) {
    this.gameManager.handleClientEvent()
  }
}
