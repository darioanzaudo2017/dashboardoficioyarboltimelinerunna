# Observaciones para el equipo de backend — 2026-11-04

Salen de recorrer el front en RUNNA test (usuario `admin`) mientras se actualizaba el tutorial. Cada punto dice **qué pasa**, **dónde se vio** y **qué se pide**. Ordenados por prioridad. Ninguno se resolvió en el front: donde el front pudo compensar, se aclara.

## Alta prioridad

### 1. Almacenamiento de archivos: no se puede subir ni descargar
- **Subida:** al adjuntar archivos (intervención, actividades, oficios) el servidor responde error (`500` o `400` con `An error occurred (403) when calling the HeadObject operation: Forbidden`). Por eso en el sistema de prueba no se puede enviar una intervención con su Informe Obligatorio ni completar actividades (todas exigen evidencia).
- **Descarga:** las URL firmadas que devuelve `adjuntos-list` (`url_descarga`/`archivo`, host `t3.storageapi.dev`) responden `403 SignatureDoesNotMatch`. Ejemplo: medida `MED-2026-226` (legajo 164), intervención `INT-MED-2026-000105`, archivo `Constancia de CBU (1).pdf`.
- **Pedido:** revisar credenciales/permiso del bucket y la firma de las URL. Mientras no se arregle no se puede probar el circuito de apertura completo (aprobación → aval → informe jurídico).

### 2. Se puede enviar una intervención sin Informe Obligatorio
- La intervención de `MED-2026-251` está enviada y no tiene ningún adjunto de tipo `INFORME`; en total 4 de 91 intervenciones MPE/MPI no tienen adjuntos.
- **Pedido:** validar en el servidor, al enviar y al aprobar, que exista el Informe Obligatorio (hoy lo exige solo la pantalla).

### 3. Fechas de calendario enviadas como datetime a medianoche UTC
- `fecha_cierre` llega como `"2026-11-03T00:00:00Z"`. En Argentina (UTC-3) cualquier cliente la ve como el día anterior (se vio "Apertura 03/11 · Cierre 02/11" en `MED-2026-252`).
- `fecha_apertura` sí trae hora real (`...T15:56:03Z`) y no tiene el problema.
- **Pedido:** enviar las fechas de calendario como `AAAA-MM-DD` (campo date). El front ya compensa el caso `T00:00:00Z`, pero conviene revisar los demás campos de fecha.

## Media prioridad

### 4. Etiquetas de tipos de adjunto que no coinciden con el formulario
- `tipo = INFORME` se muestra como **"Informe Ampliatorio"** (`tipo_display`), pero en el formulario de intervención es el **Informe Obligatorio** (cada intervención tiene exactamente uno). `RESPALDO` se muestra como "Documentación Respaldatoria" y el formulario lo llama "Documentación complementaria".
- No hay un tipo propio para **notificaciones a padres/familiares**: hoy se usa `ACTA`.
- **Pedido:** unificar los nombres con los del formulario (Informe obligatorio / Notificaciones y actas / Documentación complementaria) y, si se quiere separar, crear un tipo para notificaciones.

### 5. Duplicados que el servidor no valida
- **Mismo DNI cargado dos veces:** generó dos legajos y dos medidas vigentes (`LEG-2026-0176` / `MED-2026-249` y `LEG-2026-0177` / `MED-2026-250`).
- **Dos medidas vigentes del mismo tipo en un legajo:** el legajo 176 tiene `MED-2026-249` y `MED-2026-251` (MPE) vigentes a la vez.
- **Pedido:** definir si es válido y, si no, validar en el servidor. El front hoy solo avisa ("Hay otra medida vigente del mismo tipo…"); no bloquea.

### 6. Tipos de oficio: falta el dato "cierra la medida" y la categoría no vuelve al leer
- El catálogo `tipos-oficio/` trae `id, nombre, descripcion, categoria, activo, orden` (146 tipos) y **no indica cuáles cesan/cierran una medida** (≈23 de cese). Hoy el front deduce el cese por el nombre de la categoría ("CESE…").
- Al guardar con categoría y tipo, la demanda se guarda bien, pero al **volver a leerla no devuelve la categoría** (solo el tipo): el formulario muestra la categoría vacía.
- **Pedido:** exponer en el tipo de oficio qué hace (abre MPJ / cesa medida / agrega actividades) y devolver la categoría al leer la demanda.

### 7. Qué pasa con las actividades abiertas de una medida que se cierra
- Un oficio de cese cierra la medida al guardar (correcto: lo dispone el juzgado). La medida cerrada `MED-2026-252` conserva 7 actividades pendientes.
- **Pedido:** definir si deben cancelarse/cerrarse al cese y documentarlo.

## Mejoras de rendimiento (opcionales)

### 8. Actividades de oficio por demanda
- `actividades/` no se puede filtrar por demanda: solo se puede traer `origen=DEMANDA_OFICIO` (máximo 100 por página) y filtrar en el cliente por `oficio_origen.id`. Todo el conjunto pesa ≈775 KB y ≈7 s.
- `mesa-de-entrada/` no trae un resumen de actividades por demanda, por eso la bandeja no puede mostrar el estado de las actividades de cada oficio.
- **Pedido:** filtro `?demanda=<id>` en `actividades/` y un resumen (total, sin reasignar, pendientes) en cada fila de `mesa-de-entrada/`.

### 9. Niños por dispositivo
- La página nueva "Dispositivos" cuenta niños por tipo de dispositivo e institución usando `medidas-all/?include_actividades=false` (una llamada, pero trae todas las medidas al navegador).
- **Pedido (opcional):** un endpoint agregado (por tipo/subtipo de dispositivo, con filtros de tipo de medida y zona) para cuando el volumen crezca.
- **Pregunta:** ¿el servidor guarda el **historial** de dispositivos por los que pasó cada niño? La pantalla solo muestra el último.
- Hoy casi todas las medidas vigentes no tienen dispositivo configurado (136 de 140 niños en la prueba).

## Para confirmar con el equipo

- **"Configurar dispositivo"** responde "No existe ninguna intervención para esta medida" si no hay intervención registrada. ¿Es lo esperado?
- **"Técnico a cargo"** de la intervención se toma de `asignaciones_activas[0].user_responsable` del legajo. Una asignación "Pendiente de recepción" sin responsable no cuenta, y el formulario se bloquea. ¿Es el criterio buscado?
- La pregunta **"¿Se requieren informes ampliatorios?"** del paso 3 de la intervención (`requiere_informes_ampliatorios`): ¿qué efecto tiene en el servidor, además de abrir la documentación complementaria en el front?
- `duracion_dias` de medidas cerradas el mismo día: hay una nota previa en el código sobre un valor `-1`; verificar que no vuelva a aparecer.

## Datos de prueba mencionados
`MED-2026-226` (legajo 164, con adjuntos, en informe jurídico), `MED-2026-251` y `MED-2026-249` (legajo 176), `MED-2026-252` (cerrada por cese), demandas `#328` a `#332` (oficios), `#324` (pasada a Evaluación para el tutorial).

---

## Actualización (2026-11-04, tarde): error exacto de los adjuntos y qué pasa sin archivo

Se recorrió el circuito completo con la demanda `#333` (legajo `LEG-2026-0179`, medida `MED-2026-253`). **Todas las subidas de archivos fallan igual**; sin archivo, el servidor acepta.

| Endpoint | Con archivo | Sin archivo |
|---|---|---|
| `POST /api/evaluaciones/` (campo `uploaded_files`) | **500** Server Error (HTML, sin detalle). `x-railway-request-id: nNqeCvoWR0e3YM6DnPRhug` | **201** (evaluación `158` creada, la demanda pasó a Pendiente de Autorización) |
| `POST /api/medidas/253/intervenciones/crear-y-enviar/` (`archivos[]` + `tipos[]=INFORME`) | **500** Server Error. `x-railway-request-id: SBupLZrlSweM-CcH9fVATg` | **201** (`INT-MED-2026-000111`, estado "Enviado a Aprobación") |
| `POST /api/medidas/253/informe-juridico/crear-y-enviar/` (`informe_oficial`) | **500** Server Error | **400** `El informe oficial es obligatorio` (validación correcta) |

- La respuesta de los 500 es la página HTML genérica de Django (`<h1>Server Error (500)</h1>`), sin mensaje: parece una excepción sin capturar al guardar el archivo (coincide con el `403 HeadObject` / `SignatureDoesNotMatch` del almacenamiento). Conviene revisar el log del servidor con esos `request-id`.
- **Consecuencia:** hoy no se puede completar el informe jurídico (obligatorio en el servidor), así que ninguna apertura puede llegar a la ratificación.
- Confirma el punto 2: **una intervención se puede enviar y aprobar sin Informe Obligatorio** (solo lo exige la pantalla).

### Campos obligatorios que el servidor valida pero no estaban a la vista del front
- `justificacion_tecnico` (en `evaluaciones/` al pedir la medida) y `justificacion_director` (al autorizar o no autorizar: `El campo justificacion_director es obligatorio`). El front los pedía solo ante una discrepancia del Director, por lo que el flujo normal no avanzaba. Ya se corrigió en el front; conviene confirmar que ambos deben ser obligatorios desde el primer pedido.

### Lo que sí funcionó sin archivos (circuito de apertura)
Asignar demanda → Constatación → Evaluación → solicitud → autorización del Director (`PUT /api/evaluaciones/333/autorizar/` → 200, crea `LEG-2026-0179` + MPE vigente) → intervención enviada → aprobación del Jefe Zonal («Pendiente nota aval») → Nota de Aval del Director de Zona («Pendiente informe jurídico»).

---

## Actualización (2026-11-04, noche): almacenamiento arreglado y circuito completo hasta el cese

### El almacenamiento (punto 1) ya funciona
- Las URL firmadas de descarga responden `200` (antes `403 SignatureDoesNotMatch`), por ejemplo la intervención 113 de `MED-2026-226`.
- Las subidas funcionan desde la pantalla y por API: informe jurídico (`201`), Resolución Judicial de la ratificación, informe obligatorio de la intervención de cese y documento de la aprobación del Director.
- **Se puede dar por resuelto el punto 1.** Sigue vigente el punto 2 (el servidor acepta una intervención sin Informe Obligatorio).

### Circuito de apertura completo
`MED-2026-253` pasó por aprobación del Jefe Zonal, nota de aval, informe jurídico y ratificación judicial («Ratificada», ciclo MED-01 → MED-05) con archivos reales.

### Circuito de cese de MPE
Cese iniciado → intervención → aprobación → nota de aval → informe jurídico. **La medida se cierra al enviar el informe jurídico de cese** (`estado_vigencia: Cerrada`, `fecha_cierre` del día) y se abre una etapa `POST_CESE`. Antes de ese envío seguía vigente y sin fecha de cierre.

### Nuevos hallazgos

#### 10. El cese de MPE exige dispositivo que el formulario no pide (alta)
- `POST /api/medidas/{id}/intervenciones/crear-y-enviar/` de una etapa de **Cese** de MPE responde `400`:
  `{"error":"CAMPOS_INCOMPLETOS","detalle":"Faltan campos obligatorios para crear y enviar","campos_faltantes":["tipo_dispositivo_id"]}`. Con `tipo_dispositivo_id` responde lo mismo para `subtipo_dispositivo_id`.
- El formulario de cese no pide dispositivo (solo apertura e innovación) y la medida ya tiene uno configurado. Con ambos campos el servidor acepta (`201`, `INT-MED-2026-000112`).
- `x-railway-request-id` del primer rechazo: `LGgLVHOqQB-obnPA-_9nXA`.
- **Pedido:** no exigir el dispositivo en la intervención de cese, o tomarlo de la medida. Si se prefiere exigirlo, avisar y el front lo manda.
- **DECISIÓN PENDIENTE (a definir con el usuario y el equipo de backend).** Hoy el cese de MPE **no se puede enviar desde la pantalla**. Dos salidas:
  - **A. El backend deja de exigir el dispositivo en el cese** (el cese no depende del dispositivo; es lo recomendado). El front no cambia.
  - **B. El front manda el dispositivo que la medida ya tiene configurado** (tipo y subtipo de la última intervención aprobada). Es un cambio chico, pero depende de que la medida tenga un dispositivo cargado; si no lo tiene, el cese seguiría bloqueado.
  - Mientras no se decida, el cese de MPE solo se completó por API (ver «Pruebas hechas directo contra la API»). El cese de MPI y el de MPJ no tienen este problema.

#### 11. Etapa de cese que no avanza de estado en el historial (media)
- Después de cerrada la medida, `historial_etapas` sigue mostrando la etapa `MPE - CESE` en `PENDIENTE_INFORME_JURIDICO`, aunque el informe ya se envió. Conviene que quede en un estado final.

#### 12. Qué pasa con la etapa de cese y la ratificación (consulta)
- En el cese de MPE no aparece paso de ratificación judicial: el informe jurídico cierra la medida. ¿Es lo esperado? (El tutorial lo describía con ratificación.)

### Pruebas hechas directo contra la API (no desde la pantalla)
Se documentan para que no se confundan con uso normal. Medida `MED-2026-253` (legajo 179, datos de prueba):
- `POST informe-juridico/crear-y-enviar/` (`201`, informe `86`) para comprobar el almacenamiento.
- `POST intervenciones/crear-y-enviar/` de cese con dispositivo (`201`, `INT-MED-2026-000112`) para poder seguir tras el punto 10.

---

## Actualización (2026-11-04, noche II): recorrido de MPI y medida compartida

### Circuito de MPI (funciona como se espera)
`MED-2026-255` (legajo 180, medida compartida con el legajo 174): intervención de apertura → aprobación del Jefe Zonal → la apertura queda completa («Pendiente de informe de cierre», Seguimiento «Completado») → informe de cierre → **medida «Cerrada»** (`fecha_cierre` del día, `tipo_cese: Archivo de MPI cesada`). No pasa por aval, informe jurídico ni ratificación; el panel de la etapa los marca «no aplica». La MPI **no** exige dispositivo (a diferencia del cese de MPE, punto 10).

### Nuevos hallazgos

#### 13. `legajos_adicionales[].nnya.nombre_completo` trae el texto interno del objeto (media)
- En una medida compartida, `GET /api/medidas/255/?legajo_id=180` devuelve para el otro NNyA:
  `"nombre_completo": "delegano niño - 1001 - 2017-09-07 - None - 566723366 - VALIDO - MASCULINO - None - False - True"` (id `333`, `dni` `566723366`).
- Es el `__str__` del modelo, no el nombre. La pantalla lo muestra tal cual en el chip «Esta medida también cubre a…».
- **Pedido:** devolver `nombre` y `apellido` por separado (o un `nombre_completo` real, «Apellido, Nombre»).

#### 14. Adjuntos de la evaluación sin nombre, tamaño ni fecha (baja)
- `latest_evaluacion.adjuntos` de `registro-demanda-form/{id}/full-detail/` trae solo `{ "archivo": "<url firmada>" }`.
- Las intervenciones sí traen `nombre_original`, `tamaño_bytes` y `fecha_subida`.
- **Pedido:** agregar esos campos para mostrar el archivo completo. El front ya no rompe sin ellos (rama `mejora-evaluacion-archivo-nombre-fecha`).

#### 15. Estados de etapa de MPI como código interno (baja)
- `etapa_actual.estado` de una MPI llega como `PENDIENTE_DE_INFORME_DE_CIERRE` / `INFORME_DE_CIERRE_REDACTADO`, sin `estado_display` (la MPE sí lo trae, p. ej. «(4) Pendiente de informe jurídico»). La pantalla mostraba el código crudo.
- **Pedido:** devolver `estado_display` también en las etapas de MPI. (En el repositorio original ya hay una rama del front que traduce esos códigos: `fix/codigos-crudos-etiquetas`.)

### Pruebas directo contra la API (no desde la pantalla)
Ninguna en este tramo: la MPI, la evaluación (incluida la subida del informe firmado) y el cierre se hicieron desde la pantalla.
