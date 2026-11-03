# Medida MPE (vista nueva): dispositivo a la vista y comparación con la vista clásica

**Rama:** `mejora-medida-mpe-dispositivo`  **Fecha:** 2026-11-03

## Problema
La vista clásica de una medida MPE tiene el bloque **"Configuración de Dispositivo MPE"** (tipo de dispositivo e institución/familia: el lugar o programa donde está el NNyA).
La vista nueva no lo tenía, así que quien trabaja ahí no ve ni puede cargar ese dato.

## Qué cambió
- La vista nueva de una medida **MPE** muestra el bloque "Configuración de Dispositivo MPE" justo debajo del resumen (antes de las etapas).
  Es el mismo componente de la vista clásica (`ConfiguracionMPESection`): "Sin configurar" con botón **Configurar**, o los datos cargados con su botón de editar.
  Al guardar refresca la medida.
- Solo para MPE (MPI y MPJ no lo muestran, igual que en la clásica).

## Archivos
| Archivo | Qué hace |
|---|---|
| `src/app/(runna)/legajo/[id]/medida/medida-detail.tsx` | Muestra `ConfiguracionMPESection` en la vista nueva para MPE |

## Comparación vista clásica → vista nueva (MPE)
| En la vista clásica | En la vista nueva |
|---|---|
| Nombre del NNyA y legajo asociado | **Falta** (solo está en el breadcrumb "Legajo 176") |
| Botón "Seguimiento Dispositivo" | **Falta** |
| Botón "Solicitar Cese" / "Confirmar Cese" | **Falta** |
| Chips de etapas con contadores (Inicial, Apertura, Innovación 0, Prórroga 0, Resguardo 0, Seguimiento, Cese, Post Cese) | Reemplazado por la lista de Etapas |
| Detalles: fecha de apertura, origen de la demanda, zona de trabajo | Solo "Vigente desde" |
| Equipos e intervención: equipo responsable, zona centro de vida, articulación local | **Falta** |
| Ubicación del NNyA, lugar de resguardo, expediente (Nro. SAC) | **Falta** |
| Cronograma de plazos (90 días, días restantes, alerta) | **Falta** |
| **Configuración de Dispositivo MPE** | **Agregado en esta rama** |
| Pestañas Post cese, Documentos Demanda, Historial | **Faltan** (Historial solo para MPI) |

## Cómo probarlo
1. `/legajo/176/medida/249`, vista nueva: aparece el bloque de dispositivo; "Configurar" abre el diálogo con tipo de dispositivo e institución/familia.
2. Vista clásica: sigue igual.

## Verificación
Tipos sin errores. Probado en el navegador (admin, MED-2026-249): el bloque aparece y el diálogo "Configurar" abre. No se guardó ninguna configuración.

## Pendiente / notas
Lo que falta de la tabla de arriba (nombre del NNyA, plazos de 90 días, ubicación/resguardo, solicitar cese, post cese, documentos e historial) queda para ramas siguientes, empezando por nombre del NNyA y plazos.
