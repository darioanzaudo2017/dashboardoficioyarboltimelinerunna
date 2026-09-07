# Merge de `origin/main` en `refactor/modularizacion-2026-09`

**Fecha:** 2026-09-07
**Rama destino:** `refactor/modularizacion-2026-09`
**Rama integrada:** `origin/main` (tip `6268f09`)
**Merge-base:** `1bc5baa` (`chore: activar gates y corregir contratos TypeScript`)

## Objetivo

Integrar los 6 commits que el equipo pusheó a `main` mientras corría el refactor de
modularización, conservando **las dos cosas**: la estructura modular del refactor y el
comportamiento de los tres fixes reales.

De los 6 commits de `main`, 3 son `Update README.md` (sin impacto en código) y 3 son fixes:

| SHA | Fix |
|---|---|
| `40b4cac` | `fix(medida,evaluacion): desbloquear paso 2 de MPE y aclarar la solicitud del tecnico` |
| `faade05` | `fix(intervencion): sacar el campo "Categoria del informe" del formulario` |
| `7d85914` | `fix(intervencion): filtrar los submotivos por el motivo elegido` |

## Riesgo principal del merge

Los fixes tocan `intervencion-modal.tsx` (1673 líneas en `main`) y `useRegistroIntervencion.ts`
(1158 líneas en `main`), que en la rama de refactor son **fachadas** de 4 y 6 líneas: el contenido
vive en `intervencion-modal/` y `useRegistroIntervencion/`.

Resolver esos conflictos quedándose con el lado del refactor hace desaparecer los tres arreglos
**sin que falle ni el typecheck ni el build**. Por eso, además de los gates, se verificó cada fix
comportamiento por comportamiento contra el árbol resultante (sección "Verificación").

## Conflictos que aparecieron

`git merge origin/main` produjo **2 conflictos de contenido**, exactamente en los dos archivos
peligrosos. Los otros 3 archivos tocados por los fixes automergearon.

### 1. `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/shared/intervencion-modal.tsx`

- **Naturaleza:** conflicto de archivo completo. `HEAD` = fachada de 4 líneas; `origin/main` = el
  monolito de 1673 líneas con los fixes A, B y C aplicados adentro.
- **Resolución:** se conservó la fachada (`--ours`). El comportamiento de los tres fixes se
  verificó dentro de `intervencion-modal/` (ver "Verificación": A1, A2, B2, C1).

### 2. `src/app/(runna)/legajo/[id]/medida/[medidaId]/hooks/useRegistroIntervencion.ts`

- **Naturaleza:** conflicto de archivo completo. `HEAD` = fachada de 6 líneas; `origin/main` = el
  monolito de 1158 líneas con los fixes A y B aplicados adentro.
- **Resolución:** se conservó la fachada (`--ours`). El comportamiento se verificó dentro de
  `useRegistroIntervencion/` (ver "Verificación": A3, B3).

### Archivos que automergearon (verificados, no asumidos)

| Archivo | Resultado |
|---|---|
| `.../types/intervencion-api.ts` | **Idéntico byte a byte a `origin/main`.** Fixes A4 y B4 presentes literalmente. |
| `.../api/intervenciones-api-service.ts` | Difiere de `origin/main` **sólo** en la migración `console.*` → `logger.*` del refactor. Fix B1 presente. |
| `src/components/evaluacion/action-buttons.tsx` | Difiere de `origin/main` **sólo** en la migración `console.*` → `logger.*` del refactor. Fix A5 presente. |
| `README.md` | Tomado de `origin/main` (3 commits de documentación). |

La comprobación de "sólo difiere por logger" se hizo filtrando el diff contra `origin/main` y
descartando las líneas `console.`/`logger.`: el resto quedó vacío en ambos archivos.

## Dónde quedó cada fix

### Fix `40b4cac` — desbloquear paso 2 de MPE y aclarar la solicitud del técnico

| Sub-comportamiento | Archivo:línea |
|---|---|
| A1 · Filtrado de tipos de dispositivo por categoría de la medida, con fallback al listado completo | `intervencion-modal/IntervencionModal.tsx:155-159`, consumido en `:280` |
| A2 · `Dispositivo de resguardo` deja de ser obligatorio si el tipo no tiene subtipos + textos de ayuda | `intervencion-modal/steps/StepDetalles.tsx:54, 118, 124, 126, 140-143` |
| A3 · Validación: el subtipo sólo se exige si el tipo elegido tiene subtipos | `useRegistroIntervencion/validation/createFormValidation.ts:56-63` |
| A4 · `TipoDispositivo.categoria` / `categoria_display` | `types/intervencion-api.ts:41-42` |
| A5 · Hidratación de `tipoMedidaEvaluado`, MPJ deshabilitado y chip de solicitud del técnico | `src/components/evaluacion/action-buttons.tsx:122-123, 144-147, 480-488, 571-576, 700, 709` |

### Fix `faade05` — sacar el campo "Categoría del informe"

| Sub-comportamiento | Archivo:línea |
|---|---|
| B1 · `categoria_intervencion_id` opcional + guard en el `FormData` multipart | `api/intervenciones-api-service.ts:291` y `:334-336` |
| B2 · Selector eliminado del paso 3 (queda el comentario que explica por qué) | `intervencion-modal/steps/documentos/InformeObligatorioSection.tsx:113-116` |
| B2 · Navegación al paso del error simplificada (`setActiveStep(1)` incondicional) | `intervencion-modal/handlers/createIntervencionActions.ts:75` |
| B3 · Los tres payloads dejan de forzar con `!` y mandan `|| null` | `useRegistroIntervencion/actions/createSaveActions.ts:74, 163, 260` |
| B3 · Validación `"La categoría es obligatoria"` eliminada | ausente de todo `src/` (verificado por búsqueda) |
| B4 · Tipos con `categoria_intervencion_id?: number \| null` | `types/intervencion-api.ts:171` y `:235` |

### Fix `7d85914` — filtrar los submotivos por el motivo elegido

| Sub-comportamiento | Archivo:línea |
|---|---|
| C1 · `subMotivosDelMotivo` filtra por `motivo_id` y alimenta el desplegable | `intervencion-modal/IntervencionModal.tsx:147-149`, consumido en `:279` |

## Verificación fix por fix

Los gates no detectan un fix perdido, así que se verificó cada comportamiento de forma explícita
sobre el árbol resultante del merge.

### Presencia del comportamiento

- **A1** — `IntervencionModal.tsx:155-159` calcula `tiposDispositivoDeCategoria`
  (`tipo.categoria === tipoMedida`) con fallback a `tiposDispositivo`, y pasa el resultado al
  paso como `tiposDispositivo={tiposDispositivoVisibles}` (`:280`). Se confirmó además que
  `selectedTipoDispositivo` (`:161`) sigue buscando sobre la lista **sin filtrar**, igual que en
  `main`: si se filtrara ahí, un `tipo_dispositivo_id` guardado fuera de la categoría dejaría de
  resolver sus subtipos.
- **A2** — `StepDetalles.tsx` reproduce el bloque completo: `required={tieneSubtiposDisponibles}`
  (`:118`), `onChange` que admite `null` (`:124`), `disabled` con `|| !tieneSubtiposDisponibles`
  (`:126`) y las cuatro ramas de `FormHelperText` en el mismo orden que `main`, incluido
  `"Este tipo de dispositivo no tiene dispositivos de resguardo cargados - puede continuar"`.
- **A3** — `createFormValidation.ts:56-63` es idéntico en lógica al de `main`, y
  `tiposDispositivo` está correctamente inyectado en el validador vía `FormValidationParams`.
- **A4 / A5** — archivos idénticos a `origin/main` (A4 byte a byte; A5 salvo `logger`).
- **B1** — el único `formData.append('categoria_intervencion_id', ...)` del repo está en
  `intervenciones-api-service.ts:335`, **dentro** del guard `if (data.categoria_intervencion_id)`
  de `:334`. No queda ningún append sin guard.
- **B2** — no queda ningún `Select` de "Categoría del informe" en `src/`: la única aparición del
  texto es el comentario que documenta la remoción. `setActiveStep(1)` es incondicional.
- **B3** — las tres ocurrencias en `createSaveActions.ts` usan `|| null`.
- **C1** — `IntervencionModal.tsx:147-149` filtra y `:279` lo pasa al desplegable. Se verificó
  además que el hook modular expone `subMotivos: availableSubMotivos` con el mismo filtro previo
  y el mismo efecto de limpieza que `main`, de modo que el modal filtra sobre la misma entrada.

### Ausencia de las firmas de "fix perdido"

Búsqueda sobre todo `src/` de los literales que sólo existirían si se hubiera perdido un fix:

| Firma | Resultado |
|---|---|
| `"La categoría es obligatoria"` | ausente |
| `categoria_intervencion_id!` (non-null assertion) | ausente |
| `"Clasifica el documento para el repositorio y los reportes."` (helper del campo removido) | ausente |
| `formData.append('categoria_intervencion_id'` sin guard | ausente (única aparición está guardada) |

## Gates

| Gate | Resultado |
|---|---|
| `npm run typecheck` | exit **0** |
| `npm run build` | exit **0** (13/13 páginas generadas; sólo warnings preexistentes de ESLint `no-explicit-any`) |

## Observaciones (no se modificaron)

1. **Prop muerta `categorias`.** En `main`, el fix `faade05` sacó `categorias` del destructuring
   del modal. En la estructura modular la prop sigue existiendo:
   `IntervencionModal.tsx:75` la destructura y `:297` la pasa a `StepDocumentos`, que la declara
   en `StepDocumentos.tsx:17` pero **nunca la usa ni la reenvía** a las secciones hijas. Es código
   muerto, sin efecto sobre el comportamiento: el campo no se renderiza en ningún lado. No se tocó
   por estar fuera del alcance de este merge.

2. **El fix B llegó dividido en dos commits en la rama de refactor.** En `main`, `faade05`
   incluye el guard del multipart; en la rama de refactor ese guard vino aparte en
   `6034bf4 fix(intervencion): no mandar la categoria como "null" en el envio multipart`. El
   resultado final es equivalente.

## Estado del working tree

El árbol de trabajo tenía un cambio ajeno preexistente que **no se tocó ni se commiteó**:
` .env.local.template` (con espacio inicial) borrado + `.env.local.template` untracked. Ambos
quedaron fuera del commit de merge. Los 7 stashes preexistentes no se tocaron.
