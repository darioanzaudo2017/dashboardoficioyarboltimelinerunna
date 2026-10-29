# Evaluación: aviso de legajo y medidas vigentes antes de crear una medida

Rama: `mejora-evaluacion-chequeo-legajo`. Solo front.
**Depende de `mejora-evaluacion-cierre`**: el aviso va dentro de su modal de confirmación, así que esta rama sale de ella
(hay que unir primero `mejora-evaluacion-cierre`).

## Problema (probado en RUNNA test, 2026-10-28/29)
Al autorizar una medida, el backend resuelve el legajo **por persona** (no por DNI) y **no mira si ya hay una medida vigente**.
Pruebas con franco colapinto (DNI 31452587):
- **#325**, mismo DNI cargado de nuevo (sin vincular): el sistema aceptó el DNI repetido, creó una persona nueva (348), un
  **segundo legajo** (`LEG-2026-0177`) y una **segunda MPE vigente** (`MED-2026-250`).
- **#326**, vinculada al legajo existente: reutilizó el legajo `LEG-2026-0176`, pero creó una **tercera MPE vigente**
  (`MED-2026-251`) con la `249` todavía vigente.
Nadie avisa en ningún paso (registro, pedido, autorización).

## Cambio
Al abrir la confirmación de **"Solicitud de autorización de adopción de medida"** (técnico) y de **"Autorizar"** (Director,
cuando la solicitud es de tomar una medida), el modal busca, por DNI de cada NNyA:
- si **ya tiene legajo** y cuáles son sus **medidas vigentes**;
- si hay **otro registro con el mismo DNI** (con o sin legajo): posible persona duplicada, y sugiere vincular la demanda a ese legajo;
- si **no tiene DNI**: avisa que no se pudo comprobar.

Si hay algo para revisar aparece un aviso amarillo "Antes de continuar, revisá:" y el botón pasa a "… de todos modos".
Si no hay nada, un aviso verde. Si la consulta falla, un aviso informativo y se puede continuar.
No bloquea: **solo avisa**. El Director decide.
Archivar y "No autorizar" no hacen la consulta (no crean legajo ni medida).

## Cómo funciona
- `POST demanda-busqueda-vinculacion/` con el DNI → personas con ese DNI, con su legajo (la misma búsqueda de coincidencias de legajos).
- `GET medidas/?legajo=<id>&estado_vigencia=VIGENTE` → medidas vigentes de cada legajo encontrado.
- Solo lectura: no se modifica ningún dato.

## Archivos
- `src/components/evaluacion/utils/chequeoLegajoMedidas.ts` (arma los mensajes, sin llamadas al servidor)
- `src/components/evaluacion/utils/chequeoLegajoMedidasApi.ts` (consultas al servidor)
- `src/components/evaluacion/action-buttons.tsx` (disparo del chequeo y aviso en el modal)
- `tests/unit/chequeo-legajo-medidas.test.ts` (8 casos)

## Límites (importante)
- **Es un aviso del front, no una validación.** El backend sigue aceptando todo: lo correcto es que **el servidor valide**
  (rechazar o pedir justificación cuando el niño ya tiene una medida vigente, y no permitir DNI duplicados al crear personas).
- Sin DNI no se puede buscar por DNI.
- Si dos personas distintas comparten DNI por error de carga, el aviso las trata como posibles duplicados.
- A definir con el cliente: bloquear en vez de avisar.

## Cómo probar
1. Una demanda en Evaluación de un NNyA que ya tiene legajo (por ejemplo franco colapinto, DNI 31452587) con solicitud "TOMAR MEDIDA".
2. Abrir "Autorizar" (o la solicitud de adopción): el modal muestra el legajo y las medidas vigentes. Cancelar no envía nada.
3. Con un NNyA sin legajo ni otros registros: aviso verde.

Verificado en el navegador con la #320 (abriendo y cancelando los modales; no se envió nada).
