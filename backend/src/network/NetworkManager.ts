import { WebSocketServer } from "ws";
import { GameManager } from "@game/GameManager";
import { DTOType, type DTO } from "@network/dto/DTO";

import { GameUpdateDTO } from "@/network/dto/requests/GameUpdateDTO";
import { GameAddPlayerDTO } from "@network/dto/requests/GameAddPlayerDTO";
import { GameUpdateSnakeDirectionDTO } from "@network/dto/requests/GameUpdateSnakeDirectionDTO";
import { GamePingDTO } from '@network/dto/requests/GamePingDTO';

import { WebSocket } from "ws";
import { GameRemovePlayerDTO } from "./dto/requests/GameRemovePlayerDTO";
import { logger } from "@/app";

export class NetworkManager {

	private readonly gameManager: GameManager
	private wss: WebSocketServer | null
	private clients: Map<string, WebSocket>;

	constructor(gameManager: GameManager) {
		this.gameManager = gameManager
		this.wss = null;
		this.clients = new Map<string, WebSocket>();
	}

	public createServer(host: string, port: number) {
    logger.info("Initializing websocket service...")
		this.wss = new WebSocketServer(
			{ 
				port: port, 
				host: host,
				perMessageDeflate: {
					zlibDeflateOptions: {
					// See zlib defaults.
					chunkSize: 1024,
					memLevel: 7,
					level: 3
					},
					zlibInflateOptions: {
					chunkSize: 10 * 1024
					},
					// Other options settable:
					clientNoContextTakeover: true, // Defaults to negotiated value.
					serverNoContextTakeover: true, // Defaults to negotiated value.
					serverMaxWindowBits: 10, // Defaults to negotiated value.
					// Below options specified as default values.
					concurrencyLimit: 10, // Limits zlib concurrency for perf.
					threshold: 1024 // Size (in bytes) below which messages
					// should not be compressed if context takeover is disabled.
			}});
		logger.info(`WebSocket server started on ws://${host}:${port}`);

		this.wss.on('connection', (ws: WebSocket) => {
			const snakeId = GameManager.generateUUID();
			this.clients.set(snakeId, ws);

			this.emit(snakeId, { type: "Welcome to McdaSnake!" });
			this.register(ws);
			this.closeConnection(ws, snakeId);
			logger.info(`New client connected: ${snakeId}`);
		});
    logger.info("Initialized websocket service")
	}

	public emit(id: string, message: DTO) {
		const jsonMessage = JSON.stringify(message);
		this.clients.get(id)?.send(jsonMessage);
		logger.debug(`Sent message to ${id} if id exists: ${jsonMessage}`);
	}

	private register(ws: WebSocket) {
		ws.on('message', (message: string) => {
			logger.debug(`Received message: ${message}`);
			try {
				const json = JSON.parse(message);
				switch(json.type) {
					case DTOType.GameUpdate:
						this.executeOnFound(ws, (clientId: string) => {
							this.gameManager.handleClientEvent(new GameUpdateDTO(), clientId);
						});
						break;
					case DTOType.AddPlayer:
						this.executeOnFound(ws, (clientId: string) => {
							this.gameManager.handleClientEvent(new GameAddPlayerDTO(json), clientId);
						});
						break;
					case DTOType.SnakeTurn:
						this.executeOnFound(ws, (clientId: string) => {
							this.gameManager.handleClientEvent(new GameUpdateSnakeDirectionDTO(json), clientId);
						});
						break;
					case DTOType.GamePing:
						this.executeOnFound(ws, (clientId: string) => {
							this.gameManager.handleClientEvent(new GamePingDTO(), clientId);
						});
				}
			} catch (error) {
				logger.warn("Couldn't read a suspicious or malformed received websocket event", error)
			}
		});
	}

	private closeConnection(ws: WebSocket, snakeId: string) {
		ws.on('close', () => {
			logger.info(`Client disconnected: ${snakeId}`);
			this.clients.delete(snakeId);
			ws.close();
			this.gameManager.handleClientEvent(new GameRemovePlayerDTO(), snakeId);
		});
	}

	public broadcast(data: DTO) {
		logger.debug(`Broadcasting a websocket message...`, data);
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
        		logger.debug(`Websocket client found. Ready for processing.`);
				onFound(clientId);
				return;
			}
		}
    logger.warn(`Websocket client not found in memory. Couldn't process further.`);
	}

}
