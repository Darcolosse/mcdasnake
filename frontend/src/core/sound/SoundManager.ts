import type { GameManager } from "../GameManager"
import type { GameRefreshDTO } from "../network/dto/responses/GameRefresh"
import type { EntityType } from "../display/DisplayGame"

export const Sounds = {
  APPLE: "apple.mp3",
  GAME_START: "start_game.mp3",
  GAME_END: "end_game.mp3",
  DEAD: "dead.mp3",
  SOMEONE_DIE: "someone_die.mp3",
  SPAWN: "spawn.mp3",
}

export type Sounds = typeof Sounds[keyof typeof Sounds]

export class SoundManager {
  private readonly SOUND_FOLDER = "sounds/"

  private readonly gameManager: GameManager
  private readonly audioInstances : Map<string, HTMLAudioElement>
  private roundRobinApple;
  private applePoolMax;

  constructor(gameManager: GameManager) {
    this.gameManager = gameManager
    this.roundRobinApple = 0
    this.applePoolMax = 10

    this.gameManager.log(this, "Loading sounds")
    this.audioInstances = new Map()
    Object.entries(Sounds).forEach(([_ , filename]) => {
      this.audioInstances.set(filename, new Audio(this.SOUND_FOLDER + filename))
      if(filename == Sounds.APPLE) {
        for(let i=0; i<this.applePoolMax; i++) {
          this.audioInstances.set(filename + i, new Audio(this.SOUND_FOLDER + filename))
        }
      }
    })
  }

  public onReady(): Promise<void[]> {
    let loadedSounds = 0;
    return Promise.all(
      Array.from(this.audioInstances.values()).map(audio => {
        return new Promise<void>(resolve => {
          const onAudioReady = () => {
            audio.onloadedmetadata = null
            resolve();
            loadedSounds++;
            if(loadedSounds == this.audioInstances.size) {
              this.gameManager.log(this, "All " + loadedSounds + " sounds loaded")
            }
          }

          audio.onloadedmetadata = onAudioReady

          if (audio.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) onAudioReady()
        });
      })
    );
  }

  public play(sound: Sounds) {
    let audio = this.audioInstances.get(sound);
    if(sound == Sounds.APPLE) {
      if(this.roundRobinApple != 0) {
        audio = this.audioInstances.get(sound + this.roundRobinApple);
      }
      this.roundRobinApple = (this.roundRobinApple + 1) % this.applePoolMax
    }

    if(!audio) return

    audio.currentTime = 0
    audio.play()
  }

  public onScenario(dto: GameRefreshDTO) {
    dto.entities.removed.forEach(deadDto => {
      switch(deadDto.typeDeadPlayer as EntityType) {
        case "SNAKE":
          this.play(Sounds.SOMEONE_DIE)
          break;
        case "APPLE":
          this.play(Sounds.APPLE)
          break;
      }
    })
  }

}
