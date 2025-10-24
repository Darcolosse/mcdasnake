<script setup lang="ts">
import { CookieType, getCookie } from '../util/cookies'

//   onMounted(() => {
//   const username = getCookie(CookieType.Username)
//   if(username) {
//     // TODO
//   } else {
//     // TODO
//   }
// })

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
</template>
