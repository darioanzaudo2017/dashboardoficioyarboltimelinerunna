# Legajo: botón "Asignar responsable" cuando no hay un técnico asignado

**Rama:** `mejora-legajo-boton-asignar`  **Fecha:** 2026-11-03

## Problema
Para registrar la intervención de apertura, el legajo tiene que tener un técnico a cargo ("Asigne un técnico al legajo antes de continuar"). Pero la asignación solo se podía hacer desde la bandeja de legajos: dentro del legajo (encabezado y pestaña Asignaciones) no había cómo, y quien llegaba desde la medida no sabía dónde ir.

## Qué cambió
- En el encabezado del legajo, bajo "Profesional Asignado: Sin asignar", aparece el botón **"Asignar responsable"**, que abre el mismo modal de asignación de la bandeja (zonas/equipos y usuarios responsables). Al guardar, el encabezado se actualiza y el botón desaparece.
- El aviso del formulario de intervención ahora dice dónde asignarlo: "Asigne un técnico al legajo antes de continuar (en el legajo, botón "Asignar responsable")".

## Archivos
| Archivo | Qué hace |
|---|---|
| `.../components/legajo/legajo-header.tsx` | Botón (prop `onAsignar`) cuando no hay responsable |
| `src/app/(runna)/legajo/legajo-detail.tsx` | Abre el modal de asignación y recarga el legajo al guardar |
| `.../intervencion-modal/steps/StepDetalles.tsx` | Texto de ayuda |

## Cómo probarlo
Abrir un legajo sin responsable (por ejemplo `/legajo/176` antes de asignar): "Asignar responsable" → elegir usuario → Guardar: el encabezado muestra al usuario y el botón se va.

## Verificación
Tipos sin errores. Probado en el navegador (admin) con el legajo 176: se asignó "UsuarioLegal" y el encabezado se actualizó.

## Pendiente / notas
- El botón se ve para cualquiera que abra el legajo; el modal ya es el de la bandeja, así que valen sus mismas reglas del servidor. Si hay que limitarlo por rol, se puede ajustar.
- Se podría sumar el mismo botón en la pestaña Asignaciones.
