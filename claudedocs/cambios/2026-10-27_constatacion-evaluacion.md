# Constatación: resumen y botón "Enviar a Evaluación" a la vista

**Rama:** `mejora-constatacion-evaluacion`  **Fecha:** 2026-10-27

Tercera de tres ramas que salen de revisar la etapa de **Constatación** de una demanda. Esta rama trata de
**saber cuánto se cargó** y de **encontrar fácil la acción que cierra la etapa**. No cambia la regla de cuándo
se puede enviar a Evaluación (ver "Decisión pendiente del cliente").

## Problema
- El botón **"Enviar a Evaluación"** estaba abajo de todo, **solo en la pestaña "Detalles"**. Quien terminaba de
  registrar actividades o respuestas no veía cuál era el siguiente paso.
- Las pestañas no mostraban cuánto se había cargado: había que abrir cada una para saberlo.
- Al enviar no había ninguna confirmación ni resumen de lo hecho.

## Qué cambió
- **Contadores en las pestañas:** "Enviar Respuesta (1)", "Registrar Actividad (6)". Se actualizan solos al
  registrar algo (comparten la misma consulta que las pestañas).
- **"Enviar a Evaluación" en el encabezado de la demanda**, visible desde cualquier pestaña, al lado de
  "Volver a Mesa de Entrada". Se quitó el botón de abajo para no tener dos.
- **Confirmación con resumen:** "La demanda #324 pasa a la etapa de Evaluación. Resumen de la Constatación:
  6 actividades registradas y 1 respuesta enviada."
- Si el botón está deshabilitado, un texto explica por qué ("La demanda ya está en Evaluación" / "En este estado
  no se puede enviar a Evaluación").
- Se mantiene lo de siempre: no aparece en demandas de "Petición de informe" ni de "Carga de oficios", y queda
  deshabilitado cuando la demanda ya está en Evaluación o en un estado terminal.

## Archivos
| Archivo | Qué hace |
|---|---|
| `src/app/(runna)/demanda/DemandaDetail.tsx` | Contadores, botón en el encabezado, confirmación con resumen |
| `src/app/(runna)/demanda/utils/constatacionResumen.ts` | Cuenta elementos, arma el nombre de la pestaña y el texto del resumen |
| `src/components/shared/ConfirmDialog.tsx` | Diálogo de confirmación (idéntico al de `mejora-constatacion-feedback`) |
| `tests/unit/constatacion-resumen.test.ts` | Tests de los contadores y el resumen |

## Cómo probarlo
1. Abrir una demanda en Constatación (`/demanda/<id>`): las pestañas muestran los números y el botón está arriba.
2. Registrar una actividad: el número de la pestaña sube sin recargar.
3. Tocar **Enviar a Evaluación**: aparece la confirmación con el resumen; "Cancelar" no cambia nada.
4. Abrir una demanda ya en Evaluación: el botón está deshabilitado (con explicación al pasar el mouse).
   Una "Petición de informe": no hay botón.

## Verificación
- 35 tests unitarios pasan (7 nuevos); sin errores de tipos en los archivos tocados.
- En el navegador contra el backend real: contadores correctos (6 actividades y 1 respuesta en la #324), el
  contador pasó de 6 a 7 al registrar, la confirmación muestra el resumen, y se comprobó el botón deshabilitado
  (#320, en Evaluación) y ausente (#319, Petición de informe).
- No se confirmó el envío real a Evaluación para no cambiar de etapa la demanda de prueba.

## Decisión pendiente del cliente
Hoy el botón **no exige nada**: se puede enviar con 0 actividades. El resumen solo informa los números, sin
juzgarlos. Si el cliente quiere una regla, se puede configurar **desde el front sin tocar el back**:

| Opción | Cómo se cambia | Comentario |
|---|---|---|
| A. Variable de entorno (ej. `NEXT_PUBLIC_EVALUACION_REQUIERE_ACTIVIDAD` = `no` / `aviso` / `si`) | Se edita en el hosting y se redespliega | La más simple; ya se usa un mecanismo parecido (`NEXT_PUBLIC_USE_SUPABASE`). Cada cliente puede tener su valor |
| B. Archivo de configuración en el código | Se edita el archivo y se redespliega | Queda versionada, pero cambiarla es tocar código |
| C. Pantalla de administración | — | Descartada: sin el back solo se guardaría en cada navegador |

Modos posibles: `no` (como hoy), `aviso` ("todavía no registraste actividades, ¿enviar igual?") y `si`
(bloquea y explica). El conteo ya está disponible en `DemandaDetail` (`actividadesCount`, `respuestasCount`).

**Límite:** es una guía de pantalla, no una barrera de seguridad; quien llame a la API directamente se la saltea.
Si el cliente la quiere como regla dura, tiene que validarla el back.

## Pendiente / notas
- La pestaña "Conexiones" no tiene contador: su lista se arma de otra forma (combina varias consultas) y un
  número desfasado confundiría más de lo que ayuda.
- En el botón de "Detalles" (mismo `ConfirmDialog`) y en `mejora-constatacion-feedback` el archivo
  `ConfirmDialog.tsx` es el mismo: al juntar las ramas no debería haber conflicto.
