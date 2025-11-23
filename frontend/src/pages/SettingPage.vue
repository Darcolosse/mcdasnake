<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { SnakeDisplayed } from '../core/display/SnakeDisplayed'
import { Design, Graphism } from '../core/display/Design'
import { DisplayGameSimple } from '../core/display/DisplayGameSimple'
import { router } from '../router/router'
import { homeRoute } from '../router/routes'
import { CookieType, setCookie, getCookiePlus } from '../util/cookies'
import type { SpriteName } from '../core/display/SpriteManager'

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
  { name: 'HEAD_HUGOAT', src: '/src/core/display/sprite/head_hugoat.jpg' },
  { name: 'HEAD_DARCO', src: '/src/core/display/sprite/head_darco.jpg' },
  { name: 'HEAD_MCDALA', src: '/src/core/display/sprite/head_mcdala.jpg' },
]

const textures = [
  { name: 'SCALE', src: '/src/core/display/sprite/scale.jpg' },
  { name: 'SCALE2', src: '/src/core/display/sprite/scale2.jpg' },
]

// === Mode ===
const mode = ref<"color" | "texture">("color");

// === Color choice 1 ===
const selectedColor1 = ref<snakeColorsInterface>(snakeColors[0] as snakeColorsInterface);
const customColor1 = ref("#ffffff");
const customColorInput1 = ref<HTMLInputElement | null>(null);

// === Color choice 2 ===
const selectedColor2 = ref<snakeColorsInterface>(snakeColors[0] as snakeColorsInterface);
const customColor2 = ref("#ffffff");
const customColorInput2 = ref<HTMLInputElement | null>(null);

// === Texture choice ===
const selectedTexture = ref<snakeHeadsInterface>(textures[0] as snakeHeadsInterface);

// === Head choice ===
const selectedHead = ref<snakeHeadsInterface>(snakeHeads[0] as snakeHeadsInterface);


// === graphics choice ===
const graphicsLevels = ['VERY_LOW', 'LOW', 'NORMAL'];
const selectedGraphics = ref('NORMAL');
const showHeadSection = ref(true);

// === Canvas preview ===
let canvas : (HTMLCanvasElement | null) = null;
let preview : (DisplayGameSimple | null) = null;
let snakePreview : (SnakeDisplayed | null) = null;
const snakeDesign = new Design(
  selectedColor1.value.value,
  selectedHead.value.name as SpriteName,
  selectedGraphics.value as Graphism
);
const canvasRef = ref<HTMLCanvasElement | null>(null)
onMounted(() => {
  loadCookieParameter();
  canvas = canvasRef.value;
  if (!canvas) {console.log("canva null"); return;}

  preview = new DisplayGameSimple(canvas, [5,3]);
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

      // color1
      if (saved.color1) {
        const col = snakeColors.find(c => c.value === saved.color1);
        if (col) {
          selectColor1(col);
        } else {
          customColor1.value = saved.color1;
          selectCustomColor1();
        }
      }

      // color2
      if (saved.color2) {
        const col = snakeColors.find(c => c.value === saved.color2);
        if (col) {
          selectColor2(col);
        } else {
          customColor2.value = saved.color2;
          selectCustomColor2();
        }
      }
      else{
        removeColor2();
      }

      // texture
      const texture = snakeHeads.find(h => h.name === saved.texture);
      if (texture) {
        mode.value = "texture"
        selectTexture(texture);
      }
      
      // head
      const head = snakeHeads.find(h => h.name === saved.head);
      if (head) selectHead(head);

      //graphics
      if (saved.graphics) selectGraphics(saved.graphics);

    } catch (err) {
      console.warn("Cookie design invalide", err);
    }
  }
}



// === function ===

function selectCustomColor1() {
  const colorObj = { name: "custom1", value: customColor1.value };
  selectColor1(colorObj);
}
function selectCustomColor2() {
  const colorObj = { name: "custom2", value: customColor2.value };
  selectColor2(colorObj);
}

function removeColor2(){
  selectedColor2.value = { name: "none", value: "" };
  snakeDesign.setColor2(undefined);
  drawPreview();
}

function selectColor1(color: { name: string, value: string }) {
  selectedTexture.value = { name: "none", src: "" };
  snakeDesign.setTexture(undefined);
  selectedColor1.value = color;
  snakeDesign.setColor1(color.value);
  drawPreview();
}

function selectColor2(color: { name: string, value: string }) {
  selectedTexture.value = { name: "none", src: "" };
  snakeDesign.setTexture(undefined);
  selectedColor2.value = color;
  snakeDesign.setColor2(color.value);
  drawPreview();
}

function selectHead(head: { name: string, src: string }) {
  selectedHead.value = head;
  snakeDesign.setHead(head.name as SpriteName);
  drawPreview();
}

function selectTexture(texture: { name: string, src: string }) {
  selectedTexture.value = texture;
  snakeDesign.setTexture(texture.name as SpriteName);
  drawPreview();
}


function selectGraphics(level: string){
  
  selectedGraphics.value = level as Graphism;
  snakeDesign.setGraphism(level as Graphism);
  if (level === "VERY_LOW") { // Mode couleurs (1) exclusif   
    removeColor2();
  }
  if (level === "LOW" || level === "VERY_LOW"){ // pas de choix de tete
    showHeadSection.value = false;
  }
  else{
    showHeadSection.value = true;
  }
  drawPreview();
}

function drawPreview() {
  if (snakePreview){
    //snakePreview.setGraphism();
    // snakePreview.setDesign(new Design(
    //   selectedColor1.value.value,
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
    color1: selectedColor1.value?.value,
    color2: selectedColor2.value?.value,
    texture: selectedTexture.value?.name,
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
      <div class="flex justify-center gap-4 mb-4">
      
        <!-- Choix couleur / texture -->
      <button
        class="px-4 py-2 rounded-full border-2"
        :class="mode === 'color'
          ? 'bg-background-brand-primary text-content-neutral-primary border-background-brand-primary'
          : 'bg-background-inverse-primary text-content-brand-secondary hover:bg-background-brand-primary/30'"
        @click="mode = 'color'"
      >Colors</button>

      <button
        class="px-4 py-2 rounded-full border-2"
        :class="mode === 'texture'
          ? 'bg-background-brand-primary text-content-neutral-primary border-background-brand-primary'
          : 'bg-background-inverse-primary text-content-brand-secondary hover:bg-background-brand-primary/30'"
        @click="mode = 'texture'"
      >Textures</button>
    </div>

    <div v-if="mode === 'color'" class="flex flex-col gap-2">
        <!-- Color 1 selection -->
      <div class="flex flex-col gap-2">
        <h3 class="text-xl text-content-brand-secondary">Color 1</h3>
        <div class="flex flex-wrap justify-center gap-4">
          <div
            v-for="color in snakeColors"
            :key="color.name"
            class="w-10 h-10 rounded-full cursor-pointer transition-all"
            :class="color.name === selectedColor1.name
              ? 'border-4 bg-background-brand-primary '
              : 'border-2 bg-background-inverse-primary hover:bg-background-brand-primary/30'"
            :style="{ borderColor: color.name === selectedColor1.name ? 'var(--color-lime-100)' : 'var(--color-sand-100)', background: color.value }"
            @click="selectColor1(color)"
          ></div>
          <div
            class="w-10 h-10 rounded-full cursor-pointer border-2 flex items-center justify-center text-xl font-bold"
            :class="selectedColor1.name === 'custom1'
              ? 'border-4 bg-background-brand-primary'
              : 'bg-background-inverse-primary hover:bg-background-brand-primary/30'"
            :style="{ borderColor: selectedColor1.name === 'custom1' ? 'var(--color-lime-100)' : 'var(--color-sand-100)', background: customColor1 }"
            @click="() => { selectCustomColor1(); customColorInput1?.click(); }"
          >+</div>
          <input
            ref="customColorInput1"
            type="color"
            class="hidden"
            v-model="customColor1"
            @input="selectCustomColor1"
          />
        </div>
      </div>

        <!-- Color 2 selection -->
      <div v-if="mode === 'color' && selectedGraphics !== 'VERY_LOW'" class="flex flex-col gap-2">
        <h3 class="text-xl text-content-brand-secondary">Color 2</h3>
        <div class="flex flex-wrap justify-center gap-4">
          <div
            class="w-10 h-10 rounded-full cursor-pointer border-2 flex items-center justify-center text-xl font-bold"
            :class="selectedColor2.name === 'none'
              ? 'border-4 bg-background-brand-primary text-content-neutral-primary border-background-brand-primary'
              : 'border-2 bg-background-inverse-primary text-content-brand-secondary hover:bg-background-brand-primary/30'"
            :style="{ borderColor: selectedColor2.name === 'none'
              ? 'var(--color-lime-100)'
              : 'var(--color-sand-100)' }"
            @click="() => {removeColor2();}"
          >Nan</div>
          <div
            v-for="color in snakeColors"
            :key="color.name"
            class="w-10 h-10 rounded-full cursor-pointer transition-all"
            :class="color.name === selectedColor2.name
              ? 'border-4 bg-background-brand-primary '
              : 'border-2 bg-background-inverse-primary hover:bg-background-brand-primary/30'"
            :style="{ borderColor: color.name === selectedColor2.name ? 'var(--color-lime-100)' : 'var(--color-sand-100)', background: color.value }"
            @click="selectColor2(color)"

          ></div>
          <div
            class="w-10 h-10 rounded-full cursor-pointer border-2 flex items-center justify-center text-xl font-bold"
            :class="selectedColor2.name === 'custom2'
              ? 'border-4 bg-background-brand-primary'
              : 'bg-background-inverse-primary hover:bg-background-brand-primary/30'"
            :style="{ borderColor: selectedColor2.name === 'custom2' ? 'var(--color-lime-100)' : 'var(--color-sand-100)', background: customColor2 }"
            @click="() => { selectCustomColor2(); customColorInput2?.click(); }"
          >+</div>
          <input
            ref="customColorInput2"
            type="color"
            class="hidden"
            v-model="customColor2"
            @input="selectCustomColor2"
          />
        </div>
      </div>
    </div>

      <!-- Texture selection -->
      <div v-if="mode === 'texture' && showHeadSection" class="flex flex-col gap-2">
      <div v-if="showHeadSection" class="flex flex-col gap-2">
        <h3 class="text-xl text-content-brand-secondary">Textures</h3>
        <div class="flex flex-wrap justify-center gap-6">
          <img
            v-for="texture in textures"
            :key="texture.name"
            :src="texture.src"
            class="w-16 h-16 p-2 rounded-xl cursor-pointer transition-all"
            :class="texture.name === selectedTexture.name
              ? 'border-4 bg-background-brand-primary'
              : 'border-2 bg-background-inverse-primary hover:bg-background-brand-primary/30'"
            :style="{ borderColor: texture.name === selectedTexture.name ? 'var(--color-lime-100)' : 'var(--color-sand-100)' }"
            @click="selectTexture(texture)"
          />
        </div>
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
    <button
      class="mt-4 px-10 py-3 bg-background-brand-primary text-content-neutral-primary text-2xl font-semibold rounded-full hover:bg-background-inverse-tertiary hover:text-content-brand-primary hover:border-4 hover:border-background-brand-primary transition-all"
      @click="router.push(homeRoute.path)"
    >
      CANCEL
    </button>

  </div>
</template>
