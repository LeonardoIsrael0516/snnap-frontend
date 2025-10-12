// Gerador de gradientes aleatórios para biolinks
export interface GradientConfig {
  type: 'linear' | 'radial' | 'conic';
  direction: string;
  fromColor: string;
  toColor: string;
  middleColor?: string;
}

// Paletas de cores bonitas e modernas
const colorPalettes = [
  // Gradientes suaves e elegantes
  ['#667eea', '#764ba2'], // Roxo suave
  ['#f093fb', '#f5576c'], // Rosa vibrante
  ['#4facfe', '#00f2fe'], // Azul ciano
  ['#43e97b', '#38f9d7'], // Verde água
  ['#fa709a', '#fee140'], // Rosa amarelo
  ['#a8edea', '#fed6e3'], // Pastel suave
  ['#ff9a9e', '#fecfef'], // Rosa pastel
  ['#ffecd2', '#fcb69f'], // Laranja suave
  ['#a18cd1', '#fbc2eb'], // Roxo pastel
  ['#ffd89b', '#19547b'], // Dourado azul
  
  // Gradientes vibrantes
  ['#ff6b6b', '#ee5a24'], // Vermelho laranja
  ['#4834d4', '#686de0'], // Roxo vibrante
  ['#00d2ff', '#3a7bd5'], // Azul vibrante
  ['#11998e', '#38ef7d'], // Verde vibrante
  ['#fc4a1a', '#f7b733'], // Laranja vibrante
  ['#667db6', '#0082c8'], // Azul profundo
  ['#f12711', '#f5af19'], // Vermelho dourado
  ['#8360c3', '#2ebf91'], // Roxo verde
  ['#ff416c', '#ff4b2b'], // Rosa vermelho
  ['#667eea', '#764ba2'], // Roxo clássico
  
  // Gradientes modernos
  ['#ff9a56', '#ff6b95'], // Laranja rosa
  ['#a8c0ff', '#3f2b96'], // Azul roxo
  ['#ffecd2', '#fcb69f'], // Bege laranja
  ['#ff8a80', '#ea6100'], // Rosa laranja
  ['#84fab0', '#8fd3f4'], // Verde azul
  ['#ff9a9e', '#fad0c4'], // Rosa suave
  ['#a1c4fd', '#c2e9fb'], // Azul claro
  ['#ffecd2', '#fcb69f'], // Bege quente
  ['#ff8a80', '#ff80ab'], // Rosa vibrante
  ['#84fab0', '#8fd3f4'], // Verde água
];

// Direções para gradientes lineares
const linearDirections = [
  'to right',
  'to left', 
  'to bottom',
  'to top',
  '45deg',
  '135deg',
  '225deg',
  '315deg'
];

// Direções para gradientes radiais
const radialDirections = [
  'circle at center',
  'ellipse at center',
  'circle at top',
  'circle at bottom',
  'circle at left',
  'circle at right'
];

// Direções para gradientes cônicos
const conicDirections = [
  'from 0deg',
  'from 90deg',
  'from 180deg',
  'from 270deg',
  'from 45deg',
  'from 135deg'
];

// Função para gerar cor intermediária
function generateMiddleColor(color1: string, color2: string): string {
  // Converter hex para RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // Converter RGB para hex
  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return color1;

  // Gerar cor intermediária
  const middleRgb = {
    r: Math.round((rgb1.r + rgb2.r) / 2),
    g: Math.round((rgb1.g + rgb2.g) / 2),
    b: Math.round((rgb1.b + rgb2.b) / 2)
  };

  return rgbToHex(middleRgb.r, middleRgb.g, middleRgb.b);
}

// Função principal para gerar gradiente aleatório
export function generateRandomGradient(): GradientConfig {
  // Escolher paleta aleatória
  const palette = colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
  const [fromColor, toColor] = palette;

  // Decidir se vai ter cor intermediária (30% de chance)
  const hasMiddleColor = Math.random() < 0.3;
  const middleColor = hasMiddleColor ? generateMiddleColor(fromColor, toColor) : undefined;

  // Escolher tipo de gradiente (70% linear, 20% radial, 10% cônico)
  const gradientType = Math.random() < 0.7 ? 'linear' : 
                      Math.random() < 0.9 ? 'radial' : 'conic';

  // Escolher direção baseada no tipo
  let direction: string;
  switch (gradientType) {
    case 'linear':
      direction = linearDirections[Math.floor(Math.random() * linearDirections.length)];
      break;
    case 'radial':
      direction = radialDirections[Math.floor(Math.random() * radialDirections.length)];
      break;
    case 'conic':
      direction = conicDirections[Math.floor(Math.random() * conicDirections.length)];
      break;
    default:
      direction = 'to right';
  }

  return {
    type: gradientType,
    direction,
    fromColor,
    toColor,
    middleColor
  };
}

// Função para gerar gradiente baseado em uma cor específica
export function generateGradientFromColor(baseColor: string): GradientConfig {
  // Gerar cor complementar ou análoga
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  const rgb = hexToRgb(baseColor);
  if (!rgb) return generateRandomGradient();

  // Gerar cor complementar (inverter RGB)
  const complementRgb = {
    r: 255 - rgb.r,
    g: 255 - rgb.g,
    b: 255 - rgb.b
  };

  const toColor = rgbToHex(complementRgb.r, complementRgb.g, complementRgb.b);
  const middleColor = generateMiddleColor(baseColor, toColor);

  return {
    type: 'linear',
    direction: 'to right',
    fromColor: baseColor,
    toColor,
    middleColor
  };
}

// Função para gerar gradiente com tema específico
export function generateThemedGradient(theme: 'warm' | 'cool' | 'neutral' | 'vibrant'): GradientConfig {
  const themedPalettes = {
    warm: [
      ['#ff9a9e', '#fecfef'],
      ['#ffecd2', '#fcb69f'],
      ['#fa709a', '#fee140'],
      ['#ff6b6b', '#ee5a24'],
      ['#fc4a1a', '#f7b733']
    ],
    cool: [
      ['#4facfe', '#00f2fe'],
      ['#43e97b', '#38f9d7'],
      ['#a8edea', '#fed6e3'],
      ['#667eea', '#764ba2'],
      ['#4834d4', '#686de0']
    ],
    neutral: [
      ['#f093fb', '#f5576c'],
      ['#a18cd1', '#fbc2eb'],
      ['#ffd89b', '#19547b'],
      ['#667db6', '#0082c8'],
      ['#8360c3', '#2ebf91']
    ],
    vibrant: [
      ['#ff416c', '#ff4b2b'],
      ['#ff9a56', '#ff6b95'],
      ['#a8c0ff', '#3f2b96'],
      ['#ff8a80', '#ea6100'],
      ['#84fab0', '#8fd3f4']
    ]
  };

  const palette = themedPalettes[theme][Math.floor(Math.random() * themedPalettes[theme].length)];
  const [fromColor, toColor] = palette;
  const middleColor = generateMiddleColor(fromColor, toColor);

  return {
    type: 'linear',
    direction: linearDirections[Math.floor(Math.random() * linearDirections.length)],
    fromColor,
    toColor,
    middleColor
  };
}

