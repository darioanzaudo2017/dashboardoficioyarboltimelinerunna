# Actividad: el aviso de visado aparecía en actividades que no lo llevan

**Rama:** `mejora-aviso-visado-subtipo`  **Fecha:** 2026-11-04

## Problema
En el plan de trabajo, al cambiar el estado de una actividad a "Completada", el modal avisaba:
«Esta actividad requiere visado. Al completarla, pasará a "Pendiente Visado JZ"…».
Pero la actividad (de Equipo Técnico) quedaba directamente **Completada**, sin pasar por visado.

## Causa
`CambiarEstadoSection.tsx` decidía el aviso con «subtipo **o** tipo»: si el **tipo** de actividad tenía tildado
«Requiere visado del equipo legal», avisaba aunque el **subtipo** no lo tuviera. El servidor decide por el subtipo.

Caso real (catálogos del sistema):
- Tipo «Derecho a la salud»: visado **tildado**.
- Subtipo «Seguimiento del esquema de vacunación»: visado **sin tildar** (y «Exige adjuntos obligatorios al cerrar» tildado).
- Resultado: el modal avisaba visado, el servidor completaba directo.

Criterio de negocio (indicado por el usuario): casi todas las actividades de Equipo Técnico **no** llevan visado; las de Legales **sí**.

## Qué cambió
- Nueva función `actividadRequiereVisado` (`utils/actividad-visado.ts`): decide por el **subtipo**; el tipo solo se mira si la actividad no trae subtipo.
- `CambiarEstadoSection.tsx` usa esa función.

## Archivos
| Archivo | Qué hace |
|---|---|
| `utils/actividad-visado.ts` | Regla de visado (subtipo manda) |
| `components/medida/actividad/CambiarEstadoSection.tsx` | Usa la regla para mostrar el aviso |
| `tests/unit/actividad-visado.test.ts` | 4 casos (subtipo sí, solo tipo, sin subtipo, sin datos) |

## Verificación
Tipos sin errores; 25 archivos / 151 tests en verde. En pantalla (MPI MED-2026-256), con una actividad de «Derecho a la salud / Gestión de Cobertura de Salud» en Progreso, al elegir «Completada» ya no aparece el aviso de visado.
No se probó en pantalla el caso positivo (una actividad de Legales con visado tildado, que debe seguir mostrando el aviso): solo está cubierto por el test.

## Pendiente (no incluido)
- Datos de catálogo: el tipo «Derecho a la salud» (Equipo Técnico) tiene el visado tildado; probablemente no corresponde. Anotado en las observaciones del backend.
