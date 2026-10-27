# Evaluación: panel "Cierre de la evaluación" en 3 pasos

Rama: `mejora-evaluacion-cierre` (sale de `main`). Solo front, no se toca el backend ni lo que se envía.

## Problema
Al final de la pantalla de Evaluación había una fila de botones sin orden (Generar PDF, Generar Word, Firmantes,
solicitudes, NNyA, tipo de medida) y la carga del informe estaba más arriba, separada. Además:
- Al generar el PDF, el borrador sin firmar se **agregaba solo** a la lista de archivos y se enviaba con la solicitud.
- Los botones "Solicitud…" no avisaban qué faltaba ni pedían confirmación.
- No había forma de saber que el informe firmado era obligatorio hasta que fallaba el envío.

## Cambios
Panel **CIERRE DE LA EVALUACIÓN** (Técnico):
1. **Generar el borrador del informe (opcional)**: Firmantes + "Generar borrador (PDF)" y "(Word)". El texto explica que
   es un borrador: se descarga, se revisa, se firma y se sube la versión firmada. Si el informe ya está redactado por
   fuera del sistema, se puede saltear. El borrador **ya no se adjunta solo**.
2. **Subir el informe firmado (obligatorio)**: la zona de carga (ARCHIVOS) está justo debajo de los botones del paso 1.
   Se tilda en verde cuando hay al menos un archivo cargado y lista sus nombres.
3. **Pedir la autorización al Director**: dos bloques, "Adoptar una medida" (NNyA + tipo de medida + botón) y "Archivar
   la demanda". Los botones quedan deshabilitados hasta que haya informe (y NNyA / tipo de medida en el caso de la medida),
   y debajo dice qué falta: "Falta: subir el informe firmado, elegir el tipo de medida."
   Antes de enviar hay una **confirmación** con el tipo de medida, los NNyA y los archivos que se adjuntan.

Panel **DECISIÓN DEL DIRECTOR**: resumen de la solicitud del técnico, Firmantes + PDF/Word, "Autorizar" / "No autorizar"
con confirmación. Si el usuario es solo Director (no admin), la zona de carga de archivos se muestra en este panel.
El admin ve los dos paneles, como antes.

## Lo que no cambia
- Los datos que se envían al backend, los endpoints y las validaciones de descripción y valoración.
- Los textos del informe PDF/Word.

## Límites (conocidos)
- El front no puede verificar que el archivo esté realmente firmado: exige un archivo cargado y lo recuerda en el texto.
- Los cambios hechos a mano sobre el borrador (Word) no vuelven al sistema.
- Pendiente de definir con el cliente: un check "Confirmo que el informe está firmado" antes de enviar.

## Archivos
- `src/components/evaluacion/action-buttons.tsx` (panel, pasos, confirmaciones)
- `src/components/evaluacion/evaluacion-tabs.tsx` (la zona de carga se dibuja dentro del panel; deja de adjuntar el borrador)
- `src/components/evaluacion/file-management.tsx` (avisa los nombres de los archivos cargados)

## Cómo probar
1. Entrar a `/evaluacion?id=<id>` de una demanda en Evaluación; completar descripción y valoración.
2. Ver el panel: los botones "Solicitud…" están deshabilitados y dicen qué falta.
3. Subir un archivo sin haber descargado nada: el paso 2 se tilda y se habilitan los botones (falta elegir tipo de medida).
4. Generar el PDF: se descarga, aparece un aviso y **no** se agrega a la lista de archivos.
5. Apretar una solicitud: aparece la confirmación; "Cancelar" no envía nada.

Verificado en el navegador con la #320 (usuario admin), sin enviar ninguna solicitud.

## Observación aparte (no tocada)
En la lista de archivos recién subidos aparece "Invalid Date" como fecha: viene del componente compartido
`FileUploadSection`, que no entiende el formato de fecha con el que `file-management.tsx` carga los archivos nuevos.
