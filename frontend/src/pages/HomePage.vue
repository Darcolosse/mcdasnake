<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { CookieType, getCookie, setCookie } from '../util/cookies';
import { router } from '../router/router';
import { paramRoute, playRoute } from '../router/routes';

  const username = ref<string>('')
  
  // Load cookie on mount
  onMounted(() => {
    const cookie = getCookie(CookieType.Username)
    if (cookie) username.value = cookie
  })

  // Save cookie whenever it changes
  watch(username, (newVal) => {
    if (newVal) {
      setCookie(CookieType.Username, newVal, 1)
    }
  })

  function joinGame() {
    if(username.value){
      setCookie(CookieType.Username, username.value, 1)
      router.push(playRoute.path)     
    }
  }

  function goToSettings() {
    router.push(paramRoute.path);
  }

</script>

<template>
  <div class="w-screen h-screen bg-background-inverse-primary grid place-items-center">
    <div class="w-full h-full flex flex-col gap-6 justify-center items-center text-center">
      <h1 class="text-5xl md:text-7xl font-semibold">
        <span class="text-content-brand-secondary">McDa</span>
        <span class="text-content-brand-primary">Snake</span>
      </h1>
      <img class="w-1/6" src="/icon.webp" />
      <input 
        v-model="username"
        type="text"
        class="w-1/2 md:w-1/5 h-1/18 min-h-10 bg-background-inverse-tertiary px-5 rounded-full border-3 border-background-brand-secondary text-center text-xl text-content-inverse-secondary focus:placeholder-transparent focus:outline-none placeholder:text-content-brand-secondary/40"
        placeholder="Username"
        @keydown.enter="joinGame"
      />
      <button
        class="w-fit h-1/18 min-h-10 bg-background-brand-primary px-5 text-3xl text-content-neutral-primary font-semibold rounded-full grid place-items-center cursor-pointer hover:text-content-brand-primary hover:bg-background-inverse-tertiary hover:border-3 hover:border-background-brand-primary"
        @click="joinGame"
      >
        PLAY
      </button>


      <button
        class="w-fit h-1/18 min-h-10 bg-background-brand-primary px-5 text-3xl text-content-neutral-primary font-semibold rounded-full grid place-items-center cursor-pointer hover:text-content-brand-primary hover:bg-background-inverse-tertiary hover:border-3 hover:border-background-brand-primary"
        @click="goToSettings"
      >
        SETTINGS
      </button>
    </div>
  </div>
</template>
