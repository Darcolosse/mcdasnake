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

const interfaceManager = new InterfaceManager(respawnAuthorisation)
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
    window.addEventListener('keydown', onKeyDown)
  } else {
    router.push(homeRoute.path)
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
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
      <div class="bg-background-neutral-primary w-full h-full rounded-3xl">
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

