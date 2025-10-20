<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { GameManager } from '../core/GameManager'
import { CookieType, getCookie } from '../util/cookies'
import { router } from '../router/router'
import { homeRoute } from '../router/routes'

const gameManager = new GameManager()
const gameRef = ref<HTMLCanvasElement | null>(null)
const bgRef = ref<HTMLCanvasElement | null>(null)

onMounted(() => {
  const username = getCookie(CookieType.Username)
  if(username) {
    gameManager.start(bgRef.value, gameRef.value)
  } else {
    router.push(homeRoute.path)
  }
})
</script>

<template>
  <div class="w-screen h-screen flex flex-col lg:flex-row items-center justify-center xl:p-16 xl:gap-16 bg-background-inverse-primary">
    <div class="relative w-[95vmin] xl:w-auto xl:h-full aspect-square">
      <div class="absolute -top-11 -left-2 md:-top-13 xl:-top-15.5 xl:-left-15 flex items-center py-1 px-2 gap-3">
        <img class="w-1/12" src="/icon.webp" />
          <h1 class="text-sm xl:text-3xl font-semibold">
            <span class="text-content-brand-secondary">McDa</span>
            <span class="text-content-brand-primary">Snake</span>
          </h1>
      </div>
      <div class=" w-full h-full rounded-3xl overflow-hidden">
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
          class="absolute inset-0 w-full h-full block z-50">
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

