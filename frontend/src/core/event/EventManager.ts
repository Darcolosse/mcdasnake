import type { GameManager } from "../GameManager";
import type { TurnRequestDTO } from "../network/dto/requests/TurnRequest";
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

  public raiseEvent(event: TurnRequestDTO) {
    this.gameManager.handleClientEvent(event)
  }
}
