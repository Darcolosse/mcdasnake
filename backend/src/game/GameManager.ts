import { NetworkManager } from "@network/NetworkManager";
import { Game } from "@game/Game";
import { Direction } from "@/Direction";
import { DTO, DTOType } from "@/network/dto/DTO";

export class GameManager {
	private networkManager: NetworkManager;
	private game: Game;
	private eventBuffer: Direction[];

	constructor(port: number) {
		this.networkManager = new NetworkManager(this);
		this.networkManager.createServer(port);
		this.game = new Game(this);
		this.eventBuffer = [];
	}

	public addPlayer(id: string, name:string) {
		const coord = this.game.getCoordinates();
    const randomCoordinates: [number, number] = [Game.random(0, coord[0] + 10), Game.random(0, coord[1] - 10)] 
    const caseUnderRandom: [number, number] = [randomCoordinates[0], randomCoordinates[1]+1]
		this.game.addSnake(id, name, [randomCoordinates, caseUnderRandom], Direction.DOWN);
	}

	public handleGameEvent(eventDTO: DTO, id: string = '') {
		switch (eventDTO.type) {
			case DTOType.GameRefresh:
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
			case DTOType.GameUpdate:
				//récup info
				this.game.getState(id);
				break;
			case DTOType.AddPlayer:
        this.addPlayer(id, eventDTO.playerName);
				this.game.getState(id);
				break;
			case DTOType.SnakeTurn:
				this.game.updateDirection(id, eventDTO.direction);
				break;
			case DTOType.RemovePlayer:
				this.game.removeSnake(id);
				break;
			default:
				console.log("Unhandled event type:", eventDTO.type);
		}
	}

	public gameUpdate() {
		return
	}

	public popBuffer(): Direction[] {
		const events = this.eventBuffer.slice();
		this.eventBuffer = [];
		return events;
	}
}




