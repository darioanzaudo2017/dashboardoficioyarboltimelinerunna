# Sidebars de filtros, tabs de módulos, calendario de actividades y Panel de Administración de Catálogos

**Fecha:** 2026-09-16
**Alcance:** Mesa de Entradas, Bandeja de Legajos, vista de Medida (MPI/MPE/MPJ), nuevo Panel de Administración de Catálogos.

Este documento resume todo lo implementado hoy en el frontend y separa claramente qué quedó resuelto sin tocar el backend de qué necesita trabajo del equipo de backend para completarse.

---

## 1. Resumen ejecutivo

| Feature | Estado | ¿Necesita backend? |
|---|---|---|
| Sidebar de filtros rápidos — Mesa de Entradas | ✅ Completo | No |
| Sidebar de filtros rápidos — Bandeja de Legajos | ✅ Completo | No (usa `user_responsable`, ya soportado por el backend aunque no estaba cableado en el front) |
| "Módulos activos" de Medida ahora son Tabs (antes pastillas independientes) | ✅ Completo | No |
| Calendario de actividades (Plan de Trabajo + Control de Legalidad) | ✅ Completo | No |
| Panel de Administración de Catálogos (`/admin/catalogos`) | ✅ Completo para 6 catálogos editables + 16 de solo lectura | **Sí**, para habilitar edición en los 16 de solo lectura y en los ~18 valores embebidos sin endpoint propio |

---

## 2. Cambios de Frontend

### 2.1 Sidebar de filtros — Mesa de Entradas

Nueva sidebar colapsable (`DemandaFilterSidebar.tsx`) con atajos de un clic: Estado, Objetivo de demanda, Envío de respuesta, "Mis demandas". Escribe sobre el mismo estado (`apiFilters`) que ya usaba el popover "Filtros" existente — no se sacó ni se duplicó ningún filtro.

**Bug de fondo que encontramos y arreglamos:** el popover de filtros (`Buttons.tsx`) mantenía su propio estado local que nunca se sincronizaba si algo externo (la nueva sidebar) cambiaba los filtros — el próximo click adentro del popover podía pisar el cambio hecho desde la sidebar. Se agregó un prop `value` + `useEffect` para mantenerlo sincronizado.

### 2.2 Sidebar de filtros — Bandeja de Legajos

Mismo patrón (`LegajoFilterSidebar.tsx`), con presets:
- **Mis legajos** — filtra por `user_responsable` (parámetro que ya estaba tipado en `LegajosQueryParams` pero nunca se enviaba al backend; ahora sí se envía).
- **Tareas propias pendientes** — no tiene parámetro de backend, así que se resuelve trayendo actividades globales y aplicando la misma función que ya usa la campanita de notificaciones (`shouldNotifyActivity`), para que signifique exactamente lo mismo en los dos lugares.
- **Prioridad alta**, **Con alertas**, **Actividades vencidas**, **Oficios vencidos** — atajos a filtros que ya existían pero estaban escondidos en el popover "Avanzados".

Mismo fix de sincronización aplicado a `LegajoFilters` que en Mesa de Entradas.

**Nota de rendimiento:** cuando "Tareas propias pendientes" está activo, la paginación pasa a ser del lado del cliente (se pide un lote de hasta 500 legajos en vez de la página elegida en la UI) porque el filtro no tiene forma de aplicarse en el servidor. Esto es transparente para el usuario, pero si algún equipo tiene más de 500 legajos con tareas pendientes simultáneas, se recortaría — no lo vimos como escenario realista, pero queda anotado.

### 2.3 Medida: "Módulos activos" ahora son Tabs

Antes, "Plan de trabajo", "Control de legalidad" e "Informes mensuales" eran pastillas que abrían paneles independientes con `Collapse` — se podía tener dos o más abiertos al mismo tiempo, lo que generaba confusión sobre qué estaba realmente "activo". Ahora es un componente `Tabs`/`Tab` de MUI: un solo módulo visible a la vez, con indicador de color por módulo. Es un componente compartido (`medida-modulos-row.tsx`) usado por MPI, MPE y MPJ, así que el cambio aplica a los tres tipos de medida sin duplicar código.

### 2.4 Medida: Calendario de actividades

Nuevo módulo "Calendario" agregado a esa misma fila de tabs, en los tres tipos de medida. Trae TODAS las actividades del plan de trabajo (Plan de Trabajo + Control de Legalidad juntas, ya que comparten el mismo `plan_trabajo`) y las ubica por `fecha_planificacion`.

- Vistas **Mes / Semana / Día** con navegación.
- Color por **equipo** (borde azul = Técnico, borde violeta = Legales) y por **estado** (punto de color: naranja Pendiente, azul En Progreso, verde Completada/Visado Aprobado, rojo Vencida, gris Cancelada, violeta Pend. Visado Legal).
- Click en una actividad abre el mismo modal de detalle que ya usan el Plan de Trabajo y el Kanban de Control de Legalidad.

Archivos nuevos bajo `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/calendario/`.

### 2.5 Panel de Administración de Catálogos (`/admin/catalogos`)

Implementado inicialmente con ayuda de Gemini a partir de un análisis de endpoints que hicimos nosotros (cruzando el uso real en frontend con el spec OpenAPI `stories/RUNNA API (14).yaml` que está en el repo), y luego revisado y corregido acá.

**Arquitectura:** un registro config-driven (`catalogos-registry.ts`) — un array con un objeto por catálogo (`key`, `endpoint`, `editable`, columnas de tabla, campos de formulario). Un solo set de componentes genéricos (`CatalogTable`, `CatalogFormModal`, `CatalogDeleteDialog`) sirve para los 22 catálogos, en vez de una página por catálogo. Acceso restringido a `isAdmin` vía `AdminGuard`.

**22 catálogos identificados**, divididos según lo que el backend permite hoy:

- **6 con CRUD completo** (alta, edición y baja habilitadas en el panel): `tipos-oficio`, `tipos-actividad-plan-trabajo`, `subtipos-actividad-plan-trabajo`, `locales-centro-vida`, `cobertura-medica`*, `medico`.
- **16 de solo lectura** (el panel los muestra pero sin botones de alta/edición/baja, porque el backend no expone esos verbos): `zonas`, `juzgados`, `categoria-motivo`, `categoria-submotivo`, `categorias`, `cpc`, `barrio`, `localidad`, `institucion-actividad`, `respuesta-etiqueta`, `tipos-dispositivo`, `subtipos-dispositivo`, `tipos-vinculo`, `actividad-tipo`, `indicadores-valoracion`, `plantillas-informe`.

*`cobertura-medica` se sacó del panel en la revisión (ver sección 4) — quedaron 5 realmente habilitados con alta/edición desde acá, más `medico`.

**3 correcciones que hicimos sobre la primera versión:**

1. **Middleware sin proteger `/admin`** — a diferencia de todas las demás secciones de la app, `/admin/:path*` no estaba en el matcher de `src/middleware.ts`, así que la página se servía sin el redirect a login del servidor. Corregido.
2. **Borrado físico en vez de baja lógica** — `tipos-oficio`, `tipos-actividad-plan-trabajo`, `subtipos-actividad-plan-trabajo` y `locales-centro-vida` tienen campo `activo`, y ya hay actividades reales de legajos apuntándoles por FK. El botón "Eliminar" hacía `DELETE` físico. Se cambió a `PATCH {activo: false}` (baja lógica) para esos 4 catálogos — sin tocar el backend, ya que el verbo PATCH ya estaba disponible.
3. **`cobertura-medica` no es un catálogo** — es un registro de salud por persona (tiene un campo `persona` obligatorio en el modelo real), no una tabla de referencia. Se sacó del registro de catálogos editables para evitar que se creen registros huérfanos desde el panel.

---

## 3. Recomendaciones para el equipo de Backend

### 3.1 Habilitar CRUD completo en los 16 catálogos de solo lectura (pedido explícito para poder "editar todas las tablas desde catálogos")

Hoy estos ViewSets solo exponen `list`/`retrieve` (probablemente `ReadOnlyModelViewSet` o un `ModelViewSet` con los métodos de escritura explícitamente excluidos). Para habilitar edición completa desde el panel de administración, sugerimos:

- Cambiar a `ModelViewSet` completo (o agregar los mixins de create/update/destroy) para: `zonas`, `juzgados`, `categoria-motivo`, `categoria-submotivo`, `cpc`, `barrio`, `localidad`, `institucion-actividad`, `respuesta-etiqueta`, `tipos-dispositivo`, `subtipos-dispositivo`, `tipos-vinculo`, `actividad-tipo`, `indicadores-valoracion`, `plantillas-informe`.
  - `categorias/` parece ser un endpoint agregado de solo lectura sobre `categoria-motivo` + `categoria-submotivo` — probablemente no aplique escritura directa ahí, sino en sus dos endpoints de origen.
- Restringir esos verbos de escritura a rol admin (`IsAdminUser` o el permission class equivalente que ya usan en los 6 catálogos que hoy sí son editables — mantener consistencia).
- Para los que tengan relaciones activas desde entidades de dominio (`tipos-dispositivo`, `subtipos-dispositivo`, `tipos-vinculo`, `actividad-tipo` son los que más nos preocupan por volumen de uso), evaluar si conviene que tengan campo `activo`/soft-delete en vez de DELETE físico — ya viene siendo el patrón en varios de los catálogos actuales.

### 3.2 Confirmar comportamiento `on_delete` en los catálogos ya editables

Para `tipos-actividad-plan-trabajo` y `subtipos-actividad-plan-trabajo` — que YA tienen DELETE habilitado y ya son referenciados por actividades reales de legajos en producción — necesitamos saber si el `ForeignKey` desde `Actividad` usa `on_delete=PROTECT` (recomendado, el borrado falla si hay actividades asociadas), `CASCADE` (borraría en cascada las actividades reales — riesgo alto) o `SET_NULL`. Del lado del frontend ya movimos el botón "Eliminar" de estos catálogos a baja lógica (`PATCH activo=false`) precisamente por esta duda, pero si en algún momento se necesita permitir el borrado físico real (limpieza de datos de prueba, por ejemplo), esto hay que confirmarlo antes.

### 3.3 Los ~18 valores embebidos en `registro-demanda-form-dropdowns/` no tienen endpoint propio

Campos como `situacion_dni_choices`, `genero_choices`, `tipo_calle_choices`, `nivel_educativo_choices`, `ultimo_cursado_choices`, `tipo_escuela_choices`, `nacionalidad_choices`, `ocupacion_choices`, `obra_social_choices`, `ambito_vulneracion`, `condiciones_vulnerabilidad`, `departamento_judicial_choices`, `tipo_institucion_demanda`, `tipo_codigo_demanda`, `bloques_datos_remitente`, `origenes`, `envio_de_respuesta_choices`, `objetivo_de_demanda_choices` solo existen embebidos dentro de ese endpoint agregado — no tienen ruta propia con `id`. Sospechamos que son `TextChoices`/enums hardcodeados en los modelos Django (no filas de tabla), pero no podemos confirmarlo sin ver el código del backend.

**Pregunta para el equipo de backend:** ¿cuáles de estos son choices hardcodeadas (y por lo tanto requieren un cambio de código + deploy para agregar un valor) y cuáles son tablas reales sin ViewSet registrado (y por lo tanto solo faltaría exponer el endpoint)? Si el objetivo final es "editar todas las tablas desde catálogos", los que sean choices hardcodeadas van a necesitar migrarse a un modelo real primero.

### 3.4 Re-exportar el spec OpenAPI actualizado

El spec que usamos para este análisis (`stories/RUNNA API (14).yaml`) es una foto de un momento dado. Antes de planificar el trabajo de 3.1, conviene generar un export fresco desde `/api/schema/` del backend en producción para confirmar que ninguno de estos 16 catálogos ganó verbos de escritura después de esa exportación (evitaría trabajo duplicado).

### 3.5 (Opcional / nice-to-have) Endpoint de metadata de catálogos

El índice del panel (`/admin/catalogos`) hoy dispara ~22 requests en paralelo (uno por catálogo, solo para mostrar la cantidad de registros de cada uno). Si en algún momento se agregan más catálogos y esto se vuelve pesado, un endpoint liviano tipo `GET /api/catalogos-meta/` que devuelva `[{endpoint, count, editable}]` para todos de una sola vez evitaría el fan-out de requests. No es urgente — el uso actual ya se cachea 5-10 min por catálogo.

---

## 4. Riesgos conocidos / pendientes

- `medico/` sigue usando DELETE físico (no tiene campo `activo` en el modelo actual) — si se agrega ese campo en el backend, hay que sumarle `softDeleteField: "activo"` en el registro del frontend.
- El panel no valida del lado del cliente si un registro está "en uso" antes de intentar la baja — depende del mensaje de error que devuelva el backend ante una violación de FK. Si el backend no devuelve un mensaje claro (`detail`/`message`), el usuario va a ver un error genérico.
- No se implementó un endpoint "todos los catálogos en uno" para el panel de admin (ver 3.5) — cada catálogo se pide por separado.
