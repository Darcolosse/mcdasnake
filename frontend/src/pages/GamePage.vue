<script setup lang="ts">
import { onMounted } from 'vue';
import { GameManager } from '../core/GameManager';

const gameManager: GameManager = new GameManager();

onMounted(() => {
  gameManager.start()
})
</script>

<template>
  <canvas id="game" class="w-screen h-screen">
  </canvas>
</template>

<style scoped>
</style>
