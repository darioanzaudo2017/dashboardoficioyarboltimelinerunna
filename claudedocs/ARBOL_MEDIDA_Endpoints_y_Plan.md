# Vista "Árbol" de Medida — Inventario de Endpoints y Plan

> Estado: investigación completa, implementación no iniciada. Continuar desde acá.
> Objetivo: nueva página que muestre, a modo de árbol/timeline jerárquico, todo lo que fue sucediendo en una medida (acciones de los distintos equipos a lo largo del tiempo).

## TL;DR

El backend ya centraliza casi todo lo necesario en un módulo de historial unificado (PLTM-04). **No hace falta crear endpoints nuevos** salvo, quizás, uno que devuelva equipo/zona junto al usuario en cada evento (ver Gap #3 abajo). El trabajo es principalmente de **re-visualización jerárquica en el frontend** sobre datos que ya existen, planos y auditables.

---

## 1. Endpoints núcleo para el árbol

### `GET /medidas/{id}/historial-seguimiento/`
Feed unificado de eventos, paginado (20/página) y filtrable por `fecha_desde/hasta, tipo_evento, tipos_evento (CSV), categoria, etapa, etapa_tipo, usuario, search, page, page_size`.

Shape de cada evento (`HistorialEventoItem`):
```ts
{
  id: number
  tipo_evento: TipoEvento            // 36 valores
  tipo_evento_display: string
  categoria: 'ACTIVIDAD'|'INTERVENCION'|'ETAPA'|'INFORME'|'SEGUIMIENTO'|'MEDIDA'|'OFICIO'|'MANUAL'
  descripcion_automatica: string     // texto humano generado por backend
  fecha_evento: string (ISO)
  usuario: { id, username, nombre_completo } | null
  etapa: { id, tipo_etapa, tipo_etapa_display, estado, estado_display } | null
  actividad_id?, intervencion_id?, informe_id?
  deep_link: { tipo, medida_id, actividad_id?, etapa_id?, url } | null
  datos_evento?: DatosEvento | null  // ej. antes/después de un cambio
}
```

Endpoints hermanos:
- `GET /medidas/{id}/historial-seguimiento/{eventoId}/` — detalle de un evento
- `GET /medidas/{id}/historial-seguimiento/tipos/` — catálogo de tipos agrupados por categoría (para filtros)
- `GET /medidas/{id}/historial-seguimiento/resumen/` — agregados: total, por tipo, por categoría, primer/último evento
- `GET /medidas/{id}/historial-seguimiento/exportar/` — CSV (blob)
- `GET /historial-seguimiento-global/` — mismo shape, cross-medida (solo admin)

Servicio: `historial-seguimiento-api-service.ts`. Hooks (React Query, ya listos): `useHistorialSeguimiento`, `useHistorialEventoDetail`, `useHistorialTipos`, `useHistorialResumen`, `useExportHistorial`, `useInvalidateHistorial`, `usePrefetchHistorial` — en `hooks/useHistorialSeguimiento.ts`.

### `GET /medidas/{id}/trazabilidad-etapas/` (+ `/compacta/`, + `/exportar/`)
Estructura por etapa — **esqueleto ideal para las ramas principales del árbol** (una rama por etapa: Apertura → Innovación → Prórroga → Cese → Post-Cese).

```ts
{
  medida: { id, numero_medida, tipo_medida, estado_vigencia, fecha_apertura, fecha_cierre, duracion_dias }
  etapas_timeline: EtapaTimeline[]      // cada una con transiciones_estado: TransicionEstado[]
                                         // (fecha, tipo_cambio +/~/-, estado anterior→nuevo, usuario)
  vigencia_timeline: VigenciaTimeline[] // cambios VIGENTE/CESADA (fecha, usuario, tipo_cambio)
  etapa_actual: EtapaTimeline | null
  resumen: { total_etapas, etapas_activas, etapas_cerradas, etapas_por_tipo, duracion_total_dias, flujo_esperado }
}
```
`/compacta/` da una versión resumida (`etapas[]` con orden/fechas/duración/activa + `flujo{esperado, real, proximas_posibles, completado}`) — usada hoy por el stepper visual.

Hooks: `useTrazabilidadEtapas`, `useTrazabilidadCompacta`, `useExportTrazabilidad`.

---

## 2. Endpoints de drill-down (para expandir un nodo del árbol)

| Endpoint | Para qué |
|---|---|
| `GET /actividades/{id}/historial/` | Auditoría inmutable de una actividad: `tipo_accion` (CREACION, CAMBIO_ESTADO, EDICION_CAMPOS, REAPERTURA, ASIGNACION, ADJUNTO_AGREGADO, COMENTARIO, VISADO_APROBADO/RECHAZADO, TRANSFERENCIA), usuario, fecha, `campos_modificados{antes,despues}` |
| `GET /actividades/{id}/transferencias/` | Traspasos entre equipos/zonas — **único lugar donde aparece "equipo" explícito**, no solo usuario (`equipo_origen/destino`, `responsable_anterior/nuevo`) |
| `GET /medidas/{id}/ratificacion/historial/` | Historial de ratificaciones judiciales (activas + inactivas) |
| `GET /medidas/{id}/cambio-lugar/historial/` | Historial de cambios de resguardo |
| `GET /medidas/{id}/situacion-dispositivo/` (lista) | Historial de situaciones del NNyA en dispositivo, DESC |
| `GET /actividades/{id}/lecturas/` | Quién leyó la actividad y cuándo |

---

## 3. Resto de endpoints de "medida" (contexto, no cronológicos por sí solos)

Ver detalle completo abajo en el Anexo. Resumen por módulo:

- **Medida CRUD**: `legajo-mesa/api/medidas-api-service.ts` — create/list/detail/all. `MedidaDetailResponse` trae `historial_etapas: EtapaMedida[]` embebido.
- **Legajos vinculados**: `medida-legajos-api-service.ts` — vincular/desvincular legajo adicional (medidas compartidas MPJ).
- **Etapas/Estados**: `etapa-api-service.ts`, `etapa-detail-api-service.ts`, `estado-etapa-api-service.ts` — `transicionarEtapa`, `getEtapaDetail` (endpoint unificado etapa + documentos), catálogo de estados.
- **Intervenciones (MED-02)**: `intervenciones-api-service.ts` — CRUD + flujo enviar/aprobar/rechazar + adjuntos.
- **Nota de Aval (MED-03)**: `nota-aval-api-service.ts` — decisión Director (APROBAR/OBSERVAR) + adjuntos.
- **Informe Jurídico (MED-04)**: `informe-juridico-api-service.ts` — crear/enviar/enviar-a-juzgado + adjuntos.
- **Ratificación Judicial (MED-05)**: `ratificacion-judicial-api-service.ts` — decisión + historial.
- **Cese de Medida**: `cese-medida-api-service.ts` (MPI directo, MPE en 2 fases) + `informe-cierre-api-service.ts`.
- **Informes de Seguimiento mensuales (PLTM-03)**: `informe-seguimiento-api-service.ts` — completar, plantilla, adjuntos.
- **Seguimiento en Dispositivo**: `seguimiento-dispositivo-api-service.ts` — situación, info educativa/salud, talleres, cambio de lugar, notas de seguimiento.
- **Personas relacionadas / Persona / Localización / Vulnerabilidad**: contexto del NNyA, no cronológico.
- **Actividades (Plan de Trabajo, PLTM-01/02)**: `services/actividadService.ts` — las acciones concretas que ejecutan los equipos; incluye `historial`, `transferencias`, `visar`, `visar-jz`, `comentarios`, `lecturas`.
- **Actividades globales**: `legajo/actividades/services/globalActividadService.ts` — filtro por `medida=X` para listar actividades cross-plan.
- **Documentos / Repositorio**: `descarga-masiva-api-service.ts` — ZIP de adjuntos de todos los módulos.

---

## 4. Componente de historial ya existente (no reinventar)

Ubicación: `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/historial/`

`historial-tab.tsx` renderiza 2 sub-tabs, ambos consumen **solo** los endpoints de la sección 1 (nada de intervenciones/actividades directo):

1. **Timeline Unificado** (`historial-timeline.tsx`): `useHistorialSeguimiento` (lista paginada) + `useHistorialResumen` (tarjetas de stats) + filtros (`historial-filters.tsx`) + export CSV. Cada evento se pinta con `historial-event-card.tsx` (ícono/color por categoría, descripción automática, tiempo relativo, usuario, chip de etapa, botón "ver detalle" — **hoy solo hace `console.log`, deep_link no implementado**).
2. **Trazabilidad de Etapas**: `trazabilidad-stepper.tsx` (usa `/compacta/`, dibuja Stepper MUI horizontal con duración por etapa) + `trazabilidad-detalle.tsx` (usa el endpoint completo, accordion por etapa con tabla de transiciones + tab de vigencia).

### Gaps del componente actual (oportunidad para el árbol nuevo)
1. **No es jerárquico** — todo es lista lineal, no agrupa etapa→categoría→evento como árbol.
2. **`deep_link` no implementado** — no navega al recurso real (intervención, actividad, etc.).
3. **No distingue "equipo responsable"**, solo usuario individual (el dato de equipo solo aparece en `GET /actividades/{id}/transferencias/`).
4. **No arma relaciones causa-efecto** entre eventos (ej. actividad → intervención generada → nota de aval que la resolvió).

---

## 5. Plan propuesto para la nueva vista de árbol

Estructura jerárquica sugerida:
```
Medida (raíz)
└── Etapa (Apertura, Innovación, Prórroga, Cese, Post-Cese...)   ← de trazabilidad-etapas
    └── Categoría (Actividad, Intervención, Informe, Seguimiento, Oficio, Manual...)  ← de historial-seguimiento
        └── Evento individual (fecha, usuario, descripción)      ← nodo hoja
            └── (drill-down opcional) historial/transferencias si el evento es de una actividad
```

Pasos concretos:
1. **Fuente de datos**: reusar `getHistorialSeguimiento` (todos los eventos, sin paginar para el árbol — evaluar si el backend permite `page_size` grande o hay que paginar y acumular) + `getTrazabilidadEtapas` para el esqueleto de ramas por etapa. No crear endpoints nuevos salvo que el Gap #3 (equipo) resulte imprescindible.
2. **Agrupación en frontend**: armar un árbol `etapa → categoria → eventos[]`, ordenado cronológicamente dentro de cada rama.
3. **Nodo hoja interactivo**: al hacer click, navegar de verdad usando `deep_link.url` (implementar lo que hoy es placeholder) o abrir un panel de detalle in-page.
4. **Drill-down de actividad**: cuando el evento tiene `actividad_id`, permitir expandir para traer `GET /actividades/{id}/historial/` y `GET /actividades/{id}/transferencias/` (para mostrar equipo origen/destino).
5. **Filtros**: reusar los que ya definió `HistorialSeguimientoQueryParams` (fecha, tipo, categoría, usuario, etapa, búsqueda) en la nueva UI de árbol.
6. **Dónde vive la página**: evaluar si es un tab nuevo dentro de `historial-tab.tsx` (ej. "Vista Árbol") o una ruta separada dentro de `legajo/[id]/medida/[medidaId]/`.

### Decisiones pendientes a definir mañana
- ¿Tab nuevo dentro del historial existente, o ruta/página separada?
- ¿Librería para el árbol (custom con MUI TreeView / `@mui/x-tree-view`, o diseño custom tipo timeline vertical con ramas)?
- ¿Cuán profundo el drill-down? (¿solo hasta evento, o hasta campo modificado individual?)
- ¿Resolver el Gap de "equipo responsable" cruzando con transferencias, o pedir al backend que lo agregue directo en `HistorialEventoItem`?

---

## Anexo — Tabla completa de endpoints por módulo

### Medida CRUD (`legajo-mesa/api/medidas-api-service.ts`)
| Método | Path | Función |
|---|---|---|
| POST | `/legajos/{legajoId}/medidas/` | `createMedida` |
| GET | `/legajos/{legajoId}/medidas/` | `getMedidasByLegajo` |
| GET | `/medidas/{id}/?legajo_id=` | `getMedidaDetail` |
| GET | `/medidas/` | `getAllMedidas` (paginado, filtros) |

### Legajos vinculados
| Método | Path | Función |
|---|---|---|
| POST | `/medidas/{medidaId}/legajos/` | `vincularLegajoAdicional` |
| DELETE | `/medidas/{medidaId}/legajos/{legajoId}/` | `desvincularLegajoAdicional` |

### Etapas y Estados
| Método | Path | Función |
|---|---|---|
| POST | `/medidas/{id}/transicionar-etapa/` | `transicionarEtapa` |
| GET | `/medidas/{id}/etapa/{tipo_etapa}/?etapa_id=&legajo_id=` | `getEtapaDetail` (+wrappers por tipo) |
| GET | `/estados-etapa-medida/` | `getAllEstados` |
| GET | `/estados-etapa-medida/{id}/` | `getEstadoById` |
| GET | `/estados-etapa-medida/{id}/siguiente/` | `getNextEstado` |

### Intervenciones (MED-02)
| Método | Path | Función |
|---|---|---|
| POST | `/medidas/{id}/intervenciones/` | `createIntervencion` |
| GET | `/medidas/{id}/intervenciones/` | `getIntervencionesByMedida` |
| GET/PATCH/DELETE | `/medidas/{id}/intervenciones/{intId}/` | detail/update/delete |
| POST | `/medidas/{id}/intervenciones/crear-y-enviar/` | `crearYEnviarIntervencion` |
| PATCH | `/medidas/{id}/intervenciones/{intId}/enviar/` | `enviarIntervencion` |
| POST | `/medidas/{id}/intervenciones/{intId}/aprobar/` | `aprobarIntervencion` |
| POST | `/medidas/{id}/intervenciones/{intId}/rechazar/` | `rechazarIntervencion` |
| POST/GET/DELETE | `.../adjuntos[/batch|-list]/` | manejo de adjuntos |
| GET | `/categorias/`, `/tipos-dispositivo/` | catálogos |

### Nota de Aval (MED-03)
| Método | Path | Función |
|---|---|---|
| GET | `/medidas/{id}/nota-aval/` | `getNotasAvalByMedida` |
| GET | `/medidas/{id}/nota-aval/{notaId}/` | `getNotaAvalDetail` |
| POST | `/medidas/{id}/nota-aval/` | `createNotaAval` |
| POST/GET/DELETE | `.../adjuntos[-list]/` | adjuntos |

### Informe Jurídico (MED-04)
| Método | Path | Función |
|---|---|---|
| GET/POST/PATCH | `/medidas/{id}/informe-juridico/[{infId}/]` | list/detail/create/update |
| POST | `.../enviar/`, `.../crear-y-enviar/`, `.../enviar-a-juzgado/` | flujo de envío |
| POST/GET/DELETE | `.../adjuntos[-list]/` | adjuntos |

### Ratificación Judicial (MED-05)
| Método | Path | Función |
|---|---|---|
| GET/POST/PATCH | `/medidas/{id}/ratificacion/` | consultar/crear/editar (singleton) |
| GET | `/medidas/{id}/ratificacion/historial/` | histórico completo |

### Cese / Cierre
| Método | Path | Función |
|---|---|---|
| POST | `/medidas/{id}/cesar-medida/` | `cesarMedidaMPI` |
| POST | `/medidas/{id}/solicitar-cese/` | `solicitarCeseMPE` (2 fases) |
| GET/POST | `/medidas/{id}/informe-cierre/` | list/create |
| POST/GET/DELETE | `.../adjuntos/` | adjuntos |

### Informes de Seguimiento mensuales (PLTM-03)
| Método | Path | Función |
|---|---|---|
| GET | `/medidas/{id}/informes-seguimiento/[{infId}/]` | list/detail |
| POST | `.../completar/`, `.../subir-plantilla/` | completar informe |
| GET | `.../plantilla/`, `.../plantilla/descargar/` | plantilla |
| GET/POST/DELETE | `.../adjuntos/` | adjuntos |

### Seguimiento en Dispositivo
| Método | Path | Para qué |
|---|---|---|
| GET/POST/PUT | `/medidas/{id}/seguimiento/` | datos generales (legacy) |
| POST/GET | `/medidas/{id}/situacion-dispositivo/[/actual/]` | situación NNyA |
| GET/PATCH | `/medidas/{id}/info-educativa/`, `/info-salud/` | info NNyA |
| CRUD | `/medidas/{id}/talleres/[{id}/]` | talleres |
| POST/GET | `/medidas/{id}/cambio-lugar/[/historial/]` | cambio de resguardo |
| CRUD | `/medidas/{id}/notas-seguimiento/[{id}/]` | notas libres |

### Actividades (Plan de Trabajo, PLTM-01/02)
| Método | Path | Para qué |
|---|---|---|
| GET/POST/PATCH/DELETE | `/actividades/[{id}/]` | CRUD (multipart, soft-delete con motivo) |
| POST | `.../adjuntos/`, `.../comentarios/` | adjuntos y comentarios |
| POST | `.../cambiar-estado/` | transición de estado |
| GET | `.../historial/` | auditoría inmutable |
| POST | `.../reabrir/` | reabrir (JZ/Director/Admin) |
| GET/POST | `.../transferencias/`, `.../transferir/` | equipo origen/destino |
| POST | `.../visar/`, `.../visar-jz/` | aprobación Legal/JZ |
| PATCH/POST | `/actividades/bulk-update/`, `/bulk-transferir/` | operaciones masivas |
| POST/GET | `.../marcar-leida/`, `.../lecturas/`, `.../leida-por-mi/` | lecturas |
| PATCH | `.../responsables/` | reasignar responsables secundarios |
| GET | `/tipos-actividad-plan-trabajo/`, `/subtipos-actividad-plan-trabajo/` | catálogos |

### Actividades globales
`legajo/actividades/services/globalActividadService.ts` — `GET /actividades/` con filtros extensos incluyendo `medida` (id, tipo_medida).

### Documentos / Repositorio
`descarga-masiva-api-service.ts` — `POST /repositorio-documentos/descarga-masiva/` (ZIP de adjuntos de todos los módulos).

---

## Archivos relevantes (mapa rápido)

```
src/app/(runna)/legajo/[id]/medida/[medidaId]/
├── api/
│   ├── historial-seguimiento-api-service.ts   ← núcleo del árbol
│   ├── etapa-detail-api-service.ts
│   ├── intervenciones-api-service.ts
│   ├── nota-aval-api-service.ts
│   ├── informe-juridico-api-service.ts
│   ├── ratificacion-judicial-api-service.ts
│   ├── cese-medida-api-service.ts
│   ├── informe-cierre-api-service.ts
│   ├── informe-seguimiento-api-service.ts
│   ├── seguimiento-dispositivo-api-service.ts
│   ├── estado-etapa-api-service.ts / etapa-api-service.ts
│   ├── medida-legajos-api-service.ts
│   └── workflow-api-facade.ts                 ← adapter que unifica lectura/escritura
├── hooks/
│   ├── useHistorialSeguimiento.ts             ← hooks React Query listos para reusar
│   ├── useEtapaDetail.ts / useWorkflowData.ts
│   └── ...
├── types/
│   ├── historial-seguimiento-api.ts
│   └── medida-api.ts
├── services/actividadService.ts               ← historial/transferencias de actividad
└── components/medida/historial/
    ├── historial-tab.tsx                      ← entrada, 2 sub-tabs
    ├── historial-timeline.tsx                 ← timeline unificado (a superar/extender)
    ├── historial-event-card.tsx
    ├── historial-filters.tsx
    ├── trazabilidad-stepper.tsx
    └── trazabilidad-detalle.tsx

src/app/(runna)/legajo/actividades/services/globalActividadService.ts  ← actividades cross-medida
```
