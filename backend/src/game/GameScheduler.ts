import { GameRefreshResponseDTO } from "@network/dto/responses/GameRefreshResponseDTO";
import { Game } from "@game/Game";
import { GameManager, Buffers } from "@game/GameManager";
import { GameUpdateSnakeDirectionDTO } from "@network/dto/requests/GameUpdateSnakeDirectionDTO";
import { GameAddPlayerDTO } from "@network/dto/requests/GameAddPlayerDTO";
import { GameDeadPlayerDTO } from "@/network/dto/responses/GameDeadPlayerDTO";

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
      const snake = this.game.addSnake(connection.id, (connection.dto as GameAddPlayerDTO).name, (connection.dto as GameAddPlayerDTO).design);
      gameRefresh.entities.snakes.push(snake);
    })

    this.gameManager.popBuffer(Buffers.DECONNECTION_BUFFER).forEach((deconnection) => {
      this.game.removeSnake(deconnection.id);
      gameRefresh.entities.removed.push(deconnection.id);
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
      for (const id of gameRefresh.entities.removed) {
        this.gameManager.handleGameEvent(new GameDeadPlayerDTO(id), id);
      }
    }
  }

  private onGameStep(gameRefresh: GameRefreshResponseDTO) {
    this.gameManager.popBuffer(Buffers.TURN_BUFFER).forEach((event) => {
      this.game.updateDirection(event.id, (event.dto as GameUpdateSnakeDirectionDTO).direction)
    })

		this.game.processMove(gameRefresh);
		this.game.processCollisions(gameRefresh);
  }

}
