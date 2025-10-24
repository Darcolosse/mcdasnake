import { NetworkManager } from "@network/NetworkManager";
import { Game } from "@game/Game";
import { Direction } from "@/Direction";
import { DTO, DTOType } from "@/network/dto/DTO";
import { GameUpdateResponseDTO } from "@/network/dto/responses/GameUpdateResponse";

export class GameManager {
	private networkManager: NetworkManager;
	private game: Game;

	constructor(port: number) {
		this.networkManager = new NetworkManager(this);
		this.networkManager.createServer(port);
		this.game = new Game();
	}

	public addPlayer(id: string, name:string) {
		const coord = this.game.getCoordinates();
		this.game.addSnake(id, name, [[Game.random(0, coord[0] + 10), Game.random(0, coord[1] - 10)]], Direction.DOWN);
	}

	public handleGameEvent(eventDTO: DTO) {
		console.log(eventDTO)
	}

	public handleClientEvent(eventDTO: any, id: string = '') {
		switch (eventDTO.type) {
			case DTOType.GameUpdate:
				//récup info
				const gameState = this.game.getState();
				this.networkManager.emit(id, new GameUpdateResponseDTO(gameState));
				break;
			case DTOType.GameAddPlayer:
				const coord = this.game.getCoordinates();
				this.game.addSnake(id, eventDTO.playerName, [[Game.random(0, coord[0] + 10), Game.random(0, coord[1] - 10)]], Direction.DOWN);
				break;
			case DTOType.GameUpdateSnakeDirection:
				this.game.updateDirection(id, eventDTO.direction);
				break;
			case DTOType.GameRemovePlayer:
				this.game.removeSnake(id);
				break;


			default:
				console.log("Unhandled event type:", eventDTO.type);
		}
	}

	public gameUpdate() {
		return
	}
}




