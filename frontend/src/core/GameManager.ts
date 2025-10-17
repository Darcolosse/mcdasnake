import { DisplayManager, type EntityServer } from "./display/DisplayManager"
import { EventManager } from "./event/EventManager";
import { DTOType, type DTO } from "./network/dto/DTO";
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

  public start(canvas : HTMLCanvasElement | null) {
    if(canvas) {
      this.networkManager.connect().then(() => {
        this.displayManager.initialize(canvas as HTMLCanvasElement)
        this.eventManager.startListening()
        this.networkManager.emit(new GameUpdateRequestDTO())
      })
      this.test(canvas);
    } else {
      this.raiseError("Canvas element not found. Couldn't start the game.")
    }
  }

  public test(canvas : HTMLCanvasElement){
    this.displayManager.initialize(canvas as HTMLCanvasElement);
    this.displayManager.setboxSize(20);
    this.displayManager.setEntities([
      {"id": 1, "boxes":[[1,1],[2,1],[3,1],[3,2]]},
      {"id": 2, "boxes":[[3,6]]},
    ] as EntityServer[]);
    this.displayManager.startLoop();
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
        //this.displayManager.refresh(eventDTO as GameUpdateResponseDTO)
        break;
    }
    
  }

  public raiseError(errorMessage: string, error: any = null) {
    console.error(errorMessage, error)
  }

}
