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
