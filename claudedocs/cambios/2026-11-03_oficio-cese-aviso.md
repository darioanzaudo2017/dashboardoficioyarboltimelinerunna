# Oficio de cese: texto que explica qué pasa al guardarlo

**Rama:** `mejora-oficio-cese-aviso`  **Fecha:** 2026-11-03

## Problema
Al cargar un oficio de cese sobre una medida (por ejemplo "Cese/levantamiento de Art. 31 trámite de medida urgente"), **la medida pasa a Cerrada en el momento de guardar el oficio**, sin ningún visado ni aprobación.
Es lo correcto: el cese lo dispone el **juzgado** y SENAF solo recibe la notificación. Pero la pantalla no lo explica, y quien carga el oficio no sabe que (1) no hay una aprobación posterior y (2) tiene que elegir la medida que cesa en el vínculo.

## Qué cambió
Cuando la categoría de información elegida es de cese (su nombre empieza con "CESE"), el formulario de carga de oficios muestra un aviso debajo de la clasificación:

> **Este oficio comunica un cese.** El cese lo dispone el juzgado: SENAF no lo aprueba ni lo visa, solo recibe la notificación. En «Vínculos con Legajos y Medidas» elegí el legajo y la medida que cesa; al guardar el oficio, la medida elegida pasa a Cerrada.

Con una categoría de apertura o de actividades no aparece.

## Archivos
| Archivo | Qué hace |
|---|---|
| `src/components/forms/carga-oficios/utils/oficioDeCese.ts` | Reconoce las categorías de cese y guarda el texto |
| `src/components/forms/carga-oficios/CargaOficiosForm.tsx` | Muestra el aviso |
| `tests/unit/oficio-de-cese.test.ts` | 3 casos |

## Cómo probarlo
`/nuevoingreso` → "Carga de Oficios Penal Juvenil" → categoría **CESE MEDIDAS TUTELARES PROVISORIAS** (o cualquier otra de cese): aparece el aviso. Con **MEDIDA TUTELAR INICIAL**, no.

## Verificación
Tipos sin errores y tests en verde. Probado en el navegador (admin): sale con la categoría de cese y no con la de apertura. El comportamiento descrito (la medida se cierra al guardar) se comprobó con el oficio de la demanda #329 sobre `MED-2026-252`.

## Pendiente / notas
- **El catálogo no tiene un campo que diga que un tipo "cierra la medida"**: el aviso se basa en el nombre de la categoría ("CESE…"). Solo se comprobó el cierre con el tipo de Art. 31 (categoría "Cese medidas tutelares provisorias"); en otras categorías de cese (por ejemplo "Cese de período de probación", "Programa de justicia restaurativa") conviene confirmar con el back que también cierren la medida, y ajustar el texto si no.
- Ideal: que el back exponga ese dato en el tipo de oficio para no depender del nombre.
- Idea siguiente: en la pantalla de una medida cerrada, aclarar "Cesada por oficio judicial #N" (hoy solo dice "Cerrada desde la fecha").
