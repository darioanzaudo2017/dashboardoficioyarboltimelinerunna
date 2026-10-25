# El borrador vuelve al paso donde se dejó

**Rama:** `mejora-borrador-paso`  **Fecha:** 2026-10-25

## Problema
El registro de una demanda guarda un borrador automático. Al retomarlo ("Continuar borrador") los **datos** se
recuperaban, pero el formulario volvía **siempre al paso 1**. Quien había avanzado hasta "Niños y Adolescentes"
tenía que volver a pasar por los pasos anteriores para llegar a donde estaba trabajando.

## Qué cambió
- El borrador recuerda **en qué paso estaba** el usuario.
- Al retomarlo, el formulario abre **en ese paso** (con los anteriores marcados como completos).
- El aviso lo dice: "Borrador cargado: retomás en el paso 3."
- Si el paso guardado no existe (borrador viejo o formulario con menos pasos) se usa el último válido.
- El paso se borra junto con el borrador (al guardar la demanda o al "Descartar y empezar nuevo").

## Cómo funciona
- El paso se guarda en el mismo almacén del borrador (`form-drafts-storage`), en un campo aparte
  (`draftSteps`), **separado de los datos del formulario** para que no viaje al backend.
- Es el índice del paso de contenido (0 = Información General), sin contar el paso de elegir objetivo.
- Solo lo recuerdan los borradores con nombre (el registro nuevo); la edición de una demanda no.
- Al retomar el borrador, la página **remonta el formulario** para que calcule el paso inicial. Sin eso el
  formulario (ya montado sin datos) mostraba el aviso "paso 3" pero seguía en el paso 1.

## Archivos
| Archivo | Qué hace |
|---|---|
| `src/components/forms/utils/userDraftStore.ts` | Guarda/lee/borra el paso junto al borrador |
| `src/components/forms/utils/draftStep.ts` | `resolveResumeStep`: acota el paso guardado a uno válido |
| `src/components/forms/MultiStepForm.tsx` | Guarda el paso al avanzar y arranca en el paso guardado |
| `src/app/(runna)/nuevoingreso/page.tsx` | Remonta el formulario al retomar y avisa a qué paso vuelve |
| `tests/unit/draft-step.test.ts` | Tests del cálculo del paso |

## Cómo probarlo
1. Iniciar sesión → **Nuevo Registro** → "Protección Inicial" → completar Información General y avanzar
   hasta el paso 3 (o el 2).
2. Recargar la página.
3. En el diálogo, elegir **Continuar borrador**: el formulario abre en el paso donde estabas.
4. Probar también "Descartar y empezar nuevo": vuelve a empezar desde el objetivo.

## Verificación
- 32 tests unitarios pasan (4 nuevos); sin errores de tipos en los archivos tocados.
- En el navegador: se avanzó hasta el paso 3, se guardó `draftSteps: {"new-registro": 2}`, tras recargar y
  "Continuar borrador" el formulario abrió en "Niños y Adolescentes" con los pasos 1 y 2 completos.
- Durante la prueba apareció (y se corrigió) un fallo: sin remontar el formulario el paso inicial no se
  recalculaba y además el paso guardado se pisaba con 0.

## Pendiente / notas
- Los datos del borrador siguen en el navegador (`localStorage`): no viajan entre equipos ni usuarios.
- Ideas siguientes: mostrar la fecha/hora del último guardado en el diálogo del borrador.
