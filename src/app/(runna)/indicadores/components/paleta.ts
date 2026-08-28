/**
 * Paleta categórica validada (8 tonos, orden fijo) de la skill de dataviz del
 * proyecto — pasa los chequeos de daltonismo (CVD Delta E) y de contraste en
 * el orden dado. Nunca se reordena ni se cicla por gráfico: el mismo índice
 * de categoría usa siempre el mismo color en toda la página.
 */
export const PALETA_CATEGORICA = [
  "#2a78d6", // 1 blue
  "#eb6834", // 2 orange
  "#1baf7a", // 3 aqua
  "#eda100", // 4 yellow
  "#e87ba4", // 5 magenta
  "#008300", // 6 green
  "#4a3aa7", // 7 violet
  "#e34948", // 8 red
] as const

export const colorPorIndice = (i: number): string => PALETA_CATEGORICA[i % PALETA_CATEGORICA.length]
