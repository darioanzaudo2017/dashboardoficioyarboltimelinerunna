# Derivar demanda: texto que explica la diferencia entre derivar y asignar

**Rama:** `mejora-derivar-demanda-texto`  **Fecha:** 2026-11-03

## Problema
En Mesa de Entradas, el botón "Asignar" abre "Derivar Demanda". Si se elige solo la zona, la demanda se deriva pero **sigue "Sin Asignar"** (correcto: se puede derivar a un equipo por cualquier motivo, pero el estado solo cambia cuando hay una o más personas responsables). Pero el modal no lo explica y parece que "Asignar" no hizo nada.

## Qué cambió
- Un cartel informativo arriba del modal: "Podés derivar la demanda a un equipo de trabajo por el motivo que sea. Pero la demanda **no cambia de estado hasta que tenga uno o más responsables**: sin una persona a cargo sigue en «Sin Asignar». Para asignarla, elegí también al menos un usuario responsable."
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
