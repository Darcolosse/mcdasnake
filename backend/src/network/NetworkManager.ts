import { WebSocketServer } from "ws";
import { GameManager } from "@game/GameManager";
import { DTOType, type DTO } from "@network/dto/DTO";

import { GameUpdateRequestDTO } from "@network/dto/requests/GameUpdateRequest";
import { GameAddPlayerDTO } from "@network/dto/requests/GameAddPlayerDTO";
import { GameUpdateSnakeDirectionDTO } from "@network/dto/requests/GameUpdateSnakeDirectionDTO";

import { randomUUID } from "crypto";
import { WebSocket } from "ws";
import { GameRemovePlayerDTO } from "./dto/requests/GameRemovePlayerDTO";

export class NetworkManager {

	private readonly gameManager: GameManager
	private wss: WebSocketServer | null
	private clients: Map<string, WebSocket>;

	constructor(gameManager: GameManager) {
		this.gameManager = gameManager
		this.wss = null;
		this.clients = new Map<string, WebSocket>();
	}

	public createServer(port: number) {
		this.wss = new WebSocketServer({ port: port });
		console.log(`WebSocket server started on ws://localhost:${port}`);

		this.wss.on('connection', (ws: WebSocket) => {
			const snakeId = randomUUID();
			this.clients.set(snakeId, ws);

			this.emit(snakeId, { type: "Welcome to McdaSnake!" });
			this.register(ws);
			this.closeConnection(ws, snakeId);
			console.log(`New client connected: ${snakeId}`);
		});
	}

	public emit(id: string, message: DTO) {
		const jsonMessage = JSON.stringify(message);
		this.clients.get(id)?.send(jsonMessage);
	}

	private register(ws: WebSocket) {
		ws.on('message', (message: string) => {
			console.log(`Received message: ${message}`);
			try {
				const json = JSON.parse(message);
				switch(json.type) {
					case DTOType.GameUpdate:
						this.gameManager.handleClientEvent(new GameUpdateRequestDTO());
						break;
					case DTOType.GameAddPlayer:
						this.executeOnFound(ws, (clientId: string) => {
							this.gameManager.handleClientEvent(new GameAddPlayerDTO(json), clientId);
						});
						break;
					case DTOType.SnakeTurn:
						this.executeOnFound(ws, (clientId: string) => {
							this.gameManager.handleClientEvent(new GameUpdateSnakeDirectionDTO(json), clientId);
						});
						break;
				}
			} catch (error) {
				//this.gameManager.raiseError("Couldn't read received event :", error)
			}
		});
	}

	private closeConnection(ws: WebSocket, snakeId: string) {
		ws.on('close', () => {
			console.log(`Client disconnected: ${snakeId}`);
			this.clients.delete(snakeId);
			ws.close();
			this.gameManager.handleClientEvent(new GameRemovePlayerDTO(), snakeId);
		});
	}

	public broadcast(data: DTO) {
		const jsonMessage = JSON.stringify(data);
		this.wss?.clients.forEach(function each(client) {
			if (client.readyState === WebSocket.OPEN) {
				client.send(jsonMessage);
			}
		});
	}

	private executeOnFound(ws: WebSocket, onFound: (clientId: string) => void): void {
		for (const [clientId, clientWs] of this.clients) {
			if (clientWs === ws) {
				onFound(clientId);
				return;
			}
		}
	}

}
