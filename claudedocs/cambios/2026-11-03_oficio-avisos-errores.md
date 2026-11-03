# Oficio judicial: avisos y errores más claros en todo el mini flujo

**Rama:** `mejora-oficio-avisos-errores`  **Fecha:** 2026-11-03

Sale de revisar el flujo completo de un oficio que abre una MPJ (cargar el oficio, guardar, asignar las actividades y cambiarles el estado). Solo front.

## Qué cambió
1. **Carga de oficios: el circuito es solo MPJ.** El selector mostraba MPI, MPE y MPJ aunque esta carga es la del oficio penal juvenil (los de MPE/MPI vigente tienen su propia opción).
   Ahora ofrece únicamente **MPJ y ya viene elegido**, con la aclaración "Esta carga es de oficios penales juveniles. Los de MPE o MPI vigente se cargan con la otra opción."
   Un oficio viejo con otro circuito conserva el suyo (se siguen mostrando las tres opciones).
2. **Formulario del oficio: la categoría de información ahora marca error.** Era obligatoria (tenía asterisco) pero al guardar vacía no decía nada; solo marcaba "Tipo de oficio".
   Ahora muestra "La categoría de información es obligatoria" y el cartel cuenta bien los campos (antes decía 8 y había 9 marcados).
3. **Guardar la demanda cuando falla el servidor:** el cartel decía "No se pudo guardar la demanda. **Corregí lo siguiente:**" aunque no hubiera nada para corregir (ej.: el almacenamiento de archivos sin permiso).
   Ahora, si el problema es del servidor (error 5xx o almacenamiento), dice "No se pudo guardar la demanda:" y el motivo; los errores de validación siguen pidiendo corregir.
4. **Completar una actividad de oficio o pedido de informe:**
   - Si no tiene adjuntos, el aviso lo dice ("Esta actividad todavía no tiene ningún adjunto…") y ofrece **"Ir a Actividad"**, que cierra el diálogo y abre la pestaña donde se sube la evidencia.
   - Si el servidor igual la rechaza, el error dice qué hacer ("necesita al menos un adjunto (evidencia). Subilo en la pestaña «Actividad»…") en lugar de "Verifique los requisitos".
   - El aviso de **visado** ahora también aparece cuando el visado está configurado en el **tipo** de actividad (antes solo miraba el subtipo, y las actividades técnicas de un oficio MPJ lo traen en el tipo).
5. **Subir evidencia a una actividad:** cuando falla, el aviso dice "El servidor tuvo un problema al guardar los archivos. Probá de nuevo en unos minutos; si sigue, avisá a soporte." (antes solo "Error al subir archivos").
6. **El detalle de una actividad se actualiza solo** tras cambiar el estado: antes seguía mostrando el estado anterior hasta cerrar y volver a abrir.
7. **Buscador de legajos (Agregar vínculo):** los resultados que comparten DNI con otro legajo del mismo resultado muestran "Hay otro legajo con este mismo DNI: revisá cuál corresponde antes de vincular."
   (un mismo niño con dos legajos termina con medidas vigentes duplicadas).

## Archivos
| Archivo | Qué hace |
|---|---|
| `src/utils/apiErrorFormatter.ts` | `esProblemaDelServidor` y `mensajeErrorDeArchivos` (se agregan al final) |
| `src/components/forms/MultiStepForm.tsx` | Título del aviso al guardar según el tipo de error |
| `src/components/forms/carga-oficios/CargaOficiosForm.tsx`, `components/CircuitoSelector.tsx`, `types/carga-oficios.types.ts` | Circuito solo MPJ; categoría con validación |
| `.../medida/components/medida/actividad/CambiarEstadoSection.tsx`, `ActividadDetailModal.tsx` | Guía de evidencia, "Ir a Actividad", aviso de visado y error específico |
| `.../medida/hooks/useUnifiedActivity.ts` | Mensaje claro al fallar la subida de evidencia |
| `.../legajo/actividades/components/UnifiedActividadesTable/UnifiedActividadesTable.tsx` | El detalle abierto toma la actividad actualizada |
| `.../demanda/ui/components/LegajoSearchAutocomplete.tsx`, `legajosConMismoDni.ts` | Aviso de DNI repetido |
| `tests/unit/oficio-avisos.test.ts` | 10 casos |

## Cómo probarlo
1. `/nuevoingreso` → "Carga de Oficios Penal Juvenil": el circuito muestra solo MPJ ya elegido. "Guardar demanda" vacío: la categoría marca su error y el cartel cuenta 9 campos.
2. En la sección de vínculos, "Agregar Vínculo" y buscar `colapinto`: los dos legajos (0176 y 0177) muestran el aviso de DNI repetido.
3. Página Actividades (`/legajo/actividades`), actividad "62 - MPJ - Informe psicológico inicial" (En Progreso): detalle → "Cambiar Estado" → Completada: aviso de visado + aviso de falta de adjunto con "Ir a Actividad"; "Confirmar" muestra el error específico.
4. Pestaña Actividad → "+" → "Subir Archivo": con el servidor sin permisos aparece el aviso claro.
5. "Cambiar Estado" → Pendiente: el encabezado del detalle pasa a "Pendiente" sin recargar.

## Verificación
Tipos sin errores y 38 tests en verde. Probado en el navegador (admin) los puntos 1, 2, 4, 5, 6 y 7. **El punto 3 (título al guardar con el servidor caído) solo está probado con tests**: reproducirlo en pantalla exige llenar todo el oficio con un adjunto.

## Pendiente / notas
- No se tocó: el aviso de éxito duplicado (demanda creada, transferir, asignar). Puede estar resuelto en `mejora-constatacion-feedback` (quitó un `ToastContainer` duplicado); hay que mirarlo en `integracion`.
- Sin verificar: que la fecha de ingreso no sea anterior a la del oficio, tipo y tamaño de los archivos, y asignar sin elegir responsable.
- **Al unir con otras ramas:** `UnifiedActividadesTable.tsx` (la rama `mejora-actividades-fecha-contadores` cambia `handleRefresh`, justo debajo del efecto agregado aquí), `MultiStepForm.tsx` (ramas `borrador-paso` y `constatacion-feedback`) y `apiErrorFormatter.ts` (rama `errores-firmantes`) pueden pedir un conflicto chico; se conservan los dos lados.
