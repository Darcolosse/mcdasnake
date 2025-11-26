export interface snakeColorsInterface {
  name:string,
  value:string
}

export interface snakeHeadsInterface {
  name:string,
  src:string
}

export const snakeColors = [
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

export const snakeHeads = [
  { name: 'HEAD_CLASSIC', src: '/src/core/display/sprite/head3.svg' },
  { name: 'HEAD_BETA', src: '/src/core/display/sprite/head.png' },
  { name: 'HEAD_HUGOAT', src: '/src/core/display/sprite/head_hugoat.jpg' },
  { name: 'HEAD_DARCO', src: '/src/core/display/sprite/head_darco.jpg' },
  { name: 'HEAD_MCDALA', src: '/src/core/display/sprite/head_mcdala.jpg' },
]

export const textures = [
  { name: 'SCALE', src: '/src/core/display/sprite/scale.jpg' },
  { name: 'SCALE2', src: '/src/core/display/sprite/scale2.jpg' },
]

export const graphicsLevels = ["VERY_LOW", "LOW", "NORMAL", "MULTI"];