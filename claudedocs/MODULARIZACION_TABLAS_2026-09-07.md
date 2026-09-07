# Modularización de tablas — 2026-09-07

Rama: `refactor/modularizacion-2026-09`

Descomposición de tres "god components" de tabla en módulos por responsabilidad.
El trabajo es **puro movimiento de código**: no se cambiaron props, orden de
ejecución de efectos, arrays de dependencias, claves de storage, textos visibles
ni objetos `sx`.

## Resumen

| Archivo | Antes | Punto de entrada después | Módulos creados | typecheck | build |
|---|---:|---:|---:|:---:|:---:|
| `mesadeentrada/ui/dataGrid.tsx` | 2217 | 58 | 20 | ✅ exit 0 | ✅ exit 0 |
| `legajo/actividades/components/UnifiedActividadesTable.tsx` | 2125 | 7 | 22 | ✅ exit 0 | ✅ exit 0 |
| `legajo-mesa/ui/legajos-table.tsx` | 1805 | 5 | 18 | ✅ exit 0 | ✅ exit 0 |

Commits (uno por archivo, agregando sólo las rutas involucradas):

- `92b580e` refactor(mesadeentrada): descomponer dataGrid en columnas, celdas, toolbar y hooks
- `2a72fed` refactor(actividades): descomponer UnifiedActividadesTable en hooks y partes
- `243fa39` refactor(legajo-mesa): descomponer legajos-table en columnas, celdas, toolbar y hooks

---

## 1. `src/app/(runna)/mesadeentrada/ui/dataGrid.tsx`

### Antes

Un único archivo de **2217 líneas** con:

- helpers sueltos (`getFileNameFromUrl`), `CustomToolbar` (sin uso),
  `StatusChip`, `AdjuntosCell`
- constantes de presets y claves de localStorage
- `DemandaTableContent` (líneas 378–2169, ~1790 líneas): estado, `fetchDemandas`,
  dos mutaciones, 13 columnas, export a xlsx, afordancia de scroll, tabla,
  lista de tarjetas, panel de detalle, drawer y modal
- `DemandaTable` (wrapper con permisos + skeleton) y el `export default`

### Después

`ui/dataGrid.tsx` (58 líneas) conserva `DemandaTable` con su chequeo de permisos
y su skeleton, y sigue siendo el `export default` que consume `page.tsx`.

| Módulo | Líneas |
|---|---:|
| `dataGrid/DemandaTableContent.tsx` | 428 |
| `dataGrid/columns.tsx` | 426 |
| `dataGrid/gridConfig.ts` | 139 |
| `dataGrid/AdjuntosCell.tsx` | 129 |
| `dataGrid/utils.ts` | 123 |
| `dataGrid/StatusChip.tsx` | 89 |
| `dataGrid/exportDemandas.ts` | 62 |
| `dataGrid/constants.ts` | 47 |
| `dataGrid/toolbar.tsx` | 40 |
| `dataGrid/types.ts` | 38 |
| `dataGrid/hooks/useDemandaMutations.ts` | 196 |
| `dataGrid/hooks/useGridScrollAffordance.ts` | 81 |
| `dataGrid/hooks/useColumnVisibility.ts` | 60 |
| `dataGrid/hooks/useViewMode.ts` | 29 |
| `dataGrid/components/DemandaCardsList.tsx` | 181 |
| `dataGrid/components/DemandaDetailViews.tsx` | 139 |
| `dataGrid/components/GridScrollButtons.tsx` | 98 |
| `dataGrid/components/DemandaActionsBar.tsx` | 82 |
| `dataGrid/components/DemandaHeaderBar.tsx` | 61 |
| `dataGrid/components/DemandaPresetBar.tsx` | 55 |
| `dataGrid/components/DemandaDetailLazy.ts` | 6 |

Notas de diseño:

- `getColumns()` pasa a ser `buildDemandaColumns(options)`. El `useMemo` conserva
  exactamente `[isMobile]` como array de dependencias.
- `useGridScrollAffordance` se invoca en el punto del render donde vivía el
  `useEffect` original (no antes), de modo que el orden de ejecución de los
  efectos del componente queda idéntico: persistir visibilidad → persistir modo
  de vista → sincronizar `?demanda=` → datos → scroll.
- `CustomToolbar` se movió a `toolbar.tsx` tal cual. **Ya estaba sin uso en el
  original** (ver "Bugs detectados").

### Gates

| | Resultado |
|---|---|
| `npm run typecheck` | exit 0 |
| `npm run build` | exit 0 |
| `/mesadeentrada` | 113 kB → 114 kB (page), 547 kB → 548 kB (First Load) |

---

## 2. `src/app/(runna)/legajo/actividades/components/UnifiedActividadesTable.tsx`

### Antes

**2125 líneas**: tipos, `ESTADO_COLORS`, la interfaz de props y un componente de
~1970 líneas con 51 hooks, tres variantes (`legajo` / `medida` / `global`),
consultas a dos APIs distintas, filtrado y paginado cliente, lectura
multi-usuario, tabla de escritorio, tarjetas mobile, contenido, envoltorio,
seis modales y un diálogo de acuse de recibo.

### Después

`components/UnifiedActividadesTable.tsx` (7 líneas) re-exporta `TableVariant`,
el named export `UnifiedActividadesTable` y el default. Los importadores externos
(`DemandaSuccessModal`, `GlobalActividadesTable`, `AdvancedFiltersPanel`,
`plan-trabajo-tab`, `plan-trabajo-section`) no se tocaron.

| Módulo | Líneas |
|---|---:|
| `UnifiedActividadesTable/UnifiedActividadesTable.tsx` | 464 |
| `UnifiedActividadesTable/types.ts` | 36 |
| `UnifiedActividadesTable/constants.ts` | 20 |
| `UnifiedActividadesTable/features.ts` | 40 |
| `UnifiedActividadesTable/utils.ts` | 13 |
| `UnifiedActividadesTable/hooks/useActividadesQuery.ts` | 266 |
| `UnifiedActividadesTable/hooks/useActividadesFilters.ts` | 96 |
| `UnifiedActividadesTable/hooks/useActividadLectura.ts` | 79 |
| `UnifiedActividadesTable/hooks/useActividadesSelection.ts` | 57 |
| `UnifiedActividadesTable/hooks/useActividadModals.ts` | 40 |
| `UnifiedActividadesTable/parts/ActividadTableRow.tsx` | 264 |
| `UnifiedActividadesTable/parts/ActividadesMobileCards.tsx` | 215 |
| `UnifiedActividadesTable/parts/ActividadesContent.tsx` | 185 |
| `UnifiedActividadesTable/parts/ActividadRowActions.tsx` | 174 |
| `UnifiedActividadesTable/parts/ActividadesModals.tsx` | 157 |
| `UnifiedActividadesTable/parts/ActividadesStatisticsPanel.tsx` | 150 |
| `UnifiedActividadesTable/parts/ActividadTipoCell.tsx` | 138 |
| `UnifiedActividadesTable/parts/AcuseReciboDialog.tsx` | 99 |
| `UnifiedActividadesTable/parts/ActividadesWrapper.tsx` | 85 |
| `UnifiedActividadesTable/parts/BulkActionsToolbar.tsx` | 67 |
| `UnifiedActividadesTable/parts/ActividadesTable.tsx` | 63 |
| `UnifiedActividadesTable/parts/ActividadesTableHead.tsx` | 61 |
| `UnifiedActividadesTable/parts/tableProps.ts` | 35 |

Notas de diseño:

- El componente **no tiene ningún `useEffect`**, así que reagrupar estado en
  hooks propios no altera ningún orden de ejecución de efectos.
- `renderStatistics` / `renderFilters` / `renderBulkActionsToolbar` /
  `renderTable` se siguen pasando a `ActividadesContent` **como funciones**
  (`() => ReactNode`), no como nodos ya evaluados, para preservar la evaluación
  perezosa del original.
- `features` deja de ser un objeto inline y pasa a `buildFeatures(variant)`;
  el `useMemo` conserva `[variant]`.

### Gates

| | Resultado |
|---|---|
| `npm run typecheck` | exit 0 |
| `npm run build` | exit 0 |
| `/legajo/actividades` | 11.2 kB → 11.2 kB (page), 483 kB → 486 kB (First Load) |

---

## 3. `src/app/(runna)/legajo-mesa/ui/legajos-table.tsx`

### Antes

**1805 líneas**: `calculateAge`, `CustomToolbar`, `MedidasHoverChip` y
`LegajoTable` (líneas 239–1803, ~1565 líneas) con el armado de ~40 query params,
filtros persistidos en sessionStorage, 20 definiciones de columna, tabla,
tarjetas, panel de detalle, drawer y modal.

### Después

`ui/legajos-table.tsx` (5 líneas) re-exporta el default; `page.tsx` lo sigue
cargando con `next/dynamic` sin cambios.

| Módulo | Líneas |
|---|---:|
| `legajos-table/columns.tsx` | 377 |
| `legajos-table/LegajoTable.tsx` | 340 |
| `legajos-table/utils.ts` | 221 |
| `legajos-table/components/LegajoCardsList.tsx` | 197 |
| `legajos-table/components/LegajoDetailViews.tsx` | 131 |
| `legajos-table/components/GridScrollButtons.tsx` | 97 |
| `legajos-table/components/LegajoHeaderBar.tsx` | 87 |
| `legajos-table/components/LegajoDetailLazy.ts` | 6 |
| `legajos-table/gridConfig.ts` | 91 |
| `legajos-table/hooks/useGridScrollAffordance.ts` | 80 |
| `legajos-table/hooks/useLegajoFilters.ts` | 108 |
| `legajos-table/hooks/useLegajoViewMode.ts` | 29 |
| `legajos-table/cells/PrioridadCell.tsx` | 80 |
| `legajos-table/cells/LegajoRowActions.tsx` | 65 |
| `legajos-table/cells/AlertasCell.tsx` | 46 |
| `legajos-table/MedidasHoverChip.tsx` | 76 |
| `legajos-table/toolbar.tsx` | 70 |
| `legajos-table/constants.ts` | 4 |

Notas de diseño:

- **No se unificó nada con `mesadeentrada/ui/dataGrid`.** El `CustomToolbar` de
  esta tabla, sus chevrones de scroll y su `useGridScrollAffordance` quedan como
  copias locales: aunque el hook de scroll es idéntico y los dos toolbars se
  parecen, unificarlos obligaría a elegir un estilo y cambiaría la UI de alguna
  de las dos pantallas.
- El armado de query params (98 líneas) pasa a `buildLegajoQueryParams()`; el
  `useMemo` conserva `[paginationModel.page, paginationModel.pageSize,
  apiFilters, sortModel]`.
- `getColumns()` pasa a `buildLegajoColumns(options)` con `useMemo` sobre
  `[isMobile, permissions]`, igual que antes.

### Gates

| | Resultado |
|---|---|
| `npm run typecheck` | exit 0 |
| `npm run build` | exit 0 |
| `/legajo-mesa` | 713 B → 712 B (page), 91.7 kB → 91.7 kB (First Load) |

---

## Verificación de que fue puro movimiento de código

1. **Gates**: `npm run typecheck` y `npm run build` con exit 0 después de cada
   archivo, antes de cada commit. Baseline (`c9642ba`) también exit 0.

2. **Literales preservados**: se comparó el conjunto de literales de string
   (≥4 caracteres) del archivo original contra la unión de los módulos nuevos,
   ignorando imports. Resultado:

   | Archivo | Literales del original ausentes |
   |---|---|
   | `dataGrid.tsx` | 1 — sólo `"../../demanda/DemandaDetail"` (ruta relativa reajustada a la nueva profundidad) |
   | `UnifiedActividadesTable.tsx` | 0 |
   | `legajos-table.tsx` | 1 — sólo `"../../legajo/legajo-detail"` (misma razón) |

   Es decir: todos los textos visibles, valores de `sx`, claves de localStorage
   y sessionStorage, `queryKey`s y endpoints quedaron intactos.

3. **Bundle**: los tamaños *page-specific* de las tres rutas afectadas son
   idénticos salvo −1 B en `/legajo-mesa`. El *First Load JS* sube entre 0 y 3 kB
   (≤ 0,6 %) en las rutas que comparten el chunk de actividades, que es el
   overhead esperable de los wrappers de módulo de webpack al pasar de 3 archivos
   a ~60. No aparecen dependencias nuevas.

   | Ruta | Baseline (page / First Load) | Después |
   |---|---|---|
   | `/mesadeentrada` | 113 kB / 547 kB | 114 kB / 548 kB |
   | `/legajo/actividades` | 11.2 kB / 483 kB | 11.2 kB / 486 kB |
   | `/legajo-mesa` | 713 B / 91.7 kB | 712 B / 91.7 kB |
   | `/demanda/[id]` | 45.4 kB / 668 kB | 45.4 kB / 671 kB |
   | `/legajo/[id]` | 51.7 kB / 527 kB | 51.7 kB / 530 kB |
   | `/legajo/[id]/medida/[medidaId]` | 107 kB / 617 kB | 107 kB / 619 kB |
   | `/nuevoingreso` | 15.3 kB / 544 kB | 15.3 kB / 546 kB |

---

## Bugs detectados y NO corregidos

Todos preexistentes; se movieron tal cual y quedan documentados aquí.

### B1 — `dataGrid`: columnas memoizadas sólo por `isMobile` (closure obsoleto)

`src/app/(runna)/mesadeentrada/ui/dataGrid/DemandaTableContent.tsx`

```ts
const columns = useMemo(() => buildDemandaColumns({ ... }), [isMobile])
```

El array de dependencias es sólo `[isMobile]`, pero la factory captura
`hasCalificarPermission`, `hasAssignPermission`, `hasEvaluatePermission`,
`user?.id`, `handleOpenModal` y `handleCalificacionChange`. Si el usuario
(zustand persistido) se hidrata después del primer render, las columnas siguen
usando los permisos del primer render: el `<select>` de calificación y los
botones de asignar/evaluar pueden quedar ocultos hasta que cambie el breakpoint.
`handleOpenModal` además captura `viewMode`, así que el modal puede no abrirse
tras conmutar Lista/Tabla sin re-render por `isMobile`.

Mismo patrón en `legajos-table` (`[isMobile, permissions]`), donde sí incluye
`permissions` y por eso el riesgo es menor.

### B2 — `dataGrid`: precedencia de operadores al calcular `dni`

`src/app/(runna)/mesadeentrada/ui/dataGrid/utils.ts`

```ts
dni: demanda.nnya_principal?.dni || demanda.nnya_nombre_legajo ? "Ver legajo" : ((demanda as any).dni_oficio || "N/A"),
```

`||` liga más fuerte que `?:`, así que la condición real es
`(nnya_principal?.dni || nnya_nombre_legajo)`. Cuando hay `nnya_principal.dni`,
el tooltip muestra `"Ver legajo"` en lugar del DNI. Casi con seguridad se quiso
escribir `demanda.nnya_principal?.dni ?? (demanda.nnya_nombre_legajo ? "Ver legajo" : ...)`.

### B3 — `dataGrid`: `CustomToolbar` sin uso

`src/app/(runna)/mesadeentrada/ui/dataGrid/toolbar.tsx`

El componente nunca se pasa a `slots.toolbar` del `DataGrid` (a diferencia del de
`legajos-table`, que sí se usa). Además su botón de refresco no tiene `onClick`.
Se movió textualmente; es código muerto candidato a eliminación.

### B4 — `dataGrid`: `setFilterState` nunca se llama

`src/app/(runna)/mesadeentrada/ui/dataGrid/DemandaTableContent.tsx`

`filterState` sólo participa del `queryKey` de la query de demandas y su setter
no se invoca en ningún lado, con lo cual es una entrada de cache constante y
estado inerte.

### B5 — `UnifiedActividadesTable`: `excludeActors` fuera de las dependencias

`src/app/(runna)/legajo/actividades/components/UnifiedActividadesTable/hooks/useActividadesQuery.ts`

El `useMemo` de `filteredActividades` filtra por `excludeActors` pero no lo
incluye en su array de dependencias (ESLint ya lo reportaba como warning en el
archivo original). Si el padre cambia `excludeActors` sin que cambie ninguna
otra dependencia, la lista no se recalcula.

### B6 — `legajos-table`: imports muertos en el original

`fetchLegajos` y `extractArray` estaban importados y sin usar. No se arrastraron
a los módulos nuevos (mantenerlos habría sido arrastrar ruido, y quitarlos no
cambia comportamiento).

---

## Efecto colateral conocido (no es un bug de la app)

Al mover estado a hooks propios, `react-hooks/exhaustive-deps` ya no puede probar
que los setters son estables y emite 4 warnings nuevos en
`UnifiedActividadesTable.tsx` (`setDetailModalOpen`, `setEditModalOpen`,
`setCancelModalOpen`, `setAsignarModalOpen`, `setSelectedActividad`). Los arrays
de dependencias se dejaron **exactamente como estaban**, por lo que el
comportamiento en runtime es idéntico: React garantiza la identidad estable de
los setters de `useState`. Son warnings de lint, no fallan el build.
