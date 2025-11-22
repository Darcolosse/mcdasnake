import { Entity } from "@entities/Entity";
import { Snake } from "@entities/Snake";
import { Apple } from "@entities/Apple";
import { Direction } from "@entities/Direction";
import { GameRefreshResponseDTO } from "@network/dto/responses/GameRefreshResponseDTO";
import { GameManager } from "@game/GameManager";
import { GameUpdateResponseDTO } from "@network/dto/responses/GameUpdateResponseDTO";
import { PrismaClient } from '@prisma/client';
import { ScoreBoard } from "@game/ScoreBoard";
import { logger } from "@/app";


export class Game {
	private readonly rows: number;
	private readonly cols: number;

	private snakes: Map<string, Snake>;
	private apples: Map<string, Apple>;

  private readonly scoreBoard: ScoreBoard;

  private readonly sessionId: string;

  private readonly maxBonus: number;

	constructor(size: [number, number], db: PrismaClient) {
    logger.info("Initializing a new game session...");
		this.cols = size[0];
		this.rows = size[1];
		this.snakes = new Map<string, Snake>();
		this.apples = new Map<string, Apple>();
    this.sessionId = GameManager.generateUUID();
    logger.info("Creating a scoreboard in base for the game session...");
    this.scoreBoard = new ScoreBoard(db);
    this.scoreBoard.createGameSession(this.sessionId);
    this.maxBonus = (this.cols * this.rows) * (Number(process.env.BONUS_PERCENTAGE_MAX)/100);
    logger.info("Initialized successfully a new game on session id " + this.sessionId + " with max bonus set to " + this.maxBonus);
	}

  // ==================== Available Actions ====================== \\

  // ### SNAKES ###

	public addSnake(snakeId: string, name: string, design: [string, string]): Snake {
    logger.debug("Adding a new snake in game for player '" + name + "'...");
    const newSnake = new Snake(
      snakeId,
      name,
      this.generateRandomSpawn(Number(process.env.SNAKE_SPAWNING_LENGTH), 100/3, 200/3),
      process.env.SNAKE_SPAWNING_DIRECTION as Direction,
      design
    )
    logger.info("Spawing a snake on " + newSnake.cases + " for player " + name);
    logger.info("Creating an empty score in the scoreboard for the player '" + name + "'...");
		this.snakes.set(snakeId, newSnake);
    this.scoreBoard.createScore(snakeId, name, this.sessionId);
    return newSnake;
	}

	public removeSnake(id: string) {
    logger.info("Deleting snake of id " + id);
		this.snakes.delete(id);
	}

	public updateDirection(snakeId: string, direction: Direction) {
		this.snakes.get(snakeId)?.setDirection(direction);
	}

  // ### COMMON ###

	public getState(): GameUpdateResponseDTO {
    logger.debug("Retrieving game state in a dto");
    return new GameUpdateResponseDTO(
      Array.from(this.snakes.values()),
      Array.from(this.apples.values()), 
      [this.cols, this.rows], 
      Number(process.env.GAME_SPEED_MS),
      this.scoreBoard.getAllScores()
    )
	}

  public getSize(): [number, number] {
    return [this.cols, this.rows];
  }

  public getScore(){
    logger.debug("Scoreboard ...");
    return this.scoreBoard.getAllScores();
  }

  public getSnakes(): Map<string, Snake> {
    return this.snakes;
  }

  // ### GAME EVENTS ###

  public processGenerateBonus(gameRefresh: GameRefreshResponseDTO) {
    logger.debug("Generating bonus...");
    const random = Math.random();
    if(this.snakes.size > 0 && this.apples.size < this.maxBonus) {
      if(random <= Number(process.env.BONUS_PROBABILITY_SPAWN_APPLE)) {
        let uuid = GameManager.generateUUID()
        gameRefresh.entities.apples.push(this.addApple(uuid));
      }
    }
    logger.debug("Generated bonus");
  }

  public processMove(gameRefresh: GameRefreshResponseDTO) {
    logger.debug("Moving snakes...");
		this.snakes.forEach(snake => snake.move(this.apples, gameRefresh));
    logger.debug("Moved snakes");
  }

  public processCollisions(gameRefresh: GameRefreshResponseDTO) {
    logger.debug("Checking collisions...");
    const map = new Map<string, Entity>();

		this.apples.forEach(apple => map.set(JSON.stringify(apple.getHead()), apple));

		this.snakes.forEach(snake => {

      const head = snake.getHead();

      if (this.isOutOfBounds(head)) {
        logger.info(`${snake.name} hit the border (${this.cols}, ${this.rows}) at ${head}`);
        logger.debug("Snake on id " + snake.id + " hit border");
        snake.dead = true;
        gameRefresh.entities.removed.push(snake.id);

      } else {
        this.checkCollisions(snake, map,
          (entityCollided) => {
            logger.debug("Snake collided with an entity");
            if(entityCollided instanceof Apple) {
              const eaten_apple = entityCollided as Apple;

              logger.info(snake.name + " ate an apple. Current length of " + snake.cases.length);
              logger.debug("Snake on id " + snake.id + " ate apple on id " + eaten_apple.id);
              this.removeApple(eaten_apple.id);
              gameRefresh.entities.removed.push(eaten_apple.id);

              logger.debug("Updating database score of snake " + snake.name);
              this.scoreBoard.updateScore(snake.id, 100, 0, 1);

            } else if (entityCollided instanceof Snake) {
              const collided_snake = entityCollided as Snake;
              logger.debug("Snake on id " + snake.id + " was killed by " + collided_snake.id);

              if (!snake.dead) {
                logger.info(snake.name + " died from " + collided_snake.name + ". Last registered length of " + snake.cases.length);
                logger.debug("Updating database score of snake " + snake.name);
                this.scoreBoard.updateScore(snake.id, 1000, 1, 0);
              }
              snake.dead = true;
              gameRefresh.entities.removed.push(snake.id);

            } else {
              logger.warn("Couldn't figure what snake on id " + snake.id + " and name " + snake.name + " collided. Game state on tick unstable.");
            }
          }
        )
      }
      
    });
    this.snakes.forEach(snake => {
      if (snake.dead) {
        this.snakes.delete(snake.id);
      }
    });
    logger.debug("Checked collisions");
  }

  // ======================== Collisions ========================= \\

  private checkCollisions(element: Entity | [number, number][], entityMap: Map<string, Entity>, onCollision: (entity: Entity) => void) {
    const isEntity = (element as any).id;
    const cases: [number, number][] = isEntity ? (element as Entity).cases : (element as [number, number][]);

    cases.forEach((_case) => {
      const key = this.createCollideKey(_case);
      const entityAtKey = entityMap.get(key);

      if(entityAtKey) {
        onCollision(entityAtKey);
      } else {
        if(isEntity) {
          entityMap.set(key, (element as Entity));
        }
      }
      
    });
  }

  private isOutOfBounds(cases: [number, number]) {
    const [x, y] = cases;
    return (x < 0 || x > this.cols - 1) || (y < 0 || y > this.rows - 1)
  }

  private buildMap(includeApples: boolean, includeSnakes: boolean) : Map<string, Entity> {
    const map = new Map<string, Entity>();
    if(includeApples) this.apples.forEach(apple => map.set(this.createCollideKey(apple.getHead()), apple));
    if(includeSnakes) this.snakes.forEach(snake => snake.cases.forEach(_case => map.set(this.createCollideKey(_case), snake)))
    return map
  }

  private createCollideKey(_case: [number, number]) {
    return `[${_case[0]},${_case[1]}]`
  }

  // ========================== Random =========================== \\

	public generateRandomSpawn(length: number, minPercentage: number = 100, maxPercentage: number = 100) : [number, number][] {
    let success = false;
    let cases: [number, number][] = [];
    const map = this.buildMap(true, true);
    while(!success) {
      cases = this.generateRandomSpawnUnchecked(length, minPercentage, maxPercentage);
      success = true;
      this.checkCollisions(cases, map, (_) => success = false)
    }
    return cases;
  }

	private generateRandomSpawnUnchecked(length: number, minPercentage: number, maxPercentage: number) : [number, number][] {
    const cases: [number, number][] = [[this.random(true, minPercentage, maxPercentage), this.random(false, minPercentage, maxPercentage)]]
    for(let _ = 1; _<length; _++) {
      const lastCase = cases[cases.length-1];
      cases.push([lastCase[0], lastCase[1]+1]);
    }
    return cases
	}

  private random(x_axis: boolean, minPercentage: number = 100, maxPercentage: number = 100) {
    const ref = x_axis ? this.cols : this.rows;
    const upperBound = Math.round(ref*maxPercentage/100)
    const lowerBound = Math.round(minPercentage == 100 ? 0 : ref*minPercentage/100)
		return Math.floor(Math.random() * (upperBound - lowerBound)) + lowerBound;
  }

  // ========================= Private =========================== \\

  // ### APPLES ###

	private addApple(id: string): Apple {
    logger.debug("Adding a new apple in game");
    const newApple = new Apple(id, this.generateRandomSpawn(1));
    logger.info("Spawing an apple on " + newApple.cases[0]);
		this.apples.set(id, newApple);
    return newApple;
	}

	private removeApple(id: string) {
    logger.debug("Deleting apple of id " + id);
		this.apples.delete(id);
	}

}
