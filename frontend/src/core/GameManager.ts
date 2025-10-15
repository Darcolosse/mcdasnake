import { DisplayManager } from "./display/DisplayManager"
import { EventManager } from "./event/EventManager";
import type { DTO } from "./network/dto/DTO";
import { GameUpdateRequestDTO } from "./network/dto/requests/GameUpdateRequest";
import { NetworkManager } from "./network/NetworkManager";

export class GameManager {

  private readonly displayManager: DisplayManager;
  private readonly eventManager: EventManager;
  private readonly networkManager: NetworkManager;

  constructor () {
    this.displayManager = new DisplayManager(this)
    this.eventManager = new EventManager(this)
    this.networkManager = new NetworkManager(this, "")
  }

  // ====================== Vertical layer ======================= \\

  public start() {
    this.networkManager.connect().then(() => {
      this.displayManager.initialize()
      this.eventManager.startListening()
      this.networkManager.emit(new GameUpdateRequestDTO())
    })
  }

  public close() {
    this.eventManager.stopListening()
    this.displayManager.destroy()
    this.networkManager.disconnect()
  }
  
  // ===================== Management layer ====================== \\

  public handleClientEvent() {

  }

  public handleServerEvent(eventDTO: DTO) {
    
  }

  public raiseError(errorMessage: string, error: any = null) {
    console.error(errorMessage, error)
  }

}
