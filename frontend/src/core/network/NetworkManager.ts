import { GameManager } from "../GameManager"
import { DTOType, type DTO } from "./dto/DTO"
import { GameUpdateResponseDTO } from "./dto/responses/GameUpdateResponse"

export class NetworkManager {

  private readonly websocketURL: string

  private readonly gameManager: GameManager
  private socket: WebSocket | undefined

  constructor(gameManager: GameManager, websocketURL: string) {
    this.websocketURL = websocketURL
    this.gameManager = gameManager
    this.socket = undefined
  }

  // ====================== Vertical layer ======================= \\

  public connect() : Promise<void> {
    return new Promise((openHandler) => {
      this.socket = new WebSocket(this.websocketURL)
      this.registerHandlers(openHandler)
    })
  }

  public disconnect() {
    if(!this.socket) {
      this.gameManager.raiseError("Tried to disconnect from the game with a non initialized socket.");
      return;
    } 
    this.socket.close()
  }

  public emit(message: DTO) {
    if(!this.socket) {
      this.gameManager.raiseError("Tried to emit a message to the server with a non initialized socket.");
      return;
    } 
    this.socket.send(JSON.stringify(message)) 
  }

  // ===================== Management layer ====================== \\

  private registerHandlers(openHandler: () => void) {
    if(!this.socket) {
      this.gameManager.raiseError("Tried registering listeners and handlers of a non initialized socket.");
      return;
    } 

    // #                        #
    // # Connection established #
    // #                        #
    this.socket.addEventListener('open', _ => {
      openHandler()
    });

    // #                                 #
    // # The server sends data to client #
    // #                                 #
    this.socket.addEventListener('message', event => {
      try {
        const json = JSON.parse(event.data);
        switch(json.type) {
          case DTOType.GameUpdate: this.gameManager.handleServerEvent(new GameUpdateResponseDTO(json));
        }
      } catch (error) {
        this.gameManager.raiseError("Couldn't read received event :", error)
      }
    });

    // #                                        #
    // # The server closed connection of client #
    // #                                        #
    this.socket.addEventListener('close', event => {
      this.gameManager.raiseError("WebSocket connection closed:", event);
    });

    // #               #
    // # Network error #
    // #               #
    this.socket.addEventListener('error', error => {
      this.gameManager.raiseError("WebSocket error:", error)
    });
  }

}
