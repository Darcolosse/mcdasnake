import { CookieType, getCookie, getCookiePlus } from "../util/cookies";
import { DisplayManager } from "./display/DisplayManager"
import { EventManager } from "./event/EventManager";
import type { InterfaceManager } from "./interface/InterfaceManager";
import { DTOType, type DTO } from "./network/dto/DTO";
import { GameAddPlayerDTO } from "./network/dto/requests/GameAddPlayerDTO";
import type { GameRefreshDTO } from "./network/dto/responses/GameRefresh";
import { GameUpdateResponseDTO } from "./network/dto/responses/GameUpdateResponse";
import { NetworkManager } from "./network/NetworkManager";

export class GameManager {

  private readonly debug : boolean = true;

  private readonly displayManager: DisplayManager;
  private readonly eventManager: EventManager;
  private readonly networkManager: NetworkManager;
  private readonly interfaceManager: InterfaceManager;

  constructor (interfaceManager: InterfaceManager) {
    this.displayManager = new DisplayManager(this)
    this.eventManager = new EventManager(this)
    this.networkManager = new NetworkManager(this, `ws://${import.meta.env.VITE_BACKEND_IP}:${import.meta.env.VITE_BACKEND_PORT}`)
    this.interfaceManager = interfaceManager
  }

  // ====================== Vertical layer ======================= \\

  public start(background : HTMLCanvasElement | null, canvas : HTMLCanvasElement | null) {
    if(background && canvas) {
      this.log(this, "Initializing canvas and connecting to server")
      this.displayManager.initialize(background as HTMLCanvasElement, canvas as HTMLCanvasElement)
      this.displayManager.showConnection()
      this.networkManager.connect().then(() => {
        this.log(this, "Sending an add request to the server after being connected")
        this.eventManager.startListening()
        this.askServerForRespawn()
      })
    } else {
      this.raiseError("Canvas elements not found. Couldn't start the game.")
    }
  }

  public close() {
    this.log(this, "Closing")
    this.eventManager.stopListening()
    this.displayManager.destroy()
    this.networkManager.disconnect()
  }

  public askServerForRespawn() {
    const design = JSON.parse(getCookiePlus(CookieType.Design) as string)
    this.handleClientEvent(new GameAddPlayerDTO(
      getCookie(CookieType.Username) as string,
      design.color,
      design.head
    ))
    this.eventManager.startListening();
    this.interfaceManager.restrictRespawn()
  }
  
  // ===================== Management layer ====================== \\

  public handleClientEvent(eventDTO: DTO) {
    this.log(this, "Handling client event", eventDTO)
    switch(eventDTO.type) {
      case DTOType.AddPlayer :
      case DTOType.GameUpdate :
      case DTOType.SnakeTurn :
        this.networkManager.emit(eventDTO);
        break;
      default:
        this.log(this, "Handler of event not implemented.", eventDTO)
        break;
    }
  }

  public handleServerEvent(eventDTO: DTO) {
    this.log(this, "Handling an event from server");
    switch(eventDTO.type) {
      case DTOType.GameDeadPlayer :
        this.eventManager.clearSavedInputs();
        this.eventManager.stopListening();
        this.interfaceManager.permitToRespawn();
        break;
      case DTOType.GameRefresh :
        console.log(eventDTO);
        this.displayManager.refreshGame(eventDTO as GameRefreshDTO);
        this.interfaceManager.updateScoreboard(eventDTO as GameRefreshDTO)
        break;
      case DTOType.GameUpdate :
        this.interfaceManager.setEntireScoreboard(eventDTO as GameUpdateResponseDTO)
        this.displayManager.updateGameLayers(eventDTO as GameUpdateResponseDTO);
        this.displayManager.showGame();
        break;
      default:
        this.log(this, "Handler of event not implemented.", eventDTO);
        break;
    }
    
  }

  public log(responsible: object, ...data: any[]){
    if(this.debug) {
      if(data[0] && typeof data[0] === "string") {
        console.log(`[${responsible.constructor.name.toUpperCase()}] ${data[0]}`, data.slice(1))
      } else {
        console.log(`[${responsible.constructor.name.toUpperCase()}]`, data)
      }
    }
  }

  public raiseError(errorMessage: string, error: any = null) {
    console.error('[FATAL]', errorMessage, error)
    // /!\ /!\ /!\
    //window.location.reload()
    // /!\ /!\ /!\
  }

}
