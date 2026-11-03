# Derivar demanda: texto que explica la diferencia entre derivar y asignar

**Rama:** `mejora-derivar-demanda-texto`  **Fecha:** 2026-11-03

## Problema
En Mesa de Entradas, el botón "Asignar" abre "Derivar Demanda". Si se elige solo la zona, la demanda se deriva pero **sigue "Sin Asignar"** (correcto: derivar a una zona no deja a nadie a cargo). Pero el modal no lo explica y parece que "Asignar" no hizo nada.

## Qué cambió
- Un cartel informativo arriba del modal: "**Derivar** envía la demanda a una zona; **asignar** la deja a cargo de una persona. Para asignarla, elegí también un usuario responsable. Sin responsable queda derivada pero sigue en «Sin Asignar» hasta que se elija un responsable."
- El texto de ayuda bajo "Usuarios responsables" pasa de "Seleccione al menos un usuario responsable" a "Elegí un responsable para asignarla; si no, solo se deriva a la zona" (antes sonaba obligatorio y no lo es).
- El aviso al terminar ya existía y no se tocó: "derivada a la zona, todavía sin responsable…".

## Archivos
| Archivo | Qué hace |
|---|---|
| `src/components/asignarModal.tsx` | Cartel y texto de ayuda |

## Cómo probarlo
Mesa de Entradas → icono "Asignar" de cualquier demanda: el cartel aparece arriba. Elegí una zona: el texto bajo "Usuarios responsables" aclara que sin responsable solo se deriva.

## Verificación
Tipos sin errores. Probado en el navegador (admin): el cartel se ve en el modal de la demanda #332 (se cerró sin derivar).

## Pendiente / notas
- Solo cambia textos; no cambia el comportamiento ni se toca el back.
