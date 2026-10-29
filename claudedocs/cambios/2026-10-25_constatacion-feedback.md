# Constatación: avisos y confirmaciones

**Rama:** `mejora-constatacion-feedback`  **Fecha:** 2026-10-25

Segunda de tres ramas que salen de revisar la etapa de **Constatación** de una demanda. Esta rama trata de
**avisarle al usuario qué pasó** y de **pedir confirmación antes de acciones que no se pueden deshacer**.

## Problema
- Registrar una actividad, conectar demandas o quitar una conexión **no mostraban ningún aviso**, aunque el código
  pedía mostrarlo. Causa: `MultiStepForm` montaba su **propio** `ToastContainer` (dentro de la pestaña
  "Detalles"), además del global del layout. Al cambiar de pestaña ese contenedor se desmontaba y los avisos de
  las demás pestañas se perdían.
- Un clic en la papelera de "Demandas Conectadas" **quitaba la conexión sin preguntar**.
- "Enviar Respuesta" mandaba un **correo** sin pedir confirmación.
- Buscar por calle sin elegir localidad daba 0 resultados sin explicar por qué.
- Después de "Conectar", el resultado seguía mostrando el botón activo.
- La búsqueda dibujaba una fila "Demanda ID:" vacía (con botón "Conectar") cuando el backend devolvía más
  textos que demandas.

## Qué cambió
- Se quitó el `ToastContainer` duplicado de `MultiStepForm`: ahora se ve **"Actividad registrada con éxito"**,
  **"Demandas conectadas exitosamente"** y **"Conexión eliminada exitosamente"**.
- **Desconectar** pide confirmación: "¿Desconectar esta demanda? … Las demandas no se borran y podés volver a
  conectarlas".
- **Enviar Respuesta** pide confirmación y dice a quién y con qué asunto sale: "Se enviará un correo a … Una vez
  enviado no se puede deshacer". Al cancelar no se pierde lo escrito.
- Bajo "Calle", ayuda: "La calle se busca junto con la localidad: elegí también la localidad."
- Tras conectar, el resultado pasa a **"Ya conectada"**.
- No se dibuja el resultado que no tiene demanda.
- Nuevo componente compartido `ConfirmDialog` (apoyado en `BaseDialog`).

## Archivos
| Archivo | Qué hace |
|---|---|
| `src/components/forms/MultiStepForm.tsx` | Quita el `ToastContainer` duplicado |
| `src/components/shared/ConfirmDialog.tsx` | Diálogo de confirmación reutilizable (nuevo) |
| `src/app/(runna)/demanda/ui/ConexionesDemandaTab.tsx` | Confirmación al desconectar; pasa las demandas ya conectadas a la búsqueda |
| `src/components/searchModal/searchModal.tsx` | Ayuda de la calle, cartel "Ya conectada", salta filas sin demanda |
| `src/app/(runna)/demanda/ui/EnviarRespuestaModal.tsx` | Confirmación antes de enviar el correo |
| `claudedocs/OBSERVACIONES_BACKEND_2026-10-23.md` | Se suman B10 y B11 (hallazgos del backend) |

## Cómo probarlo
1. Abrir una demanda en Constatación (`/demanda/<id>`) y registrar una actividad: aparece el aviso verde.
2. **Conexiones**: escribir una calle sin localidad (ayuda visible); conectar una demanda ("Ya conectada" y aviso);
   tocar la papelera (diálogo de confirmación) y confirmar (aviso "Conexión eliminada").
3. **Enviar Respuesta**: completar el formulario y enviar: aparece la confirmación; "Cancelar" no envía nada.

## Verificación
- 28 tests unitarios pasan; sin errores de tipos en los archivos tocados.
- En el navegador contra el backend real: se vieron los tres avisos que antes se perdían, el diálogo de
  desconexión, la ayuda de la calle, el cartel "Ya conectada" y la confirmación del correo (cancelada, sin envío).
- No se probó en el navegador la fila vacía de resultados ya corregida (se vio antes del arreglo y solo se
  verificó que compila); depende de una respuesta del backend (B11).

## Pendiente / notas
- Hallazgo del backend (B10): una demanda desconectada **no vuelve a aparecer en la búsqueda**, así que no se
  puede reconectar desde la pantalla. Está en el documento de observaciones para el back.
- En "Demandas Conectadas" el estado aparece crudo ("CONSTATACION") hasta que se una la rama
  `mejora-constatacion-textos`.
- Tercera rama pendiente: `mejora-constatacion-evaluacion` (resumen y botón "Enviar a Evaluación"). La regla de
  si exige actividades la define el cliente; no se cambia.
