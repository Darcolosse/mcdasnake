import { Entity } from "@/Entity";
import { Snake } from "@/Snake";
import { Apple } from "@/Apple";
import { Direction } from "@/Direction";
import { GameRefreshResponseDTO } from "@/network/dto/responses/GameRefreshResponseDTO";
import { GameManager, TrucMoche } from "@game/GameManager";
import { GameUpdateResponseDTO } from "@/network/dto/responses/GameUpdateResponseDTO";
import { randomUUID } from "crypto";

export class Game {
	private height: number;
	private width: number;

	private snakes: Map<string, Snake>;
	private apples: Map<string, Apple>;

	private map: Map<string, Entity>;

	private tickRate: number;

	private gameManager: GameManager;

	constructor(gameManager: GameManager, width: number = 16, height: number = 16, tickRate: number = 1000) {
		this.gameManager = gameManager;
		this.width = width;
		this.height = height;
		this.snakes = new Map<string, Snake>();
		this.apples = new Map<string, Apple>();
		this.tickRate = tickRate;
		this.map = new Map<string, Entity>();
	}

	public updateGame() {
    const events: TrucMoche[] = this.gameManager.popBuffer();	
		const gameRefresh: GameRefreshResponseDTO = new GameRefreshResponseDTO();

    events.map((event) => {
      this.updateDirection(event.id, event.dto.direction)
    })

		this.moveSnakes(gameRefresh);
		this.checkCollisions(gameRefresh);

    if(this.snakes.size > 0 && Math.random() < 0.03) {
      const apple = new Apple(randomUUID(), [[0, 0]])
      apple.generateRandom(this.width, this.height)
      this.addApple(apple)
      gameRefresh.entities.apples.push(apple)
    }

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
    // Clearing map
    this.map.clear();

    // Adding apples
		this.apples.forEach(apple => {
      const jsonHead = JSON.stringify(apple.getHead())
      if(!this.map.has(jsonHead)) {
				this.map.set(jsonHead, apple);
      }
		});

    // Checking snake collisions
		this.snakes.forEach(snake => {
			this.check(snake, gameRefresh);
		});
	}

	private check(snake: Snake, gameRefresh: GameRefreshResponseDTO) {
		snake.cases.forEach(coord => {
      const jsonCoord = JSON.stringify(coord);
      const entityAtCoord = this.map.get(jsonCoord);

      if(!entityAtCoord){
        this.map.set(jsonCoord, snake);
      } else {
          if(entityAtCoord instanceof Apple) {
            const eaten_apple = entityAtCoord as Apple;
            this.apples.delete(eaten_apple.id);
            this.map.delete(jsonCoord);
            gameRefresh.entities.removed.push(eaten_apple.id);
          } else if (entityAtCoord instanceof Snake) {
            snake.dead = true;
            gameRefresh.entities.removed.push(snake.id);
          }
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

  public getSize(): [number, number] {
    return [this.width, this.height];
  }
}
