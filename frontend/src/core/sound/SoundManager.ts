import type { GameManager } from "../GameManager"

export const Sounds = {
  APPLE: "apple.mp3",
  GAME_START: "start_game.mp3",
}

export type Sounds = typeof Sounds[keyof typeof Sounds]

export class SoundManager {
  private readonly SOUND_FOLDER = "sounds/"

  private readonly gameManager: GameManager
  private readonly audioInstances : Map<string, HTMLAudioElement>
  private readonly antiDuplicateSounds : Map<string, number>

  constructor(gameManager: GameManager) {
    this.gameManager = gameManager

    this.gameManager.log(this, "Loading sounds")
    this.audioInstances = new Map()
    this.antiDuplicateSounds = new Map()
    Object.entries(Sounds).forEach(([_ , filename]) => {
      this.audioInstances.set(filename, new Audio(this.SOUND_FOLDER + filename))
      this.antiDuplicateSounds.set(filename, -performance.timeOrigin)
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
    const audio = this.audioInstances.get(sound)
    const lastTimePlayed = this.antiDuplicateSounds.get(sound)
    if(!audio || !lastTimePlayed) return

    const now = performance.now()
    const tooSoon = (now - lastTimePlayed) < audio.duration * 1000
    if(tooSoon) return

    this.antiDuplicateSounds.set(sound, now)
    audio.currentTime = 0
    audio.play()
  }

}
