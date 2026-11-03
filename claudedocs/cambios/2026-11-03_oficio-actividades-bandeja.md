# Demandas de oficio: ver y asignar sus actividades desde la Mesa de Entradas

**Rama:** `mejora-oficio-actividades-bandeja`  **Fecha:** 2026-11-03

## Problema
Al guardar una demanda de oficio (por ejemplo, una carga de oficios que abre una MPJ) el servidor crea solo las actividades del plan de trabajo, y el front las muestra
en el modal "Demanda Creada Exitosamente", donde se pueden asignar. **Si ese modal se cierra, la Mesa de Entradas no ofrece ningún camino para volver a ellas**:
la fila solo tiene "Ver detalles", "Asignar" (derivar la demanda) y editar, y el detalle abre las pestañas de constatación.
La medida MPJ tampoco ayuda: solo muestra en "Control de legalidad" la actividad de Legales, no las del Equipo Técnico.
Además las actividades se crean **a nombre de quien cargó el oficio** (responsable principal = esa persona, equipo = el de la zona), así que nada indica que falte reasignarlas.

## Qué cambió
- **Detalle de la demanda** (vista de lista y de tabla): si la demanda es de oficio o pedido de informe y generó actividades, aparece un aviso
  *"Esta demanda generó 5 actividades en el plan de trabajo; 5 todavía a nombre de quien cargó el oficio."* con el botón **"Ver y asignar actividades"**.
  El aviso pasa a informativo cuando ya no queda ninguna sin reasignar, y no aparece si la demanda no generó actividades.
- **Tabla de la Mesa de Entradas:** un ícono nuevo **"Ver y asignar actividades"** en la columna Acciones, solo en las demandas de oficio.
- **Modal "Actividades de la demanda #N":** la misma tabla del modal de después de guardar, con casillas, filtros, "Asignar Responsables" y "Transferir a Equipo".
  Muestra "N actividades" y "N sin reasignar", y se actualiza en el acto al asignar o transferir.

## Cómo se cuentan las actividades de una demanda
El servidor no permite filtrar actividades por demanda. Cada actividad trae `oficio_origen.id` con el número de la demanda, así que se recorren las de origen oficio
(las más nuevas primero, de a 100, hasta 10 páginas) y se queda con las de esa demanda. "Sin reasignar" = el responsable principal es quien creó la actividad (o no hay) y no hay responsables secundarios.

## Archivos
| Archivo | Qué hace |
|---|---|
| `mesadeentrada/utils/actividadesDeOficio.ts` | Reconoce demandas de oficio, filtra por demanda y cuenta "sin reasignar" |
| `mesadeentrada/services/actividadesDeDemandaService.ts` | Trae las actividades de una demanda recorriendo las páginas |
| `mesadeentrada/hooks/useActividadesDeDemanda.ts` | Consulta con caché de 1 minuto |
| `mesadeentrada/ui/ActividadesDeOficio.tsx` | Modal y aviso del detalle |
| `mesadeentrada/ui/dataGrid/columns.tsx`, `DemandaTableContent.tsx` | Ícono en la tabla y estado del modal |
| `demanda/DemandaDetail.tsx` | Muestra el aviso en el detalle |
| `tests/unit/actividades-de-oficio.test.ts` | 8 casos |

## Cómo probarlo
1. Mesa de Entradas, demanda de oficio con actividades (por ejemplo la `#328`). En el detalle: aviso + "Ver y asignar actividades". En la vista de tabla: ícono en Acciones (la `#326`, de protección, no lo tiene).
2. En el modal: seleccionar las 5, "Asignar Responsables", pestaña "Transferir a Equipo" (equipo + motivo de al menos 15 caracteres) o "Asignar Responsables" (responsable principal) → "Asignar a Todas".
   Las filas cambian en el acto (círculo con la inicial del responsable) y el contador "sin reasignar" desaparece.

## Verificación
Tipos sin errores y tests en verde. En el navegador (admin) con la `#328`: aviso, modal, transferencia a "CAPITAL ZONA 1 PENAL JUVENIL" (guardada) y asignación de responsable (la tabla se actualizó sola).
Se corrigió durante la prueba que el modal no refrescaba tras transferir (la tabla avisa los cambios por `onActividadesUpdate`).

## Pendiente / notas
- **No se probó con un usuario técnico:** falta comprobar que alguien que no es admin vea el aviso y las actividades de su zona. Si una transferencia las deja fuera de la zona del usuario, dejarían de verse.
- **Color del ícono según el estado de las actividades: no se hizo, por costo.** El listado de la Mesa de Entradas (`mesa-de-entrada/`) no trae nada de actividades (ni cantidad ni estado),
  y el servidor no filtra actividades por demanda. Medido en RUNNA test (208 actividades de oficio): traer todas serían 3 llamadas, ~775 KB y ~7 s en cada carga; por legajo serían llamadas chicas
  (0 a 27 KB, ~0,5 s) pero una por cada fila de oficio visible. La página de Oficios no tiene este problema porque hace una sola búsqueda dirigida (`medidas-all/?search=`) que ya trae las actividades embebidas.
  **Lo correcto es que el back devuelva, en cada demanda del listado, un resumen de sus actividades** (total, pendientes, vencidas, resueltas); con eso el color y un contador salen sin llamadas extra.
  Criterio propuesto para el color (mismo que Oficios: resueltas = completada, visado aprobado o cancelada): rojo si hay vencidas, naranja si hay pendientes, azul si hay en curso, verde si todas están resueltas.
- Mejor aún: que el servidor permita filtrar actividades por demanda (`oficio_origen`), para no recorrer páginas.
- La medida MPJ no tiene módulo "Plan de trabajo": solo muestra la actividad de Legales en "Control de legalidad". Conviene mostrar el plan completo o avisar.
- La lista de equipos de destino incluye opciones como "NO USAR! …" y "CSE - CE (NO TRANSFERIR AQUI)".
- El aviso de éxito de transferir y asignar aparece duplicado ("Actividades transferidas exitosamente" + "5 actividades transferidas al equipo exitosamente").
