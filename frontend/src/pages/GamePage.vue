<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { GameManager } from '../core/GameManager'
import { CookieType, getCookie, setCookie } from '../util/cookies'
import { router } from '../router/router'
import { homeRoute } from '../router/routes'
import { InterfaceManager } from '../core/interface/InterfaceManager'

const gameRef = ref<HTMLCanvasElement | null>(null)
const bgRef = ref<HTMLCanvasElement | null>(null)
const respawnAuthorisation = ref(false)
const gameRunningRef = ref(false)
const lastDeathMessageRef = ref('')
const timerRef = ref('')
const refScoreBoard = ref<Array<[string, number, number, number]> | null>(null)

let interfaceManager: InterfaceManager
let gameManager: GameManager

function onKeyDown(e: KeyboardEvent) {
  // Respawn
  if (e.key === 'r' || e.key === 'R') {
    interfaceManager.askForRespawn()
  }

  // Exit (Escape)
  else if (e.key === 'Escape') {
    goToHome()
  }
}

onMounted(() => {
  interfaceManager = new InterfaceManager(respawnAuthorisation, lastDeathMessageRef, refScoreBoard, timerRef, gameRunningRef)
  gameManager = new GameManager(interfaceManager)
  interfaceManager.setGameManager(gameManager)

  const antiSpamExists = getCookie(CookieType.AntispamServer)
  const username = getCookie(CookieType.Username)
  if(!antiSpamExists && username) {
    setCookie(CookieType.AntispamServer, "bomboclatt", 5000)
    gameManager.start(bgRef.value, gameRef.value)
    document.addEventListener('keydown', onKeyDown)
  } else {
    router.push(homeRoute.path)
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeyDown)
})

async function goToHome() {
  if (gameManager) {
    document.removeEventListener('keydown', onKeyDown)
    await gameManager.close()
  }
  router.push(homeRoute.path);
}

</script>

<template>
  <div class="relative w-screen h-screen flex flex-col lg:flex-row items-center justify-center xl:p-16 xl:gap-16 bg-background-inverse-primary">
    <div 
       class="cursor-pointer absolute top-4 right-4 py-1 px-4 bg-background-brand-tertiary rounded-lg font-semibold text-background-inverse-tertiary"
       @click="goToHome"
      >
      Back (Escape)
    </div>
    <div class="relative w-[95vmin] xl:w-auto xl:h-full aspect-square">
      <div class="absolute -top-11 -left-2 md:-top-13 xl:-top-15.5 xl:-left-15 flex items-center py-1 px-2 gap-3">
        <img class="w-1/12" src="/icon.webp" />
          <h1 class="text-sm xl:text-3xl font-semibold">
            <span class="text-content-brand-secondary">McDa</span>
            <span class="text-content-brand-primary">Snake</span>
          </h1>
      </div>
      <div 
        :class="['z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 py-1 px-4 bg-background-inverse-secondary rounded-lg font-semibold text-2xl lg:text-3xl text-center text-background-inverse-tertiary',
                 respawnAuthorisation ? 'absolute cursor-pointer' : 'hidden']"
        @click="interfaceManager.askForRespawn"
        >
        <span class="text-content-brand-primary">Click here to </span>
        <span class="text-content-brand-secondary">Re</span>
        <span class="text-content-brand-primary">spawn</span>
        <span class="text-content-brand-secondary"> (r)</span>
        <br />
        <span class="text-lg text-content-brand-tertiary">{{ lastDeathMessageRef }}</span>
      </div>
      <div 
        :class="['z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 py-1 px-4 bg-background-inverse-secondary rounded-lg font-semibold text-2xl text-center text-background-inverse-tertiary',
                 gameRunningRef ? 'absolute cursor-pointer' : 'hidden']"
        >
        <span class="text-content-brand-primary">Game is</span>
        <span class="text-content-brand-secondary"> restarting </span>
        <span class="text-content-brand-primary">!</span>
        <br />
        <span class="text-xs text-content-brand-tertiary">Reconnection is automatic!</span>
      </div>
      <div class="relative w-full h-full rounded-3xl overflow-hidden">
        <!-- Background canvas -->
        <canvas
          ref="bgRef"
          id="background"
          class="absolute inset-0 w-full h-full block z-10">
        </canvas>

        <!-- Foreground / main canvas -->
        <canvas
          ref="gameRef"
          id="game"
          class="absolute inset-0 w-full h-full block z-30">
        </canvas>
      </div>
      <div class="absolute -bottom-12 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 font-semibold text-content-brand-secondary grid place-items-center rounded-xl bg-background-inverse-secondary">
        {{ timerRef }}
      </div>
    </div>
    <div class="w-full h-full hidden xl:flex flex-col gap-16 font-extrabold text-lg text-background-inverse-tertiary">
      <div class="bg-background-brand-primary w-full h-full rounded-3xl flex flex-col p-1 overflow-y-auto">
        <div class="text-center text-4xl py-5">
          LeaderBoard
        </div>

        <div
          v-if="refScoreBoard && refScoreBoard.length > 0"
          v-for="(entry, index) in refScoreBoard"
          :key="index"
          class="flex flex-row items-center rounded-xl gap-5 p-2"
        >
          <!-- Rank / Index -->
          <div class="w-12 text-center py-3 bg-background-inverse-primary text-content-brand-primary rounded-xl">
            {{ index + 1 }}
          </div>

          <!-- Username -->
          <div class="h-full flex-1 flex justify-between items-center bg-background-neutral-primary rounded-xl px-5">
            {{ entry[0] }}
            <div class="flex justify-end gap-4">
              <div class="flex justify-center items-center rounded-xl bg-background-brand-secondary gap-2 py-2 px-4">
                <img class="h-7" src="../core/display/sprite/apple.png" />
                {{ entry[3] }}
              </div>
              <div class="flex justify-center items-center rounded-xl bg-background-brand-tertiary gap-2 py-2 px-4">
                <img class="h-7" src="/icon.webp" />
                {{ entry[2] }}
              </div>
            </div>
          </div>

          <!-- Stats -->
        </div>

        <!-- When no scoreboard yet -->
        <div v-else class="text-center text-lg py-10 opacity-75">
          No score yet.
        </div>
         
      </div>
      <div class="bg-background-inverse-secondary w-full h-fit py-5 text-center font-bold rounded-3xl">
        <p class="text-content-brand-primary">
          Designed and developed by
        </p>
        <p class="text-content-brand-secondary underline">
          <a href="https://github.com/Darcolosse" target="_blank">Corentin GOUES</a><br />
          <a href="https://github.com/Alexis-Wamster" target="_blank">Alexis WAMSTER</a><br />
          <a href="https://github.com/Hugo-CASTELL" target="_blank">Hugo CASTELL</a>
        </p>
      </div>
    </div>
  </div>
</template>

