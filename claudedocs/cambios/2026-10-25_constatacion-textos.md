# Constatación: textos y nombres consistentes

**Rama:** `mejora-constatacion-textos`  **Fecha:** 2026-10-25

Primera de tres ramas que salen de revisar la etapa de **Constatación** de una demanda (Detalles, Enviar
Respuesta, Registrar Actividad y Conexiones). Esta rama toca solo **textos y nombres**: no cambia el
comportamiento de ninguna pantalla.

## Problema
- En el encabezado de una demanda ya existente, la pestaña "Detalles" decía "Complete todos los campos
  requeridos para **registrar una nueva demanda**", lo que confunde a quien está revisando un caso en curso.
- Los chips de estado y objetivo mostraban el valor crudo del backend: "CONSTATACION", "PROTECCION".
- El mismo estado se escribía distinto según la pantalla ("Constatación" en la Mesa de Entradas,
  "CONSTATACION" en el detalle). El mapa de nombres estaba copiado dentro de `StatusChip`.
- En "Enviar Respuesta" había idiomas mezclados: "Para (To)", y la tabla del historial decía
  "Rows per page", "1–1 of 1" y "No rows".
- En la Mesa de Entradas, la columna Objetivo mostraba "Proteccion" y "Peticion De Informe" (sin tildes),
  y el Excel exportado igual.

## Qué cambió
- Encabezado de Detalles de una demanda existente: **"Datos de la demanda"** — "Revisá y completá los datos de
  esta demanda. Los campos marcados con * son obligatorios." (al registrar una nueva se mantiene el texto de siempre).
- Chips del encabezado y estado en "Demandas Conectadas": **"Protección"**, **"Constatación"**.
- Un solo lugar con los nombres: `src/utils/demandaLabels.ts`. `StatusChip` lo usa y solo decide el color.
- "Para (To)" → **"Para"**; tabla del historial en español ("Filas por página", "1–1 de 1") y, si está vacía,
  "Todavía no se envió ninguna respuesta".
- Columna Objetivo de la Mesa de Entradas y Excel exportado, con tildes.

## Archivos
| Archivo | Qué hace |
|---|---|
| `src/utils/demandaLabels.ts` | Nombres de estado y objetivo con tildes; `formatEstadoDemanda`, `formatObjetivoDemanda` |
| `src/app/(runna)/mesadeentrada/ui/dataGrid/StatusChip.tsx` | Usa los nombres compartidos (colores sin cambios) |
| `src/app/(runna)/demanda/DemandaDetail.tsx` | Chips de objetivo y estado con nombre legible |
| `src/app/(runna)/demanda/ui/ConexionesDemandaTab.tsx` | Estado legible en demandas conectadas |
| `src/components/forms/Step1Form.tsx` | Encabezado distinto según sea demanda nueva o existente |
| `src/app/(runna)/demanda/ui/EnviarRespuestaModal.tsx` | "Para" y tabla en español (reutiliza `demandaGridLocaleText`) |
| `src/app/(runna)/mesadeentrada/ui/dataGrid/columns.tsx` | Columna Objetivo con tildes |
| `src/app/(runna)/mesadeentrada/ui/dataGrid/exportDemandas.ts` | Estado y objetivo con tildes en el Excel |
| `tests/unit/demanda-labels.test.ts` | Tests de los nombres |

## Cómo probarlo
1. Abrir una demanda en Constatación (`/demanda/<id>`): chips "Protección" y "Constatación"; pestaña Detalles con
   "Datos de la demanda".
2. Pestaña **Enviar Respuesta**: el campo se llama "Para"; el historial dice "Filas por página" y "1–1 de 1".
3. Pestaña **Conexiones**: la demanda conectada muestra "Estado: Constatación".
4. **Mesa de Entradas** (Vista completa): columna Objetivo con "Protección" / "Petición de Informe".

## Verificación
- 34 tests unitarios pasan (9 nuevos de nombres); sin errores de tipos en los archivos tocados.
- En el navegador (contra el backend real) se comprobó cada punto de la lista anterior y que los estados de
  la Mesa de Entradas siguen igual: Constatación, Sin Asignar, Evaluación, Archivada, Admitida, Informe Sin Enviar.

## Pendiente / notas
- La línea "Debug: Loading=…" de la pestaña Conexiones **no se tocó**: solo aparece en desarrollo
  (`NODE_ENV === 'development'`), no en producción.
- Siguen las ramas `mejora-constatacion-feedback` (avisos y confirmaciones) y `mejora-constatacion-evaluacion`
  (resumen y botón "Enviar a Evaluación"). La regla de si "Enviar a Evaluación" exige tener actividades
  registradas la define el cliente; no se cambia.
