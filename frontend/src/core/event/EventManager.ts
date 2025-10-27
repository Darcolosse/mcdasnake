import type { GameManager } from "../GameManager";
import type { GameUpdateSnakeDirectionDTO } from "../network/dto/requests/GameUpdateSnakeDirectionDTO";
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
    this.gameManager.log(this, "Starting listeners")
    this.snakeEventListener.listen()
  }

  public stopListening() {
    this.gameManager.log(this, "Stopping listeners")
    this.snakeEventListener.stopListening()
  }
  
  // ===================== Management layer ====================== \\

  public raiseEvent(event: GameUpdateSnakeDirectionDTO) {
    this.gameManager.handleClientEvent(event)
  }
}
