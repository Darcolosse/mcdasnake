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

  private sessionDuration: number;

	private snakes: Map<string, Snake>;
	private apples: Map<string, Apple>;

  private readonly scoreBoard: ScoreBoard;

  private readonly sessionId: string;

  private readonly maxBonus: number;
  private readonly bonusProbabilitySpawnApple: number;
  
  private readonly snakeSpawningLength: number;

	constructor(size: [number, number], db: PrismaClient) {
    logger.info("Initializing a new game session...");
		this.cols = size[0];
		this.rows = size[1];
		this.snakes = new Map<string, Snake>();
		this.apples = new Map<string, Apple>();
    this.sessionId = GameManager.generateUUID();
    this.snakeSpawningLength = Number(process.env.SNAKE_SPAWNING_LENGTH);
    this.maxBonus = (this.cols * this.rows) * (Number(process.env.BONUS_PERCENTAGE_MAX)/100);
    this.bonusProbabilitySpawnApple = Number(process.env.BONUS_PROBABILITY_SPAWN_APPLE);
    this.sessionDuration = Number(process.env.GAME_SESSION_DURATION_S);

    logger.info("Creating a scoreboard in base for the game session...");
    this.scoreBoard = new ScoreBoard(db);
    this.scoreBoard.createGameSession(this.sessionId);

    logger.info("Initialized successfully a new game on session id " + this.sessionId + " with max bonus set to " + this.maxBonus);
	}

  // ==================== Available Actions ====================== \\

  // ### SNAKES ###

	public addSnake(snakeId: string, name: string, design: [string, string]): Snake {
    logger.debug("Adding a new snake in game for player '" + name + "'...");
    const newSnake = new Snake(
      snakeId,
      name,
      this.generateRandomSpawn(this.snakeSpawningLength, 100/3, 200/3),
      process.env.SNAKE_SPAWNING_DIRECTION as Direction,
      design
    )
    logger.info("Spawing a snake on " + newSnake.cases + " for player " + name);
    logger.info("Creating an empty score in the scoreboard for the player '" + name + "'...");
		this.snakes.set(snakeId, newSnake);

    if(this.scoreBoard.getScore(snakeId) === undefined) {
      this.scoreBoard.createScore(snakeId, name, this.sessionId);
    } else {
      this.scoreBoard.resetScores(snakeId);
    }
    return newSnake;
	}

  public isSnakePlaying(id: string): boolean {
    return this.snakes.get(id) !== undefined;
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
      this.snakes,
      this.apples, 
      [this.cols, this.rows], 
      Number(process.env.GAME_SPEED_MS),
      this.getScore()
    )
	}

  public getSize(): [number, number] {
    return [this.cols, this.rows];
  }

  public getScore(){
    logger.debug("Scoreboard ...");
    return Array.from(this.scoreBoard.getAllScores().values()).sort((a, b) => (b[1]+b[2]*10+b[3]) - (a[1]+a[2]*10+a[3])).splice(0, 10);
  }

  public getSnakes(): Map<string, Snake> {
    return this.snakes;
  }

  public GetGameSessionDuration(): number {
    console.log("Getting game session duration: " + this.sessionDuration + "s");
    return this.sessionDuration;
  }

  public GetGameSessionId(): string {
    return this.sessionId;
  }

  // ### GAME EVENTS ###

  public processGenerateBonus(gameRefresh: GameRefreshResponseDTO) {
    logger.debug("Generating bonus...");
    const random = Math.random();
    if(this.snakes.size > 0 && this.apples.size < this.maxBonus) {
      if(random <= this.bonusProbabilitySpawnApple) {
        gameRefresh.entities.apples.push(this.addApple(GameManager.generateUUID()));
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

    // # Shortcuts #
    const handlingDeath = (snake: Snake) => {
      if(!snake.dead) {
        snake.dead = true;
        logger.debug("Updating database score of snake " + snake.name);
      }
    }
    const handlingEating = (snake: Snake, eaten: Entity) => {
      gameRefresh.entities.removed.push(eaten.id);
      this.removeApple(eaten.id);

      logger.debug("Updating database score of snake " + snake.name);
      this.scoreBoard.updateScore(snake.id, 100, 0, 1);
    }

    // #              #
    // # Requirements #
    // #              #
    const snakes_as_array = Array.from(this.snakes);

    const map = new Map<string, Entity>(); // Map without head of snakes
		this.apples.forEach(apple => map.set(this.createCollideKey(apple.getHead()), apple));
    this.snakes.forEach(snake => snake.getBody().map((_case) => { map.set(this.createCollideKey(_case), snake)}));

    // #           #
    // # Alogrithm #
    // #           #
		snakes_as_array.forEach(([_, snake], index) => {

      const head = snake.getHead();

      if (this.isOutOfBounds(head)) {
        logger.info(`${snake.name} hit the border (${this.cols}, ${this.rows}) at ${head}`);
        handlingDeath(snake);
      } else {

        // Only checking if head collided on an apple or the body of another snake
        this.checkCollisions([head], map,
          (entityCollided) => {
            logger.debug("Snake collided with an entity");

            if (entityCollided instanceof Apple) {
              const eaten_apple = entityCollided as Apple;
              logger.info(snake.name + " ate an apple. Current length of " + snake.cases.length);
              handlingEating(snake, eaten_apple);
            } 

            if (entityCollided instanceof Snake) {
              const collided_snake = entityCollided as Snake;
              logger.info(snake.name + " died colliding on " + collided_snake.name + "'s body. Last registered length of " + snake.cases.length);
              handlingDeath(snake);
              if (collided_snake.id !== snake.id) {
                this.scoreBoard.updateScore(collided_snake.id, 1000, 1, 0);
              }
            } 

            if ((entityCollided instanceof Snake) === false && (entityCollided instanceof Apple) === false) {
              logger.warn("Couldn't figure what snake on id " + snake.id + " and name " + snake.name + " collided. Game state on tick unstable.");
            }
          }
        )

        // Checking if head collided on another head only if still alive because handling bidirectional death on collision
        if(!snake.dead) {

          // Only checking for the remaining snake so it doesn't double the checks :
          //   snake 1 with snake 2..n
          //   snake 2 with snake 3..n because already checked 1 & 2
          //   snake 3 with snake 4..n because already checked 1 & 3 and 2 & 3
          //   ...
          for(let i=index+1; i<snakes_as_array.length; i++) {
            const [_, other_snake] = snakes_as_array[i];
            const other_snake_head = other_snake.getHead();

            // If colliding, they are both dead so we don't run any futile checks on the other snake later
            if(head[0] == other_snake_head[0] && head[1] == other_snake_head[1]) {
              logger.info(snake.name + " head collided with the head of " + other_snake.name);
              handlingDeath(snake);
              handlingDeath(other_snake);
            }
          }
        }
      }
      if (snake.dead) {
        this.snakes.delete(snake.id);
        gameRefresh.entities.removed.push(snake.id);

        const index = gameRefresh.entities.snakes.indexOf(snake);
        if (index > -1) {
          gameRefresh.entities.snakes.splice(index, 1);
        }
      }
    });
    logger.debug("Checked collisions");
  }

  // ======================== Collisions ========================= \\

  private checkCollisions(cases: [number, number][], entityMap: Map<string, Entity>, onCollision: (entity: Entity) => void) {
    cases.forEach((_case) => {
      const key = this.createCollideKey(_case);
      const entityAtKey = entityMap.get(key);

      if (entityAtKey) {
        onCollision(entityAtKey);
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
