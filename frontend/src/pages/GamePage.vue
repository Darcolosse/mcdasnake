<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { GameManager } from '../core/GameManager'
import { CookieType, getCookie } from '../util/cookies'
import { router } from '../router/router'
import { homeRoute } from '../router/routes'
import { InterfaceManager } from '../core/interface/InterfaceManager'

const gameRef = ref<HTMLCanvasElement | null>(null)
const bgRef = ref<HTMLCanvasElement | null>(null)
const respawnAuthorisation = ref(false)
const refScoreBoard = ref<Map<string, [string, number, number, number]> | null>(null)

const interfaceManager = new InterfaceManager(respawnAuthorisation, refScoreBoard)
const gameManager = new GameManager(interfaceManager)
interfaceManager.setGameManager(gameManager)

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'r' || e.key === 'R') {
    interfaceManager.askForRespawn()
  }
}

onMounted(() => {
  const username = getCookie(CookieType.Username)
  if(username) {
    gameManager.start(bgRef.value, gameRef.value)
    window.addEventListener('keyup', onKeyDown)
  } else {
    router.push(homeRoute.path)
  }
})

onUnmounted(() => {
  window.removeEventListener('keyup', onKeyDown)
})

function goToHome() {
  router.push(homeRoute.path);
}

</script>

<template>
  <div class="relative w-screen h-screen flex flex-col lg:flex-row items-center justify-center xl:p-16 xl:gap-16 bg-background-inverse-primary">
    <div 
       class="cursor-pointer absolute top-4 right-4 py-1 px-4 bg-background-inverse-secondary/60 rounded-lg font-semibold text-background-inverse-tertiary"
       @click="goToHome"
      >
      Exit
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
        :class="['z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 py-1 px-4 bg-background-inverse-secondary rounded-lg font-semibold text-3xl text-background-inverse-tertiary',
                 respawnAuthorisation ? 'absolute cursor-pointer' : 'hidden']"
        @click="interfaceManager.askForRespawn"
        >
        <span class="text-content-brand-primary">Click here to </span>
        <span class="text-content-brand-secondary">Re</span>
        <span class="text-content-brand-primary">spawn</span>
        <span class="text-content-brand-secondary"> (r)</span>
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
    </div>
    <div class="w-full h-full hidden xl:flex flex-col gap-16">
      <div class="bg-background-neutral-primary w-full h-full rounded-3xl flex flex-col p-1">

        <div
          v-if="refScoreBoard && refScoreBoard.size > 0"
          v-for="[id, data] in refScoreBoard"
          :key="id"
          class="flex flex-row items-center bg-background-neutral-secondary rounded-xl p-2"
        >
          <!-- Rank / Index -->
          <div class="w-12 text-center font-bold text-content-brand-primary">
            {{ [...refScoreBoard.keys()].indexOf(id) + 1 }}
          </div>

          <!-- Username -->
          <div class="flex-1 font-semibold">
            {{ data[0] }}
          </div>

          <!-- Stats -->
          <div class="text-right w-32 font-mono">
            <div>Score: {{ data[1] }}</div>
            <div>Kills: {{ data[2] }}</div>
            <div>Deaths: {{ data[3] }}</div>
          </div>
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

