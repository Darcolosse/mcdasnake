import type { Ref } from "vue";
import type { GameManager } from "../GameManager";
import type { GameUpdateResponseDTO } from "../network/dto/responses/GameUpdateResponse";
import type { GameRefreshDTO } from "../network/dto/responses/GameRefresh";
import type { GameDeadPlayerResponseDTO } from "../network/dto/responses/GamePlayerDead";

export class InterfaceManager {
  private gameManager!: GameManager;
  private scoreBoard: Ref<Array<[string, number, number, number]> | null>;
  private respawnAuthorization: Ref<Boolean>;
  private lastDeathMessageRef: Ref<string>;

  constructor(respawnAuthorization: Ref<Boolean>, lastDeathMessageRef: Ref<string> , scoreBoard: Ref<Array<[string, number, number, number]> | null>)  {
    this.respawnAuthorization = respawnAuthorization
    this.lastDeathMessageRef = lastDeathMessageRef
    this.scoreBoard = scoreBoard

    // Default
    this.respawnAuthorization.value = false
  }

  // ====================== Vertical layer ======================= \\

  public setGameManager(gameManager: GameManager) {
    this.gameManager = gameManager
  }

  public permitToRespawn(dto: GameDeadPlayerResponseDTO) {
    this.lastDeathMessageRef.value = dto.deathMessage
    this.respawnAuthorization.value = true
  }

  public restrictRespawn() {
    this.respawnAuthorization.value = false
  }

  public askForRespawn() {
    if (this.respawnAuthorization.value) {
      this.gameManager.askServerForRespawn()
    }
  }

  public setEntireScoreboard(dto: GameUpdateResponseDTO) {
    this.scoreBoard.value = dto.scoreBoard
  }

  public updateScoreboard(dto: GameRefreshDTO) {
    this.scoreBoard.value = dto.scoreBoard
  }
}
