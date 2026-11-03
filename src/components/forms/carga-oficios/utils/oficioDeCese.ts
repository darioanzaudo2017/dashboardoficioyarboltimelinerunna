/**
 * Las categorías de información judicial de cese empiezan con "CESE" (por ejemplo "CESE MEDIDAS TUTELARES PROVISORIAS",
 * "CESE DE CAUSA PENAL JUVENIL"). El catálogo no tiene un campo que lo indique, así que se reconoce por el nombre.
 */
export const esCategoriaDeCese = (nombre?: string | null): boolean => /^\s*CESE\b/i.test(nombre ?? "")

export const TITULO_OFICIO_DE_CESE = "Este oficio comunica un cese"

export const TEXTO_OFICIO_DE_CESE =
  "El cese lo dispone el juzgado: SENAF no lo aprueba ni lo visa, solo recibe la notificación. " +
  "En «Vínculos con Legajos y Medidas» elegí el legajo y la medida que cesa; al guardar el oficio, la medida elegida pasa a Cerrada."
