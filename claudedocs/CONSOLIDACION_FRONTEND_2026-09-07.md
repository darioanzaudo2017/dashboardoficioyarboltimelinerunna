# Consolidación de duplicados y descomposición de tabs — 2026-09-07

Rama: `refactor/modularizacion-2026-09`

Continuación de `MODULARIZACION_TABLAS_2026-09-07.md` y
`MODULARIZACION_MODALES_2026-09-07.md`, con las mismas convenciones: carpeta
hermana por componente, fachada delgada en la ruta original, hooks por
responsabilidad y `sections/` / `parts/` / `steps/` para subcomponentes.

Baseline verificado antes de empezar (`d663bea`): `npm run typecheck` exit 0 y
`npm run build` exit 0.

## Resumen

| # | Commit | Qué |
|---|---|---|
| 1 | `a358e6e` | Consolidar `extractUserName` (2 de 3) e `isAllowedExtension` |
| 2 | `4216b11` | Descomponer `seguimiento-dispositivo-tab` (1079 → 2) |
| 3 | `afefe91` | Unificar `ERROR_MESSAGES` de configuración MPJ/MPE |
| 4 | `3d5d2da` | Descomponer `residencias-tab` (1043 → 2) |
| 5 | `a0bb736` | Descomponer `unified-workflow-tab` (1010 → 2) |
| 6 | `08ac463` | Descomponer `AdvancedFiltersPanel` (862 → 2) |

Todos los commits con `npm run typecheck` exit 0 y `npm run build` exit 0 antes
de commitear, agregando sólo las rutas involucradas.

---

# BLOQUE A — Consolidación de duplicados

## A1. `extractUserName` (3 definiciones) → se consolidan 2

### El dato que cambia la decisión

El enunciado partía de que las tres variantes diferían en el manejo de la
**cadena vacía**. **Eso no es así**: las tres arrancan con una guarda `if (!value)`
que ya captura `""`, así que para toda entrada `string | null | undefined` las
tres devuelven exactamente lo mismo. En `nota-aval-api.ts` el `value || 'Usuario
desconocido'` de la segunda línea es **código muerto**: en ese punto `value` ya
es un string no vacío.

Se verificó ejecutando las tres implementaciones sobre una matriz de entradas:

| entrada | nota-aval | informe-juridico | ratificación | nota==inf | nota==rat |
|---|---|---|---|:---:|:---:|
| `undefined` | `"Usuario desconocido"` | `"Usuario desconocido"` | `"Usuario desconocido"` | sí | sí |
| `null` | `"Usuario desconocido"` | `"Usuario desconocido"` | `"Usuario desconocido"` | sí | sí |
| `""` | `"Usuario desconocido"` | `"Usuario desconocido"` | `"Usuario desconocido"` | sí | sí |
| `"  "` | `"  "` | `"  "` | `"  "` | sí | sí |
| `"Juan Perez"` | `"Juan Perez"` | `"Juan Perez"` | `"Juan Perez"` | sí | sí |
| `obj(nc="Juan", un="jp")` | `"Juan"` | `"Juan"` | *(no aplica)* | sí | — |
| `obj(nc="", un="jp")` | `"jp"` | `"Usuario desconocido"` | *(no aplica)* | **NO** | — |
| `obj(nc="  ", un="jp")` | `"jp"` | `"  "` | *(no aplica)* | **NO** | — |
| `obj(nc="", un=undefined)` | `"Usuario desconocido"` | `"Usuario desconocido"` | *(no aplica)* | sí | — |
| `obj(nc="  ", un="  ")` | `"Usuario desconocido"` | `"  "` | *(no aplica)* | **NO** | — |
| `obj(nc="Juan", un=undefined)` | `"Juan"` | `"Juan"` | *(no aplica)* | sí | — |

### ✅ Consolidadas: `nota-aval-api.ts` + `ratificacion-judicial-api.ts`

Nueva canónica en `types/user-name.ts`, con el cuerpo **textual** de la variante
de `nota-aval-api.ts` (la del superconjunto) y un tipo de parámetro
`UserNameSource { nombre_completo: string; username?: string }`.

Por qué es seguro:

- `DirectorInfo` y `EquipoLegalInfo` son **estructuralmente idénticos**
  (`id`, `nombre_completo`, `username?`, `email?`, `nivel?`), así que
  `DirectorInfo` es asignable a `UserNameSource`.
- La variante de `ratificacion-judicial-api.ts` aceptaba **sólo `string | undefined`**,
  y para todo ese dominio la canónica devuelve exactamente lo mismo (filas 1-5 de
  la tabla). Sus dos call sites pasan strings:
  - `adjuntos-ratificacion.tsx:283` → `extractUserName(String(adjunto.usuario_carga))`
  - `ratificacion-judicial-section.tsx:336` → `extractUserName(ratificacion.usuario_registro_nombre)` (campo `string`)
- Ampliar el tipo del parámetro (de `string | undefined` a
  `string | UserNameSource | undefined | null`) sólo habilita más llamadas; nunca
  invalida una existente.

Ambos módulos **re-exportan** la canónica, así que ningún import cambió.

### ❌ NO consolidada: `informe-juridico-api.ts`

Su rama de objeto omite el fallback a `username` y el chequeo de `trim()`:

```ts
return value.nombre_completo || 'Usuario desconocido'
```

Difiere de forma observable en tres de las once filas de la tabla, todas cuando
`nombre_completo` llega vacío o en blanco. **Es un caso alcanzable**: el
`get_full_name()` de Django devuelve `""` cuando el usuario no tiene nombre ni
apellido cargados, y `EquipoLegalInfo.nombre_completo` viene del backend.

Unificarla cambiaría lo que se muestra en:

- `informe-juridico-section.tsx:394` y `:526` (`elaborado_por_detalle`)
- `adjuntos-informe-juridico.tsx:447` (`subido_por_detalle`)
- `arbol/documento-cards.tsx:255` (`extractLegalName`)

Concretamente: hoy esos puntos muestran `"Usuario desconocido"` y con la
canónica pasarían a mostrar el `username`. Es probablemente *mejor*, pero es un
cambio de comportamiento, así que queda como está con un comentario en el sitio
que explica por qué no se unificó.

## A2. `isAllowedExtension` (2 definiciones) → consolidada

- `medida/[medidaId]/utils/file-validation.ts` — lista hardcodeada.
- `src/utils/fileUtils.ts` — parametrizada por `allowedExtensions`.

**Las dos hacían exactamente la misma computación**: la primera ya importaba
`getFileExtension` de `@/utils/fileUtils` (como `getExtension`), así que ambas
resolvían la extensión con la misma función y la buscaban en una lista. La
versión local ahora delega:

```ts
export const isAllowedExtension = (filename: string): boolean =>
  isExtensionIn(filename, ALLOWED_EXTENSIONS)
```

`ALLOWED_EXTENSIONS` (`["pdf","doc","docx","jpg","jpeg","png"]`) no se tocó: se
sigue exportando con el mismo tipo `string[]` porque `validateFile` y
`getAcceptAttribute` la usan con `.join()` y `.map()`.

**Nota honesta**: la condición "preservar la lista de cada call site" se cumple
de forma trivial porque **ninguna de las dos tenía call sites**. El único
importador de `file-validation` es `informe-cierre-modal.tsx`, que importa sólo
`validateFile` y `getAcceptAttribute`; y `fileUtils.isAllowedExtension` sólo
aparece en su propio JSDoc. Las dos eran código muerto, y por eso la
consolidación es de riesgo cero pero también de valor práctico bajo.

## A3. Auditoría de los otros 13 nombres → se consolida 1, se descartan 10, 2 no existen

### ✅ Consolidado: `ERROR_MESSAGES` de configuración MPJ/MPE

`configuracion-mpj-section.tsx:131` y `configuracion-mpe-section.tsx:131`
declaraban el mismo objeto de siete claves, **byte a byte idéntico salvo un
valor** (`'Esta medida no es de tipo MPJ'` / `'...MPE'`). Mismo dominio, mismos
códigos de error del mismo endpoint, mismo uso (`ERROR_MESSAGES[errorCode]`).

Se parametrizó en `components/medida/shared/configuracion-error-messages.ts`:

```ts
export const buildConfiguracionErrorMessages = (tipoMedida: 'MPJ' | 'MPE'): Record<string, string> => ({ ... })
```

Verificado con un test de igualdad: la factory reproduce los dos objetos
originales con **las mismas claves, en el mismo orden y con los mismos valores**.

### ❌ Descartes (con el motivo concreto de cada uno)

| Nombre | Defs | Motivo del descarte |
|---|---:|---|
| `uploadAdjunto` | 4 | Endpoints distintos (`intervenciones/{id}/adjuntos/` vs `informes-seguimiento/{id}/adjuntos/`), parámetros distintos (`tipo` vs `descripcion`), tipos de retorno distintos (`AdjuntoIntervencion` vs `InformeSeguimientoAdjunto`) y mecanismos distintos (`axiosInstance.post` vs `create()`). La de `ratificacion-judicial-api-service` es un placeholder que **lanza**; la de `useInformeJuridico` es un `useCallback` dentro de un hook. Homónimos de dominios distintos. |
| `getAdjuntos` | 2 | Endpoints distintos (`adjuntos-list/` con query `tipo` vs `adjuntos/`) y tipos de retorno distintos. `documento-cards.tsx` ya importa las dos en el mismo archivo y tuvo que aliasar una. |
| `deleteAdjunto` | 5 | Mismo caso: recursos distintos. Dos de las cinco son `useCallback` locales de hooks; una es un placeholder que lanza. |
| `fetchCaseData` | 2 | **Casi idénticas** (misma firma, mismo endpoint `registro-demanda-form/${id}/`, mismos logs), pero **cada una llama a un `transformApiDataToFormData` distinto** en su propio módulo, y esos transforms no son intercambiables (ver fila siguiente). Unificar `fetchCaseData` obligaría a unificar antes el transform. |
| `transformApiDataToFormData` | 2 | Conjuntos de campos genuinamente distintos. `apiToFormData.ts` (218 líneas) tiene `apellido`, `dni_oficio`, `user_responsable_id`, `vinculos` y todo el bloque CARGA_OFICIOS (`tipo_oficio`, `numero_expediente`, `caratula`, `plazo_dias`, `circunscripcion_judicial`, …) que `fetch-case-data.tsx` (158 líneas) **no tiene**; y este último mapea `cobertura_medica.institucion_sanitaria` como `.id` + un `institucion_sanitaria_nombre` extra, mientras el otro guarda el objeto entero. Ver B4 en "Bugs detectados". |
| `fetchPersonaLocalizacion` | 2 | Tipos de retorno distintos: `LocalizacionPersona \| null` vs `{ localizacion, principal } \| null`. Además la de `localizacion-api-service.ts` **no tiene ningún call site** (el único importador de ese módulo usa sólo `buildFullAddress`). |
| `TIPO_ADJUNTO_LABELS` | 2 | **Conjuntos de claves disjuntos**: `RESOLUCION_JUDICIAL/CEDULA_NOTIFICACION/ACUSE_RECIBO/OTRO` vs `INFORME/ACUSE`. Dominios distintos. |
| `OBJETIVO_LABELS` | 2 | Mismas tres claves pero **valores distintos**: `"Protección"` / `"Petición de Informe"` (con tilde, en `oficios/lib/buscar-oficios.ts`) vs `"Proteccion"` / `"Peticion de Informe"` (sin tilde, en `nuevoingreso/types/demanda-response.ts`). Unificar obliga a elegir uno y **cambia texto visible** en una de las dos pantallas. Ver B5. |
| `ERROR_MESSAGES` (los otros 2) | 2 | `utils/constants/duplicateDetection.ts` y `forms/constants/duplicate-thresholds.ts` tienen **claves completamente disjuntas** (`INVALID_SEARCH/SEARCH_FAILED/…` vs `DATOS_INSUFICIENTES/TIMEOUT/NETWORK_ERROR/…`). Ninguno de los dos tiene consumidores efectivos. |
| `SectionCard` | 2 | **Superficies de props disjuntas**. `components/medida/section-card.tsx` exige `icon` y ofrece `isActive/isCompleted/elevation` (5 importadores); `components/medida/shared/section-card.tsx` no tiene `icon` y ofrece `chips/date/additionalInfo/showMessageButton/onMessageClick/showCheckIcon/headerActions/highlight` (15 importadores). Son dos componentes distintos que comparten nombre. |
| `HistorialTab` | 2 | Props disjuntas (`medidaId/numeroMedida` vs `actividadId/onGetHistorial/loading`) y dominios distintos (historial de **medida** vs historial de **actividad**). |
| `getIndicadores` | 0 | **No existe** en `src/`. Lo más cercano es `getMedidasAll` en `indicadores/api/indicadores-api-service.ts`. |
| `createEvaluaciones` | 0 | **No existe** en `src/`. |

---

# BLOQUE B — Descomposición de tabs

## 1. `mpj-tabs/seguimiento-dispositivo-tab.tsx` — 1079 → 2

| Módulo | Líneas |
|---|---:|
| `seguimiento-dispositivo-tab/sections/CambioLugarResguardoSection.tsx` | 392 |
| `seguimiento-dispositivo-tab/sections/NotasSeguimientoSection.tsx` | 319 |
| `seguimiento-dispositivo-tab/sections/SituacionInstitutoSection.tsx` | 225 |
| `seguimiento-dispositivo-tab/SeguimientoDispositivoMPJ.tsx` | 112 |
| `seguimiento-dispositivo-tab/utils.ts` | 27 |
| `seguimiento-dispositivo-tab/types.ts` | 6 |

`mpj-header.tsx` sigue importando `{ SeguimientoDispositivoMPJ }` de la misma ruta.

**Única desviación del movimiento literal**: `formatDate` y `formatDateTime`
estaban definidos **tres veces**, uno dentro de cada sección, con cuerpos
verificados byte a byte idénticos (`diff` sin diferencias). Se extrajeron una
sola vez a `utils.ts` en lugar de triplicarlos en los módulos nuevos.

No se arrastraron cinco imports muertos que ESLint ya reportaba: `InputLabel`,
`Select`, `MenuItem`, `Checkbox`, `AddIcon`.

## 2. `mpe-tabs/residencias-tab.tsx` — 1043 → 2

| Módulo | Líneas |
|---|---:|
| `residencias-tab/sections/CambioLugarResguardoSection.tsx` | 423 |
| `residencias-tab/sections/NotasSeguimientoSection.tsx` | 326 |
| `residencias-tab/sections/SituacionResidenciaSection.tsx` | 220 |
| `residencias-tab/ResidenciasTab.tsx` | 114 |
| `residencias-tab/types.ts` | 7 |

Movimiento puro: este archivo no tenía imports muertos ni helpers duplicados (ya
usaba `formatDateLocaleAR` / `formatDateTimeLocaleAR` de `@/utils/dateUtils`).

**No se unificaron** `CambioLugarResguardoSection` ni `NotasSeguimientoSection`
con las homónimas de `mpj-tabs`, pese al comentario `// shared between MPE and
MPJ` que llevan ambas. Son **forks divergentes**: 151 y 113 líneas de `diff`
respectivamente. Las de MPE agregan flags de cancelación (`let cancelled = false`
con cleanup) y estados de error (`localesError`, `cambiosError`) que las de MPJ
no tienen. Ver B2 en "Bugs detectados".

## 3. `components/medida/unified-workflow-tab.tsx` — 1010 → 2

| Módulo | Líneas |
|---|---:|
| `unified-workflow-tab/UnifiedWorkflowTab.tsx` | 467 |
| `unified-workflow-tab/steps/buildWorkflowSteps.tsx` | 292 |
| `unified-workflow-tab/parts/EtapaHistorialSelector.tsx` | 100 |
| `unified-workflow-tab/data/loadEtapaDetail.ts` | 96 |
| `unified-workflow-tab/parts/EtapaNotFoundView.tsx` | 90 |
| `unified-workflow-tab/etapa-selection.ts` | 89 |
| `unified-workflow-tab/parts/WorkflowV2View.tsx` | 83 |
| `unified-workflow-tab/hooks/useWorkflowState.ts` | 67 |
| `unified-workflow-tab/parts/IniciarOtraEtapaBanner.tsx` | 44 |
| `unified-workflow-tab/types.ts` | 37 |
| `unified-workflow-tab/permissions.ts` | 27 |
| `unified-workflow-tab/constants.ts` | 15 |

Los seis importadores siguen usando el named export `UnifiedWorkflowTab`; se
preserva también el `export default`.

**Orden de hooks preservado**: `useParams` → `useUser` →
`useMemo(etapasOfThisType)` → `useMemo(puedeIniciarNuevaEtapa)` →
`useWorkflowState` (los 12 `useState`, el `useEffect` de reset y el `useCallback`
de refresh en su orden original) → `useEffect(fetch)` →
`useEffect(auto-navegación, con su array vacío)`. Los cuatro arrays de
dependencias quedaron intactos.

El mapa de etiquetas de fase (`{apertura: "Apertura", …}`) estaba escrito
**cuatro veces** inline con las mismas claves y valores; se extrajo una vez a
`constants.ts`.

**Tres adaptaciones necesarias**, ninguna cambia comportamiento:

1. `permissions.ts` anota `(z: any)` en los dos callbacks de `user?.zonas?.some`,
   porque al recibir `user` como parámetro se pierde el tipo que venía de
   `useUser()`. Es el mismo estilo que los `(g: any)` que ya tenía el original.
2. `WorkflowV2View` agrega `&& medidaApiData` a una condición que **ya lo
   implicaba** (`showInformeCierreSection` se calcula con `medidaApiData &&`),
   para recuperar el estrechamiento de tipo que se perdió al mover el bloque a
   su propio módulo.
3. `loadEtapaDetail` recibe `medidaId` como parámetro en vez de cerrar sobre
   `medidaData.id`.

## 4. `legajo/actividades/components/AdvancedFiltersPanel.tsx` — 862 → 2

| Módulo | Líneas |
|---|---:|
| `AdvancedFiltersPanel/parts/AdvancedFiltersCollapse.tsx` | 396 |
| `AdvancedFiltersPanel/parts/PrimaryFiltersRow.tsx` | 297 |
| `AdvancedFiltersPanel/AdvancedFiltersPanel.tsx` | 117 |
| `AdvancedFiltersPanel/hooks/useFilterPanelState.ts` | 78 |
| `AdvancedFiltersPanel/parts/EstadoChips.tsx` | 58 |
| `AdvancedFiltersPanel/utils.ts` | 42 |
| `AdvancedFiltersPanel/hooks/useFilterCatalogs.ts` | 42 |
| `AdvancedFiltersPanel/constants.ts` | 41 |
| `AdvancedFiltersPanel/types.ts` | 11 |

**Orden de hooks preservado**: `useUser` → `useFilterPanelState`
(`useState(expanded)`, los cuatro `useState` locales y los **cinco `useEffect`
con debounce de 500 ms**, en su orden original y con sus arrays de dependencias
intactos) → `useFilterCatalogs` (los cuatro `useCatalogData` y el `useMemo` de
`categoriasOficio`).

---

# Verificación de que fue puro movimiento de código

## 1. Gates

`npm run typecheck` y `npm run build` con exit 0 después de cada archivo, antes
de cada commit. **El build de este repo valida tipos**: `next.config` no tiene
bloques `typescript.ignoreBuildErrors` ni `eslint.ignoreDuringBuilds`.
(`CLAUDE.md` todavía afirma lo contrario; ver B7.)

## 2. Literales de string preservados

Conjunto de literales de ≥4 caracteres del archivo original en git contra la
unión de los módulos nuevos, ignorando líneas de import:

| Archivo | Literales del original | Ausentes | Cuáles |
|---|---:|---:|---|
| `seguimiento-dispositivo-tab.tsx` | 113 | **0** | — |
| `residencias-tab.tsx` | 111 | 1 | `../../../utils/seguimiento-mapper` (ruta de import reajustada) |
| `unified-workflow-tab.tsx` | 91 | 1 | `../../utils/step-completion` (ruta de import reajustada) |
| `AdvancedFiltersPanel.tsx` | 159 | 1 | `@mui/material` (la lista de imports de MUI se reagrupó por módulo) |

Es decir: todos los textos visibles, valores de `sx`, claves de cache,
`queryKey`s, endpoints y mensajes quedaron intactos.

## 3. Multiconjunto de líneas normalizadas

Toda línea del original (sin indentación, sin líneas en blanco) debía aparecer
al menos la misma cantidad de veces en la unión de los módulos nuevos.

| Archivo | Líneas no cubiertas | Naturaleza de las diferencias |
|---|---:|---|
| `seguimiento-dispositivo-tab.tsx` | 33 | 8 imports reajustados, 5 imports muertos no arrastrados, 4 declaraciones que ganan `export`, 15 líneas de las dos copias sobrantes de `formatDate`/`formatDateTime`, 1 comentario obsoleto |
| `residencias-tab.tsx` | 12 | 8 imports, 3 declaraciones que ganan `export`, 1 comentario obsoleto |
| `unified-workflow-tab.tsx` | 52 | 22 imports, 12 de la de-cuadruplicación del mapa de etiquetas, 8 declaraciones que cambiaron de firma al pasar de closure a parámetro, 4 del recableado de handlers a props, 2 de `(z) → (z: any)`, 1 de `medidaData.id → medidaId`, 1 del guard de estrechamiento, 3 comentarios de sección |
| `AdvancedFiltersPanel.tsx` | 32 | 17 items de la lista de imports de MUI, 6 otras líneas de import, 9 declaraciones que ganan `export` |

**Ninguna línea de lógica, JSX o texto se perdió.**

En `seguimiento-dispositivo-tab` la aritmética de llaves cuadra exactamente con
la de-triplicación: `}` pasa de 35 a 31 (−4 = 2 copias de `formatDate` + 2 de
`formatDateTime`) y `})` de 6 a 2.

## 4. Lo que esta verificación efectivamente atrapó

En `unified-workflow-tab` y en `AdvancedFiltersPanel` la comparación detectó que
se había perdido la directiva **`"use client"`** al armar los módulos nuevos
(los dos originales la tenían en la línea 1). Se restauró en ambos antes del
gate. En `unified-workflow-tab` también detectó que se había perdido la cabecera
JSDoc del archivo (22 líneas que documentan los modos V1/V2), que también se
restauró.

Control final: los cuatro originales tenían `"use client"` y los cuatro paquetes
de módulos nuevos la tienen.

## 5. Bundle

| Ruta | Antes (`d663bea`) | Después |
|---|---|---|
| `/legajo/[id]/medida/[medidaId]` | 109 kB / 622 kB | 110 kB / 623 kB |

El aumento de ~1 kB es el overhead esperable de los wrappers de módulo de
webpack al pasar de 4 archivos a ~40. No aparecen dependencias nuevas.

---

# Bugs detectados y NO corregidos

Todos preexistentes. Se movieron tal cual y quedan documentados acá.

## B1 — `seguimiento-dispositivo-tab` (MPJ): todas las fechas se muestran un día antes

`components/medida/mpj-tabs/seguimiento-dispositivo-tab/utils.ts`

```ts
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-AR', { ... })
}
```

`new Date("2024-01-15")` parsea como medianoche **UTC**; al formatear en
`es-AR` (UTC−3) rinde `14/01/2024`. Verificado:

```
TZ=America/Argentina/Buenos_Aires
new Date('2024-01-15').toLocaleDateString('es-AR', {...})  →  "14/01/2024"
```

Afecta a las tres secciones del tab MPJ: fecha de situación, fecha de cambio de
lugar y fecha de nota de seguimiento.

**El repo ya tiene la corrección**: `src/utils/dateUtils.ts` expone
`formatDateLocaleAR`, cuyo `toDateObject` documenta y resuelve exactamente este
caso ("Date-only values represent calendar dates, not UTC instants. Parsing them
with `new Date("YYYY-MM-DD")` moves the date to the previous day in Argentina").
El tab **MPE** (`residencias-tab`) ya lo usa; el **MPJ** no. La corrección sería
cambiar el import, pero es un cambio de comportamiento visible y queda fuera de
alcance.

## B2 — `CambioLugarResguardoSection` / `NotasSeguimientoSection`: dos forks que se declaran compartidos

`mpj-tabs/seguimiento-dispositivo-tab/sections/` y `mpe-tabs/residencias-tab/sections/`

Los cuatro componentes llevan el comentario `// ... Section (shared between MPE
and MPJ)`, pero **no están compartidos**: son copias que divergieron (151 y 113
líneas de `diff`).

La versión MPE es estrictamente más robusta:

- Inline del fetch dentro del `useEffect` con flag `cancelled` y cleanup, lo que
  evita el *race* de escribir estado después de desmontar o de que llegue una
  respuesta vieja.
- Estados `localesError` / `cambiosError` para distinguir "sin datos" de "falló
  la carga".

La versión MPJ llama a `fetchLocales()` / `fetchCambios()` declaradas fuera del
efecto y sin cancelación. Es un bug latente de carrera + código duplicado que
sólo se arregló en una de las dos copias.

## B3 — `unified-workflow-tab`: la rama V2 es inalcanzable

`components/medida/unified-workflow-tab/UnifiedWorkflowTab.tsx`

```ts
const useV2Mode = false // Always use V1 interactive workflow
```

`if (useV2Mode && workflowPhase && etapaActualForThisTab)` nunca se cumple, así
que todo `WorkflowV2View` (83 líneas, con su `WorkflowStepper` basado en
catálogo y su `InformeCierreSection`) es **código muerto**. Junto con él quedan
inertes `estadosCatalog` (un `useState` sin setter, siempre `[]`),
`isLoadingEstados` (siempre `false`) y `availableEstadosFromEtapa`.

Se preservó tal cual. Es candidato a eliminación si se confirma que V2 no vuelve.

## B4 — `submitFormData` calcula el diff contra un baseline al que le faltan campos

`src/components/forms/utils/fetch-case-data.tsx` y `src/components/forms/utils/api.ts`

Hay dos `transformApiDataToFormData`. El camino de **lectura/detalle**
(`DemandaDetail.tsx` → `apiToFormData.ts`) usa el completo. El camino de
**edición/PATCH** (`MultiStepForm.tsx` → `submitFormData` → `api.ts:55` →
`fetch-case-data.tsx`) usa el otro, al que le faltan:

`apellido`, `dni_oficio`, `user_responsable_id`, `vinculos` y **todo el bloque
CARGA_OFICIOS** (`tipo_oficio`, `tipo_medida_evaluado`, `numero_expediente`,
`caratula`, `plazo_dias`, `fecha_vencimiento_oficio`,
`categoria_informacion_judicial`, `departamento_judicial`,
`circunscripcion_judicial`), además del mapeo condicional de `institucion` para
CARGA_OFICIOS.

`submitFormData` usa ese resultado como `originalData` para calcular qué cambió.
Como esos campos llegan siempre `undefined` en el baseline, el diff de una
demanda CARGA_OFICIOS los va a tratar como distintos (o no los va a ver, según
cómo compare). Además los dos transforms mapean `cobertura_medica.institucion_sanitaria`
distinto (objeto entero vs `.id` + `_nombre`).

No lo toqué porque arreglarlo es unificar los dos transforms, que es
precisamente lo que el enunciado pide no hacer a la fuerza.

## B5 — `OBJETIVO_LABELS`: las etiquetas de `nuevoingreso` no tienen tildes

`src/app/(runna)/nuevoingreso/types/demanda-response.ts:140`

```ts
PROTECCION: "Proteccion",
PETICION_DE_INFORME: "Peticion de Informe",
```

frente a `src/app/(runna)/oficios/lib/buscar-oficios.ts:112`:

```ts
PROTECCION: "Protección",
PETICION_DE_INFORME: "Petición de Informe",
```

El `DemandaSuccessModal` muestra un chip sin tildes. Es texto visible, así que
no se cambió.

## B6 — Código muerto encontrado durante la auditoría

Nada de esto se eliminó.

| Símbolo | Ubicación | Estado |
|---|---|---|
| `isAllowedExtension` (las dos) | `utils/file-validation.ts`, `src/utils/fileUtils.ts` | Sin call sites |
| `fetchPersonaLocalizacion` | `api/localizacion-api-service.ts:33` | Sin call sites |
| `RatificacionJudicialAPI.uploadAdjunto` / `.deleteAdjunto` | `api/ratificacion-judicial-api-service.ts:327-328` | Placeholders que lanzan; sin call sites |
| `ERROR_MESSAGES` | `forms/constants/duplicate-thresholds.ts:99` | Sin call sites |
| `ERROR_MESSAGES` | `utils/constants/duplicateDetection.ts:95` | Importado aliasado en `duplicate-thresholds.ts:14`, ni re-exportado ni usado |
| `WorkflowV2View` y todo el modo V2 | `unified-workflow-tab/` | Inalcanzable (B3) |
| `InformeJuridicoBasicResponse`, `StepStatus` | imports de `unified-workflow-tab.tsx` | Imports muertos, no arrastrados |
| `InputLabel`, `Select`, `MenuItem`, `Checkbox`, `AddIcon` | imports de `seguimiento-dispositivo-tab.tsx` | Imports muertos, no arrastrados |

## B7 — `CLAUDE.md` afirma que el build ignora errores de TypeScript

`CLAUDE.md` dice:

> **TypeScript Build Errors**: Ignored (`ignoreBuildErrors: true`) - Fix this in production

Es **falso**: `next.config` no tiene ningún bloque `typescript` ni `eslint` que
desactive la validación, y `npm run build` efectivamente falla ante errores de
tipos. El commit `385022e` ya corrigió esta afirmación en los reportes de
`claudedocs/`, pero `CLAUDE.md` quedó desactualizado. No lo edité porque está
fuera del alcance pedido.

## B8 — `adjuntos-ratificacion`: se muestra el id numérico como nombre de usuario

`components/ratificacion-judicial/adjuntos-ratificacion.tsx:283`

```tsx
{adjunto.usuario_carga_nombre || extractUserName(String(adjunto.usuario_carga))}
```

`usuario_carga` está tipado `number`. Cuando `usuario_carga_nombre` viene vacío,
el fallback renderiza `String(42)` → `"42"`, es decir el id crudo como si fuera
un nombre. La consolidación de A1 no cambia esto (la canónica devuelve el mismo
`"42"`), pero quedó a la vista al listar los call sites.

---

# Efecto colateral conocido (no es un bug de la app)

Al mover estado a hooks propios, `react-hooks/exhaustive-deps` ya no puede
probar que los setters son estables y emite warnings nuevos en
`useWorkflowState`, `useFilterPanelState` y los tres `sections/` de cada tab.
Los arrays de dependencias se dejaron **exactamente como estaban**, por lo que el
comportamiento en runtime es idéntico: React garantiza la identidad estable de
los setters de `useState`. Son warnings de lint, no fallan el build.
