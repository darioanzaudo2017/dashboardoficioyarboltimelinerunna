# Logger centralizado y fuga de datos por consola

**Fecha**: 2026-09-07
**Rama**: `refactor/modularizacion-2026-09`
**Alcance**: `src/` completo

---

## 1. El problema

RUNNA maneja datos personales sensibles de menores: legajos, personas, vulneraciones
y medidas de protección. La capa de servicios de API registraba con `console.log` el
**request y el response completos** de cada operación.

Ejemplo real en `src/app/(runna)/legajo/[id]/medida/[medidaId]/api/intervenciones-api-service.ts`:

```ts
console.log(`Creating intervención for medida ${medidaId}:`, data)
console.log("Intervención created successfully:", response)
```

`console.log` no distingue entornos: en producción esos payloads quedaban en la consola
del navegador de cualquier persona que abriera DevTools. No hacía falta ningún acceso
privilegiado para leerlos.

Estado inicial en `src/`: **352 `console.log`, 33 `console.warn`, 348 `console.error`**
(733 ocurrencias) repartidas en 113 archivos. Ningún `console.debug` ni `console.info`.

---

## 2. Diseño del logger

Módulo nuevo: **`src/utils/logger.ts`**. No existía nada equivalente; el único
antecedente era `src/components/forms/utils/debugFormData.ts`, que ya usaba el patrón
`process.env.NODE_ENV === 'development'` a mano.

### Separación de canales

| Canal | Producción | Motivo |
|---|---|---|
| `debug`, `log`, `info` | no-op | Es donde se concentran los volcados de payloads |
| `group`, `groupEnd` | no-op | Acompañan a los canales de diagnóstico |
| `warn`, `error` | **emite** | Información que necesita soporte para diagnosticar incidentes |

### Decisiones de implementación

- **Tipado sin `any`.** La firma pública es `type LogFn = (...args: unknown[]) => void`,
  compatible con la de `console`, para que la migración fuera un cambio de canal y nada más.
- **`bind` en lugar de wrapper.** Los canales se construyen con `console[method].bind(console)`.
  Un wrapper (`(...args) => console.log(...args)`) haría que DevTools reportara `logger.ts`
  como origen de todos los logs; con `bind` se conserva el archivo y la línea reales del
  call site.
- **Seguro en SSR.** No toca `window`. `process.env.NODE_ENV` lo reemplaza Next.js en
  tiempo de build, así que la constante se resuelve estáticamente y el módulo funciona
  igual en el servidor (route handlers, server actions) que en el navegador. Además, si
  `console` no existiera o no expusiera el método, degrada a no-op en vez de romper.
- **`group`/`groupEnd` incluidos.** No estaban en el pedido original, pero eran necesarios:
  `debug-patch.ts` los usaba **sin ningún gate de entorno** junto a tres `JSON.stringify`
  de payloads completos. Migrar sólo `log` habría dejado el `console.group` colgado en
  producción.

### Limitación conocida (documentada en el módulo)

Los argumentos **se evalúan siempre**, aunque el canal sea no-op:

```ts
logger.log("data:", JSON.stringify(obj))  // no imprime en prod, pero igual ejecuta el stringify
```

No es una fuga de datos —nada llega a la consola—, pero sí un costo de CPU. Donde importe,
hay que gatear el bloque entero.

---

## 3. Migración

Migración mecánica: **sólo cambia el canal**. No se reescribió ningún mensaje, no se
alteró lógica y no se eliminó ningún log con valor diagnóstico.

Se aplicó con un script que salta líneas de comentario, inserta el import respetando el
estilo de comillas y punto y coma de cada archivo, y lo coloca después del último import
estático. `console.log` se mapeó a `logger.log` (y no a `logger.debug`) para que el diff
fuera un cambio de canal 1:1 y auditable.

### Por tipo

| Tipo original | Destino | Call sites |
|---|---|---:|
| `console.log` | `logger.log` | 339 |
| `console.error` | `logger.error` | 346 |
| `console.warn` | `logger.warn` | 33 |
| `console.group` | `logger.group` | 4 |
| `console.groupEnd` | `logger.groupEnd` | 4 |
| **Total** | | **726** |

### Por módulo (una tanda = un commit)

| # | Módulo | Archivos | log | warn | error | group/End | Total |
|---|---|---:|---:|---:|---:|---:|---:|
| 1 | `src/utils`, `src/hooks`, `src/app/api` | 5 | 2 | 2 | 7 | – | 11 |
| 2 | `src/components` (base, login, evaluacion) | 8 | 15 | – | 11 | – | 26 |
| 3 | `src/components/forms` | 15 | 64 | 3 | 23 | 8 | 98 |
| 4 | `src/features/legajo` | 6 | 14 | – | 20 | – | 34 |
| 5 | `(runna)`: demanda, legajo-mesa, mesadeentrada, nuevoingreso | 16 | 50 | 6 | 45 | – | 101 |
| 6 | `(runna)/legajo`: capa `api` + `hooks` | 27 | 166 | 19 | 178 | – | 363 |
| 7 | `(runna)/legajo`: componentes | 35 | 28 | 3 | 62 | – | 93 |
| | **Total** | **112** | **339** | **33** | **346** | **8** | **726** |

La tanda 6 es la que concentra la fuga original: es la capa de servicios de API de medidas,
intervenciones, personas relacionadas e informes.

### Caso especial: gates `NODE_ENV` preexistentes

`src/components/forms/utils/debugFormData.ts` envuelve sus tres funciones en
`if (process.env.NODE_ENV === 'development')`. **Esos gates se conservaron.** No son
redundantes: dentro del bloque hay también llamadas a `error`, que en el logger emiten
en producción. Quitar el gate habría hecho que esos dos `logger.error` empezaran a
emitir en prod, o sea un cambio de comportamiento. El gate más el canal dev-only dan
exactamente el comportamiento previo.

---

## 4. Logs eliminados

Dos, ambos código muerto, ambos documentados en su commit:

**1. `src/app/api/utils/errorHandler.ts:13`**

```ts
console.log(error.response + "HOLAAA")
```

Debug abandonado. Concatenaba un objeto con una cadena, así que lo único que imprimía era
`"[object Object]HOLAAA"`: cero valor diagnóstico. El `console.log(error)` de la rama `else`
del mismo archivo **sí se conservó** (migrado a `logger.log`), porque ese sí lleva el error.

**2. `src/app/(runna)/legajo-mesa/ui/legajos-table/utils.ts:212-214`**

```ts
if (process.env.NODE_ENV === "development") {
  // console.log(`[Legajo ${legajo.id}] allStates:`, Array.from(states))
}
```

Bloque vacío: su único contenido ya estaba comentado. No ejecutaba nada.

---

## 5. Riesgo residual: `warn`/`error` que siguen activos en producción

`warn` y `error` emiten en producción **por diseño**. Eso es correcto para mensajes, pero
**31 archivos** pasan además estructuras completas como segundo argumento. Esto queda
fuera del alcance de esta migración (habría sido reescribir mensajes), pero conviene
revisarlo aparte.

### Patrón dominante: el objeto `Error details` (58 sitios, 13 archivos)

La capa de servicios repite esta forma:

```ts
logger.error("Error details:", {
  message: error?.message,
  response: error?.response?.data,   // <-- acá
  status: error?.response?.status,
})
```

`error.response.data` es la respuesta cruda del backend. En un error de validación, el
backend suele devolver los campos rechazados **con los valores enviados**, o sea que el
payload con datos del menor vuelve a la consola por la vía del error.

| Archivo | Sitios |
|---|---:|
| `(runna)/legajo/[id]/medida/[medidaId]/api/intervenciones-api-service.ts` | 14 |
| `(runna)/legajo/[id]/medida/[medidaId]/api/informe-juridico-api-service.ts` | 9 |
| `(runna)/legajo/[id]/medida/[medidaId]/api/informe-seguimiento-api-service.ts` | 8 |
| `(runna)/legajo/[id]/medida/[medidaId]/api/nota-aval-api-service.ts` | 6 |
| `(runna)/legajo/[id]/medida/[medidaId]/api/ratificacion-judicial-api-service.ts` | 4 |
| `(runna)/legajo-mesa/api/medidas-api-service.ts` | 4 |
| `(runna)/legajo/[id]/medida/[medidaId]/api/informe-cierre-api-service.ts` | 3 |
| `(runna)/legajo-mesa/api/legajos-api-service.ts` | 3 |
| `features/legajo/api/legajo-search.service.ts` | 2 |
| `features/legajo/api/legajo-creation.service.ts` | 2 |
| `(runna)/legajo/[id]/medida/[medidaId]/api/cese-medida-api-service.ts` | 2 |
| `(runna)/legajo/[id]/medida/[medidaId]/api/{etapa,etapa-detail,historial-seguimiento}-api-service.ts` | 3 |
| `app/api/utils/axiosInstance.ts` | 1 |

### El sitio de mayor tráfico: `src/app/api/utils/axiosInstance.ts:61`

```ts
logger.error(`API Error - ${endpoint}:`, {
  method,
  status,
  data: error.response?.data,
});

// Error tracking en PostHog (sin payloads: solo metadata accionable).
```

Es el interceptor global de respuesta: corre en **todos** los errores de API de la
aplicación. Vale la pena señalar que el comentario inmediatamente siguiente deja explícita
la política de no mandar payloads a PostHog — política que este `logger.error` de arriba
no sigue.

### Otros 21 sitios que pasan `response`/`data`/`payload` directo

Entre otros: `components/forms/utils/api.ts` (3, incluido
`logger.error("Server error response:", error.response.data)`),
`hooks/useRegistroIntervencion.ts` (2), `api/personas-relacionadas-api-service.ts` (2),
`legajo-mesa/api/vinculo-api-service.ts` (2), y uno cada uno en `utils/auth/index.ts`,
`fetchFormCase.ts`, `fetch-case-data.tsx`, `apiToFormData.ts`, `evaluacion-content.tsx`,
`nuevoingreso/page.tsx`, `excel-export-service.tsx`, `useDemandaMutations.ts`,
`InformacionSaludSection.tsx`, `InformacionEducativaSection.tsx`,
`persona-api-service.ts` y `DemandaDetail.tsx`.

### Opción sugerida (no implementada)

Lo más barato sería un canal explícito que registre metadata en producción y el cuerpo
sólo en desarrollo, por ejemplo `logger.error(msg, meta)` para `{ status, method, endpoint }`
y `logger.log("detalle:", error.response?.data)` en una línea aparte. Requiere reescribir
mensajes, así que es una decisión que conviene tomar de forma consciente y no como efecto
colateral de esta migración.

---

## 6. Verificación

### Gate

| Etapa | `npm run typecheck` | `npm run build` |
|---|---|---|
| Baseline | exit 0 | exit 0 |
| Después de cada una de las 7 tandas | exit 0 | – |
| Final | **exit 0** | **exit 0** |

Nota: `next.config` tiene `ignoreBuildErrors: true`, así que `npm run build` **no** valida
tipos. El gate de tipos real es `npm run typecheck`, que se corrió después de cada tanda.

Dos tandas se revirtieron y se rehicieron antes de commitear, por fallo de typecheck o de
estilo:

- **Tanda 4**: el script confundía el `import()` **dinámico** de
  `useCreateLegajo.ts:61` con un import estático e insertaba el import del logger dentro
  del cuerpo de una función (`error TS1005`). Se corrigió el reconocimiento
  (`/^import[\s{*'"]/`) y se rehizo.
- **Tanda 1**: rehecha para preservar el fin de línea dominante de cada archivo.

### Reconciliación de las 733 ocurrencias originales

| Concepto | Cantidad |
|---|---:|
| `console.log` → `logger.log` | 339 |
| `console.error` → `logger.error` | 346 |
| `console.warn` → `logger.warn` | 33 |
| `console.log` en bloques `@example` de JSDoc (documentación, se dejan) | 12 |
| `console.log` comentado, eliminado con su bloque muerto | 1 |
| `console.error` ya comentados de antes (`errorHandler.ts`), se dejan | 2 |
| **Total** | **733** ✓ |

De los 718 migrados, 1 (`HOLAAA`) se eliminó después. Sumados los 8 `group`/`groupEnd`
—que no formaban parte de las 733—, quedan **725 call sites de `logger.*`** en el árbol,
que es exactamente lo que se cuenta:

```
logger.log = 338   logger.warn = 33   logger.error = 346
logger.group = 4   logger.groupEnd = 4                     → 725
```

### Estado final de `console.*` en `src/`

**0 llamadas ejecutables.** Quedan 15 ocurrencias del texto `console.`, todas no ejecutables:

- 12 en bloques `@example` de JSDoc, que documentan uso para quien consume esas funciones
- 2 `//console.error(...)` ya comentados de antes en `errorHandler.ts` (no se tocaron: no
  es decisión de esta migración volver a habilitar logging que alguien deshabilitó)
- 1 mención en prosa dentro de la documentación de `logger.ts`

---

## 7. Fuera de alcance

- **No se agregaron librerías.**
- **No se conectó a PostHog ni a ningún servicio externo.** Sería una decisión de producto,
  con implicancias de privacidad propias dado el tipo de dato que maneja el sistema.
- **No se tocaron `tests/` ni `stories/`** (no había ninguno afectado).
- **No se reescribió ningún mensaje de log**, ni siquiera los de la sección 5.

## 8. Commits

```
e7602d9  feat(utils): agregar logger centralizado con canales gateados por entorno
96526e7  refactor(infra): migrar console.* a logger en utils, hooks y capa api
0ff3709  refactor(components): migrar console.* a logger en evaluacion, login y modales
95e7c30  refactor(forms): migrar console.* a logger en formularios y utilidades
ba282aa  refactor(features/legajo): migrar console.* a logger
5a61d64  refactor(runna): migrar console.* a logger en demanda, legajo-mesa, mesadeentrada y nuevoingreso
6f27605  refactor(runna/legajo): migrar console.* a logger en la capa api y hooks de medida
8240471  refactor(runna/legajo): migrar console.* a logger en componentes de medida
```
