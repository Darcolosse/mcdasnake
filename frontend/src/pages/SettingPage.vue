<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Colors } from '../core/display/colors'
import { SnakeDisplayed } from '../core/display/SnakeDisplayed'
import { Design, Graphism } from '../core/display/Design'

import { DisplayGameFake } from '../core/display/DisplayGameFake'
import { router } from '../router/router'
import { homeRoute } from '../router/routes'
import { CookieType, setCookie, getCookiePlus } from '../util/cookies'
import type { SpriteName } from '../core/display/SpriteManager'
import { DisplayManager } from '../core/display/DisplayManager'
import { GameManager } from '../core/GameManager'

interface snakeColorsInterface {
  name:string,
  value:string
}

interface snakeHeadsInterface {
  name:string,
  src:string
}

// === Snake customization ===
const snakeColors = [
  { name: 'Pig', value: 'rgb(255, 145, 155)' },        // rose doux
  { name: 'Coral', value: 'rgb(255, 185, 170)' },      // corail pastel
  { name: 'Peach', value: 'rgb(254, 200, 170)' },      // pêche pastel
  { name: 'Apricot', value: 'rgb(255, 215, 160)' },    // abricot léger
  { name: 'Lemon', value: 'rgb(255, 245, 170)' },      // jaune pastel
  { name: 'Mint', value: 'rgb(180, 240, 210)' },       // vert menthe
  { name: 'Aqua', value: 'rgb(185, 235, 245)' },       // bleu aqua soft
  { name: 'Sky', value: 'rgb(190, 220, 255)' },        // bleu ciel pastel
  { name: 'Lavender', value: 'rgb(215, 190, 255)' },   // violet pastel
  { name: 'Mauve', value: 'rgb(220, 180, 220)' },      // mauve doux
  { name: 'Lilac', value: 'rgb(230, 200, 245)' },      // lilas clair
];


const snakeHeads = [
  { name: 'HEAD_CLASSIC', src: '/src/core/display/sprite/head3.svg' },
  { name: 'HEAD_BETA', src: '/src/core/display/sprite/head.png' },
  { name: 'HEAD_FUN', src: '/src/core/display/sprite/head2.jpg' },
] //as {name : SpriteName, src : string}[];

  
const selectedColor = ref<snakeColorsInterface>(snakeColors[0] as snakeColorsInterface);
const selectedHead = ref<snakeHeadsInterface>(snakeHeads[0] as snakeHeadsInterface);


// === General graphics ===
const graphicsLevels = ['VERY_LOW', 'LOW', 'NORMAL'];
const selectedGraphics = ref('NORMAL');
const showHeadSection = ref(true);

// === Canvas preview ===
let canvas : (HTMLCanvasElement | null) = null;
let preview : (DisplayGameFake | null) = null;
let snakePreview : (SnakeDisplayed | null) = null;
const snakeDesign = new Design(
  selectedColor.value.value,
  selectedHead.value.name as SpriteName,
  selectedGraphics.value as Graphism
);
const canvasRef = ref<HTMLCanvasElement | null>(null)
onMounted(() => {
  loadCookieParameter();
  canvas = canvasRef.value;
  if (!canvas) {console.log("canva null"); return;}

  preview = new DisplayGameFake(canvas, [5,3]);
  snakePreview = new SnakeDisplayed(
    preview,
    [[1,1],[2,1],[3,1]],
    0,
    snakeDesign,
    1,
    0
  );
  preview.setEntity2("preview", snakePreview);
  preview.show();
  console.log(canvas);
})

function loadCookieParameter(){
  const raw = getCookiePlus(CookieType.Design);
  if (raw) {
    try {
      const saved = JSON.parse(raw);

      const col = snakeColors.find(c => c.value === saved.color);
      if (col) selectColor(col);

      const head = snakeHeads.find(h => h.name === saved.head);
      if (head) selectHead(head);

      if (saved.graphics) selectGraphics(saved.graphics);

    } catch (err) {
      console.warn("Cookie design invalide", err);
    }
  }
}



// === function ===

function selectColor(color: { name: string, value: string }) {
  selectedColor.value = color;
  snakeDesign.setColor(color.value);
  drawPreview();
}

function selectHead(head: { name: string, src: string }) {
  selectedHead.value = head;
  snakeDesign.setHead(head.name as SpriteName);
  drawPreview();
}

function selectGraphics(level: string){
  selectedGraphics.value = level as Graphism;
  snakeDesign.setGraphism(level as Graphism);
  drawPreview();
  if (level === "LOW" || level === "VERY_LOW"){
    showHeadSection.value = false;
  }
  else{
    showHeadSection.value = true;
  }
}

function drawPreview() {
  if (snakePreview){
    //snakePreview.setGraphism();
    // snakePreview.setDesign(new Design(
    //   selectedColor.value.value,
    //   selectHead.value.name,
    //   selectedGraphics.value as Graphism
    // ));
  }
  if (preview){
    preview.show();
  }
}

// === Validation ===
function applyChanges() {

  const design = {
    color: selectedColor.value?.value,
    head: selectedHead.value?.name,
    graphics: selectedGraphics.value,
  }
  console.log('Applied settings:', design)
  setCookie(CookieType.Design, JSON.stringify(design), 1)
  router.push(homeRoute.path);
}
</script>

<template>
  <div class="w-screen min-h-screen bg-background-inverse-primary text-content-inverse-secondary p-6 flex flex-col items-center gap-8">
    <h1 class="text-4xl md:text-6xl font-semibold text-center">
      <span class="text-content-brand-secondary">McDa</span>
      <span class="text-content-brand-primary">Settings</span>
    </h1>

    <!-- === General graphics section === -->
    <section class="w-full max-w-3xl bg-background-inverse-tertiary rounded-3xl p-6 flex flex-col gap-4 shadow-lg">
      <h2 class="text-2xl font-semibold text-content-brand-primary text-center">Graphics</h2>
      <div class="flex justify-center gap-6">
        <button
          v-for="level in graphicsLevels"
          :key="level"
          class="px-4 py-2 rounded-full text-lg border-2 transition-all"
          :class="{
            'bg-background-brand-primary text-content-neutral-primary border-background-brand-primary': selectedGraphics === level,
            'bg-background-inverse-primary text-content-brand-secondary hover:bg-background-brand-primary/30': selectedGraphics !== level
          }"
          @click="selectGraphics(level)"
        >
          {{ level }}
        </button>
      </div>
    </section>

    <!-- === Snake customization section === -->
    <section class="w-full max-w-3xl bg-background-inverse-tertiary rounded-3xl p-6 flex flex-col gap-6 shadow-lg">
      <h2 class="text-2xl font-semibold text-content-brand-primary text-center">Snake Customization</h2>

      <!-- Color selection -->
      <div class="flex flex-col gap-2">
        <h3 class="text-xl text-content-brand-secondary">Color</h3>
        <div class="flex flex-wrap justify-center gap-4">
          <div
            v-for="color in snakeColors"
            :key="color.name"
            class="w-10 h-10 rounded-full cursor-pointer transition-all"
            :class="color.name === selectedColor.name
              ? 'border-4 bg-background-brand-primary '
              : 'border-2 bg-background-inverse-primary hover:bg-background-brand-primary/30'"
            :style="{ borderColor: color.name === selectedColor.name ? 'var(--color-lime-100)' : 'var(--color-sand-100)', background: color.value }"
            @click="selectColor(color)"

          ></div>
        </div>
      </div>

      <!-- Head selection -->
      <div v-if="showHeadSection" class="flex flex-col gap-2">
        <h3 class="text-xl text-content-brand-secondary">Head</h3>
        <div class="flex flex-wrap justify-center gap-6">
          <img
            v-for="head in snakeHeads"
            :key="head.name"
            :src="head.src"
            class="w-16 h-16 p-2 rounded-xl cursor-pointer transition-all"
            :class="head.name === selectedHead.name
              ? 'border-4 bg-background-brand-primary'
              : 'border-2 bg-background-inverse-primary hover:bg-background-brand-primary/30'"
            :style="{ borderColor: head.name === selectedHead.name ? 'var(--color-lime-100)' : 'var(--color-sand-100)' }"
            @click="selectHead(head)"
          />
        </div>
      </div>

      <!-- Preview -->
      <div class="flex flex-col items-center">
        <h3 class="text-xl text-content-brand-secondary">Preview</h3>
        <canvas id="preview" ref="canvasRef" width="250" height="150" class="bg-background-inverse-primary rounded-2xl border-4 border-background-brand-primary mt-2"></canvas>
      </div>
    </section>

    <!-- === Validate button === -->
    <button
      class="mt-4 px-10 py-3 bg-background-brand-primary text-content-neutral-primary text-2xl font-semibold rounded-full hover:bg-background-inverse-tertiary hover:text-content-brand-primary hover:border-4 hover:border-background-brand-primary transition-all"
      @click="applyChanges"
    >
      APPLY SETTINGS
    </button>
  </div>
</template>
