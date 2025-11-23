import type { Ref } from "vue";
import type { GameManager } from "../GameManager";
import type { GameUpdateResponseDTO } from "../network/dto/responses/GameUpdateResponse";

export class InterfaceManager {
  private gameManager!: GameManager;
  private scoreBoard: Ref<Array<[string, number, number, number]> | null>;
  private respawnAuthorization: Ref<Boolean>;

  constructor(respawnAuthorization: Ref<Boolean>, scoreBoard: Ref<Array<[string, number, number, number]> | null>)  {
    this.respawnAuthorization = respawnAuthorization
    this.scoreBoard = scoreBoard

    // Default
    this.respawnAuthorization.value = false
  }

  // ====================== Vertical layer ======================= \\

  public setGameManager(gameManager: GameManager) {
    this.gameManager = gameManager
  }

  public permitToRespawn() {
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
}
