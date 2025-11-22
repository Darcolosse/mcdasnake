import { GameRefreshResponseDTO } from "@network/dto/responses/GameRefreshResponseDTO";
import { Game } from "@game/Game";
import { GameManager, Buffers, Event } from "@game/GameManager";
import { GameUpdateSnakeDirectionDTO } from "@network/dto/requests/GameUpdateSnakeDirectionDTO";
import { GameAddPlayerDTO } from "@network/dto/requests/GameAddPlayerDTO";

export class GameScheduler {
  private readonly game: Game;
  private readonly gameManager: GameManager;

  private gameLoop!: NodeJS.Timeout;
  private tickCount!: number;

  constructor(gameManager: GameManager, game: Game) {
    this.gameManager = gameManager;
    this.game = game;
  }

  // ====================== Vertical layer ======================= \\

  public start() {
    this.tickCount = 0;
    this.gameLoop = setInterval(this.onTick.bind(this), Number(process.env.GAME_TICKRATE_MS));
  }

  public stop() {
    clearInterval(this.gameLoop);
  }
  
  // ===================== Management layer ====================== \\

  private onTick() {
    this.tickCount += Number(process.env.GAME_TICKRATE_MS);

    // ### Game refresh barebone ###
    const gameRefresh: GameRefreshResponseDTO = new GameRefreshResponseDTO();
    gameRefresh.scoreBoard = this.game.getScore();

    // #                 #
    // # Realtime events #
    // #                 #
    this.gameManager.popBuffer(Buffers.CONNECTION_BUFFER).forEach((connection) => {
      if (this.game.isSnakePlaying(connection.id)) this.onRemove(connection.id, gameRefresh);
      this.onAdd(connection, gameRefresh);
    })

    this.gameManager.popBuffer(Buffers.DECONNECTION_BUFFER).forEach((deconnection) => {
      this.onRemove(deconnection.id, gameRefresh);
    })

    // #                  #
    // # Bonus generation #
    // #                  #
    this.game.processGenerateBonus(gameRefresh);

    // #           #
    // # Game step #
    // #           #
    if(this.tickCount % Number(process.env.GAME_SPEED_MS) == 0) {
      this.onGameStep(gameRefresh);
    }

    // #                        #
    // # Notifying game refresh #
    // #                        #
    if(!gameRefresh.isEmpty()) {
      this.gameManager.handleGameEvent(gameRefresh);
    }
  }

  private onGameStep(gameRefresh: GameRefreshResponseDTO) {
    this.gameManager.popBuffer(Buffers.TURN_BUFFER).forEach((event) => {
      this.game.updateDirection(event.id, (event.dto as GameUpdateSnakeDirectionDTO).direction)
    })

		this.game.processMove(gameRefresh);
		this.game.processCollisions(gameRefresh);
  }

  private onAdd(connection: Event, gameRefresh: GameRefreshResponseDTO) {
    const snake = this.game.addSnake(connection.id, (connection.dto as GameAddPlayerDTO).name, (connection.dto as GameAddPlayerDTO).design);
    gameRefresh.entities.snakes.push(snake);
  }

  private onRemove(id: string, gameRefresh: GameRefreshResponseDTO) {
    this.game.removeSnake(id);
    gameRefresh.entities.removed.push(id);
  }

}
