import { Entity } from "@/Entity";
import { Snake } from "@/Snake";
import { Apple } from "@/Apple";
import { Direction } from "@/Direction";
import { GameRefreshResponseDTO } from "@/network/dto/responses/GameRefreshResponseDTO";
import { GameManager, TrucMoche } from "@game/GameManager";
import { GameUpdateResponseDTO } from "@/network/dto/responses/GameUpdateResponseDTO";

export class Game {
	private height: number;
	private width: number;

	private snakes: Map<string, Snake>;
	private apples: Map<string, Apple>;

	private map: Map<[number, number], Entity>;

	private tickRate: number;

	private gameManager: GameManager;

	constructor(gameManager: GameManager, width: number = 64, height: number = 64, tickRate: number = 200) {
		this.gameManager = gameManager;
		this.width = width;
		this.height = height;
		this.snakes = new Map<string, Snake>();
		this.apples = new Map<string, Apple>();
		this.tickRate = tickRate;
		this.map = new Map<[number, number], Entity>();
	}

	public updateGame() {
    const events: TrucMoche[] = this.gameManager.popBuffer();	
		const gameRefresh: GameRefreshResponseDTO = new GameRefreshResponseDTO();

    events.map((event) => {
      this.updateDirection(event.id, event.dto.direction)
    })

		//Voir pour ajouter des Pommes

		// Déplacer les têtes et éventuellement garder les queues
		this.moveSnakes(gameRefresh);

		// Pour chaque snake, tester la position de la tête et traiter les incoherences
		this.checkCollisions(gameRefresh);

		// Broadcast 
		if(!gameRefresh.isEmpty()) {
			this.gameManager.handleGameEvent(gameRefresh);
      console.log("refresh not empty")
		}

		setTimeout(this.updateGame.bind(this), this.tickRate);
	}

	public getState(): GameUpdateResponseDTO {
    return new GameUpdateResponseDTO(
      Array.from(this.snakes.values()),
      Array.from(this.apples.values()), 
      [this.width, this.height], 
      this.tickRate
    )
	}

	public moveSnakes(gameRefresh: GameRefreshResponseDTO) {
		this.snakes.forEach(snake => {
			snake.move(this.apples, gameRefresh);
		});
	}

	private checkCollisions(gameRefresh: GameRefreshResponseDTO) {
		this.snakes.forEach(snake => {
			this.check(snake, gameRefresh);
		});
		this.apples.forEach(apple => {
			this.check(apple, gameRefresh);
		});
	}

	private check(entity: Entity, gameRefresh: GameRefreshResponseDTO) {
		entity.cases.forEach(coord => {
			if (this.map.has(coord)) {
				let other_entity = this.map.get(coord);
				if (other_entity instanceof Apple) {
					this.apples.delete(other_entity.id);
					this.map.delete(coord);
					gameRefresh.entities.removed.push(other_entity.id);
				} else if (other_entity instanceof Snake) {
					if (other_entity.getHead() == coord && entity.getHead() == coord) {
						// Head-on collision
						entity.dead = true;
						other_entity.dead = true;
						gameRefresh.entities.removed.push(entity.id);
						gameRefresh.entities.removed.push(other_entity.id);
					} else if (other_entity.getHead() == coord && entity.getHead() != coord) {
						// body collision
						other_entity.dead = true;
						gameRefresh.entities.removed.push(other_entity.id);
					} else if (other_entity.getHead() != coord && entity.getHead() == coord) {
						// body collision
						entity.dead = true;
						gameRefresh.entities.removed.push(entity.id);
					}
				}
			} else {
				this.map.set(coord, entity);
			}
		});
	}

	public updateDirection(snakeId: string, direction: Direction) {
		this.snakes.get(snakeId)?.setDirection(direction);

	}

	public addSnake(snakeId: string, name: string, coordinates: [number, number][], direction: Direction) {
    console.log(coordinates)
		this.snakes.set(snakeId, new Snake(snakeId, name, coordinates, direction));
	}

	public addApple(apple: Apple) {
		this.apples.set(apple.id, apple);
	}

	public removeSnake(id: string) {
		this.snakes.delete(id);
	}

	public removeApple(id: string) {
		this.apples.delete(id);
	}

	public static random(min: number, max: number){
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	public getCoordinates(): [number, number] {
		return [this.width, this.height]
	}
}
