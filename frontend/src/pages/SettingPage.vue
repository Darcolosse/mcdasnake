<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { router } from '../router/router'
import { homeRoute } from '../router/routes'
import {snakeColors,snakeHeads,textures, graphicsLevels} from '../components/SettingsConfig'
import {SettingsAction} from "../components/SettingsAction"
import type { Graphism } from '../core/display/Design'
import type { SpriteName } from '../core/display/SpriteManager'


const customColorInput2 = ref<HTMLInputElement | null>(null);
const customColor2 = ref("#ffffff");
const customColorInput1 = ref<HTMLInputElement | null>(null);
const customColor1 = ref("#ffffff");


const settingManager = new SettingsAction();
const canvasRef = ref<HTMLCanvasElement | null>(null)
onMounted(() => {
  if (canvasRef.value){settingManager.setCanvas(canvasRef.value);}
})
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
            'bg-background-brand-primary text-content-neutral-primary border-background-brand-primary': settingManager.getElement('GRAPHISM') === level,
            'bg-background-inverse-primary text-content-brand-secondary hover:bg-background-brand-primary/30': settingManager.getElement('GRAPHISM') !== level
          }"
          @click="settingManager.selectGraphics(level as Graphism)"
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
        :class="settingManager.getMode() === 'color'
          ? 'bg-background-brand-primary text-content-neutral-primary border-background-brand-primary'
          : 'bg-background-inverse-primary text-content-brand-secondary hover:bg-background-brand-primary/30'"
        @click="settingManager.setMode('color')"
      >Colors</button>

      <button
        class="px-4 py-2 rounded-full border-2"
        :class="settingManager.getMode() === 'texture'
          ? 'bg-background-brand-primary text-content-neutral-primary border-background-brand-primary'
          : 'bg-background-inverse-primary text-content-brand-secondary hover:bg-background-brand-primary/30'"
        @click="settingManager.setMode('texture')"
      >Textures</button>
    </div>

    <div v-if="settingManager.getMode() === 'color'" class="flex flex-col gap-2">
        <!-- Color 1 selection -->
      <div class="flex flex-col gap-2">
        <h3 class="text-xl text-content-brand-secondary">Color 1</h3>
        <div class="flex flex-wrap justify-center gap-4">
          <div
            v-for="color in snakeColors"
            :key="'default1_'+color.value"
            class="w-10 h-10 rounded-full cursor-pointer transition-all"
            :class="'default1_'+color.value === settingManager.getElement('COLOR1')
              ? 'border-4 bg-background-brand-primary '
              : 'border-2 bg-background-inverse-primary hover:bg-background-brand-primary/30'"
            :style="{ borderColor: 'default1_'+color.value === settingManager.getElement('COLOR1') ? 'var(--color-lime-100)' : 'var(--color-sand-100)', background: color.value }"
            @click="settingManager.changeColor(1, color.value, false)"
          ></div>
          <div
            :key="'custom1_'"
            class="w-10 h-10 rounded-full cursor-pointer border-2 flex items-center justify-center text-xl font-bold"
            :class="'custom1_' === settingManager.getElement('COLOR1')
              ? 'border-4 bg-background-brand-primary'
              : 'bg-background-inverse-primary hover:bg-background-brand-primary/30'"
            :style="{ borderColor: settingManager.getElement('COLOR1') === 'custom1_' ? 'var(--color-lime-100)' : 'var(--color-sand-100)', background: settingManager.getValue('CUSTOMCOLOR1') }"
            @click="() => {
              customColorInput1?.click();
            }"
          >+</div>
          <input
            ref="customColorInput1"
            type="color"
            class="hidden"
            v-model="customColor1"
            @input="(e) => {
              const input = e.target as HTMLInputElement | null;
              if (input) settingManager.changeColor(1, input.value, true);
              }"
          />
        </div>
      </div>

        <!-- Color 2 selection -->
      <div v-if="settingManager.getMode() === 'color' && settingManager.getElement('GRAPHISM') !== 'VERY_LOW'" class="flex flex-col gap-2">
        <h3 class="text-xl text-content-brand-secondary">Color 2</h3>
        <div class="flex flex-wrap justify-center gap-4">
          <div
            :key="'noColor2_'"
            class="w-10 h-10 rounded-full cursor-pointer border-2 flex items-center justify-center text-xl font-bold"
            :class="settingManager.getElement('COLOR2') === 'noColor2_'
              ? 'border-4 bg-background-brand-primary text-content-neutral-primary border-background-brand-primary'
              : 'border-2 bg-background-inverse-primary text-content-brand-secondary hover:bg-background-brand-primary/30'"
            :style="{ borderColor: settingManager.getElement('COLOR2') === 'noColor2_'
              ? 'var(--color-lime-100)'
              : 'var(--color-sand-100)' }"
            @click="() => {settingManager.changeColor(2, '', true);}"
          >Nan</div>
          <div
            v-for="color in snakeColors"
            :key="'default2_'+color.value"
            class="w-10 h-10 rounded-full cursor-pointer transition-all"
            :class="'default2_'+color.value === settingManager.getElement('COLOR2')
              ? 'border-4 bg-background-brand-primary '
              : 'border-2 bg-background-inverse-primary hover:bg-background-brand-primary/30'"
            :style="{ borderColor: color.value === settingManager.getElement('COLOR2') ? 'var(--color-lime-100)' : 'var(--color-sand-100)', background: color.value }"
            @click="settingManager.changeColor(2, color.value, false)"

          ></div>
          <div
          :key="'custom2_'"
            class="w-10 h-10 rounded-full cursor-pointer border-2 flex items-center justify-center text-xl font-bold"
            :class="settingManager.getElement('COLOR2') === 'custom2_'
              ? 'border-4 bg-background-brand-primary'
              : 'bg-background-inverse-primary hover:bg-background-brand-primary/30'"
            :style="{ borderColor: settingManager.getElement('COLOR2') === 'custom2_' ? 'var(--color-lime-100)' : 'var(--color-sand-100)', background: settingManager.getValue('CUSTOMCOLOR2') }"
            @click="() => {
                customColorInput2?.click();
              }"
          >+</div>
          <input
            ref="customColorInput2"
            type="color"
            class="hidden"
            v-model="customColor2"
            @input="(e) => {
              const input = e.target as HTMLInputElement | null;
              if (input) settingManager.changeColor(2, input.value, true);
              }"
          />
        </div>
      </div>
    </div>

      <!-- Texture selection -->
      <div v-if="settingManager.getMode() === 'texture' && settingManager.isEnabled('HEAD')" class="flex flex-col gap-2">
      <div v-if="settingManager.isEnabled('TEXTURE')" class="flex flex-col gap-2">
        <h3 class="text-xl text-content-brand-secondary">Textures</h3>
        <div class="flex flex-wrap justify-center gap-6">
          <img
            v-for="texture in textures"
            :key="texture.name"
            :src="texture.src"
            class="w-16 h-16 p-2 rounded-xl cursor-pointer transition-all"
            :class="texture.name === settingManager.getElement('TEXTURE')
              ? 'border-4 bg-background-brand-primary'
              : 'border-2 bg-background-inverse-primary hover:bg-background-brand-primary/30'"
            :style="{ borderColor: texture.name === settingManager.getElement('TEXTURE') ? 'var(--color-lime-100)' : 'var(--color-sand-100)' }"
            @click="settingManager.selectTexture(texture.name as SpriteName)"
          />
        </div>
      </div>
      </div>

      <!-- Head selection -->
      <div v-if="settingManager.isEnabled('HEAD')" class="flex flex-col gap-2">
        <h3 class="text-xl text-content-brand-secondary">Head</h3>
        <div class="flex flex-wrap justify-center gap-6">
          <img
            v-for="head in snakeHeads"
            :key="head.name"
            :src="head.src"
            class="w-16 h-16 p-2 rounded-xl cursor-pointer transition-all"
            :class="head.name === settingManager.getElement('HEAD')
              ? 'border-4 bg-background-brand-primary'
              : 'border-2 bg-background-inverse-primary hover:bg-background-brand-primary/30'"
            :style="{ borderColor: head.name === settingManager.getElement('HEAD') ? 'var(--color-lime-100)' : 'var(--color-sand-100)' }"
            @click="settingManager.selectHead(head.name as SpriteName)"
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
      @click="() => {settingManager.applyChanges(); router.push(homeRoute.path);}"
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
