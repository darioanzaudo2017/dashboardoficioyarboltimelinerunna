# Pedido al backend: validar legajo y medida vigente al crear una medida

Fecha: 2026-10-29. API probada: `https://web-runna-v2legajos.up.railway.app/api` (sistema de test).
Continúa `OBSERVACIONES_BACKEND_2026-10-23.md` (B1–B11).

## Resumen
Al autorizar una medida (`PUT evaluaciones/<demanda>/autorizar/?autorizar=true` con `decision=AUTORIZAR_ADMISION`) el sistema crea
legajo y medida sin comprobar si la persona ya tiene legajo **por DNI** ni si ya tiene una **medida vigente**. Resultado: legajos
duplicados y varias medidas vigentes para el mismo niño.

## B12 — Se puede registrar la misma persona (mismo DNI) más de una vez
`POST` de la demanda con un NNyA de DNI ya existente crea una persona nueva (no hay unicidad ni aviso).
Repro: demanda #325, DNI 31452587 → persona nueva `348`, ya existía la `341` con el mismo DNI. Hoy hay dos personas con ese DNI.
**Pedido:** al crear persona, detectar DNI existente (devolver 409/aviso con la persona existente) o reutilizarla.

## B13 — El legajo se resuelve por persona, no por DNI
Autorizar una MPE para la persona `348` creó el legajo `LEG-2026-0177`, aunque la persona `341` (mismo DNI) ya tenía el `LEG-2026-0176`.
**Pedido:** antes de crear legajo, buscar por DNI (y avisar/rechazar si existe en otra persona).

## B14 — No se valida la medida vigente
Con la medida `MED-2026-249` (MPE, VIGENTE) en el legajo `0176`, se autorizó otra MPE para la misma persona y el sistema creó
`MED-2026-251` (MPE, VIGENTE) en el mismo legajo. También se aceptó el pedido del técnico (`POST evaluaciones/`) sin ningún aviso.
**Pedido:** al solicitar y al autorizar una medida, comprobar medidas vigentes del legajo y rechazar (o exigir una decisión
explícita del Director con justificación) según la regla que defina el cliente (mismo tipo / cualquier tipo).

## B15 — Se aceptan pedidos de autorización sobre una demanda ya admitida
Demanda #320 en `ADMITIDA` (legajo y medida ya creados): `POST evaluaciones/` con `solicitud_tecnico=ARCHIVAR` fue aceptado y devolvió la demanda
a `PENDIENTE_AUTORIZACION` (evaluación 153).
**Pedido:** validar el estado de la demanda (solo `EVALUACION` / `PENDIENTE_AUTORIZACION`).

## B16 — Justificaciones obligatorias que la pantalla no pide
`POST evaluaciones/` exige `justificacion_tecnico` (400 "Este campo no puede estar en blanco") y `PUT .../autorizar/` exige
`justificacion_director` ("El campo justificacion_director es obligatorio"), pero la pantalla solo muestra esos campos tras un
"No autorizar". La primera solicitud no se puede enviar desde la pantalla.
**Pedido / decisión del cliente:** hacerlas opcionales en el servidor, o mostrarlas siempre en el front.

## B17 — A confirmar
- `POST evaluaciones/` con un adjunto PDF de 14 bytes respondió **500**; sin adjunto, 201. Reprobar con un PDF real.
- El servidor no exigió adjunto al registrar la solicitud (la obligatoriedad del informe firmado hoy es solo del front).
- Los tipos de vínculo del catálogo de test son texto de relleno (lorem ipsum).

## Mitigación en el front (rama `mejora-evaluacion-chequeo-legajo`)
El modal de confirmación avisa del legajo, las medidas vigentes y los registros con el mismo DNI. Es solo informativo: no reemplaza la
validación del servidor.

## Datos de prueba que dejó esta verificación
Demandas #325 y #326 (ADMITIDAS), #320 (PENDIENTE_AUTORIZACION); personas 341, 348, 349; legajos `LEG-2026-0176` y `LEG-2026-0177`;
medidas `MED-2026-249`, `250`, `251` (MPE vigentes).
