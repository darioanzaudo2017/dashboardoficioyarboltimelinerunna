# Cambios por rama

Cada mejora se entrega en **una rama chica, con su propio documento** en esta carpeta.
Así se puede revisar, probar y mergear (o descartar) de a una.

## Convención

| Qué | Cómo |
|---|---|
| Rama | `mejora-<tema-corto>` (ej. `mejora-aviso-coincidencias`), siempre a partir de `main` |
| Documento | `claudedocs/cambios/AAAA-MM-DD_<tema-corto>.md`, en el mismo commit que el código |
| Alcance | Un solo tema por rama. Si aparece otro, va en otra rama |
| Tests | Lo que se pueda probar sin navegador lleva test en `tests/unit/` |
| Verificación | Se prueba en el navegador y se anota qué se vio |
| Backend | Lo que no se arregla desde el front **no** se parchea: va a `OBSERVACIONES_BACKEND_*.md` |

## Plantilla del documento

```md
# <Título del cambio>

**Rama:** `mejora-...`  **Fecha:** AAAA-MM-DD

## Problema
Qué pasaba antes y a quién le molestaba.

## Qué cambió
Lista corta de cambios visibles para el usuario.

## Archivos
| Archivo | Qué hace |

## Cómo probarlo
Pasos concretos para ver el cambio.

## Verificación
Tests, tipos y qué se comprobó en el navegador.

## Pendiente / notas
Límites conocidos, dependencias del backend, ideas siguientes.
```

## Índice

| Fecha | Rama | Tema |
|---|---|---|
| 2026-10-23 | `mejoras-ux-front` | Registro de demanda y asignación (errores, navegación, mensajes) — ver [OBSERVACIONES_BACKEND_2026-10-23.md](../OBSERVACIONES_BACKEND_2026-10-23.md) |
| 2026-10-25 | `mejora-aviso-coincidencias` | Aviso de posibles coincidencias: compacto, abajo a la derecha, con alerta y animación — [documento](2026-10-25_aviso-coincidencias.md) |
| 2026-10-25 | `mejora-borrador-paso` | El borrador del registro vuelve al paso donde se estaba — [documento](2026-10-25_borrador-paso.md) |
| 2026-10-25 | `mejora-constatacion-textos` | Nombres con tildes y textos en español en Constatación — [documento](2026-10-25_constatacion-textos.md) |
| 2026-10-25 | `mejora-constatacion-feedback` | Avisos que se perdían (contenedor duplicado) y confirmaciones — [documento](2026-10-25_constatacion-feedback.md) |
| 2026-10-27 | `mejora-constatacion-evaluacion` | Contadores en las pestañas y botón "Enviar a Evaluación" a la vista — [documento](2026-10-27_constatacion-evaluacion.md) |
| 2026-10-27 | `mejora-navegacion-evaluacion` | La fila de una demanda en evaluación ofrece "Ver constatación" o "Ir a la evaluación" — [documento](2026-10-27_navegacion-evaluacion.md) |
| 2026-10-27 | `mejora-evaluacion-cierre` | Panel de 3 pasos en Evaluación (borrador, informe firmado, solicitud) con confirmaciones — [documento](2026-10-27_evaluacion-cierre.md) |
| 2026-10-27 | `mejora-evaluacion-errores-firmantes` | Motivo del error del servidor en Evaluación y bucle de firmantes corregido — [documento](2026-10-27_evaluacion-errores-firmantes.md) |
| 2026-10-29 | `mejora-evaluacion-chequeo-legajo` | Aviso de legajo y medidas vigentes antes de pedir o autorizar una medida — [documento](2026-10-29_evaluacion-chequeo-legajo.md) |
| 2026-11-03 | `mejora-legajo-resumen-medidas` | Legajo: resumen por medida (tarjetas con avance, equipos y última actividad) y botón para volver desde el plan de trabajo — [documento](2026-10-29_legajo-resumen-medidas.md) |
| 2026-11-03 | `mejora-medida-mpe-guia` | Medida MPE (vista nueva): cartel de primer paso, contadores sin repetir y estados legibles — [documento](2026-11-03_medida-mpe-guia.md) |
| 2026-11-03 | `mejora-actividades-fecha-contadores` | Actividades: fecha sin corrimiento de día y encabezado de la medida que se actualiza — [documento](2026-11-03_actividades-fecha-contadores.md) |
| 2026-11-03 | `mejora-medida-mpe-dispositivo` | Medida MPE (vista nueva): configuración de dispositivo a la vista y comparación con la vista clásica — [documento](2026-11-03_medida-mpe-dispositivo.md) |
| 2026-11-03 | `mejora-medida-mpe-cabecera` | Medida (vista nueva): franja compacta con el NNyA, el equipo y el plazo de 90 días — [documento](2026-11-03_medida-mpe-cabecera.md) |
| 2026-11-03 | `mejora-intervencion-documentacion` | Registro de intervención (paso 3): notificaciones y actas, documentación complementaria y errores de adjuntos visibles — [documento](2026-11-03_intervencion-documentacion.md) |
| 2026-11-03 | `mejora-oficio-actividades-bandeja` | Demandas de oficio: ver y asignar sus actividades desde la Mesa de Entradas — [documento](2026-11-03_oficio-actividades-bandeja.md) |
| 2026-11-03 | `mejora-medida-mpj-plan-completo` | Medida MPJ: el plan de trabajo muestra todas las actividades (no solo las de Legales) — [documento](2026-11-03_medida-mpj-plan-completo.md) |
| 2026-11-03 | `mejora-oficio-avisos-errores` | Oficio judicial: circuito solo MPJ, avisos y errores más claros (evidencia, visado, DNI repetido, detalle que se actualiza) — [documento](2026-11-03_oficio-avisos-errores.md) |
| 2026-11-03 | `mejora-oficio-cese-aviso` | Carga de oficios: texto que explica que el cese lo dispone el juzgado y que la medida elegida se cierra al guardar — [documento](2026-11-03_oficio-cese-aviso.md) |
| 2026-11-03 | `mejora-oficio-vinculo-guia` | Oficio MPE/MPI vigente: tipo de vínculo preseleccionado, errores en el campo, avisos dentro del vínculo y mensaje de guardado claro — [documento](2026-11-03_oficio-vinculo-guia.md) |
| 2026-11-03 | `mejora-oficio-orden-medida` | Oficio MPE/MPI vigente: Clasificación junto a los vínculos y medida vigente obligatoria (solo vigentes) — [documento](2026-11-03_oficio-orden-medida.md) |
| 2026-11-03 | `mejora-derivar-demanda-texto` | Derivar demanda: texto que aclara que el estado cambia solo con uno o más responsables — [documento](2026-11-03_derivar-demanda-texto.md) |
| 2026-11-03 | `mejora-pantalla-completa` | Demandas y legajos: botón "Pantalla completa" visible y una sola X de cerrar en el panel lateral — [documento](2026-11-03_pantalla-completa-boton.md) |
| 2026-11-03 | `mejora-link-tutorial` | Barra superior: el ícono del manual abre el tutorial publicado (GitHub Pages) — [documento](2026-11-03_link-tutorial.md) |
| 2026-11-03 | `mejora-boton-cargar-apertura` | Apertura: el botón "Nueva Intervención" pasa a "Cargar Apertura" — [documento](2026-11-03_boton-cargar-apertura.md) |
| 2026-11-03 | `mejora-fecha-cierre-medida` | Fecha de cierre de la medida: ya no se ve un día antes (el back la manda a medianoche UTC) — [documento](2026-11-03_fecha-cierre-medida.md) |
| 2026-11-03 | `mejora-informe-juridico-adjuntos-tecnico` | Informe jurídico: Equipo Legal ve los documentos que cargó el técnico (informe obligatorio y adjuntos) — [documento](2026-11-03_informe-juridico-adjuntos-tecnico.md) |
| 2026-11-03 | `mejora-pagina-ninos-por-dispositivo` | Página nueva "Dispositivos": cantidad de niños por tipo de dispositivo e institución o familia — [documento](2026-11-03_pagina-ninos-por-dispositivo.md) |
| 2026-11-03 | `mejora-legajo-boton-asignar` | Legajo: botón "Asignar responsable" cuando no tiene técnico asignado — [documento](2026-11-03_legajo-boton-asignar.md) |
| 2026-11-04 | `mejora-evaluacion-justificacion-tecnico` | Evaluación: la justificación del técnico se pide antes de enviar la solicitud (el servidor la exige) — [documento](2026-11-04_evaluacion-justificacion-tecnico.md) |
| 2026-11-04 | `mejora-evaluacion-justificacion-director` | Evaluación: la justificación del director se pide antes de autorizar o no autorizar (el servidor la exige) — [documento](2026-11-04_evaluacion-justificacion-director.md) |
| 2026-11-04 | `mejora-fechas-ratificacion-informe` | Ratificación judicial e informe jurídico: las fechas de calendario ya no se ven un día antes — [documento](2026-11-04_fechas-ratificacion-informe.md) |
| 2026-11-04 | `mejora-evaluacion-archivo-nombre-fecha` | Evaluación: el archivo cargado ya no muestra la URL firmada, un "0" ni "Invalid Date" — [documento](2026-11-04_evaluacion-archivo-nombre-fecha.md) |
| 2026-11-04 | `traer-original-mpi` | MPI: dos arreglos traídos del repositorio original (etiqueta de la etapa y Seguimiento en curso) — [documento](2026-11-04_traidas-del-original-mpi.md) |
| 2026-11-04 | `mejora-observacion-rechazo-visible` | Intervención rechazada: el motivo del Jefe Zonal se ve en la tarjeta de la etapa y arriba del modal — [documento](2026-11-04_observacion-rechazo-visible.md) |

## Orden recomendado para unir las ramas

Unir **de a una**, en este orden, probando en pantalla y con `npx vitest run` entre medio.
Usar **"Create a merge commit"** (no squash ni rebase): `mejora-evaluacion-chequeo-legajo` sale de `mejora-evaluacion-cierre`
y GitHub debe conservar esa relación. Los dos conflictos conocidos están marcados en la tabla y ya vienen resueltos en la rama `integracion`.

| # | Rama | Notas |
|---|---|---|
| 1 | `mejora-constatacion-textos` | Base de los textos en español. |
| 2 | `mejora-constatacion-feedback` | **Conflicto en `EnviarRespuestaModal.tsx`** (imports de `demandaGridLocaleText` y `ConfirmDialog`): conservar los dos. Trae `ConfirmDialog.tsx`. |
| 3 | `mejora-constatacion-evaluacion` | Usa el mismo `ConfirmDialog` (idéntico a propósito). Toca `DemandaDetail.tsx`. |
| 4 | `mejora-aviso-coincidencias` | Independiente. |
| 5 | `mejora-borrador-paso` | Toca `MultiStepForm.tsx`. |
| 6 | `mejora-navegacion-evaluacion` | Toca `DemandaDetail.tsx` y `DemandaTableContent.tsx`. |
| 7 | `mejora-evaluacion-cierre` | Debe ir antes que la 9. |
| 8 | `mejora-evaluacion-errores-firmantes` | Toca `action-buttons.tsx` y `apiErrorFormatter.ts`. |
| 9 | `mejora-evaluacion-chequeo-legajo` | **Conflicto en los imports de `action-buttons.tsx`**: conservar los dos lados. Depende de la 7. |
| 10 | `mejora-legajo-resumen-medidas` | Independiente de las demás (solo toca el legajo). Puede ir en cualquier lugar. |
| 11 | `mejora-medida-mpe-guia` | Independiente. Toca `medida-detail.tsx` y la tabla de actividades (`hideStatistics`). |
| 12 | `mejora-actividades-fecha-contadores` | Independiente. Toca `UnifiedActividadesTable.tsx` (se une sin conflicto con la 11). |
| 13 | `mejora-medida-mpe-dispositivo` | Independiente. Toca `medida-detail.tsx` (se une sin conflicto con la 11). |
| 14 | `mejora-medida-mpe-cabecera` | Toca `medida-detail.tsx`. **Conflicto con la 13 en los imports** (conservar `ConfiguracionMPESection` y `MedidaFicha`). |
| 15 | `mejora-intervencion-documentacion` | Independiente (modal de intervención). |
| 16 | `mejora-oficio-actividades-bandeja` | Toca `columns.tsx`, `DemandaTableContent.tsx` y `DemandaDetail.tsx`. **Conflicto con la 6** (`mejora-navegacion-evaluacion`) en `columns.tsx` (imports) y en `DemandaTableContent.tsx` (el modal "en evaluación" y `ActividadesDeOficioModal`): conservar los dos lados. |
| 17 | `mejora-medida-mpj-plan-completo` | Toca `medida-modulos-config.tsx` y `plan-trabajo-tab.tsx`. **Conflicto con la 11** (`mejora-medida-mpe-guia`): el plan acepta a la vez `ocultarEstadisticas` (11) e `incluirLegales` (17); en la MPJ llamar `buildPlanModule(..., ocultarEstadisticasPlan, true)`. |
| 18 | `mejora-oficio-avisos-errores` | Toca `MultiStepForm.tsx` (**conflicto en los imports con la 5**, `mejora-borrador-paso`: conservar `esProblemaDelServidor` y `resolveResumeStep`), `apiErrorFormatter.ts`, `UnifiedActividadesTable.tsx` y el modal de cambio de estado. |
| 19 | `mejora-oficio-cese-aviso` | Toca `CargaOficiosForm.tsx`. **Conflicto con la 18** (dos líneas contiguas: `watchedCircuito` de la 18 y `esOficioDeCese` de la 19): conservar las dos. |
| 20 | `mejora-oficio-vinculo-guia` | Toca `MultiStepForm.tsx` (se une solo) y `VinculosManager.tsx`. |
| 21 | `mejora-oficio-orden-medida` | **Va después de la 20** (parte de ella): reordena `OficioJudicialMPEStep.tsx` y toca `VinculosManager.tsx`. |
| 22 | `mejora-derivar-demanda-texto` | Independiente (solo `asignarModal.tsx`). |
| 23 | `mejora-pantalla-completa` | Toca `DemandaDetail.tsx` y `legajo-detail.tsx` (se une sin conflicto con la 16 y la 10). |
| 24 | `mejora-link-tutorial` | Independiente (solo `Navbar.tsx`). |
| 25 | `mejora-boton-cargar-apertura` | Independiente (solo `apertura-section.tsx`). |
| 26 | `mejora-fecha-cierre-medida` | Toca `dateUtils.ts` (se une sin conflicto con la 12, que usa `toDateObject`). |
| 27 | `mejora-informe-juridico-adjuntos-tecnico` | Toca `informe-juridico-section.tsx` y `buildWorkflowSteps.tsx`. |
| 28 | `mejora-pagina-ninos-por-dispositivo` | Toca `Navbar.tsx` (se une sin conflicto con la 24, `mejora-link-tutorial`). |
| 29 | `mejora-legajo-boton-asignar` | Toca `legajo-detail.tsx` y `legajo-header.tsx` (se une sin conflicto con la 23). |
| 30 | `mejora-evaluacion-justificacion-tecnico` | Toca `evaluacion-tabs.tsx` y `action-buttons.tsx` (se une sin conflicto). |
| 31 | `mejora-evaluacion-justificacion-director` | Va después de la 30 (mismos archivos); se une sin conflicto. |
| 32 | `mejora-fechas-ratificacion-informe` | Toca tres componentes de la medida y usa `toDateObject` (ver la 26); se une sin conflicto. |
| 33 | `mejora-evaluacion-archivo-nombre-fecha` | Toca `file-management.tsx` y `fileUtils.ts` (se une sin conflicto). |
| 34 | `traer-original-mpi` | Dos ramas del original (`santiago6124`); se une sin conflicto, verificado con simulación de merge. |
| 35 | `mejora-observacion-rechazo-visible` | Toca `apertura-section.tsx` e `IntervencionModal.tsx`; archivos nuevos aparte. |

La rama **`integracion`** ya tiene las 19 unidas (de la 10 en adelante son casi independientes; los conflictos conocidos están marcados en la tabla) (merge commits, tipos sin errores, 59 tests pasando).

## Para el equipo de backend

- [OBSERVACIONES_BACKEND_2026-10-23.md](../OBSERVACIONES_BACKEND_2026-10-23.md): problemas B1 a B11 (registro de demanda y asignación).
- [PEDIDO_VALIDACION_BACKEND_2026-10-29.md](../PEDIDO_VALIDACION_BACKEND_2026-10-29.md): B12 a B17 (DNI duplicado, legajo por DNI, medida vigente,
  estado de la demanda, justificaciones obligatorias). Decisiones pendientes del cliente: bloquear o solo avisar.
