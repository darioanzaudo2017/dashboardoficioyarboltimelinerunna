# Oficio de MPE/MPI vigente: vínculo guiado y mensaje claro al guardar

**Rama:** `mejora-oficio-vinculo-guia`  **Fecha:** 2026-11-03

## Problema
En la demanda de oficio de MPE/MPI vigente, las actividades se agregan a la medida solo si la demanda tiene **vínculo (legajo + medida) y Tipo de Oficio**. Al probarla se vio que:
1. El **Tipo de vínculo** había que elegirlo a mano aunque en un oficio siempre es el mismo; al olvidarlo, el único aviso era un toast que desaparece.
2. Los errores del vínculo no se veían en el campo: solo el toast.
3. El aviso de "sin Tipo de Oficio no se crean actividades" estaba al final del formulario, lejos del vínculo.
4. Al guardar decía solo "Demanda actualizada con éxito", sin decir qué pasó con las actividades.

## Qué cambió
1. **Tipo de vínculo preseleccionado** ("Vinculacion por Oficio Judicial") y justificación autocompletada al agregar un vínculo en este formulario. Sigue siendo editable.
2. **Errores en el campo**: al intentar guardar, cada campo faltante del vínculo se marca en rojo con su mensaje ("Elegí el legajo", "Elegí el tipo de vínculo", "Mínimo 20 caracteres (tiene N)"), la pantalla va al primero y los errores se van solos al completarlos. El toast se mantiene.
3. **Avisos dentro de la tarjeta del vínculo**:
   - con legajo y sin Tipo de Oficio: aviso amarillo "Falta el Tipo de Oficio…" con botón **Elegir tipo** que lleva a "Clasificación del Oficio";
   - con legajo y tipo pero sin medida: "Elegí también la medida vigente…";
   - sin vínculos pero con tipo elegido: "Agregá el vínculo con el legajo y la medida vigente".
4. **Mensaje al guardar** en el oficio de MPE/MPI: "…Las actividades del oficio se agregan al plan de trabajo de MED-xxxx." (o "No se agregaron actividades: falta elegir el Tipo de Oficio.").

## Archivos
| Archivo | Qué hace |
|---|---|
| `src/components/forms/components/VinculosManager.tsx` | Prop `guiaOficio`; errores derivados del envío (se quita el estado local que nunca se llenaba); avisos |
| `src/components/forms/utils/formValidationFeedback.ts` | `vinculoFieldErrors`, `revealClasificacionOficio` |
| `src/components/forms/utils/mensajeGuardado.ts` | Texto de éxito según el caso |
| `src/components/forms/utils/api.ts` | Usa ese texto en crear/actualizar |
| `src/components/forms/MultiStepForm.tsx` | Pasa `guiaOficio`; lleva el foco al primer error del vínculo |
| `src/components/forms/steps/OficioJudicialMPEStep.tsx` | Marca la sección "Clasificación del Oficio" como destino del botón |
| `tests/unit/oficio-vinculo-guia.test.ts` | 7 casos |

## Cómo probarlo
`/mesadeentrada?demanda=<id de un oficio de MPE/MPI>` → "Agregar Vínculo": el tipo viene elegido. Elegí un legajo sin tipo de oficio: aparece el aviso con "Elegir tipo". Dejá un vínculo sin legajo y guardá: el campo queda en rojo y la pantalla va ahí.

## Verificación
Tipos sin errores y tests en verde. Probado en el navegador (admin, demanda #332): tipo preseleccionado, error "Elegí el legajo" en el campo con scroll, aviso de medida. El mensaje de guardado se probó con tests unitarios; el caso real (guardar con tipo + medida → actividades en el plan) se verificó antes con #332.

## Pendiente / notas
- La demanda ya guardada no devuelve la categoría del oficio (el tipo sí), por eso al reabrirla "Categoría" aparece vacía y el tipo dice "Seleccione primero una categoría".
- Ideas aparte: pasar Clasificación junto a Vínculos, hacer obligatoria la medida y mostrar solo vigentes, aclarar "derivar" vs "asignar responsable".
