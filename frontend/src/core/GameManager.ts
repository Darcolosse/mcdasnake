import { DisplayManager } from "./display/DisplayManager"
import { EventManager } from "./event/EventManager";
import { DTOType, type DTO } from "./network/dto/DTO";
import { GameUpdateRequestDTO } from "./network/dto/requests/GameUpdateRequest";
import { GameUpdateResponseDTO } from "./network/dto/responses/GameUpdateResponse";
import { NetworkManager } from "./network/NetworkManager";

export class GameManager {

  private readonly displayManager: DisplayManager;
  private readonly eventManager: EventManager;
  private readonly networkManager: NetworkManager;

  constructor () {
    this.displayManager = new DisplayManager(this)
    this.eventManager = new EventManager(this)
    this.networkManager = new NetworkManager(this, "ws://127.0.0.1:5001")
  }

  // ====================== Vertical layer ======================= \\

  public start(background : HTMLCanvasElement | null, canvas : HTMLCanvasElement | null) {
    if(background && canvas) {
      this.displayManager.initialize(background as HTMLCanvasElement, canvas as HTMLCanvasElement)
      this.displayManager.showConnection()
      this.networkManager.connect().then(() => {
        this.eventManager.startListening()
        this.networkManager.emit(new GameUpdateRequestDTO())
      })
      this.test();
    } else {
      this.raiseError("Canvas elements not found. Couldn't start the game.")
    }
  }

  public test(){
    this.handleServerEvent(new GameUpdateResponseDTO(
      {
        "boxSize": 20,
        "entities": [
                      {"id": 1, "boxes":[[1,1],[2,1],[3,1],[3,2]], "type": "SNAKE"},
                      {"id": 2, "boxes":[[3,6]], "type": "APPLE"},
                    ] 
      }
    ))
  }

  public close() {
    this.eventManager.stopListening()
    this.displayManager.destroy()
    this.networkManager.disconnect()
  }
  
  // ===================== Management layer ====================== \\

  public handleClientEvent(eventDTO: DTO) {
    console.log(eventDTO)
  }

  public handleServerEvent(eventDTO: DTO) {
    switch(eventDTO.type) {
      case DTOType.GameUpdate :
        this.displayManager.refreshGame(eventDTO as GameUpdateResponseDTO)
        this.displayManager.showGame()
        break;
    }
    
  }

  public raiseError(errorMessage: string, error: any = null) {
    console.error('[FATAL]', errorMessage, error)
    // /!\ /!\ /!\
    //window.location.reload()
    // /!\ /!\ /!\
  }

}
