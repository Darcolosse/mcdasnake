import { NetworkManager } from "@network/NetworkManager";
import { Game } from "@game/Game";
import { Direction } from "@/Direction";
import { DTO, DTOType } from "@/network/dto/DTO";
import { GameUpdateSnakeDirectionDTO } from "@/network/dto/requests/GameUpdateSnakeDirectionDTO";

export interface TrucMoche {
  id: string,
  dto: GameUpdateSnakeDirectionDTO
}

export class GameManager {
	private networkManager: NetworkManager;
	private game: Game;
	private eventBuffer: TrucMoche[];

	constructor(port: number) {
		this.networkManager = new NetworkManager(this);
		this.networkManager.createServer(port);
		this.game = new Game(this);
		this.eventBuffer = [];
	}
  
  // ===================== Management layer ====================== \\

  public start() {
    this.game.updateGame();
  }

	public handleGameEvent(eventDTO: DTO, id: string = '') {
		switch (eventDTO.type) {
			case DTOType.GameRefresh:
        console.log("Broadcasting", JSON.stringify(eventDTO))
				this.networkManager.broadcast(eventDTO);
				break;
			case DTOType.GameUpdate:
				this.networkManager.emit(id, eventDTO);
				console.log("Sent game update response to", id);
				break;
			default:
				console.log("Unhandled event type:", eventDTO.type);
		}
	}

	public handleClientEvent(eventDTO: any, id: string = '') {
    console.log('Received:', eventDTO);
		switch (eventDTO.type) {
			case DTOType.AddPlayer:
        this.addPlayer(id, eventDTO.playerName);
				this.networkManager.emit(id, this.game.getState());
				break;
			case DTOType.GameUpdate:
				this.networkManager.emit(id, this.game.getState());
				break;
			case DTOType.SnakeTurn:
        this.eventBuffer.push({ id: id, dto: eventDTO } as TrucMoche)
				break;
			case DTOType.RemovePlayer:
				this.game.removeSnake(id);
				break;
			default:
				console.log("Unhandled event type:", eventDTO.type);
		}
	}

	public popBuffer(): TrucMoche[] {
		const events = this.eventBuffer.slice();
		this.eventBuffer = [];
		return events;
	}
  
  // ========================== Private ========================== \\

	private addPlayer(id: string, name:string) {
		const coord = this.game.getCoordinates();
    const randomCoordinates = [Game.random(0, coord[0] + 10), Game.random(0, coord[1] - 10)] 
    const caseUnderRandom = [randomCoordinates[0], randomCoordinates[1]+1]
		this.game.addSnake(id, name, [randomCoordinates, caseUnderRandom] as [number, number][], Direction.DOWN);
	}

}
