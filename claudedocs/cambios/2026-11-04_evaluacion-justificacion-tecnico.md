# Evaluación: la justificación del técnico se pide antes de enviar la solicitud

**Rama:** `mejora-evaluacion-justificacion-tecnico`  **Fecha:** 2026-11-04

## Problema
En el panel "Cierre de la evaluación", el botón "Solicitud de autorización de adopción de medida" (y el de archivo) se habilitaba con el informe subido y el tipo de medida elegidos. Pero el servidor responde:

> No se pudo enviar la solicitud de adopción de medida: • Justificación del técnico: Este campo no puede estar en blanco.

El campo "Justificación del Técnico" **solo se mostraba cuando el Director no autorizaba** (dentro de "Justificaciones internas"), así que el técnico no tenía dónde escribirla y la solicitud no se podía enviar nunca en el flujo normal. Se vio al recorrer el tutorial con la demanda #333.

## Qué cambió
- Bajo "Valoración profesional final" aparece el bloque **"Justificación del técnico"** (obligatoria, de uso interno, no va al informe). Si el Director ya no autorizó, se sigue editando dentro de "Justificaciones internas", como antes.
- El panel "Falta: …" ahora incluye **"completar la justificación del técnico"** para los dos pedidos (adoptar una medida y archivar), y los botones se habilitan solo cuando está completa.

## Archivos
| Archivo | Qué hace |
|---|---|
| `src/components/evaluacion/evaluacion-tabs.tsx` | Bloque visible de la justificación del técnico |
| `src/components/evaluacion/action-buttons.tsx` | La suma a la lista de lo que falta |

## Cómo probarlo
Demanda en Evaluación → completar valoración, subir el informe firmado y elegir tipo de medida: el panel dice «Falta: completar la justificación del técnico» hasta que se escribe. Con todo completo, el botón se habilita.

## Verificación
Tipos sin errores. Probado en el navegador (admin) con la demanda #333: aparece el campo y el aviso, y el servidor deja de rechazar por ese motivo. El envío completo no se pudo terminar porque el servidor responde "Error interno" al guardar el informe firmado (almacenamiento de archivos, ver observaciones para el backend).

## Pendiente / notas
- Hay que ajustar el tutorial (página 04) para nombrar este campo en el paso de cierre.
- Conviene que el backend confirme si realmente debe exigir la justificación del técnico en la primera solicitud.
