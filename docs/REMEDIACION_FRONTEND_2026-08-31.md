# Remediación de calidad del frontend RUNNA

**Fecha:** 31 de agosto de 2026  
**Base:** relevamiento visual y técnico del 30 de agosto de 2026

## Resultado de esta tanda

La remediación priorizó exactitud, seguridad, estados reales y usabilidad. No se agregaron fallbacks plausibles para ocultar datos faltantes ni se conservaron acciones que aparentaran persistencia.

### Integridad y seguridad

- Evaluación muestra únicamente datos provenientes del contrato: tipo/categoría de oficio, juzgado, organismo remitente, descripción y valoración. Los faltantes se identifican como tales.
- Asignación utiliza la identidad autenticada; ya no existe el usuario fijo `1`.
- Middleware cubre las rutas privadas principales y conserva el destino de retorno al login.
- Refresh y logout se resuelven en servidor con cookies `httpOnly`; se eliminó la implementación cliente duplicada.
- El frontend no depende del objeto de usuario de auditoría completo devuelto por demanda.

### Contratos y rendimiento

- Legajo usa un único detalle canónico y dejó de ejecutar una consulta `full-detail` por demanda relacionada.
- Navbar consume un resumen liviano de notificaciones con estados separados de carga, error, vacío y datos.
- Medidas acepta el resumen paginado del backend.
- Urgencias consume el catálogo real, sin fallback mock.
- Nuevo Ingreso y Crear Legajo muestran éxito sólo después de una respuesta persistida que incluya identificadores válidos.

### UI/UX y accesibilidad

- Navbar móvil con menú, estado activo, manual, perfil y acciones accesibles.
- Mis Actividades usa tarjetas en móvil, filtros priorizados y controles responsive.
- Oficios mejora jerarquía, búsqueda, copy y contraste del estado pendiente.
- Medida nueva evita overflow y adapta resumen, etapas, módulos, tabla y controles.
- Demanda bloqueada usa modo de consulta compacto, sin instrucciones de alta ni finalización falsa.
- Se corrigieron idioma del documento, headings, nombres accesibles y límites de carga/error/404.
- Fechas de calendario se interpretan sin corrimiento UTC; fechas futuras y edades imposibles se muestran como datos inválidos.

### Código y simulaciones eliminadas

- Se retiraron servicios N+1 y componentes de ejemplo o no alcanzados.
- Se eliminaron mensajes, responsables, transferencias, otras intervenciones, documentos y situaciones críticas ficticias.
- Residencias usa exclusivamente situaciones, cambios, notas y catálogos reales. Los errores de carga no se convierten en listas vacías.
- Adjuntos ya persistidos abren `adjunto_url`. No se ofrece una carga genérica que el backend no pueda persistir correctamente.
- Se limpiaron dependencias sin uso y se migró la configuración de React Query a v5.

## Contratos backend requeridos

El backend de esta tanda incorpora auditoría server-side, serializers seguros, resumen de notificaciones, medidas livianas/paginadas, adjuntos de demandas relacionadas y catálogo real de urgencias.

Quedan fuera de la UI hasta contar con contrato formal:

- alta genérica en `/api/repositorio-documentos/` con modelo, categoría, archivo y permisos;
- adjuntos para notas y cambios de residencia;
- mensajería global de medida. Actualmente el contrato válido es comentario por actividad.

## Gates ejecutados

- `npm run test:run`: 13 tests unitarios.
- `npm run typecheck`: 0 errores (línea base anterior: 259).
- `npm run lint`: 0 errores; conserva advertencias históricas.
- `npm run build`: compilación de producción completa.
- ESLint y TypeScript focales: sin errores en archivos modificados.
- Smoke autenticado: Mis Actividades, Oficios, Demanda 303, Legajo 134, Medida 235 y página inexistente.
- Backend: suite focalizada de seguridad, auditoría, notificaciones, adjuntos, medidas y catálogos.

## Deuda que continúa abierta

- PostHog no se modificó por instrucción expresa de no aplicar enmascaramiento.
- Los 259 errores TypeScript quedaron resueltos y el build ya no ignora TypeScript ni ESLint. Continúa la reducción de advertencias de lint y usos de `any` como deuda no bloqueante.
- Indicadores continúa siendo una aproximación del cliente; falta endpoint homologado y versionado.
- `npm audit --omit=dev` todavía informa 11 vulnerabilidades productivas (1 crítica, 7 altas y 3 moderadas); requieren un sprint de actualización con regresión, especialmente Next y `xlsx`.
- Falta automatizar E2E por rol y resolver progresivamente componentes monolíticos, estilos locales y logging excesivo.
- El flujo de duplicados referencia `buscar-duplicados`, `crear-con-duplicado-confirmado` y `vincular-demanda`, pero el backend todavía no expone esos contratos; las acciones quedan protegidas hasta definirlos.
