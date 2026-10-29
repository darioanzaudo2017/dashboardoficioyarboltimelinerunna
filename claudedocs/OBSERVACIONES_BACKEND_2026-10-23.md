# Observaciones para backend — Registro de demanda y asignación

**Fecha:** 2026-10-23
**Origen:** revisión del front siguiendo el tutorial de Mesa de Entradas (login → crear demanda de Protección → derivar) en el ambiente de test.
**API probada:** `https://web-runna-v2legajos.up.railway.app/api` (front en `localhost:3000` y en `nuevo-senaf-runna.vercel.app`).
**Alcance:** lo que **no se puede resolver desde el front**. Cada punto tiene cómo reproducirlo, la evidencia y una sugerencia.

## Resumen

| # | Prioridad | Endpoint | Problema |
|---|---|---|---|
| B1 | Alta | `POST registro-demanda-form` | `telefono` rechaza números de 10 dígitos (límite de entero de 32 bits) |
| B2 | Alta | `POST registro-demanda-form` | Con adjuntos responde `403 HeadObject Forbidden` (S3) y rechaza toda la demanda |
| B3 | Alta | `POST demanda-zona` / `GET gestion-demanda-zona` | Con varios responsables no cambia el estado; la lista y el objetivo no se devuelven; la auditoría no los registra |
| B4 | Media | `POST legajos/buscar-duplicados` | Responde `405` siempre (detección de duplicados inoperante) |
| B5 | Media | `POST registro-demanda-form` | La respuesta trae en `demanda_personas` personas que no están en `personas` |
| B6 | Baja | varios | Valores de `objetivo` inconsistentes entre endpoints |
| B7 | Baja | varios | Formato de errores inconsistente; error de infraestructura devuelto como `400` |
| B8 | Baja | `POST demanda-busqueda-vinculacion` | El texto dice "vinculado a la demanda N" cuando no se vinculó nada |
| B9 | Datos | catálogos / usuarios | Datos de prueba que impiden completar flujos |
| B10 | Media | `POST demanda-busqueda-vinculacion` | Una demanda **desconectada** no vuelve a aparecer en la búsqueda: no se puede reconectar |
| B11 | Baja | `POST demanda-busqueda-vinculacion` | Devuelve más textos (`match_descriptions`) que demandas (`demanda_ids`) |

---

## B1 — `telefono` no admite números con código de área

**Reproducción**
1. Crear una demanda de Protección con un adulto con `telefono: 3511234567` (10 dígitos).
2. Guardar.

**Respuesta**
```
400 Bad Request
{"personas":[{},{"persona":{"telefono":["Asegúrese de que este valor es menor o igual a 2147483647."]}}]}
```

**Causa probable:** el campo se guarda como entero de 32 bits (máx. 2.147.483.647). Un celular argentino con característica (10 dígitos) lo supera siempre.

**Impacto:** no se puede cargar ningún celular completo. El servidor rechaza **toda** la demanda por ese único campo.

**Sugerencia:** guardar `telefono` como texto (`CharField`) o `BigIntegerField`. Revisar los demás campos numéricos con el mismo límite: `dni`, `casa_nro`, `piso_depto`, `lote`, `mza`, y el teléfono del médico de cabecera (este último no se probó).

**Mitigación en el front (temporal):** se valida el tope en el campo y se avisa "Ingresá el número sin código de área". Esto **impide** guardar números reales; hay que **quitar** la validación (`phoneFieldRules` en `src/components/forms/utils/numberRules.ts`) cuando el back lo corrija.

---

## B2 — Adjuntos: `403 HeadObject Forbidden` y rechazo de toda la demanda

**Reproducción**
1. Crear una demanda con un adjunto (se probó con un PNG de 70 bytes).
2. Guardar.

**Respuesta**
```
400 Bad Request
{"error":"An error occurred (403) when calling the HeadObject operation: Forbidden"}
```

**Contraste:** el mismo formulario **sin adjunto** se guarda (`201`).

**Causa probable:** el rol/credenciales que usa el back para S3 no tienen permiso `s3:GetObject`/`HeadObject` sobre el bucket.

**Impacto:** cualquier demanda con adjunto falla y no se crea.

**Sugerencia:**
- Corregir permisos del bucket/IAM.
- Si el almacenamiento falla, devolver un `5xx` con un mensaje claro, no `400`.
- Evaluar si la demanda debe crearse igual y reportar el adjunto fallido por separado.

**Mitigación en el front:** el error se traduce a "No se pudieron guardar los archivos adjuntos…".

---

## B3 — Asignación con varios responsables

El modal "Derivar Demanda" envía `POST demanda-zona`:

```json
{"zona":5,"demanda":324,"objetivo":"proteccion",
 "user_responsable":46,"users_responsables":[46,47], ...}
```

### B3a — El estado depende de `user_responsable`
| Se envía | Resultado |
|---|---|
| `user_responsable: <id>` | `201` y la demanda pasa a **Constatación** |
| `user_responsable: null` + `users_responsables: [46,47]` | `201` pero **sigue "Sin Asignar"**, sin error |

**Sugerencia:** que el estado cambie también con `users_responsables`, o que rechace (`400`) el caso `user_responsable: null` con lista cargada, en vez de aceptarlo en silencio.

**Mitigación en el front:** ahora se envía como `user_responsable` al **primer** usuario seleccionado y la lista completa en `users_responsables`. Es un workaround; si el back lo resuelve, se puede simplificar.

### B3b — Las lecturas no devuelven la lista ni el objetivo
- `POST demanda-zona` responde solo `user_responsable` (sin `users_responsables`, sin `objetivo`).
- `GET gestion-demanda-zona/<id>/` → cada `demanda_zonas[]` trae únicamente: `id, enviado_por, recibido_por, zona, user_responsable, esta_activo, recibido, comentarios, demanda`.

**Consecuencia:** al reabrir el modal se ve **un solo responsable** y el objetivo vuelve al valor por defecto, aunque se haya asignado a dos.

**No se pudo verificar si el segundo responsable se guarda** o se descarta: no hay ningún endpoint de lectura que lo muestre.

**Sugerencia:** devolver `users_responsables` y `objetivo` en `POST demanda-zona` y en `GET gestion-demanda-zona/<id>/`.

**Mitigación en el front:** el objetivo se precarga con `objetivo_de_demanda` de la lista de Mesa de Entradas, y el modal avisa que solo se muestra el responsable principal.

### B3c — La auditoría no registra a quién ni con qué objetivo
`GET auditoria-demanda-zona/<id>` devuelve solo textos del tipo:
```
admin - Ha derivado la demanda a la zona 1EQUIPO RUNNA
admin - Ha quitado la derivacion de la demanda en la zona 1EQUIPO RUNNA
```
Cada reasignación genera "quitó" + "derivó" aunque la zona sea la misma, y **no figuran los usuarios ni el objetivo**. Cada asignación crea un `demanda_zona` nuevo que reemplaza al anterior (ej. id 445 → 446); el `GET` solo lista el vigente.

**Sugerencia:** registrar responsables y objetivo en la auditoría, y no generar "quitó/derivó" si la zona no cambia.

---

## B4 — `legajos/buscar-duplicados` responde siempre `405`

**Reproducción**
```bash
# con un token válido
curl -X POST "$API/legajos/buscar-duplicados"  -H "Authorization: Bearer $T" -H "Content-Type: application/json" -d '{"nombre":"Lucas","apellido":"Errores","dni":50111222}'
curl -X POST "$API/legajos/buscar-duplicados/" ...   # misma respuesta
```
**Ambas** dan:
```
405 Method Not Allowed
allow: GET, PATCH
{"detail":"Método \"POST\" no permitido."}
```

**Hipótesis:** la ruta `legajos/<pk>/` (que admite GET y PATCH) está capturando `buscar-duplicados` como si fuera un id, porque se registra antes que la acción personalizada. Conviene revisar el orden de rutas del router de `legajos`.

**Impacto:** la detección de duplicados (LEG-01) no funciona. El front la intenta con cada cambio de datos de una persona, lo que genera una cadena de errores 405 en la consola (un grupo por cada persona cargada).

**Nota:** la documentación del front (`legajo-duplicado-types.ts`) indica `POST /api/legajos/buscar-duplicados/`. Se probaron ambas variantes, con y sin `/`.

---

## B5 — `registro-demanda-form` devuelve personas que no se enviaron

Caso: demanda con 2 personas (1 NNyA + 1 adulto) y un vínculo con el legajo `LEG-2026-0174`.

- `personas` (2): las enviadas.
- `demanda_personas` (3): las dos enviadas **más** `persona_id: 333` con `vinculo_demanda: "NNYA_SECUNDARIO"` (el niño del legajo vinculado).

El backend agrega esa persona por su cuenta, pero no figura en `personas`. Esto hace que el resumen del front muestre "2 NNyA" y nombre solo a uno.

**Sugerencia:** incluir a las personas incorporadas en `personas`, o marcarlas (p. ej. `origen: "legajo_vinculado"`).

**Mitigación en el front:** el resumen aclara "Incluye 1 persona incorporada automáticamente desde el legajo vinculado".

---

## B6 — Valores de `objetivo` inconsistentes

| Dónde | Valores |
|---|---|
| `demanda.objetivo_de_demanda` (registro/lista) | `PROTECCION`, `PETICION_DE_INFORME`, `CARGA_OFICIOS` |
| `demanda-zona.objetivo` (derivación) | `proteccion`, `peticion_informe` |
| Filtro "Objetivo de demanda" de Mesa de Entradas | `CONSTATACION`, `PETICION_DE_INFORME` |

Mayúsculas/minúsculas distintas, y `CONSTATACION` en el filtro no existe como objetivo de demanda. Además `GET tipos-vinculo/` no devuelve un arreglo (el front lo normaliza y lo advierte en consola: *"Tipos de vínculo response was not an array"*).

**Sugerencia:** unificar el catálogo de valores y su formato.

---

## B7 — Formato de errores inconsistente

- Validación: estructura anidada tipo DRF, con huecos posicionales (`"personas":[{}, {...}]`).
- S3: `{"error": "…"}` con status `400`, siendo un fallo de infraestructura.

**Sugerencia:** un formato único para errores, y `5xx` para fallos del servidor.

---

## B8 — `demanda-busqueda-vinculacion`: texto engañoso y coincidencias ruidosas

La descripción devuelta dice, por ejemplo:
> "Se encontró coincidencia en la localización por match en el campo 'calle' (Colon) y 'localidad' (CORDOBA); **vinculado a la demanda 323**"

No se vinculó nada: es solo una coincidencia. Además, coincidir por calle + localidad marca como "coincidentes" demandas de personas distintas.

**Sugerencia:** cambiar el texto a "coincide con la demanda N" y evaluar exigir más criterios (por ejemplo, también la altura).

---

## B9 — Datos del ambiente de test

- `tipos-vinculo`: la opción `id 20` tiene el nombre "who" y una descripción de texto de relleno ("What act culture whether world…").
- Condiciones de vulnerabilidad: el catálogo está vacío ("No options"), no se puede completar.
- Zona `1EQUIPO RUNNA` (id 5): solo hay dos usuarios (`UsuarioDirector`, `UsuarioLegal`), sin técnicos ni "legales de protección"; el filtro "Solo legales de protección" queda vacío.

---

## B10 — Una demanda desconectada no se puede volver a conectar

En la pestaña **Conexiones** de una demanda se buscan otras para conectar. Al desconectar, el front marca el
registro de `demanda-vinculada` con `deleted: true` (no lo borra).

**Reproducción** (con las demandas #324 y #323, ya conectadas y luego desconectadas):
```bash
POST /api/demanda-busqueda-vinculacion/   {"dni":50111222}                    -> demanda_ids: [323]
POST /api/demanda-busqueda-vinculacion/   {"dni":50111222,"demanda":324}       -> demanda_ids: []     (!)
POST /api/demanda-busqueda-vinculacion/   {"dni":50111222,"demanda":321}       -> demanda_ids: [323]
GET  /api/demanda-vinculada/?demanda_preexistente=324 -> [{"id":68,"demanda_entrante":323,"deleted":true}]
```
Con `demanda: 324` la #323 queda excluida **porque existe un vínculo con `deleted: true`**. Desde la #323 tampoco
encuentra a la #324.

**Impacto:** después de desconectar por error no hay forma de volver a conectar desde la pantalla.

**Sugerencia:** al excluir demandas ya conectadas, ignorar los vínculos con `deleted: true`.

---

## B11 — `match_descriptions` más largo que `demanda_ids`

Al buscar por nombre (ej. "Tutorial RUNNA 0909" desde la #324) la respuesta trae 2 textos de coincidencia pero 1
solo id de demanda. El front los emparejaba por posición y dibujaba una fila "Demanda ID:" vacía con el botón
"Conectar" activo.

**Sugerencia:** que cada texto lleve su id (por ejemplo una lista de objetos `{demanda_id, descripcion}`), o que
los textos de legajos vengan en otro campo.

**Mitigación en el front:** no se dibuja la fila que no tiene demanda.

---

## Pendiente de verificar por el back

1. ¿Se persiste el segundo responsable de `users_responsables`? (B3b)
2. ¿Qué otros campos enteros tienen el límite de 32 bits? (B1)
3. ¿Está registrado el router de `legajos` con `buscar-duplicados` antes que `<pk>`? (B4)

## Datos creados en el ambiente de test durante la revisión

- Demandas **#323** y **#324** (Constatación), con personas de prueba "Gonzalez Prueba" y "Errores". Se pueden borrar.
- Varias reasignaciones sobre ambas (`demanda_zona` ids 445 y 446 entre otros).

## Cambios del front relacionados (rama `mejoras-ux-front`)

Para que se puedan revisar o revertir cuando el back corrija:

| Archivo | Qué hace | Depende de |
|---|---|---|
| `src/utils/apiErrorFormatter.ts` | Traduce errores del backend a mensajes legibles | B1, B2, B7 |
| `src/components/forms/utils/numberRules.ts` | Valida tope de teléfono y DNI | **B1 (quitar al corregir)** |
| `src/components/asignarModal.tsx` | `user_responsable` = primer usuario; objetivo precargado; aviso de responsable principal | B3 |
| `src/app/(runna)/nuevoingreso/components/DemandaSuccessModal.tsx` | Aclara personas incorporadas desde el legajo | B5 |
