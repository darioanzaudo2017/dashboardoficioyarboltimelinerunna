# Informe jurídico: Equipo Legal ve los documentos que cargó el técnico

**Rama:** `mejora-informe-juridico-adjuntos-tecnico`  **Fecha:** 2026-11-03

## Problema
En el paso "Informe Jurídico" de la apertura, Equipo Legal sube su informe, pero para redactarlo necesita tener a mano todo lo que cargó el técnico en la intervención (el Informe Obligatorio y los adjuntos adicionales). Hoy tenía que ir a buscarlos a otro lado.

## Qué cambió
En el paso Informe Jurídico, arriba del informe, aparece una tarjeta **"Documentos que cargó el técnico"** (solo lectura) con los archivos de la intervención más reciente de la etapa, agrupados y con botón **Descargar**:
1. **Informe obligatorio**
2. **Notificaciones y actas**
3. **Documentación complementaria**
4. **Otros documentos** (si los hubiera)
Muestra nombre, tamaño, quién lo subió y cuándo. Si el técnico no adjuntó nada, lo dice; si falla la carga, avisa.

## Archivos
| Archivo | Qué hace |
|---|---|
| `.../components/informe-juridico/adjuntos-del-tecnico.tsx` | Tarjeta de solo lectura (trae los adjuntos con `getAdjuntos`) |
| `.../components/informe-juridico/agrupar-adjuntos.ts` | Agrupa los adjuntos por tipo y los ordena |
| `.../components/medida/informe-juridico-section.tsx` | Muestra la tarjeta (nueva prop `intervenciones`) |
| `.../unified-workflow-tab/steps/buildWorkflowSteps.tsx` | Le pasa las intervenciones de la etapa |
| `tests/unit/adjuntos-del-tecnico.test.ts` | 2 casos |

## Cómo probarlo
Medida MPE con la apertura ya aprobada por el Jefe Zonal y el aval: abrir la etapa Apertura → paso Informe Jurídico (usuario Equipo Legal): se ve la tarjeta con los archivos y, debajo, el informe jurídico.

## Verificación
Tipos sin errores y tests en verde. **Falta verlo en pantalla con archivos reales**: el paso Informe Jurídico se desbloquea recién después de aprobar la intervención, y el almacenamiento de archivos del sistema de prueba falla (403), por lo que no hay adjuntos para mostrar.

## Pendiente / notas
- Se muestran los adjuntos de la intervención más reciente; si una apertura tuviera varias intervenciones (por ejemplo una rechazada), solo se ve la última.
- Equipo Legal ve la tarjeta; el resto de los usuarios que llegan a ese paso también la ven (es solo lectura).
- El informe jurídico propio ya se sube dentro del diálogo de "Crear y enviar informe jurídico" (sin cambios).
