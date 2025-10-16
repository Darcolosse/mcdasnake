import { DisplayManager } from "./display/DisplayManager"
import { EventManager } from "./event/EventManager";
import { DTOType, type DTO } from "./network/dto/DTO";
import { GameUpdateRequestDTO } from "./network/dto/requests/GameUpdateRequest";
import type { GameUpdateResponseDTO } from "./network/dto/responses/GameUpdateResponse";
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

  public start(canvas : HTMLCanvasElement | null) {
    if(canvas) {
      this.networkManager.connect().then(() => {
        this.displayManager.initialize(canvas as HTMLCanvasElement)
        this.eventManager.startListening()
        this.networkManager.emit(new GameUpdateRequestDTO())
      })
    } else {
      this.raiseError("Canvas element not found. Couldn't start the game.")
    }
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
    switch(eventDTO.type) {
      case DTOType.GameUpdate :
        this.displayManager.refresh(eventDTO as GameUpdateResponseDTO)
        break;
    }
    
  }

  public raiseError(errorMessage: string, error: any = null) {
    console.error(errorMessage, error)
  }

}
