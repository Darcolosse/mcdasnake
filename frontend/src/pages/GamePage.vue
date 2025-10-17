<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { GameManager } from '../core/GameManager'
import { CookieType, getCookie } from '../util/cookies'
import { router } from '../router/router'
import { homeRoute } from '../router/routes'

const gameManager = new GameManager()
const canvasRef = ref<HTMLCanvasElement | null>(null)

onMounted(() => {
  const username = getCookie(CookieType.Username)
  if(username) {
    gameManager.start(canvasRef.value)
  } else {
    router.push(homeRoute.path)
  }
})
</script>

<template>
  <div class="w-screen h-screen flex flex-col lg:flex-row items-center justify-center xl:p-16 xl:gap-16 bg-background-inverse-primary">
    <div class="w-[95vmin] xl:h-full aspect-square rounded-3xl bg-background-neutral-primary ">
      <canvas
        ref="canvasRef"
        id="game"
        class="w-full h-full">
      </canvas>
    </div>
    <div class="w-full h-full hidden xl:flex flex-col gap-16">
      <div class="bg-background-neutral-primary w-full h-full rounded-3xl">
      </div>
      <div class="bg-background-inverse-secondary w-full h-fit py-5 text-center font-bold rounded-3xl">
        <p class="text-content-brand-primary">
          Designed and developed by
        </p>
        <p class="text-content-brand-secondary underline">
          <a href="https://github.com/Darcolosse">Corentin GOUES</a><br />
          <a href="https://github.com/Darcolosse">Corentin GOUES</a><br />
          <a href="https://github.com/Darcolosse">Corentin GOUES</a>
        </p>
      </div>
    </div>
  </div>
</template>

