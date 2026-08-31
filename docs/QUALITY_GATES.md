# Quality gates del frontend

Esta base usa Vitest para probar lógica de negocio pura sin levantar Next.js ni un navegador.

## Uso local

- `npm test`: modo interactivo durante el desarrollo.
- `npm run test:run`: ejecución determinística para CI y antes de integrar cambios.
- `npm run lint`: reglas estáticas existentes del proyecto.
- `npm run build`: compilación de producción de Next.js.

Los tests unitarios viven en `tests/unit/`. Cada corrección de lógica pura debe incluir el caso que fallaba y al menos un caso límite. Los componentes que necesiten DOM deben incorporar `jsdom` de forma explícita; no se agrega a toda la suite mientras los tests sean independientes del navegador.

## Gate mínimo para integrar

1. `npm run test:run` finaliza sin fallos.
2. `npm run build` finaliza sin fallos.
3. `npm run typecheck` finaliza sin errores.
4. `npm run lint` finaliza sin errores. Las advertencias históricas deben reducirse progresivamente y no aumentar.

No se deben relajar `eslint`, TypeScript ni los tests para hacer pasar un cambio. El build de Next vuelve a ejecutar TypeScript y ESLint: ya no existen excepciones que permitan desplegar con errores.

## Limpieza verificada

Se eliminaron dependencias sin imports, scripts ni usos dinámicos en el repositorio: `claude`, `cookies-next`, `json-server`, `notistack`, `posthog-node`, `swr`, `tanstack` y `toastify`. Se conservan las alternativas efectivamente usadas (`@tanstack/react-query`, `posthog-js` y `react-toastify`). También se retiró el componente de ejemplo `NestedFieldDeletionExample`, que no estaba conectado al árbol de imports.

El catálogo de urgencias ya consume el endpoint real. También se retiraron componentes no alcanzados que contenían mensajes, responsables, transferencias, otras intervenciones, documentos y situaciones críticas ficticias. Los flujos visibles conservan solamente contratos persistentes o estados explícitos de indisponibilidad.

No se debe reactivar la carga genérica del repositorio ni una mensajería global de medida hasta que el backend defina un contrato persistente y con permisos. Los contratos reales existentes son comentarios por actividad, asignaciones/transferencias por actividad e intervenciones del legajo.
