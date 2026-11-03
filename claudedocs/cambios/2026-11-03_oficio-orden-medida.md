# Oficio de MPE/MPI vigente: orden del formulario y medida vigente obligatoria

**Rama:** `mejora-oficio-orden-medida` (sale de `mejora-oficio-vinculo-guia`; hay que mergear esa primero)  **Fecha:** 2026-11-03

## Problema
1. Lo que dispara las actividades (el vínculo y la **Clasificación del Oficio**) quedaba separado: el vínculo arriba y el Tipo de Oficio recién después de Asignación, Motivo, Ubicación y Expediente.
2. La medida del vínculo figuraba como "Medida (Opcional)", pero sin medida no se agregan actividades. Además la lista incluía medidas **cerradas** (ej. MED-2026-252) y no avisaba si el legajo tenía varias vigentes.

## Qué cambió
1. **Orden del paso** (debajo de los Vínculos): Clasificación del Oficio → Datos del Expediente → Datos del Oficio → Asignación → Motivo → Ubicación → Archivos adjuntos.
2. **Medida vigente** en el vínculo del oficio de MPE/MPI:
   - se llama "Medida vigente *" y solo lista las vigentes (si la demanda ya tenía una medida cerrada elegida, se sigue mostrando);
   - si el legajo tiene **una** vigente, se elige sola; si tiene **varias**, avisa "tiene N medidas vigentes: elegí a cuál corresponde el oficio";
   - es obligatoria cuando el legajo tiene medidas vigentes: error en el campo y en el toast ("Vínculo 2: elegir la medida vigente");
   - si el legajo no tiene vigentes, dice "no tiene medidas vigentes" y no la exige.
   Los otros formularios no cambian.

## Archivos
| Archivo | Qué hace |
|---|---|
| `src/components/forms/steps/OficioJudicialMPEStep.tsx` | Reordena las secciones |
| `src/components/forms/components/VinculosManager.tsx` | Selector de medida vigente, autoselección, avisos |
| `src/components/forms/utils/formValidationFeedback.ts` | `medidasVigentes`, opción `medidaRequerida` en errores y toast |
| `src/components/forms/MultiStepForm.tsx` | Activa `medidaRequerida` en el oficio |
| `tests/unit/oficio-vinculo-guia.test.ts` | 3 casos nuevos |

## Cómo probarlo
`/mesadeentrada?demanda=<id de un oficio MPE/MPI>`: el orden queda Vínculos → Clasificación → Expediente… "Agregar Vínculo" con el legajo 0176: la lista muestra solo 251 y 249 (no la cerrada 252) y avisa que hay 2 vigentes; guardar sin elegir marca el campo.

## Verificación
Tipos sin errores, 38 tests en verde, probado en el navegador (demanda #332, admin).

## Pendiente / notas
- Se consideró vigente solo `estado_vigencia === "VIGENTE"`; si el back usa otros estados activos (ej. pendientes de aprobación) habría que sumarlos.
- Queda la idea del punto 7: aclarar "derivar a zona" vs "asignar responsable".
