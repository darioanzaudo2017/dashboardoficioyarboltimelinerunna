# Medida MPJ: el plan de trabajo muestra todas las actividades

**Rama:** `mejora-medida-mpj-plan-completo`  **Fecha:** 2026-11-03

## Problema
En la pantalla de una medida MPJ solo había "Control de legalidad", que muestra las actividades del **Equipo Legal** (es su tablero), más informes mensuales y calendario.
Las demás actividades de la medida (por ejemplo las del Equipo Técnico que genera un oficio de apertura) **no aparecían en ningún lado** de la medida: quien entraba creía que había una sola actividad.
En MPI y MPE no pasa porque tienen el módulo "Plan de trabajo" (que deja las actividades legales para el control de legalidad).

## Qué cambió
- La medida **MPJ** ahora tiene el módulo **"Plan de trabajo"**, primero y abierto por defecto, con **todas** las actividades: técnicas, residenciales y legales.
- **"Control de legalidad"** sigue como estaba, con las actividades tipificadas como Equipo Legal (tablero Pendiente de revisión / Próximo a vencer / Vencido / Finalizados).
- En MPI y MPE el plan sigue sin las actividades legales (no cambia nada).

## Archivos
| Archivo | Qué hace |
|---|---|
| `.../restyle/medida-modulos-config.tsx` | MPJ agrega el módulo Plan de trabajo (primero y abierto por defecto) |
| `.../mpe-tabs/plan-trabajo-tab.tsx` | Nueva opción `incluirLegales` para no excluir al Equipo Legal |

## Cómo probarlo
`/legajo/176/medida/252` (MPJ abierta con un oficio): en "Módulos activos" la primera pestaña, "Plan de trabajo", lista las 5 actividades (1 de Legales y 4 del Equipo Técnico); "Control de legalidad" muestra solo la de Legales.
También se ve en la vista clásica de una MPJ (comparte los módulos).

## Verificación
Tipos sin errores. Probado en el navegador (admin) con `MED-2026-252`: antes se veía 1 actividad en el tablero, ahora el plan lista las 5.

## Pendiente / notas
- Esta rama toca `medida-modulos-config.tsx`, igual que `mejora-medida-mpe-guia` (que agrega `ocultarEstadisticasPlan`): al unirlas puede pedir resolver un conflicto chico en `buildPlanModule` y `buildMedidaModulos`; conservar los dos cambios.
- En la vista nueva, el plan de la MPJ repite los contadores que ya muestra el resumen de arriba (lo que `mejora-medida-mpe-guia` evita en MPE); al unir las ramas conviene pasarle `ocultarEstadisticasPlan` también a la MPJ.
