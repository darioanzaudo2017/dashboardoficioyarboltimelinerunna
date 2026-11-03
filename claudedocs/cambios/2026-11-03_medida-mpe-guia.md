# Medida MPE: guía del primer paso, sin contadores repetidos y sin códigos internos

**Rama:** `mejora-medida-mpe-guia`  **Fecha:** 2026-11-03

## Problema
Al abrir una medida MPE recién creada (vista nueva):
1. Todo estaba en cero y nada indicaba por dónde empezar: lo pendiente (registrar la intervención de Apertura) estaba en otra parte de la pantalla.
2. Los contadores (pendientes, en progreso, realizadas, vencidas, canceladas) y la barra de progreso aparecían dos veces: en el encabezado de la medida y dentro del módulo "Plan de trabajo".
3. Se veían códigos internos: `PENDIENTE_REGISTRO_INTERVENCION`, la fecha cruda `2026-10-27T11:38:55.864299Z` y "Equipo: No especificado".

## Qué cambió
- **Cartel "Primer paso"** arriba de las etapas, solo mientras la etapa actual está en "pendiente de registro de intervención" y la medida está vigente.
  Tiene el botón "Registrar intervención", que abre directamente la gestión de esa etapa.
- **Contadores una sola vez:** en la vista nueva el módulo "Plan de trabajo" ya no repite contadores ni progreso (quedan los del encabezado).
  La vista clásica y el Plan de Trabajo del legajo no cambian.
- **Textos legibles:** los estados se muestran como frase ("Pendiente registro intervención") cuando el servidor no manda el nombre;
  la fecha sale como `27/10/2026`; la línea "Equipo" se oculta cuando no hay dato.

## Archivos
| Archivo | Qué hace |
|---|---|
| `.../restyle/medida-etapas-section.tsx` | Cartel de primer paso; chip de estado legible en el panel de la etapa |
| `.../utils/estado-legible.ts` | Convierte un código de estado en texto (usa el nombre del servidor si viene) |
| `.../components/medida/apertura-section.tsx` | Fecha formateada, estado legible, "Equipo" solo si hay dato |
| `.../components/medida/workflow-stepper.tsx` | Chips de estado del stepper legibles |
| `actividades/components/UnifiedActividadesTable/*` | Nueva opción `hideStatistics` |
| `.../mpe-tabs/plan-trabajo-tab.tsx`, `restyle/medida-modulos-config.tsx`, `medida-detail.tsx` | Pasan `hideStatistics` solo en la vista nueva |
| `tests/unit/estado-legible.test.ts` | 4 casos |

## Cómo probarlo
1. Abrir `/legajo/176/medida/249` (MED-2026-249, MPE vigente sin intervención registrada), vista nueva.
2. Ver el cartel azul "Primer paso" y que los contadores aparecen una sola vez (el módulo Plan de trabajo empieza directo en el buscador).
3. "Registrar intervención": abre "Apertura · Gestión de la etapa" con fecha, estado y chips legibles.
4. Cambiar a "Vista clásica": sigue como antes.

## Verificación
Tipos sin errores, tests en verde, probado en el navegador con `LEG-2026-0176` (admin).

## Pendiente / notas
- Los nombres de los pasos no coinciden entre el panel de la etapa (5 pasos: informe inicial, nota de aprobación, nota de aval, informe jurídico, ratificación)
  y el diálogo de gestión (4 pasos, "Paso 1 de 4"). Falta ver si es dato del backend o textos del front.
- El estado de la etapa en la lista queda cortado ("Pendiente de registro de intervenci…").
- Otros estados de la etapa todavía no tienen guía; el cartel es solo para el primer paso.
