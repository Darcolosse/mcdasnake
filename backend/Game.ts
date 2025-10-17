import { Snake } from "./Snake.ts";
import { Apple } from "./Apple.ts";
import WebSocket from 'ws';

export class Game {
	private snakes: Array<Snake>;
	private apples: Array<Apple>;
	private socketsClient: 	Map<String, WebSocket>;

	constructor() {
		this.snakes = [];
		this.apples = [];
		this.socketsClient = new Map<String, WebSocket>();
	}

	public addSnake(snake: Snake) {
		this.snakes.push(snake);
	}

	public addApple(apple: Apple) {
		this.apples.push(apple);
	}

	public addClientSocket(id: String, socket: WebSocket) {
		this.socketsClient.set(id, socket);
	}

	public removeSnake(id: String) {
		for (let i = 0; i < this.snakes.length; i++) {
			if (this.snakes[i].id === id) {
				this.snakes.splice(i, 1);
				break;
			}
		}
	}

	public removeApple(id: String) {
		for (let i = 0; i < this.apples.length; i++) {
			if (this.apples[i].id === id) {
				this.apples.splice(i, 1);
				break;
			}
		}
	}

	public removeClientSocket(id: String) {
		for (let [clientId, clientSocket] of this.socketsClient) {
			if (id === clientId) {
				this.socketsClient.delete(clientId);
				break;
			}
		}
	}
}
