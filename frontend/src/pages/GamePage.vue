<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { GameManager } from '../core/GameManager'

const gameManager = new GameManager()
const canvasRef = ref<HTMLCanvasElement | null>(null)

onMounted(() => {
  gameManager.start(canvasRef.value)
})
</script>

<template>
  <canvas ref="canvasRef" id="game" class="w-screen h-screen"></canvas>
</template>

