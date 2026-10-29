# Legajo: resumen por medida (prototipo)

Rama: `mejora-legajo-resumen-medidas` (sale de `main`). Solo front. **Prototipo para validar con los usuarios.**

## Problema
Un legajo puede tener muchas medidas y para saber qué se hizo en cada una había que ir a Plan de Trabajo, abrir el selector
"Medida" y mirar cada una por separado (por defecto aparece la más nueva). En General, "Registro de medidas tomadas" era una
tabla con tipo, número, fecha, estado y duración, sin nada de lo que hicieron los equipos.

## Cambio
En la pestaña **General**, "Registro de medidas tomadas" muestra **una tarjeta por medida** (vigentes primero, la más nueva arriba):
- tipo, número, estado, etapa actual, fecha de apertura / cierre y duración;
- **barra de avance** y "X de N actividades completadas", con chips de pendientes, en progreso, por visar, vencidas, canceladas y realizadas;
- **equipos** que intervinieron y cuántas actividades tiene cada uno (Técnico, Legal, Residencial, Adultos/Institución);
- **última actividad realizada** (fecha, nombre y equipo) y **próxima actividad planificada**;
- **advertencia** si hay otra medida vigente del mismo tipo en el legajo (posible duplicado);
- botones **"Ver medida"** y **"Ver plan de trabajo"**: este último pasa a la pestaña Plan de Trabajo con esa medida ya elegida.

Un selector **Resumen / Tabla** permite volver a la tabla anterior (que no se tocó).

## Cómo se calculan los números
Con los mismos criterios que el tablero del Plan de Trabajo (`UnifiedActividadesTable`), para que no haya dos cifras distintas de la misma medida:
`pendientes` = estado PENDIENTE (incluye las vencidas), `vencidas` = pendientes con fecha pasada, `avance` = realizadas / total.
En la barra cada actividad cae en un solo tramo.
Origen de los datos: la medida ya trae etapa, fechas y duración; las actividades por medida salen de `globalActividadService.list({ legajo, medida })`
(el mismo servicio del plan de trabajo), una consulta por medida con caché de 2 minutos.

## Archivos
- `.../components/legajo/medida-resumen.ts` (cálculos, sin llamadas al servidor)
- `.../components/legajo/medida-resumen-card.tsx` (tarjeta)
- `.../components/legajo/medidas-activas-section.tsx` (tarjetas + selector Resumen/Tabla)
- `.../components/legajo/plan-trabajo-section.tsx` (acepta `initialMedidaId`)
- `src/app/(runna)/legajo/legajo-detail.tsx` (el botón cambia de pestaña con la medida elegida)
- `tests/unit/medida-resumen.test.ts` (13 casos)

## Cómo probarlo
1. Abrir un legajo con varias medidas, por ejemplo `/legajo/45` (`LEG-2026-0045`) o `/legajo/60` (`LEG-2026-0060`, con dos MPE vigentes: muestra la advertencia).
2. Pestaña General: tarjetas por medida. "Tabla" vuelve a la vista anterior.
3. "Ver plan de trabajo" en una tarjeta: abre Plan de Trabajo con esa medida elegida y los mismos números.

Verificado en el navegador con `LEG-2026-0045` y `LEG-2026-0060` (admin): tarjetas, advertencia de duplicadas, selector Tabla/Resumen y navegación al plan de trabajo.

## Límites y pendientes
- **Una consulta por medida** al abrir General. Con muchas medidas conviene que el backend devuelva los contadores por medida en el detalle del legajo.
- Falta, para ser más útil: última actividad **por equipo** y una **línea de tiempo** del legajo; ambas necesitan datos que hoy el front no tiene
  (el Historial de cambios se pide con `include_history: false`).
- Los equipos que se muestran son los que aparecen en las actividades; no se sabe cuáles *deberían* intervenir según el tipo de medida.
- El panel lateral de la Bandeja de legajos no se probó; se probó la página completa del legajo.
- No se tocó el encabezado del legajo, que sigue mostrando una sola "Medida vigente" aunque haya dos.
