# Modularización de modales y hook de intervención — 2026-09-07

Rama: `refactor/modularizacion-2026-09`

Continuación de `MODULARIZACION_TABLAS_2026-09-07.md`, con el mismo criterio:
carpeta hermana por componente, fachada delgada en la ruta original, hooks por
responsabilidad y `parts/` (aquí `steps/`, `actions/`) para subcomponentes.

El trabajo es **puro movimiento de código**: no se cambiaron props, orden de
ejecución de hooks, arrays de dependencias, `queryKey`s, endpoints, textos
visibles ni objetos `sx`.

## Resumen

| Archivo | Antes | Punto de entrada después | Módulos creados | typecheck | build |
|---|---:|---:|---:|:---:|:---:|
| `components/dialogs/persona-detail-modal-enhanced.tsx` | 2172 | 3 | 20 | ✅ exit 0 | ✅ exit 0 |
| `components/medida/shared/intervencion-modal.tsx` | 1665 | 4 | 14 | ✅ exit 0 | ✅ exit 0 |
| `hooks/useRegistroIntervencion.ts` | 1154 | 6 | 10 | ✅ exit 0 | ✅ exit 0 |

Todos bajo `src/app/(runna)/legajo/[id]/medida/[medidaId]/`.

Baseline verificado antes de empezar (`243fa39`): `npm run typecheck` exit 0 y
`npm run build` exit 0.

Commits (uno por archivo, agregando sólo las rutas involucradas):

- `886e2a6` refactor(medida): descomponer persona-detail-modal-enhanced en tabs, hooks y form
- `acdb2e9` refactor(medida): descomponer intervencion-modal en pasos, hooks y handlers
- `5caa54b` refactor(medida): descomponer useRegistroIntervencion en estado y acciones

---

## 1. `components/dialogs/persona-detail-modal-enhanced.tsx`

### Antes

**2172 líneas**: `TabPanel` / `a11yProps`, cuatro helpers (`formatFecha`,
`getInitials`, `getAvatarColor`, `copyToClipboard`), las interfaces
`PersonaDetailModalProps` / `TabPanelProps` / `PersonaFormState`, el
`initialFormState` y un componente de ~1930 líneas (242–2171) con 12 hooks,
edición inline con semántica PATCH (`getModifiedFields`, 125 líneas), guardado
contra `updateNNyAData` con invalidación de cinco caches, y ocho `TabPanel`
(Personal, Ubicación, Educación, Salud, Vulnerabilidad, Familia, Legajo,
Contexto) de entre 6 y 296 líneas cada uno.

### Después

`components/dialogs/persona-detail-modal-enhanced.tsx` (3 líneas) re-exporta el
default. Los importadores externos no se tocaron.

| Módulo | Líneas |
|---|---:|
| `persona-detail-modal-enhanced/parts/TabUbicacion.tsx` | 356 |
| `persona-detail-modal-enhanced/parts/TabPersonal.tsx` | 353 |
| `persona-detail-modal-enhanced/parts/TabSalud.tsx` | 350 |
| `persona-detail-modal-enhanced/PersonaDetailModalEnhanced.tsx` | 289 |
| `persona-detail-modal-enhanced/parts/TabEducacion.tsx` | 284 |
| `persona-detail-modal-enhanced/parts/TabVulnerabilidad.tsx` | 200 |
| `persona-detail-modal-enhanced/form/getModifiedFields.ts` | 133 |
| `persona-detail-modal-enhanced/parts/TabLegajo.tsx` | 126 |
| `persona-detail-modal-enhanced/parts/TabContexto.tsx` | 124 |
| `persona-detail-modal-enhanced/form/buildPersonaFormState.ts` | 81 |
| `persona-detail-modal-enhanced/hooks/usePersonaDetailData.ts` | 80 |
| `persona-detail-modal-enhanced/form/persistPersonaChanges.ts` | 75 |
| `persona-detail-modal-enhanced/parts/PersonaDetailHeader.tsx` | 73 |
| `persona-detail-modal-enhanced/utils.ts` | 70 |
| `persona-detail-modal-enhanced/types.ts` | 69 |
| `persona-detail-modal-enhanced/constants.ts` | 41 |
| `persona-detail-modal-enhanced/parts/PersonaDetailTabs.tsx` | 39 |
| `persona-detail-modal-enhanced/hooks/usePersonaEditForm.ts` | 38 |
| `persona-detail-modal-enhanced/parts/TabPanel.tsx` | 25 |
| `persona-detail-modal-enhanced/parts/TabFamilia.tsx` | 19 |

Notas de diseño:

- **Orden de hooks preservado exactamente.** El original ejecutaba
  `useTheme` → `useMediaQuery` → `useQueryClient` → `useState(activeTab)` →
  4 `useState` + `useRef` del formulario → `useNNyAData` →
  `usePersonaCondicionesVulnerabilidad` → `useQuery(dropdowns)`. En la versión
  nueva el bloque 5–9 es `usePersonaEditForm()` y el 10–12 es
  `usePersonaDetailData()`, invocados en esos mismos puntos. El componente no
  tiene ningún `useEffect`, así que no hay orden de efectos que alterar.
- `initializeFormData` / `handleEnterEditMode` / `handleCancelEdit` /
  `handleSave` siguen siendo funciones planas en el componente principal; sólo
  delegan el cuerpo a `buildPersonaFormState`, `getModifiedFields` y
  `persistPersonaChanges`. `getModifiedFields` se sigue evaluando **dentro** del
  `try` de guardado, después de `setIsSaving(true)`, igual que antes.
- `displayData` pasa a `buildDisplayData(nnyaData, persona)` y su tipo se deriva
  con `ReturnType<typeof buildDisplayData>`, de modo que la inferencia de cada
  campo es idéntica a la del objeto literal original.
- Las cabeceras de cada tab (título + botones Editar / Cancelar / Guardar) se
  repiten entre tabs pero **no se unificaron**: los cuatro bloques difieren
  (título distinto, y el de Vulnerabilidad usa otro estado), y unificarlos
  obligaría a elegir una variante.

### Gates

| | Resultado |
|---|---|
| `npm run typecheck` | exit 0 |
| `npm run build` | exit 0 |

---

## 2. `components/medida/shared/intervencion-modal.tsx`

### Antes

**1665 líneas**: la interfaz `IntervencionModalProps` y un componente de ~1560
líneas (95–1665) que consume `useRegistroIntervencion`, declara 16 hooks locales
(13 `useState`/`useRef`, 2 `useEffect`, 2 `useMemo`) más 16
`useCallback`/`useMemo` de manejo de archivos, siete handlers de guardado y
transición de estado (~250 líneas), un `getStepContent` de 800 líneas con los
tres pasos del wizard, y el render con `WizardModal`, `RejectionDialog` y dos
`Snackbar`.

### Después

`components/medida/shared/intervencion-modal.tsx` (4 líneas) re-exporta
`IntervencionModal` y el tipo `IntervencionModalProps`.

| Módulo | Líneas |
|---|---:|
| `intervencion-modal/IntervencionModal.tsx` | 444 |
| `intervencion-modal/steps/documentos/InformeObligatorioSection.tsx` | 318 |
| `intervencion-modal/handlers/createIntervencionActions.ts` | 318 |
| `intervencion-modal/steps/StepDetalles.tsx` | 248 |
| `intervencion-modal/steps/documentos/DocumentosAdicionalesSection.tsx` | 217 |
| `intervencion-modal/hooks/useInformeObligatorio.ts` | 147 |
| `intervencion-modal/steps/StepInformacionBasica.tsx` | 135 |
| `intervencion-modal/steps/documentos/ConfiguracionAdicionalSection.tsx` | 128 |
| `intervencion-modal/hooks/useIntervencionModalState.ts` | 110 |
| `intervencion-modal/handlers/createStepNavigation.ts` | 105 |
| `intervencion-modal/hooks/useIntervencionFiles.ts` | 103 |
| `intervencion-modal/steps/StepDocumentos.tsx` | 99 |
| `intervencion-modal/types.ts` | 32 |
| `intervencion-modal/utils.ts` | 10 |

Notas de diseño:

- **Orden de hooks preservado.** Queda
  `useRegistroIntervencion` → `useIntervencionModalState` (los 16 hooks locales,
  incluidos los dos `useEffect` en su posición original) →
  `useIntervencionFiles` → `useInformeObligatorio`. `createStepNavigation` y
  `createIntervencionActions` son funciones planas (no hooks), así que su
  posición entre medio no afecta nada.
- El paso 3 (`Documentos y Configuración`, 495 líneas) se subdividió en sus tres
  secciones ya delimitadas por comentarios en el original: Informe Obligatorio,
  Configuración Adicional y Documentos Adicionales. `StepDocumentos.tsx` es sólo
  el compositor con el `<Box>` externo.
- `IntervencionModal.tsx` queda en 444 líneas: la mayor parte es el render de
  `WizardModal` con sus acciones primaria/secundarias y los dos `Snackbar`, que
  se movió textualmente.
- Los tres pasos ahora se construyen como elementos (`<StepInformacionBasica />`)
  en lugar de árboles JSX inline. `WizardModal` sigue recibiendo los tres en
  `steps[].content` igual que antes; la única diferencia es que el cuerpo de
  cada paso se evalúa sólo cuando se monta. Ninguno tiene efectos secundarios,
  así que el comportamiento observable es idéntico.

### Gates

| | Resultado |
|---|---|
| `npm run typecheck` | exit 0 |
| `npm run build` | exit 0 |

---

## 3. `hooks/useRegistroIntervencion.ts`

### Antes

**1154 líneas**: tres interfaces (`IntervencionFormData`,
`UseRegistroIntervencionOptions`, `ValidationErrors`), el helper de módulo
`intervencionesListKey` y un hook de ~1055 líneas (100–1154) con
`useQueryClient`, 16 `useState`, cuatro `useEffect`, trece funciones asíncronas
de API (CRUD, transiciones de estado, adjuntos, catálogos), validación, dos
`useCallback`, cinco valores derivados y un objeto de retorno de 57 líneas.

### Después

`hooks/useRegistroIntervencion.ts` (6 líneas) re-exporta el hook y sus tres
tipos. El único consumidor (`intervencion-modal`) no cambió su import.

| Módulo | Líneas |
|---|---:|
| `useRegistroIntervencion/useRegistroIntervencion.ts` | 360 |
| `useRegistroIntervencion/actions/createSaveActions.ts` | 352 |
| `useRegistroIntervencion/actions/createWorkflowActions.ts` | 263 |
| `useRegistroIntervencion/state/useRegistroIntervencionState.ts` | 113 |
| `useRegistroIntervencion/actions/createAdjuntosActions.ts` | 107 |
| `useRegistroIntervencion/actions/createLoadActions.ts` | 104 |
| `useRegistroIntervencion/actions/createCatalogActions.ts` | 84 |
| `useRegistroIntervencion/validation/createFormValidation.ts` | 70 |
| `useRegistroIntervencion/types.ts` | 46 |
| `useRegistroIntervencion/constants.ts` | 2 |

Notas de diseño:

- **Orden de hooks preservado.** `useQueryClient` → los 16 `useState` (dentro de
  `useRegistroIntervencionState`, en el mismo orden) → los cuatro `useEffect`
  **verbatim, con sus arrays de dependencias intactos** → `useCallback`
  (`updateField`) → `useCallback` (`clearErrors`).
- Los `useEffect` siguen llamando a `loadIntervencion`, `loadAperturaData`,
  `loadCatalogs` y `loadAdjuntos`, que se declaran más abajo. Es exactamente el
  patrón del original: la referencia vive dentro del callback del efecto, que se
  ejecuta después del render, así que la TDZ ya está resuelta.
- **Único reordenamiento**: `createFormValidation` se invoca antes que
  `createSaveActions`, porque `guardarBorrador`/`guardarYEnviar` reciben
  `validateForm` como valor. En el original `validateForm` se declaraba después
  y se resolvía por closure. Como es una función pura sin hooks ni efectos,
  adelantar su creación no es observable.
- **No se unificó** el objeto inicial de `formData`
  (`useRegistroIntervencionState`) con el de `resetForm`: tienen las mismas
  claves pero en distinto orden (`tipo_cese`/`subtipo_cese` van en tercera
  posición en uno y en penúltima en el otro), y unificarlos obligaría a elegir
  una de las dos formas.
- El objeto de retorno del hook es idéntico campo por campo, incluido el alias
  `subMotivos: availableSubMotivos`.

### Gates

| | Resultado |
|---|---|
| `npm run typecheck` | exit 0 |
| `npm run build` | exit 0 |

---

## Verificación de que fue puro movimiento de código

### 1. Gates

`npm run typecheck` y `npm run build` con exit 0 después de cada archivo, antes
de cada commit. El build de este repo valida tipos (no hay `ignoreBuildErrors`).

### 2. Literales de string preservados

Se comparó el conjunto de literales de string (≥4 caracteres, ignorando líneas
de import) del archivo original en git contra la unión de los módulos nuevos:

| Archivo | Literales del original | Ausentes |
|---|---:|---:|
| `persona-detail-modal-enhanced.tsx` | 187 | **0** |
| `intervencion-modal.tsx` | 202 | **0** |
| `useRegistroIntervencion.ts` | 66 | **0** |

Es decir: todos los textos visibles, valores de `sx`, claves de cache,
`queryKey`s, endpoints y mensajes de toast quedaron intactos. No hubo rutas de
`dynamic(() => import(...))` que reajustar en estos tres archivos.

### 3. Líneas de código preservadas

Control adicional: se comparó el multiconjunto de líneas normalizadas (sin
indentación, sin líneas en blanco) del original contra la unión de los módulos
nuevos. Toda línea del original debía aparecer al menos la misma cantidad de
veces.

| Archivo | Líneas distintas | No presentes | Naturaleza de las diferencias |
|---|---:|---:|---|
| `persona-detail-modal-enhanced.tsx` | 1047 | 29 | 21 líneas de import (rutas reajustadas por profundidad, listas de MUI reagrupadas) y 8 líneas de declaración que ganaron `export` o cambiaron de firma al pasar de closure a parámetro |
| `intervencion-modal.tsx` | 952 | 11 | 8 líneas de import, 2 imports muertos no arrastrados, 1 declaración con `export` |
| `useRegistroIntervencion.ts` | 557 | 13 | 8 líneas de import, 2 imports muertos no arrastrados, 3 declaraciones con `export` |

**Ninguna línea de lógica, JSX o texto se perdió.**

### 4. Bundle

| Ruta | Baseline (page / First Load) | Después |
|---|---|---|
| `/legajo/[id]/medida/[medidaId]` | 107 kB / 620 kB | 109 kB / 622 kB |
| `/legajo/[id]` | 51.8 kB / 530 kB | 53.3 kB / 531 kB |
| `/demanda/[id]` | 45.5 kB / 671 kB | 45.5 kB / 671 kB |
| `/mesadeentrada` | 115 kB / 548 kB | 115 kB / 548 kB |
| `/legajo/actividades` | 8.86 kB / 486 kB | 8.86 kB / 486 kB |

El aumento de 1–2 kB en las dos rutas afectadas es el overhead esperable de los
wrappers de módulo de webpack al pasar de 3 archivos a 44. No aparecen
dependencias nuevas.

---

## Bugs detectados y NO corregidos

Todos preexistentes; se movieron tal cual y quedan documentados acá.

### B1 — `persona-detail-modal`: los datos del médico de cabecera no se guardan

`components/dialogs/persona-detail-modal-enhanced/form/getModifiedFields.ts`

La pestaña Salud ofrece tres campos editables — "Nombre del Médico", "Email del
Médico" y "Teléfono del Médico" — que escriben en `formData.medico_nombre`,
`medico_mail` y `medico_telefono`. Pero `getModifiedFields` **nunca los incluye
en el payload**: `coberturaMedicaChanged` no los mira y el objeto
`modified.cobertura_medica` sólo manda `medico_cabecera` (la FK). El tipo
`NNyAUpdateRequest` tampoco los declara.

Consecuencia: el usuario edita el nombre/mail/teléfono del médico, presiona
Guardar, ve el toast de éxito y los cambios se descartan en silencio. El propio
`PersonaFormState` los marca como "Display-only fields for medico (read from
API, not sent back)", así que el bug está en la UI que los expone como
editables, no en el mapeo.

### B2 — `persona-detail-modal`: `condiciones_vulnerabilidad` tampoco se envía

`components/dialogs/persona-detail-modal-enhanced/form/getModifiedFields.ts`

`PersonaFormState.condiciones_vulnerabilidad` se puebla en
`buildPersonaFormState` a partir de `vulnerabilidadData`, pero `getModifiedFields`
no lo compara ni lo manda. Es estado de formulario inerte. (En la práctica la
edición de vulnerabilidad la resuelve `VulnerabilityEditor` por su cuenta, así
que el campo del form es residuo.)

Agravante relacionado: la consulta de vulnerabilidad tiene
`enabled: open && !!personaId && activeTab === 4`, así que si se entra en modo
edición desde cualquier otra pestaña, `vulnerabilidadData` es `undefined` y el
campo se inicializa en `[]`.

### B3 — `persona-detail-modal`: prop `onEdit` declarada y nunca usada

`components/dialogs/persona-detail-modal-enhanced/types.ts` y
`PersonaDetailModalEnhanced.tsx`

`onEdit?: (section: "personal" | "location" | "legajo") => void` se declara en
las props y se desestructura en el componente, pero no se invoca en ningún lado.
Se preservó tal cual.

### B4 — `intervencion-modal`: el error de `medidaId` faltante nunca se muestra

`components/medida/shared/intervencion-modal/hooks/useIntervencionModalState.ts`

El efecto de montaje setea
`validationError = 'Error: medidaId no está definido. No se pueden cargar las
intervenciones.'` cuando el modal abre sin `medidaId`, pero `validationError`
**no se lee en ningún punto del render**. El usuario ve el wizard vacío sin
explicación. Además el hook se invoca igual con `medidaId: medidaId!`, con lo
cual la llamada a la API sale con `undefined`.

### B5 — `intervencion-modal`: estado `observaciones` muerto

`components/medida/shared/intervencion-modal/hooks/useIntervencionModalState.ts`

`const [observaciones, setObservaciones] = useState("")` no se usa: el
`RejectionDialog` maneja su propio texto y se lo pasa a `handleRechazarConfirm`
como argumento (que además lo sombrea). Se conservó para no alterar la cantidad
ni el orden de hooks.

### B6 — `intervencion-modal`: `handleSaveAndSend` traga la excepción

`components/medida/shared/intervencion-modal/handlers/createIntervencionActions.ts`

Los cuatro `catch (error)` de los handlers de guardado y transición muestran un
snackbar genérico y **no loguean el error** (ESLint ya lo marcaba como
`'error' is defined but never used`). Cualquier fallo de red o de validación del
backend queda invisible para el diagnóstico.

### B7 — Imports muertos en los tres archivos

No se arrastraron a los módulos nuevos (mantenerlos habría sido arrastrar ruido,
y quitarlos no cambia comportamiento). ESLint ya los reportaba en el baseline:

| Archivo original | Import muerto |
|---|---|
| `intervencion-modal.tsx` | `CircularProgress` (de `@mui/material`) |
| `intervencion-modal.tsx` | `PersonIcon` (de `@mui/icons-material/Person`) |
| `intervencion-modal.tsx` | `WorkflowStateActions` (de `./workflow-state-actions`) |
| `useRegistroIntervencion.ts` | `useMutation` (de `@tanstack/react-query`) |
| `useRegistroIntervencion.ts` | tipo `TipoDispositivo` |

### B8 — `useRegistroIntervencion`: efectos con dependencias incompletas

`hooks/useRegistroIntervencion/useRegistroIntervencion.ts`

Preexistente y ya reportado por ESLint en el baseline: los tres primeros
`useEffect` llaman a `loadIntervencion` / `loadAperturaData` / `loadAdjuntos` sin
incluirlas en sus arrays de dependencias, y el cuarto omite
`formData.sub_motivo_id`. Como esas funciones se recrean en cada render y cierran
sobre el estado de ese render, el efecto puede ejecutar una versión vieja. Los
arrays se dejaron **exactamente como estaban**.

---

## Efecto colateral conocido (no es un bug de la app)

Al mover estado a hooks propios, `react-hooks/exhaustive-deps` ya no puede
probar que los setters son estables y emite warnings nuevos en:

- `intervencion-modal/hooks/useInformeObligatorio.ts` (5 warnings:
  `setInformeObligatorio`, `setInformeObligatorioError`,
  `setIsDraggingInformeObligatorio`, `informeObligatorioInputRef`)
- `intervencion-modal/hooks/useIntervencionFiles.ts` (2 warnings:
  `setPendingFiles`, `setPendingFileTipos`)
- `useRegistroIntervencion/useRegistroIntervencion.ts` (`setFormData`,
  `setValidationErrors`, `setError`, `loadCatalogs`)

Los arrays de dependencias se dejaron **exactamente como estaban**, por lo que el
comportamiento en runtime es idéntico: React garantiza la identidad estable de
los setters de `useState` y de los objetos de `useRef`. Son warnings de lint, no
fallan el build.
