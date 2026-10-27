# Navegación hacia Evaluación

Rama: `mejora-navegacion-evaluacion` (sale de `main`). Solo front, no se toca el backend.

## Problema
Cuando una demanda está en Evaluación (o Pendiente de autorización), hacer clic en su fila abría los formularios
de Constatación. A la pantalla de Evaluación solo se llegaba con el botón verde "Evaluar" o con el chip de estado.
Quien entraba por la fila no tenía ninguna pista de que lo siguiente estaba en otra pantalla.

## Cambios
1. **Clic en la fila** (tabla y lista de tarjetas): si el estado es `EVALUACION` o `PENDIENTE_AUTORIZACION` y la
   persona puede evaluar (mismo criterio que el botón "Evaluar"), va a `/evaluacion?id=<id>`.
   El resto de los estados no cambia. Quien no puede evaluar sigue abriendo el detalle.
2. **Pantalla de Evaluación**: el botón "Volver a la demanda" pasa a llamarse "Ver constatación", que dice qué hay
   del otro lado. Lleva al detalle de la demanda.
3. **Detalle de la demanda en Evaluación**: el aviso "Esta demanda ya se encuentra en evaluación" tiene ahora el botón
   "Ir a Evaluación" (solo si la persona puede evaluar).
4. **Detalle abierto desde `?demanda=<id>`** en modo tabla: ahora abre el modal. Antes dejaba la demanda elegida
   pero sin mostrar nada, y "Ver constatación" no habría funcionado en ese modo.

## Archivos
- `src/app/(runna)/mesadeentrada/ui/dataGrid/DemandaTableContent.tsx`
- `src/app/(runna)/demanda/DemandaDetail.tsx`
- `src/components/evaluacion/demanda-context-card.tsx`

## Cómo probar
1. Mesa de Entradas, clic en la fila de una demanda en Evaluación: abre Evaluación.
2. En Evaluación, "Ver constatación": vuelve al detalle con la demanda seleccionada.
3. En ese detalle, "Ir a Evaluación": vuelve a Evaluación.
4. Clic en la fila de una demanda en Constatación o Sin asignar: abre el detalle como siempre.

Verificado en el navegador con las demandas #320 (Evaluación) y #324 (Constatación), usuario admin.
