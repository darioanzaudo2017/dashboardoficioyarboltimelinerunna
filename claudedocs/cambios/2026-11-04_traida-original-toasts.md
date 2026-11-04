# Traído del original: un solo aviso por acción en intervención, informe jurídico y ratificación

**Rama:** `traer-original-toasts`  **Fecha:** 2026-11-04

## Problema
Al enviar o aprobar una intervención (y en informe jurídico y ratificación) el aviso verde salía **dos veces**:
lo mostraba el servicio de la API y lo volvía a mostrar el hook que lo llama. Al enviar, además, salía un tercero
("Registro de Intervención actualizado exitosamente") porque antes de enviar se guardaba el borrador.

## Qué se hizo
No se escribió código propio: se trajo **sin cambios** la rama `origin/fix/toasts-duplicados-intervencion`
(commit `bd2a6a3`, autor `santiago6124`) del repositorio original, solo lectura. El original no se tocó.

Qué hace esa rama:
- `intervenciones-api-service.ts`, `informe-juridico-api-service.ts`, `ratificacion-judicial-api-service.ts`: los servicios dejan de mostrar el aviso de éxito; lo muestra quien los llama.
- `createIntervencionActions.ts` y `createSaveActions.ts`: el guardado previo al envío es silencioso (`guardarBorrador({ silencioso: true })`).
- `tests/unit/toasts-acciones-medida.test.ts`: 6 tests.

## Verificación
- Simulación de merge contra `integracion` (`git merge-tree`): sin conflictos.
- Tipos sin errores; 26 archivos / 157 tests en verde.
- En pantalla (MPI MED-2026-229, legajo 177): al **aprobar** la intervención sale un solo aviso («Intervención aprobada exitosamente»); antes salían dos.
- **No se vio en pantalla** el caso de **enviar**: el contador no capturó los avisos de esa acción. Queda cubierto por los tests de la rama.

## Pendiente (no incluido)
Probar en pantalla el aviso al enviar, y el de informe jurídico y ratificación (que usan el mismo cambio).
