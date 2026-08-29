# Búsqueda de Oficios — Por qué es lenta y qué se necesita del backend

## Revisión contra el backend actual (2026-08-29)

Se contrastó este documento con
`SENAF-RUNNA-db-backend@00e0a82` (rama
`RUNNA-v2.LEGAJOS.FEEDBACK`, sincronizada con su remoto). La prioridad general
se mantiene, con estos estados y precisiones:

| Tema | Estado verificado | Evidencia / precisión |
|---|---|---|
| Filtros de `registro-demanda-form` | **Pendiente** | `RegistroDemandaFormView` no define `filterset_class`; el `DjangoFilterBackend` de `BaseViewSet` no tiene filtros que aplicar. |
| Filtro `oficio_id` en actividades | **Pendiente** | `TActividadPlanTrabajoFilter` filtra medida/legajo/origen, pero no `origen_demanda`/oficio. El FK ya existe como `origen_demanda`. |
| Índices de expediente/oficio/SAC | **Pendiente** | Los campos no tienen `db_index` y no se encontró una migración `AddIndex` para ellos. |
| Serializers livianos de listado | **Pendiente** | Ambos endpoints siguen usando serializers completos; el de demanda además reconstruye relaciones anidadas en `to_representation`. |
| Filtros documentados de `medidas-all` | **Ya implementados** | `TMedidaFilter` implementa tipo, vigencia, legajo, número, rango de apertura, juzgado y urgencia; `test_medidas_all_endpoint.py` los cubre. Falta un filtro por oficio/SAC de demanda. |
| Sincronización de SAC demanda → medida | **Parcial** | La creación automática general de medida copia `demanda.nro_sac`, pero el flujo de `oficio_signals.py` que crea o reutiliza una medida no lo copia/sincroniza. |
| `oficio_origen.numero` | **Bug confirmado** | El serializer lee `demanda.numero`, atributo que no existe en `TDemanda`; debe exponer `nro_sac`, `numero_expediente` y `nro_oficio_web` explícitamente. |
| `duracion_dias` negativo | **Bug confirmado** | La propiedad usa `(fecha_fin - fecha_apertura).days` sobre datetimes; un cierre a medianoche del mismo día puede producir `-1`. |
| Relación medida → demanda | **Existe, pero no se expone desde medida** | `TVinculoLegajo` admite simultáneamente `demanda_destino` y `medida_destino`, y su endpoint filtra por `demanda_id`. El gap real está en `MedidaDetail`/`medidas-all`, no necesariamente en el modelo de datos. |
| Motivo de cierre MPE | **Requiere definición funcional** | No se encontró el supuesto enum/modelo `TipoCeseMPE` en el backend actual. Antes de unificar endpoints hay que definir dónde persistir el dato y su catálogo. |
| Datos del NNyA en `medidas-all` | **Pendiente** | El objeto embebido conserva sólo id, nombre, apellido, DNI y edad calculada. |

### Orden de implementación recomendado después de la revisión

1. Resolver la búsqueda de punta a punta: filtros reales + serializer básico
   de demandas, filtro `oficio_id` en actividades y campos reales en
   `oficio_origen`, con pruebas de API.
2. Agregar los índices de búsqueda y medir con `EXPLAIN`/pruebas de queries;
   los índices solos no corrigen la sobre-serialización.
3. Corregir consistencia (`nro_sac` y `duracion_dias`) con pruebas de los dos
   flujos de creación/reutilización de medida.
4. Exponer los vínculos `TVinculoLegajo` desde medida para indicadores, y
   abordar el cierre MPE sólo después de acordar el modelo funcional.

## Contexto

La página `/oficios` (búsqueda rápida de oficios por SAC/expediente/oficio
web/medida/legajo) se armó 100% del lado del frontend porque **no existe
ningún endpoint que resuelva esta búsqueda en el backend**. Hoy la página
trae dos datasets completos y cruza todo en el navegador. Eso es lo que la
hace lenta: en la carga observada (DevTools, ver captura del 2026-08-28) la
página tarda **~18.6 segundos** en terminar de cargar, con estas dos
llamadas como cuello de botella:

| Endpoint | Tiempo | Tamaño | Paginado |
|---|---|---|---|
| `GET /medidas-all/` | 9.89 s | 124 KB | No — trae TODO |
| `GET /registro-demanda-form/` | 11.47 s | 75.5 KB | No — trae TODO |

(También se ve una tercera llamada `GET /actividades/?page_size=100&ordering=-fecha_creacion`
en 12.72 s — esa es del badge de notificaciones del Navbar, **no** de la
página de Oficios, pero confirma que el problema de latencia no es
exclusivo de estos dos endpoints: parece un problema más general del
backend en este ambiente.)

Este documento explica, endpoint por endpoint, por qué son pesados y qué
cambios del lado del backend resolverían el problema de raíz — hoy el
frontend está compensando gaps de la API, no al revés.

---

## 1. `GET /medidas-all/` — no documentado, no paginado, no filtrable desde el frontend

**Qué hace hoy**: devuelve un array plano con **todas** las medidas del
sistema (236 en el ambiente relevado), cada una con:

- Los campos propios de la medida (`numero_medida`, `tipo_medida`,
  `estado_vigencia`, `fecha_apertura`, `fecha_cierre`, `duracion_dias`,
  `nro_sac`, `juzgado`, `urgencia`, etc.)
- `legajo` embebido (con `nnya` anidado)
- `intervencion` embebida (la más reciente, con motivo/categoría/tipo de
  dispositivo)
- **`plan_trabajo.actividades[]` embebido completo** — cada actividad trae
  a su vez `tipo_actividad_info`, `subtipo_actividad_info`,
  `derecho_principal_info`, `zonas_info`, `equipo_info`,
  `responsable_principal_info`, `responsables_secundarios_info`,
  `oficio_origen`, `adjuntos[]`, etc. — es decir, el mismo nivel de detalle
  que devolvería `GET /actividades/{id}/`, multiplicado por cada actividad
  de cada medida.

**Por qué es lento**: es un `SELECT *` con `JOIN`/`prefetch_related` sobre
varias tablas relacionadas, para **todas** las medidas del sistema, sin
ningún filtro aplicado. El spec de OpenAPI documenta filtros para este
endpoint (`fecha_apertura_desde`, `fecha_apertura_hasta`, `tipo_medida`,
`estado_vigencia`, `legajo`, `numero_medida`, `juzgado`, `urgencia`) pero
**el frontend no los usa hoy** porque la necesidad real (buscar por
SAC/expediente de UN oficio puntual) no se resuelve con ninguno de esos
filtros — el SAC del oficio vive en la demanda, no en la medida.

**Qué se necesita**:
1. Confirmar que los filtros documentados en el spec realmente funcionan
   server-side (no alcanza con que estén documentados; alguno de los
   probados en `registro-demanda-form` resultó no estar implementado pese a
   estar en el spec — ver punto 2).
2. Un modo "liviano" de este endpoint (o un `?fields=` / serializer
   reducido) que **no** traiga `plan_trabajo.actividades[]` completo cuando
   no hace falta — la mayoría de los consumidores de `medidas-all` (incluido
   el dashboard de indicadores que armamos) no necesitan el detalle
   completo de cada actividad, alcanza con conteos o campos puntuales.
3. Idealmente, un filtro `oficio_id` o `nro_sac_demanda` que permita traer
   **solo** las medidas relevantes a un oficio puntual, en vez de las 236.

---

## 2. `GET /registro-demanda-form/` — ignora los query params, siempre trae todo

**Qué hace hoy**: devuelve un array plano con **todas** las demandas del
sistema (287 en el ambiente relevado) — objeto completo por demanda,
incluyendo `indicadores_valoracion[]`, `scores[]`, `adjuntos[]`,
`localizacion`, `institucion`/`tipo_institucion` anidados, etc. — el mismo
detalle que `GET /registro-demanda-form/{id}/full-detail/` para una sola
demanda, multiplicado por 287.

**Esto lo confirmamos empíricamente, no es una suposición**: probamos

```
GET /registro-demanda-form/?numero_expediente=43534
GET /registro-demanda-form/?search=43534
```

contra el backend real y **las dos llamadas devolvieron el dataset completo
sin filtrar** (mismo tamaño, mismo primer registro con `numero_expediente:
null`, sin relación con el filtro pedido). El spec de OpenAPI ni siquiera
documenta parámetros de filtro para este endpoint ("Retrieve a list of
entries with optional filtering", sin detalle) — es decir, el filtrado
simplemente **no está implementado** en este endpoint hoy.

**Por qué es lento**: mismo problema que el anterior pero peor, porque acá
ni siquiera hay manera de pedir un subconjunto — cualquier consumidor que
necesite UNA demanda por su SAC está forzado a traer las 287 completas.

**Qué se necesita** (esto es lo más importante de todo el documento):
1. Implementar filtros reales (`django-filter` o equivalente) sobre
   `numero_expediente`, `nro_oficio_web` y `nro_sac`, exactos o
   `icontains`. Con esto solo, la búsqueda de oficios pasaría de traer 287
   demandas completas a traer 0-1.
2. Que el `search` genérico (si existe como `SearchFilter` de DRF) incluya
   estos tres campos en `search_fields`.
3. Agregar índices de base de datos sobre `numero_expediente`,
   `nro_oficio_web` y `nro_sac` en la tabla de demandas (y sobre `nro_sac`
   en la tabla de medidas) para que esos filtros sean rápidos una vez
   implementados.
4. Un serializer "básico" para listado (id, numero_expediente,
   nro_oficio_web, nro_sac, objetivo_de_demanda, fecha_creacion) separado
   del serializer de detalle completo (con scores/valoraciones/adjuntos) —
   nadie necesita el detalle completo de 287 demandas para una búsqueda por
   identificador.

---

## 3. El gap de fondo: no hay vínculo directo oficio → actividades

Aunque se arreglen los dos puntos anteriores, **seguiría faltando la pieza
central**: hoy, para saber qué actividades corresponden a un oficio, hay
que:

1. Encontrar la demanda-oficio (por SAC/expediente/oficio-web).
2. Recorrer **todas** las medidas buscando actividades cuyo
   `oficio_origen.id` coincida con el `id` de esa demanda — porque no existe
   un filtro `oficio_id` (ni `oficio_origen`) en `GET /actividades/`.

Esto es lo que obliga a traer `medidas-all` completo en vez de pedir
directamente "las actividades del oficio X".

**Qué se necesita**: agregar un filtro `oficio_id` (o el nombre que
corresponda al FK real en el modelo) a `GET /actividades/`, para poder
hacer:

```
GET /actividades/?oficio_id=306
```

y obtener directamente las actividades de ese oficio, sin pasar por
`medidas-all` en absoluto.

## 4. Bonus: `oficio_origen.numero` siempre viene `null`

Ya lo documentamos en el trabajo de la página de Oficios, pero vale
repetirlo acá porque es la causa raíz de tener que cruzar dos endpoints en
primer lugar: el campo `oficio_origen.numero` que viaja embebido en cada
actividad (`TActividadPlanTrabajo.oficio_origen`) **viene vacío en el 100%
de los casos relevados** (0 de 194 actividades con oficio_origen tenían
`numero` poblado), a pesar de que la demanda de origen sí tiene
`numero_expediente`/`nro_oficio_web` cargados.

**Qué se necesita**: completar ese campo en el serializer de actividad con
el `numero_expediente` (o `nro_oficio_web`) de la demanda vinculada. Si esto
se arregla, sumado al filtro `oficio_id` del punto 3, **la búsqueda de
oficios podría resolverse con una sola llamada** en vez de dos endpoints
completos cruzados a mano.

---

## 5. Hallazgos de consistencia de datos (no son de performance, pero salieron en el camino)

Estos no hacen que nada sea lento — hacen que los datos sean poco confiables
o que ciertas búsquedas/indicadores directamente no se puedan calcular. Los
fuimos encontrando mientras armábamos Oficios e Indicadores, y vale la pena
que el backend los tenga documentados en un solo lugar.

### 5.1 El SAC del oficio no se sincroniza con la medida (el bug que disparó este documento)

Cuando se carga un oficio (demanda con `objetivo_de_demanda: CARGA_OFICIOS`
o `PETICION_DE_INFORME`) y se vincula a un legajo/medida existente, el
`numero_expediente`/`nro_oficio_web`/`nro_sac` que se cargaron en **la
demanda** nunca se copian al `nro_sac` **de la medida**. Confirmado con un
caso real: la demanda #306 tiene `numero_expediente: "43534"` y
`nro_oficio_web: "34534"`, pero la medida MED-2026-236 a la que está
vinculada tiene `nro_sac: null`.

Esto rompe la expectativa más básica del usuario: "cargué un oficio con
este SAC, tiene que aparecer si busco por ese SAC" — y hoy no aparece salvo
que se busque también contra la demanda (que es lo que terminamos armando
en el frontend como workaround).

**Sugerencia**: cuando se crea el vínculo demanda-oficio → legajo/medida
(el flujo de `VinculosManager`/`vinculos` del formulario de carga de
oficios), si la medida vinculada no tiene `nro_sac` cargado, copiar ahí el
`numero_expediente` (o `nro_sac`, el que corresponda por convención) de la
demanda de origen. Si la medida ya tiene un `nro_sac` distinto, al menos
loguear/alertar la discrepancia en vez de dejarla pasar en silencio.

### 5.2 `oficio_origen.numero` siempre viene `null`

Ya cubierto en la sección 4 arriba — lo repetimos acá porque es la otra
cara del mismo problema de fondo: el sistema tiene el dato (en la demanda)
pero no lo propaga a donde el resto del sistema lo necesita (la actividad,
la medida).

### 5.3 `duracion_dias` puede dar negativo

En medidas abiertas y cerradas el mismo día, `duracion_dias` calculó **-1**
en vez de 0 (caso real: `fecha_apertura: "2026-07-20T11:40:45"`,
`fecha_cierre: "2026-07-20T00:00:00Z"` → `duracion_dias: -1`). Parece un
redondeo por diferencia de horas dentro del mismo día calendario, no una
resta de fechas truncadas a medianoche. El frontend lo clampea a 0 al
consumirlo (`Math.max(duracion_dias, 0)`), pero el valor de origen debería
corregirse — cualquier otro consumidor de `medidas-all`/`medida-detail`
que no aplique ese clamp va a mostrar duraciones negativas.

### 5.4 No hay vínculo directo medida → demanda de origen

Ni `MedidaDetailResponse` ni `medidas-all` tienen un campo tipo
`demanda_origen_id`. Del lado de la demanda solo existe `medida_creada:
boolean` (ni siquiera el id de la medida que generó). Esto hace imposible
calcular indicadores como "medidas según origen de la demanda" sin traer
todas las demandas y todas las medidas y intentar inferir la relación por
otro camino (que hoy no existe de forma confiable).

**Sugerencia**: exponer `demanda_origen_id` (o el array de demandas
vinculadas, si una medida puede tener más de una) en el detalle de medida.

### 5.5 Motivo de cierre: arquitectura distinta entre MPI y MPE

Para MPI, el motivo de cierre (`tipo_cese`) queda en el **Informe de
Cierre**, con un enum claro y estable
(`INICIO_MPJ`/`DERIVADA_OLP`/`CESADA_VALORA_MPE`/`CESADA`/`NO_PERTINENTE`).
Para MPE existe un enum paralelo (`TipoCeseMPE`) pero **no hay un endpoint
de "informe de cierre" equivalente que lo persista de forma consultable** —
el dato, si se carga, queda mezclado en la intervención de la etapa CESE.
Resultado práctico: hoy no se puede calcular "MPE cesadas según motivo de
cierre" sin abrir cada MPE cerrada una por una.

**Sugerencia**: unificar el modelo — que MPE tenga el mismo concepto de
"informe de cierre" consultable en bloque que ya existe para MPI, con su
`tipo_cese` expuesto en el listado, no solo en el detalle de una
intervención puntual.

### 5.6 Datos del NNyA incompletos en `medidas-all`

El `legajo.nnya` embebido en cada medida de `medidas-all` solo trae `id,
nombre, apellido, dni, edad_calculada`. **Género, nacionalidad y situación
de DNI no vienen** — hay que cruzarlo aparte contra `GET /persona/` (otro
endpoint bulk sin paginar, 295 registros) para tener esos datos. Nivel
educativo no está en NINGÚN endpoint masivo — solo vía
`GET /persona/{id}/educacion/`, uno por uno.

**Sugerencia**: si `medidas-all` va a seguir siendo la fuente para
dashboards/reportes agregados (como el de Indicadores que armamos), sumar
género/nacionalidad/situación_dni directamente en el `nnya` embebido evita
tener que pedir 295 personas aparte solo para completar esos tres campos.

---

## Resumen de pedidos, ordenados por impacto

### Performance

| # | Pedido | Impacto |
|---|---|---|
| 1 | Filtros reales (`numero_expediente`, `nro_oficio_web`, `nro_sac`) en `GET /registro-demanda-form/` | Alto — hoy trae 287 registros completos por cada búsqueda |
| 2 | Filtro `oficio_id` en `GET /actividades/` | Alto — elimina la necesidad de traer `medidas-all` completo |
| 3 | Índices DB sobre los campos de búsqueda (expediente/oficio-web/SAC, en demanda y medida) | Medio — necesario para que 1 y 2 sean rápidos, no solo posibles |
| 4 | Serializer liviano para listados masivos (`medidas-all`, `registro-demanda-form`) sin anidar objetos completos | Medio — mejora cualquier otro consumidor de estos endpoints, no solo Oficios |
| 5 | Confirmar que los filtros documentados de `medidas-all` en el spec realmente están implementados | Bajo/a confirmar |

### Consistencia de datos

| # | Pedido | Impacto |
|---|---|---|
| 6 | Sincronizar el SAC/expediente del oficio con el `nro_sac` de la medida al vincularlos (5.1) | Alto — es la causa directa de que un oficio "desaparezca" al buscarlo por su propio SAC |
| 7 | Completar `oficio_origen.numero` con el identificador real de la demanda (4 y 5.2) | Alto — sumado a 1 y 2, resuelve la búsqueda en una sola llamada |
| 8 | Corregir el cálculo de `duracion_dias` para que no dé negativo (5.3) | Medio — hoy el frontend lo clampea, pero el dato de origen está mal |
| 9 | Exponer `demanda_origen_id` en la medida (5.4) | Medio — sin esto no se puede calcular "medidas según origen de demanda" |
| 10 | Unificar el modelo de informe de cierre entre MPI y MPE (5.5) | Medio — hoy MPE no tiene motivo de cierre consultable en bloque |
| 11 | Sumar género/nacionalidad/situación_dni al `nnya` embebido en `medidas-all` (5.6) | Bajo/medio — evita cruzar con `GET /persona/` aparte |

Mientras estos cambios no estén, la página de Oficios sigue funcionando
(usa `staleTime` de 5 minutos en el cliente para no repetir las llamadas
pesadas en cada búsqueda dentro de la misma sesión), pero la primera
búsqueda de cada sesión va a seguir tardando lo que tarden estos dos
endpoints en responder — eso ya no depende del frontend.
