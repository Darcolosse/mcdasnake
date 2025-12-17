import { NetworkManager } from "@network/NetworkManager";
import { Game } from "@game/Game";
import { DTO, DTOType } from "@network/dto/DTO";
import { randomUUID } from "crypto";
import { GameScheduler } from "@game/GameScheduler";
import { PrismaClient } from '@prisma/client';
import { logger } from "@/app";
import { GamePingResponseDTO } from '@network/dto/responses/GamePingResponseDTO';


export interface Event {
  id: string,
  dto: DTO,
}

export const Buffers = {
  TURN_BUFFER: 'TB',
  CONNECTION_BUFFER: 'CB',
  DECONNECTION_BUFFER: 'DB',
}

export type Buffers = typeof Buffers[keyof typeof Buffers];

export class GameManager {
	private readonly networkManager: NetworkManager;
	private game: Game;
	private gameScheduler: GameScheduler;
  private readonly db: PrismaClient;

	private readonly buffers = {
    TURN_BUFFER: [] as Event[],
    CONNECTION_BUFFER: [] as Event[],
    DECONNECTION_BUFFER: [] as Event[],
  };

	constructor(host: string, port: number) {
    logger.debug(`Creating websocket server on IP ${String(process.env.BACKEND_IP)} PORT ${Number(process.env.BACKEND_PORT)} in game manager initialization`)
		this.networkManager = new NetworkManager(this);
		this.networkManager.createServer(host, port);
    logger.debug(`Starting prisma client in game manager initialization`)
    this.db = new PrismaClient();
		this.game = new Game([Number(process.env.GRID_COLS), Number(process.env.GRID_ROWS)], this.db);
    this.gameScheduler = new GameScheduler(this, this.game);
	}
  
  // ===================== Management layer ====================== \\

  public start() {
    logger.info("Starting game manager")
    this.gameScheduler.start();
  }

	public handleGameEvent(eventDTO: DTO, id: string = '') {
		switch (eventDTO.type) {
			case DTOType.GameRefresh:
        logger.debug("Broadcasting")
				this.networkManager.broadcast(eventDTO);
				break;
			case DTOType.GameUpdate:
				this.networkManager.emit(id, eventDTO);
				logger.debug("Sent game update response to", id);
				break;
      case DTOType.GameDeadPlayer:
        this.networkManager.emit(id, eventDTO);
        logger.debug("Notifying player is dead", id);
        break;
			default:
				logger.warn("Game tried to send to ws " + id + " a suspicious websocket:", eventDTO.type);
		}
	}

	public handleClientEvent(eventDTO: any, id: string = '') {
    logger.debug('GameManager received a new client event', eventDTO);
    const event = { id: id, dto: eventDTO } as Event;
		switch (eventDTO.type) {
			case DTOType.AddPlayer:
        this.buffers.CONNECTION_BUFFER.push(event);
        console.log('Game state :', this.game.getState());
				this.networkManager.emit(id, this.game.getState());
        logger.debug('Pushed event in connection buffer');
				break;
			case DTOType.GameUpdate:
				this.networkManager.emit(id, this.game.getState());
        logger.debug('Emitting back the current game state');
				break;
			case DTOType.SnakeTurn:
        this.buffers.TURN_BUFFER.push(event);
        logger.debug('Pushed event in the turn buffer');
				break;
			case DTOType.RemovePlayer:
        this.buffers.DECONNECTION_BUFFER.push(event);
        logger.debug('Pushed event in deconnection buffer');
				break;
      case DTOType.GamePing:
        this.networkManager.emit(id, new GamePingResponseDTO(Date.now()));
        logger.debug("Ping response for ", id);
        break;
			default:
				logger.warn("Client " + id + " sent to server a suspicious websocket:", eventDTO.type);
		}
	}

	public popBuffer(buffer: Buffers): Event[] {
    let popped: Event[] = []
    this.getBuffer(buffer, (events) => {
      popped = events.splice(0, events.length);
    })
    return popped;
	}

  public autoRestartGameSession() {
    this.game = new Game([Number(process.env.GRID_COLS), Number(process.env.GRID_ROWS)], this.db);
    this.gameScheduler = new GameScheduler(this, this.game);
    this.start();
  }

  // =========================== Utils =========================== \\

  public static generateUUID(): string {
    logger.debug("Generating a new UUID");
    return randomUUID();
  }

  // ========================== Private =========================== \\

  private getBuffer(buffer: Buffers, onFound: (buffer: Event[]) => void) {
    switch(buffer) {
      case Buffers.TURN_BUFFER:
        onFound(this.buffers.TURN_BUFFER)
        break;
      case Buffers.CONNECTION_BUFFER:
        onFound(this.buffers.CONNECTION_BUFFER)
        break;
      case Buffers.DECONNECTION_BUFFER:
        onFound(this.buffers.DECONNECTION_BUFFER)
        break;
      default:
				logger.warn("Couldn't retrieve a buffer from its enum on tick.");
    }
  }

}
