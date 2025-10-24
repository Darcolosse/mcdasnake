<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { CookieType, setCookie } from '../util/cookies';
import { router } from '../router/router';
import { playRoute } from '../router/routes';

  const usernameRef = useTemplateRef('username')

  function joinGame() {
    if(usernameRef.value?.value){
      setCookie(CookieType.Username, usernameRef.value.value, 1)
      router.push(playRoute.path)     
    }
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
        ref="username"
        type="text"
        class="w-1/5 h-1/18 min-h-10 bg-background-inverse-tertiary px-5 rounded-full border-3 border-background-brand-secondary text-center text-xl text-content-inverse-secondary focus:placeholder-transparent focus:outline-none placeholder:text-content-brand-secondary/40"
        placeholder="Username"
      />
      <button
        class="w-fit h-1/18 min-h-10 bg-background-brand-primary px-5 text-3xl text-content-neutral-primary font-semibold rounded-full grid place-items-center cursor-pointer hover:text-content-brand-primary hover:bg-background-inverse-tertiary hover:border-3 hover:border-background-brand-primary"
        @click="joinGame"
      >
        PLAY
      </button>
    </div>
  </div>
</template>
