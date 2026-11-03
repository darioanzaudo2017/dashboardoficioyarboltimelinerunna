# Registro de intervención (paso 3): documentación complementaria a la vista y errores de adjuntos visibles

**Rama:** `mejora-intervencion-documentacion`  **Fecha:** 2026-11-03

## Problema
1. En el paso 3 del registro de intervención ("Documentos y Configuración") la documentación adicional **solo aparecía si se marcaba "Sí" a "¿Se requieren informes ampliatorios?"**,
   y el bloque se llamaba "Configuración Adicional". Pero ahí se adjuntan, en general: notificaciones a padres o familiares, actas y cualquier anexo
   que ayude a explicar la toma de la medida. No es obligatorio, pero tiene que estar a mano.
2. Al observar (rechazar) una apertura y querer adjuntar, **no pasaba nada y no se veía ningún aviso**. Causa: el servidor responde error 500 al subir
   el archivo (`POST .../intervenciones/{id}/adjuntos/`), y el front guardaba el error en un estado que el paso 3 no muestra.
3. Peor: al enviar a aprobación una intervención existente, si la subida del Informe Obligatorio fallaba, **el front igual la guardaba y la enviaba** ("enviada exitosamente"),
   dejando una intervención aprobable sin su informe. Y "Guardar Borrador" decía "guardado" aunque los archivos elegidos no se guardaban.

## Qué cambió
- Paso 3 reordenado y con nuevos títulos:
  1. Informe Obligatorio de Apertura (sin cambios)
  2. **Documentación complementaria (opcional)**: siempre visible, con el texto "No es obligatoria, pero conviene adjuntarla: notificaciones a padres o familiares, actas y cualquier anexo…" (MPE).
     Tiene un selector "Tipo de documento a adjuntar": *Notificación u otro anexo* (se guarda como RESPALDO) o *Acta* (se guarda como ACTA).
  3. **Informes ampliatorios y estado** (la pregunta Sí/No y el estado de la intervención, como estaban).
- Si falla subir o quitar un archivo, aparece un cartel con el motivo. Para un error 500 dice que el servidor tuvo un problema (no se muestra la página HTML del error).
- Si falla la subida del Informe Obligatorio al enviar o al guardar el borrador de una intervención existente, **se corta**: no se guarda ni se envía.
- "Guardar Borrador" de una intervención nueva avisa que los archivos elegidos todavía no se subieron (se adjuntan al enviar).

## Archivos
| Archivo | Qué hace |
|---|---|
| `.../shared/intervencion-modal/steps/documentos/DocumentosAdicionalesSection.tsx` | Sección siempre visible, textos, selector de tipo |
| `.../steps/documentos/ConfiguracionAdicionalSection.tsx` | Nuevo título |
| `.../steps/StepDocumentos.tsx` | Orden de las secciones |
| `.../intervencion-modal/hooks/useIntervencionFiles.ts` | `handleFileUpload` acepta el tipo |
| `.../hooks/useRegistroIntervencion/actions/createAdjuntosActions.ts` | Cartel de error al subir/quitar archivos |
| `.../intervencion-modal/handlers/createIntervencionActions.ts` | No enviar si falla el informe; aviso en el borrador |
| `.../intervencion-modal/types.ts`, `hooks/useIntervencionModalState.ts` | Aviso de tipo "advertencia" |

## Cómo probarlo
1. Abrir `/legajo/92/medida/166`, etapa Innovación → "Cargar / gestionar paso" → "Ver/Editar Intervención" (rechazada) → paso 3.
2. Se ve "2. Documentación complementaria (opcional)" sin tener que marcar nada. Adjuntar un archivo: hoy el servidor responde 500 y aparece el cartel con el motivo.
3. Registro nuevo: "Guardar Borrador" con un archivo elegido muestra el aviso de que todavía no se subió.

## Verificación
Tipos sin errores y tests en verde. En el navegador (admin): la sección se ve sin marcar el "Sí", y al adjuntar en una intervención rechazada (MED-2026-166) aparece el cartel
"No se pudo adjuntar el archivo: el servidor tuvo un problema (error 500)". No se pudo probar una subida exitosa porque el servidor falla.

## Pendiente / notas
- **Backend (bloqueante):** `POST /medidas/{id}/intervenciones/{id}/adjuntos/` y `.../crear-y-enviar/` devuelven 500 con cualquier PDF válido (694 B y 34 KB). Hasta que se arregle, no se puede adjuntar nada en una apertura.
- **Backend:** no valida que exista el Informe Obligatorio al enviar ni al aprobar.
- **Backend:** el servidor solo distingue ACTA, RESPALDO, MODELO e INFORME. Las notificaciones a padres/familiares y los anexos quedan ambos como RESPALDO; conviene un tipo propio para las notificaciones.
- La pregunta "¿Se requieren informes ampliatorios?" se dejó como estaba (el campo se sigue enviando); falta confirmar con el cliente qué hace en el back.
