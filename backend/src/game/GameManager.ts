import { NetworkManager } from "@network/NetworkManager";
import { Game } from "@game/Game";
import { DTO, DTOType } from "@network/dto/DTO";
import { randomUUID } from "crypto";
import { GameScheduler } from "@game/GameScheduler";
import { PrismaClient } from '@prisma/client';


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
	private readonly game: Game;
	private readonly gameScheduler: GameScheduler;
  private readonly db: PrismaClient;

	private readonly buffers = {
    TURN_BUFFER: [] as Event[],
    CONNECTION_BUFFER: [] as Event[],
    DECONNECTION_BUFFER: [] as Event[],
  };

	constructor(host: string, port: number) {
		this.networkManager = new NetworkManager(this);
		this.networkManager.createServer(host, port);
    this.db = new PrismaClient();
		this.game = new Game([Number(process.env.GRID_COLS), Number(process.env.GRID_ROWS)], this.db);
    this.gameScheduler = new GameScheduler(this, this.game);
	}
  
  // ===================== Management layer ====================== \\

  public start() {
    this.gameScheduler.start();
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
    const event = { id: id, dto: eventDTO } as Event;
		switch (eventDTO.type) {
			case DTOType.AddPlayer:
        this.buffers.CONNECTION_BUFFER.push(event);
				this.networkManager.emit(id, this.game.getState());
				break;
			case DTOType.GameUpdate:
				this.networkManager.emit(id, this.game.getState());
				break;
			case DTOType.SnakeTurn:
        this.buffers.TURN_BUFFER.push(event);
				break;
			case DTOType.RemovePlayer:
        this.buffers.DECONNECTION_BUFFER.push(event);
				break;
			default:
				console.log("Unhandled event type:", eventDTO.type);
		}
	}

	public popBuffer(buffer: Buffers): Event[] {
    let popped: Event[] = []
    this.getBuffer(buffer, (events) => {
      popped = events.splice(0, events.length);
    })
    return popped;
	}
  
  // =========================== Utils =========================== \\

  public static generateUUID(): string {
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
    }
  }

}
