# Evaluación: motivo del error del servidor y bucle de firmantes

Rama: `mejora-evaluacion-errores-firmantes` (sale de `main`). Solo front.

## Problema 1: aviso de error genérico
Al pedir o autorizar una medida, cualquier falla mostraba "Error al procesar la solicitud de autorizar…", sin decir
por qué. Caso real: el servidor responde `400 justificacion_tecnico: Este campo no puede estar en blanco` (o
`justificacion_director es obligatorio`) y la persona no podía saberlo.

## Cambio 1
- `action-buttons.tsx`: el `catch` usa `describeApiError` + `showErrorToast` (los mismos del registro de demanda).
  Muestra "No se pudo enviar la solicitud de adopción de medida:" con el motivo en viñetas y "Ver detalles".
- `apiErrorFormatter.ts`: nombres legibles para los campos de la evaluación ("Justificación del técnico",
  "Justificación del director", "Descripción de la situación", "Valoración profesional final", "Tipo de medida",
  "NNyA evaluados", "Solicitud del técnico", "Decisión del director", "Archivos adjuntos").
  Un error 500 llega como página HTML: ya no se vuelca al usuario, se usa el mensaje estándar.
- `tests/unit/api-error-formatter.test.ts`: 3 casos nuevos (campos de evaluación, `detail` simple, 500 con HTML).

## Problema 2: bucle de consultas de usuarios (firmantes)
En la pantalla de Evaluación se repetía `GET users/?page_size=500` unas 90 veces por minuto, sin parar. El efecto
que carga los firmantes dependía de `data`, un objeto nuevo en cada render; al terminar cada carga cambiaba el estado,
se volvía a renderizar y el efecto corría de nuevo. Además cada vuelta **reiniciaba los firmantes elegidos**.

## Cambio 2
El efecto depende ahora de `user` y de la zona de la demanda (un valor simple), no de `data`.
Medido en pantalla: de ~90 consultas por minuto a 2 en 25 s (una es el doble render del modo desarrollo).

## Cómo probar
1. `/evaluacion?id=<id>`: en la pestaña Network de Chrome, `users/?page_size=500` aparece 1 o 2 veces y se queda quieto.
2. Elegir otro firmante: la elección se mantiene.
3. Provocar un rechazo del servidor (p. ej. enviar la solicitud con la justificación del técnico vacía): el aviso nombra el campo.

## Observaciones (no tocadas, para el equipo de backend / el cliente)
- **El backend acepta pedidos de autorización sobre una demanda ya admitida.** En la prueba, la #320 estaba `ADMITIDA`
  (con legajo y medida creados) y una "Solicitud de archivo" se aceptó: la demanda volvió a `PENDIENTE_AUTORIZACION`
  y se registró una evaluación nueva. El front tampoco lo impide: la pantalla de Evaluación se abre y habilita los
  botones sin mirar el estado. Conviene validar el estado en el servidor y deshabilitar los botones en el front.
- `justificacion_tecnico` y `justificacion_director` son obligatorias en el backend pero la pantalla las muestra recién
  cuando el Director ya no autorizó una vez: la primera solicitud no se puede enviar desde la pantalla. A definir con el cliente.
- El backend no exigió adjunto al registrar la solicitud; la obligatoriedad del informe firmado hoy es solo del front.
- Al subir un PDF mínimo de prueba (14 bytes) el servidor respondió 500; falta reprobar con un PDF real.
