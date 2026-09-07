# Limpieza de código muerto — 2026-09-07

**Rama:** `refactor/modularizacion-2026-09`
**Alcance:** los 57 candidatos de la heurística de basename (`fe_deadcode_candidates.txt`).
**Resultado:** 56 archivos eliminados (11.187 líneas por conteo de candidatos; 11.199 líneas según `git diff --stat`), 1 archivo conservado.

---

## 1. Metodología de verificación

La lista de partida venía de una heurística de basename, que es cruda y genera falsos
positivos. En lugar de confiar en ella, se verificó cada archivo con **dos métodos
independientes** que tenían que coincidir:

### 1.1 Grafo de imports con resolución real de módulos

Se construyó un grafo de dependencias sobre los 520 archivos de `src/`, `tests/` y
`stories/`, resolviendo cada especificador igual que lo hace el bundler:

- alias `@/*` → `./src/*` (según `tsconfig.json`),
- rutas relativas, resolución de extensiones (`.ts/.tsx/.js/.jsx/.mjs/.cjs`) y de `index.*`,
- las seis formas de referencia: `import ... from`, `import 'x'`, `export ... from`
  (incluye `export *` de barrels), `import('x')` dinámico, `require('x')` y
  `import(/* webpackChunkName */ 'x')`.

Sobre ese grafo se calculó **alcanzabilidad desde los puntos de entrada reales**, no sólo
"¿tiene algún importador?". Los entrypoints son los archivos especiales del App Router
(`page`, `layout`, `loading`, `error`, `not-found`, `route`, `template`, `default`,
`middleware`, `sitemap`, `robots`, etc.), todo `src/app/api/`, y `tests/` + `stories/`.

> Esto es más estricto que la heurística: un archivo importado **sólo por otro archivo
> muerto** también queda marcado como muerto.

### 1.2 Contraverificación textual independiente

Para cada candidato se hizo `grep` en **todo el repo, sin filtrar por extensión** (incluye
`.md`, `.json`, `.html`, configs) buscando:

- el basename sin extensión, y
- cada símbolo exportado del archivo (funciones, clases, consts, tipos, `export {}`).

Cada coincidencia se revisó a mano. Los dos métodos coincidieron en los 57 casos.

### 1.3 Riesgos descartados explícitamente

| Riesgo | Resultado |
|---|---|
| Imports dinámicos no literales (`import(\`...${x}\`)`, variables) | **0 en todo el repo.** Se buscó `import(` seguido de algo que no fuera comilla. |
| Registries / mapas de componentes por string | **Ninguno.** Las únicas coincidencias fuera de código son `tsconfig.tsbuildinfo` (caché incremental de TS, lista todos los archivos del proyecto) y un HTML de maqueta suelto. |
| Re-export desde barrels | Se revisaron los 13 `index.*` de `src/`. Ninguno referencia un candidato. |
| Alias de webpack personalizados | `next.config.mjs` sólo define `canvas: false` y `encoding: false`. No altera la resolución. |
| Referencias desde `tests/` o `stories/` | `stories/` es 100 % markdown/YAML (no hay código). Los 3 tests de `tests/unit/` no referencian ningún candidato. |
| Archivos especiales del App Router | Ninguno de los 56 eliminados lo es. El único con nombre de convención se conservó (ver §3). |

---

## 2. Archivos ELIMINADOS (56 archivos, 11.187 líneas)

Cuando la evidencia dice "sin importadores; 0 especificadores de import", significa que
el archivo no aparece en ningún `from '...'` / `import('...')` / `require('...')` del
repo, y que las coincidencias textuales de su nombre o de sus símbolos resultaron ser
comentarios, variables locales homónimas u otros archivos de nombre parecido.

### Tanda 1 — components/medida

| Archivo | Líneas | Evidencia |
|---|---:|---|
| `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/cierre-medida-modal.tsx` | 708 | Sin importadores en el grafo; 0 especificadores de import en todo el repo. |
| `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/adjuntar-nota-modal.tsx` | 604 | Sin importadores en el grafo; 0 especificadores de import en todo el repo. |
| `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/shared/workflow-section-configs.tsx` | 590 | Sin importadores en el grafo; 0 especificadores de import en todo el repo. |
| `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/shared/workflow-section.tsx` | 382 | Sin importadores en el grafo; 0 especificadores de import en todo el repo. |
| `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/agregar-informe-juridico-modal.tsx` | 312 | Sin importadores en el grafo; 0 especificadores de import en todo el repo. |
| `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/actividad/EvidenciasTab.tsx` | 249 | Sin importadores en el grafo; 0 especificadores de import en todo el repo. |
| `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/actividad/ComentariosTab.tsx` | 205 | Sin importadores en el grafo; 0 especificadores de import en todo el repo. |
| `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/formulario-documento-modal.tsx` | 195 | Sin importadores en el grafo; 0 especificadores de import en todo el repo. |
| `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/QuickFilterChips.tsx` | 190 | Sin importadores. `UnifiedActividadesTable.tsx:82` documenta explícitamente: "QuickFilterChips removed - now using AdvancedFiltersPanel". |
| `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/agregar-intervencion-modal.tsx` | 171 | Sin importadores en el grafo; 0 especificadores de import en todo el repo. |
| `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/shared/estado-badge.tsx` | 169 | Sin importadores en el grafo; 0 especificadores de import en todo el repo. |
| `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/carousel-stepper.tsx` | 147 | Sin importadores en el grafo; 0 especificadores de import en todo el repo. |
| `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/notificaciones-modal.tsx` | 143 | Sin importadores en el grafo; 0 especificadores de import en todo el repo. |
| `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/shared/NnyaSelectorMedida.tsx` | 141 | Sin importadores en el grafo; 0 especificadores de import en todo el repo. |
| `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/plan-accion-section.tsx` | 135 | Sin importadores en el grafo; 0 especificadores de import en todo el repo. |
| `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/shared/section-renderer.tsx` | 89 | Sin importadores en el grafo; 0 especificadores de import en todo el repo. |
| `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/ultimo-informe-section.tsx` | 64 | Sin importadores en el grafo; 0 especificadores de import en todo el repo. |
| `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/adjuntar-actas-modal.tsx` | 45 | Sin importadores en el grafo; 0 especificadores de import en todo el repo. |
| `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/adjuntar-dni-modal.tsx` | 44 | Sin importadores en el grafo; 0 especificadores de import en todo el repo. |

**Subtotal tanda 1: 19 archivos, 4583 líneas.** Gate `typecheck`: exit 0.

### Tanda 2 — legajo + dialogs

| Archivo | Líneas | Evidencia |
|---|---:|---|
| `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/dialogs/persona-detail-modal.tsx` | 1152 | Legacy. El único import vivo es `persona-detail-modal-enhanced` en `legajo-detail.tsx:31`. Las apariciones de `PersonaDetailModal` son `console.log` dentro del *enhanced*. |
| `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/legajo/intervenciones-section.tsx` | 449 | Sin importadores. `IntervencionesSection` sólo aparece en un comentario JSDoc de `useRegistroIntervencion.ts:34`. |
| `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/legajo/localizacion-section.tsx` | 319 | Par duplicado: ni esta ni la `-refactored` tienen importadores. Cero especificadores `localizacion-section` en el repo. |
| `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/legajo/localizacion-section-refactored.tsx` | 304 | Par duplicado: ni esta ni la original tienen importadores. Las coincidencias de `LocalizacionSection` son definiciones locales de cada archivo. |
| `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/legajo/medida-activa-card.tsx` | 241 | Sin importadores en el grafo; 0 especificadores de import en todo el repo. |
| `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/legajo/historial-medidas-section.tsx` | 203 | Sin importadores en el grafo; 0 especificadores de import en todo el repo. |
| `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/dialogs/add-task-dialog.tsx` | 123 | Sin importadores en el grafo; 0 especificadores de import en todo el repo. |
| `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/dialogs/add-intervencion-dialog.tsx` | 104 | Sin importadores en el grafo; 0 especificadores de import en todo el repo. |
| `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/dialogs/attachement-dialog.tsx` | 52 | Sin importadores en el grafo; 0 especificadores de import en todo el repo. |

**Subtotal tanda 2: 9 archivos, 2947 líneas.** Gate `typecheck`: exit 0.

### Tanda 3 — legajo-mesa / evaluación / mesa de entrada

| Archivo | Líneas | Evidencia |
|---|---:|---|
| `src/components/evaluacion/decision-box.tsx` | 344 | Sin importadores en el grafo; 0 especificadores de import en todo el repo. |
| `src/app/(runna)/nuevoingreso/components/LegalActividadesKanbanInline.tsx` | 316 | Sin importadores en el grafo; 0 especificadores de import en todo el repo. |
| `src/components/evaluacion/data/evaluacion-data.ts` | 292 | Los imports apuntan a `utils/evaluacion-data-mappers` (otro archivo). `evaluacionData` es una variable local en `evaluacion-content.tsx`. |
| `src/app/(runna)/legajo-mesa/components/calculated-fields-chip.tsx` | 229 | Sin importadores en el grafo; 0 especificadores de import en todo el repo. |
| `src/app/(runna)/legajo-mesa/components/oficios-progress-bars.tsx` | 226 | Sin importadores en el grafo; 0 especificadores de import en todo el repo. |
| `src/app/(runna)/legajo-mesa/components/filters/ResponsableFilter.tsx` | 226 | Sin importadores en el grafo; 0 especificadores de import en todo el repo. |
| `src/app/(runna)/legajo-mesa/components/filters/NumericFilter.tsx` | 193 | Sin importadores en el grafo; 0 especificadores de import en todo el repo. |
| `src/app/(runna)/legajo-mesa/components/filters/DateRangeFilter.tsx` | 191 | Sin importadores en el grafo; 0 especificadores de import en todo el repo. |
| `src/app/(runna)/mesadeentrada/ui/demanda-excel-export-utils.tsx` | 44 | `exportDemandasToExcel` se redefine de forma independiente en `legajo-mesa/ui/legajos-service.ts:209`. |
| `src/components/evaluacion/search-params-handler.tsx` | 24 | Sin importadores en el grafo; 0 especificadores de import en todo el repo. |

**Subtotal tanda 3: 10 archivos, 2085 líneas.** Gate `typecheck`: exit 0.

### Tanda 4 — components/forms

| Archivo | Líneas | Evidencia |
|---|---:|---|
| `src/components/forms/DynamicForm.tsx` | 183 | Sin importadores en el grafo; 0 especificadores de import en todo el repo. |
| `src/components/forms/carga-oficios/components/CodigosDemandaOficioSection.tsx` | 170 | Sin importadores en el grafo; 0 especificadores de import en todo el repo. |
| `src/components/forms/components/nnya/duplicate-alert-badge.tsx` | 152 | Sin importadores en el grafo; 0 especificadores de import en todo el repo. |
| `src/components/forms/RegistroLegajoModal.tsx` | 80 | Sin importadores en el grafo; 0 especificadores de import en todo el repo. |
| `src/components/forms/hooks/useExpandableSections.ts` | 69 | Sin importadores en el grafo; 0 especificadores de import en todo el repo. |
| `src/components/forms/DraftControls.tsx` | 59 | Sin importadores en el grafo; 0 especificadores de import en todo el repo. |
| `src/components/forms/hooks/useVinculacionSearch.ts` | 58 | Sin importadores en el grafo; 0 especificadores de import en todo el repo. |
| `src/components/forms/shared/EmptyStateWithAction.tsx` | 53 | Sin importadores en el grafo; 0 especificadores de import en todo el repo. |
| `src/components/forms/shared/DeleteConfirmationDialog.tsx` | 51 | Sin importadores en el grafo; 0 especificadores de import en todo el repo. |
| `src/components/forms/utils/avatar-helpers.ts` | 38 | `getInitials`/`getAvatarColor` están redefinidas localmente en KanbanCard, ResponsablesAvatarGroup, persona-detail-modal-enhanced y PersonasRelacionadasSection. Nadie las importa de aquí. |
| `src/components/forms/FormStepper.tsx` | 25 | Sin importadores en el grafo; 0 especificadores de import en todo el repo. |
| `src/components/forms/ApiCall.tsx` | 19 | Sin importadores en el grafo; 0 especificadores de import en todo el repo. |

**Subtotal tanda 4: 12 archivos, 957 líneas.** Gate `typecheck`: exit 0.

### Tanda 5 — tipos, constantes y layout

| Archivo | Líneas | Evidencia |
|---|---:|---|
| `src/app/(runna)/legajo/[id]/medida/[medidaId]/api/estado-etapa-api-service.ts` | 353 | `isEstadoApplicable` vive de forma independiente en `utils/estado-validation.ts:34`. |
| `src/app/(runna)/legajo/[id]/medida/[medidaId]/types/legajo.ts` | 73 | Los consumidores importan `legajo-mesa/types/legajo-api` (otro archivo). `Persona`/`MedidaActiva`/`Legajo` están redefinidas localmente en cada consumidor. |
| `src/app/(runna)/legajo/[id]/medida/[medidaId]/constants/institutos-mpj.ts` | 64 | Sin importadores en el grafo; 0 especificadores de import en todo el repo. |
| `src/components/Header.tsx` | 50 | Sin importadores. Las 47 coincidencias de `Header` son comentarios JSX `{/* Header */}`. |
| `src/app/(runna)/legajo/[id]/medida/[medidaId]/services/subtipoDispositivoService.ts` | 49 | `TSubtipoDispositivo` sólo aparece en comentarios de `intervencion-api.ts`. |
| `src/components/layoutComponents/UserAvatar.tsx` | 26 | Sin importadores en el grafo; 0 especificadores de import en todo el repo. |

**Subtotal tanda 5: 6 archivos, 615 líneas.** Gate `typecheck`: exit 0.

---

## 3. Archivos CONSERVADOS pese a la sospecha (1)

| Archivo | Líneas | Motivo concreto para conservarlo |
|---|---:|---|
| `src/app/(runna)/evaluacion/Loading.tsx` | 4 | **Colisión con la convención `loading` de Next.js en un filesystem case-insensitive.** Next.js 14 define `FILE_TYPES = { layout, template, error, loading }` en `next-app-loader` y resuelve cada convención pidiéndole al resolver de webpack la ruta `<dir>/loading`. En macOS (APFS case-insensitive, que es donde corre este repo) ese resolve **sí** encuentra `Loading.tsx` con L mayúscula, con lo cual el archivo probablemente **está actuando como la UI de carga de la ruta `/evaluacion`**. En Linux (CI/producción, case-sensitive) no lo haría. Borrarlo podría cambiar el comportamiento en local, y el `build` no distingue el caso. Ganancia: 4 líneas. Riesgo: cambio de comportamiento. Se conserva. |

### Hallazgo asociado que conviene decidir a mano

`Loading.tsx` con mayúscula es una **inconsistencia real entre local (macOS) y CI/producción
(Linux)**: en un entorno la ruta `/evaluacion` tiene UI de carga y en el otro no. No es
código muerto, es un bug latente de portabilidad. Las dos salidas sensatas son renombrarlo a
`loading.tsx` (si se quiere el estado de carga, que hoy devuelve `null`) o borrarlo
deliberadamente (si no se quiere). Queda fuera del alcance de esta limpieza porque no es una
eliminación de código muerto sino una decisión de producto.

---

## 4. Estado final de los gates

| Gate | Resultado |
|---|---|
| `npm run typecheck` (baseline, antes de tocar nada) | exit 0 |
| `npm run typecheck` tras cada una de las 5 tandas | exit 0 en las 5 (ninguna tanda necesitó revertirse) |
| `npm run build` final | **exit 0** |

El build final genera las 15 rutas esperadas: `/`, `/_not-found`, `/demanda/[id]`,
`/evaluacion`, `/indicadores`, `/legajo-mesa`, `/legajo/[id]`, `/legajo/[id]/arbol`,
`/legajo/[id]/medida/[medidaId]`, `/legajo/[id]/medida/[medidaId]/arbol`,
`/legajo/actividades`, `/login`, `/mesadeentrada`, `/nuevoingreso`, `/oficios`, más el
middleware. No se perdió ninguna ruta.

**Ningún archivo tuvo que restaurarse.** Las 5 tandas pasaron el gate a la primera.

---

## 5. Commits

| Commit | Contenido |
|---|---|
| `b2d0184` | 19 componentes huérfanos de medida (4.583 líneas) |
| `1c906cb` | 9 secciones y diálogos huérfanos de legajo (2.947 líneas) |
| `18501b1` | 10 componentes de legajo-mesa, evaluación y mesa de entrada (2.085 líneas) |
| `b85144e` | 12 archivos de `components/forms` (957 líneas) |
| `a6b97b2` | 6 módulos de tipos, constantes y layout (615 líneas) |

Cada commit incluye **sólo** las rutas borradas en su tanda (`git rm` con rutas explícitas,
nunca `git add -A`). El cambio ajeno pendiente en el working tree
(`" .env.local.template"` → `.env.local.template`, un renombrado que corrige un espacio
inicial) quedó **intacto y sin commitear**.

---

## 6. Segunda ola detectada (NO ejecutada — fuera de alcance)

El análisis de alcanzabilidad encontró **26 archivos adicionales (5.847 líneas)** que también
son código muerto pero que la heurística de basename **no podía detectar**: sí tienen
importadores, pero sólo entre ellos mismos. Son *clusters* cerrados que nada alcanza desde
un entrypoint.

Se verificó que ninguno tiene importadores externos (`grep` de especificadores fuera de su
propio directorio: 0 resultados en los tres clusters principales).

| Cluster | Archivos | Líneas |
|---|---:|---:|
| `src/components/legajo/persona-completa/**` (2 barrels + sección + 4 displays + tipos) | 8 | 1.958 |
| `medida/[medidaId]` workflow (`workflow-api-facade`, `unified-workflow-modal`, `useWorkflowData`, `permissions`, `section-configs`, `action-buttons`, `document-list`, `intervencion-actions`) | 8 | 2.636 |
| `src/utils/userPreferences/**` | 3 | 136 |
| Sueltos (`RegistroLegajoForm`, `DocumentUploadModal`, `SearchBar`, `mock-data/legajos-service`, los dos `indicadores-service`, `oficios/types`) | 7 | 1.117 |

Total: **26 archivos, 5.847 líneas.**

**No se borraron en esa pasada**: el encargo acotaba el alcance a los 57 candidatos, y una
segunda ola merece su propio ciclo de verificación y su propio gate.

> **Estado: EJECUTADA.** Ver §7.

---

## 7. Segunda ola — EJECUTADA

Ejecutada en un segundo ciclo con verificación propia e independiente: la lista de §6 **no
se tomó como dada**, se reconstruyó desde cero y luego se comparó. El resultado coincidió
exactamente en los 26 archivos.

### 7.1 Metodología (tres métodos que tenían que converger)

**Método 1 — grafo estricto de imports + alcanzabilidad.**
Se reconstruyó el grafo sobre los 469 archivos de código de `src/`, `tests/`, `stories/` y
los configs de la raíz, resolviendo especificadores como el bundler: alias `@/*` → `./src/*`,
rutas relativas, extensiones `.ts/.tsx/.js/.jsx/.mjs/.cjs/.json`, resolución de `index.*`,
`export * from` de barrels, `import()` dinámico (con comentarios mágicos de webpack),
`require()` y `vi.mock()/jest.mock()`.

Raíces usadas (32): archivos especiales del App Router bajo `src/app/` — `page`, `layout`,
`loading`, `error`, `route`, `not-found`, `template`, `default`, `global-error`, `sitemap`,
`robots`, `manifest`, `icon`, `opengraph-image`… — con **match case-insensitive** para
capturar `Loading.tsx`; todo lo que cuelga de `src/app/api/`; `src/middleware.ts`;
`tests/**` y `stories/**`; y los configs de raíz (`tailwind.config.ts`, `next.config.mjs`,
`vitest.config.mts`, `postcss.config.mjs`, `next-env.d.ts`).

Resultado: 443 alcanzables, **26 muertos, 5.873 líneas**.

**Método 2 — sobreaproximación máxima.**
Se rehízo el grafo tratando **cualquier literal de string** (comillas simples, dobles o
backticks) que empiece con `.` o `@/` como si fuera una dependencia, no sólo los que están
en posición de especificador de import. Es deliberadamente demasiado permisivo: si la ruta
de un candidato apareciera en *cualquier* string de un archivo vivo — un registry, un mapa
de rutas, una config — el archivo saldría vivo.

Resultado: **los mismos 26 archivos, sin diferencias.**

**Método 3 — resolución case-insensitive.**
Se repitió el método 2 indexando todas las rutas en minúsculas, para reproducir cómo
resuelve APFS en macOS. Es la trampa que ya había hecho falsa la sospecha sobre `Loading.tsx`.

Resultado: **los mismos 26 archivos.** Ni uno nuevo, ni uno rescatado.

**Método 4 — contraverificación textual.**
Se cargó el repo entero en memoria (586 archivos de texto, cualquier extensión: `.md`,
`.json`, `.yaml`, `.html`, configs; excluyendo `node_modules/`, `.next/`, `.git/`,
`tmp_test/`, `tsconfig.tsbuildinfo` y `package-lock.json`) y para cada candidato se buscó
su basename y **cada símbolo exportado** con límite de palabra. Cada coincidencia fuera del
propio cluster se revisó a mano.

### 7.2 Riesgos descartados y falsos positivos resueltos a mano

| Riesgo | Resultado |
|---|---|
| Imports dinámicos no literales | **0 en todo el repo.** Se buscó `import(` seguido de algo que no fuera comilla ni comentario mágico. |
| Registries por string | Cubierto por el método 2: ninguna ruta de candidato aparece en ningún literal de un archivo vivo. |
| Homónimos que parecen uso vivo | Tres casos, todos resueltos: ver abajo. |
| Colisión de mayúsculas tipo `Loading.tsx` | Cubierto por el método 3: 0 diferencias. |
| Alias de webpack | `next.config.mjs` sólo define `canvas: false` y `encoding: false`. |

**Homónimos que había que descartar uno por uno:**

- **`ActionButtons`**: `evaluacion-tabs.tsx:30` hace `import ActionButtons from "./action-buttons"`,
  pero ese specifier es relativo a `src/components/evaluacion/` y resuelve a
  `src/components/evaluacion/action-buttons.tsx`, que sigue vivo. El borrado es el homónimo
  de `medida/[medidaId]/components/medida/shared/`.
- **`legajos-service`**: `legajos-table.tsx:69` hace `import { exportLegajosToExcel } from "./legajos-service"`,
  relativo a `legajo-mesa/ui/` → resuelve a `legajo-mesa/ui/legajos-service.ts`, vivo. El
  borrado es `legajo-mesa/mock-data/legajos-service.ts`.
- **`SectionConfig`**: existe una definición viva e independiente en
  `medida/[medidaId]/types/workflow.ts:298`. Nadie importaba la del `section-configs.ts` borrado.
- **`SearchBar`**: las 8 coincidencias del basename son `LegajoSearchBar`, otro componente
  vivo. Con límite de palabra, `SearchBar` tiene 0 usos fuera del archivo borrado.
- **`updateLegajo`**: las coincidencias son `updateLegajoPrioridad` y `updateLegajoDatosPersonales`,
  ambos vivos en `legajo-mesa/api/legajos-api-service.ts`.

Todos los demás aciertos de basename y de símbolos exportados cayeron en `claudedocs/**.md`
y `stories/**` — documentación que describe el código borrado, no código que lo use.

### 7.3 Archivos eliminados (27 archivos, 6.371 líneas)

Conteo de líneas según `git diff --numstat bde04be..HEAD`.

#### Tanda 1 — cluster `persona-completa` (8 archivos, 1.958 líneas) · commit `a57c74d`

Cluster cerrado: `index.ts` y `display/index.ts` son barrels que reexportan la sección y los
cuatro displays; todos importan los tipos. Ninguna referencia externa a `persona-completa`
en `src/`, `tests/` ni `stories/`.

| Archivo | Líneas |
|---|---:|
| `src/components/legajo/persona-completa/PersonaCompletaSection.tsx` | 575 |
| `src/components/legajo/persona-completa/display/HealthDisplay.tsx` | 405 |
| `src/components/legajo/persona-completa/display/PersonalInfoDisplay.tsx` | 335 |
| `src/components/legajo/persona-completa/display/VulnerabilityDisplay.tsx` | 319 |
| `src/components/legajo/persona-completa/display/EducationDisplay.tsx` | 171 |
| `src/components/legajo/persona-completa/types/persona-completa.types.ts` | 122 |
| `src/components/legajo/persona-completa/index.ts` | 27 |
| `src/components/legajo/persona-completa/display/index.ts` | 4 |

#### Tanda 2 — cluster workflow de `medida/[medidaId]` (8 archivos, 2.636 líneas) · commit `50e03e7`

Implementación del "workflow unificado" que el `page.tsx` de la ruta nunca llegó a adoptar:
usa los componentes vigentes. La única arista interna es `section-configs.ts` → `document-list.tsx`;
los otros seis no tienen ningún importador.

| Archivo | Líneas |
|---|---:|
| `.../api/workflow-api-facade.ts` | 686 |
| `.../components/medida/shared/unified-workflow-modal.tsx` | 583 |
| `.../utils/permissions.ts` | 412 |
| `.../hooks/useWorkflowData.ts` | 282 |
| `.../components/medida/intervencion-actions.tsx` | 250 |
| `.../components/medida/shared/section-configs.ts` | 194 |
| `.../components/medida/shared/document-list.tsx` | 131 |
| `.../components/medida/shared/action-buttons.tsx` | 99 |

(prefijo `src/app/(runna)/legajo/[id]/medida/[medidaId]`)

#### Tanda 3 — cluster `utils/userPreferences` (3 archivos, 136 líneas) · commit `70edc6d`

`index.ts` reexporta hook y servicio; el hook importa el servicio. La cadena
`userPreferences` no aparece en ningún otro archivo del repo.

| Archivo | Líneas |
|---|---:|
| `src/utils/userPreferences/useUserPreferences.ts` | 80 |
| `src/utils/userPreferences/userPreferences.service.ts` | 50 |
| `src/utils/userPreferences/index.ts` | 6 |

#### Tanda 4 — sueltos + un fixture (8 archivos, 1.641 líneas) · commit `1286aca`

| Archivo | Líneas | Evidencia |
|---|---:|---|
| `src/components/forms/RegistroLegajoForm.tsx` | 533 | Sin importadores. `RegistroLegajoForm` sólo aparece en `stories/LEG-02_Creacion_Legajo.md`. |
| `src/app/(runna)/legajo-mesa/mock-data/legajos.json` | 522 | **Muerto por transitividad.** Su único referenciador era `mock-data/legajos-service.ts`, borrado en este mismo commit. |
| `src/components/shared/DocumentUploadModal.tsx` | 221 | Sin importadores; 0 coincidencias del basename en código. |
| `src/app/(runna)/legajo-mesa/mock-data/legajos-service.ts` | 146 | El `"./legajos-service"` vivo resuelve a `legajo-mesa/ui/`, otro archivo. |
| `src/components/evaluacion/api/indicadores-service.ts` | 98 | Sin importadores. Par duplicado con el de abajo; ninguno de los dos se usa. |
| `src/components/evaluacion/indicadores-service.ts` | 70 | Ídem. |
| `src/components/layoutComponents/SearchBar.tsx` | 35 | Las coincidencias son `LegajoSearchBar`, otro componente. |
| `src/app/(runna)/oficios/types.ts` | 15 | `DemandaAllItem`: **1 sola aparición en todo el repo**, su propia definición. |

> **Nota sobre `oficios/types.ts`:** de sus 15 líneas, 8 son un comentario que documenta el
> comportamiento del endpoint `GET /registro-demanda-form/` (ignora los query params y
> siempre devuelve el array completo sin paginar; es la única fuente donde vive el
> SAC/expediente/oficio web real). El *tipo* estaba muerto, pero **ese conocimiento no lo
> está**. Recuperable con `git show 1286aca^:'src/app/(runna)/oficios/types.ts'` si se
> quiere reubicar el comentario junto al código que consulta ese endpoint.

> **Nota sobre `legajos.json`:** es el único archivo eliminado que **no** estaba en la lista
> de 26 de §6, porque aquella sólo contemplaba archivos de código. Se incluyó por ser un
> huérfano transitivo demostrable: cero referencias una vez borrado su único consumidor.

### 7.4 Archivos CONSERVADOS

| Archivo | Motivo |
|---|---|
| `src/app/(runna)/evaluacion/Loading.tsx` | **No tocado, igual que en la primera ola.** En macOS (APFS case-insensitive) el resolver de Next lo encuentra al pedir `<dir>/loading`, así que probablemente está actuando como UI de carga de `/evaluacion`; en Linux no. Sigue siendo un bug latente de portabilidad, no código muerto, y sigue siendo una decisión de producto (renombrar a `loading.tsx` o borrar deliberadamente). Se trató como entrypoint en los tres métodos. |

**No hubo archivos dudosos.** Los tres métodos de grafo dieron exactamente el mismo conjunto
y la contraverificación textual no dejó ninguna coincidencia sin explicar, así que ningún
candidato quedó en zona gris. Ninguna tanda necesitó revertirse.

### 7.5 Estado final de los gates

| Gate | Resultado |
|---|---|
| `npm run typecheck` (baseline, antes de tocar nada) | exit 0 |
| `npm run build` (baseline) | exit 0 |
| `npm run typecheck` tras tanda 1 | exit 0 |
| `npm run typecheck` tras tanda 2 | exit 0 |
| `npm run typecheck` tras tanda 3 | exit 0 |
| `npm run typecheck` tras tanda 4 | exit 0 |
| `npm run build` final | **exit 0** |

El build final genera **las mismas 15 rutas** que antes de la limpieza (`/`, `/_not-found`,
`/demanda/[id]`, `/evaluacion`, `/indicadores`, `/legajo-mesa`, `/legajo/[id]`,
`/legajo/[id]/arbol`, `/legajo/[id]/medida/[medidaId]`, `/legajo/[id]/medida/[medidaId]/arbol`,
`/legajo/actividades`, `/login`, `/mesadeentrada`, `/nuevoingreso`, `/oficios`) más el
middleware. No se perdió ninguna ruta.

### 7.6 ¿Hay una tercera ola?

**No.** Reejecutado el grafo después de los borrados: **435 archivos en `src/`, 435
alcanzables, 0 muertos**. El grafo de imports del proyecto quedó cerrado — cada archivo de
`src/` se alcanza desde un entrypoint del App Router, `src/app/api/`, `middleware.ts` o
`tests/`. Las dos olas juntas eliminaron **83 archivos y 17.570 líneas**.

### 7.7 Commits de la segunda ola

| Commit | Contenido |
|---|---|
| `a57c74d` | Cluster `persona-completa` (8 archivos, 1.958 líneas) |
| `50e03e7` | Cluster workflow de `medida/[medidaId]` (8 archivos, 2.636 líneas) |
| `70edc6d` | Cluster `utils/userPreferences` (3 archivos, 136 líneas) |
| `1286aca` | 7 sueltos + fixture `legajos.json` (8 archivos, 1.641 líneas) |

Igual que en la primera ola, cada commit incluye **sólo** las rutas borradas de su tanda
(`git rm` con rutas explícitas, nunca `git add -A` ni `git add .`). El cambio ajeno
pendiente en el working tree (`" .env.local.template"` → `.env.local.template`) quedó
**intacto y sin commitear**.
