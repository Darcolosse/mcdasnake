import { GameManager } from "../GameManager"
import { DTOType, type DTO } from "./dto/DTO"
import { GameDeadPlayerResponseDTO } from "./dto/responses/GamePlayerDead"
import { GameRefreshDTO } from "./dto/responses/GameRefresh"
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
    this.gameManager.log(this, `Trying to connect to the server on ${this.websocketURL}`)
    return new Promise((openHandler) => {
      this.socket = new WebSocket(this.websocketURL)
      this.registerHandlers(openHandler)
    })
  }

  public disconnect(): Promise<void> {
    return new Promise((resolve) => {
      const socket = this.socket; // Store reference locally

      if(!socket) {
          this.gameManager?.raiseError("Tried to disconnect from the game with a non initialized socket.")
          resolve()
          return;
      } 

      this.gameManager.log(this, `Closing websocket connection to ${this.websocketURL}`)

      // Wait for the close event on the local reference
      socket.addEventListener('close', () => {
          this.gameManager.log(this, "Websocket connection confirmed closed.");
          resolve();
      }, { once: true });
      
      // Initiate the close process
      socket.close(); 
    })
  }

  public emit(message: DTO) {
    if(!this.socket) {
      this.gameManager.raiseError("Tried to emit a message to the server with a non initialized socket.");
      return;
    } 
    this.gameManager.log(this, `Sending to server:`, message)
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
      this.gameManager.log(this, "Connection established")
      openHandler()
    });

    // #                                 #
    // # The server sends data to client #
    // #                                 #
    this.socket.addEventListener('message', event => {
      try {
        this.gameManager.log(this, "Received from server:", event)
        const json = JSON.parse(event.data);
        switch(json.type) {
          case DTOType.GameDeadPlayer: this.gameManager.handleServerEvent(new GameDeadPlayerResponseDTO(json)); break
          case DTOType.GameRefresh: this.gameManager.handleServerEvent(new GameRefreshDTO(json)); break
          case DTOType.GameUpdate: this.gameManager.handleServerEvent(new GameUpdateResponseDTO(json)); break
          default:
            this.gameManager.log(this, "Handler of event not implemented", event)
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
