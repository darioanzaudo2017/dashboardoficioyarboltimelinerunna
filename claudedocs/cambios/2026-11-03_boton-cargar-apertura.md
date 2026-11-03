# Apertura de la medida: el botón "Nueva Intervención" pasa a "Cargar Apertura"

**Rama:** `mejora-boton-cargar-apertura`  **Fecha:** 2026-11-03

## Problema
En el modal de la etapa ("Apertura · Gestión de la etapa") el botón para empezar se llamaba **"Nueva Intervención"**. Quien llega desde el cartel "Primer paso: registrar la intervención de Apertura" no sabe que ese botón es el que carga la apertura.

## Qué cambió
- Mientras no hay nada cargado, el botón dice **"Cargar Apertura"** (el nombre de la etapa viene del sistema, por lo que en otras etapas dice "Cargar <etapa>").
- Los demás textos no cambian: "Ver/Editar Intervención" cuando ya hay un borrador y "Ver y Aprobar <etapa>" cuando está pendiente de aprobación.

## Archivos
| Archivo | Qué hace |
|---|---|
| `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/apertura-section.tsx` | Texto del botón |

## Cómo probarlo
Una medida sin intervención (por ejemplo MED-2026-249) → etapa Apertura → el botón dice "Cargar Apertura".

## Verificación
Tipos sin errores. Probado en el navegador (admin): el modal muestra "Cargar Apertura".

## Pendiente / notas
- Se podría renombrar también "Ver/Editar Intervención" (por ejemplo "Ver/Editar Apertura") para que sea consistente; no se tocó por no haberse pedido.
- El tutorial (página 08) tiene que usar el nombre nuevo.
