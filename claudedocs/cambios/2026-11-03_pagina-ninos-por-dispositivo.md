# Página nueva: niños por dispositivo

**Rama:** `mejora-pagina-ninos-por-dispositivo`  **Fecha:** 2026-11-03

## Qué es
Una página nueva, **Dispositivos** (`/dispositivos`, con acceso en la barra superior), que dice cuántos niños hay hoy en cada dispositivo, según la **Configuración de Dispositivo** de sus medidas vigentes.

## Qué muestra
- Tres totales: niños con medida vigente, tipos de dispositivo en uso y niños **sin dispositivo configurado**.
- Una tabla por **tipo de dispositivo** (Centro de Cuidado Residencial, Acogimiento Familiar, Centro de Día, etc.) con la cantidad de niños y de instituciones o familias. Al abrir cada fila se ve el desglose por **institución / familia** y los legajos y medidas que la componen.
- Filtros por tipo de medida (MPE, MPI, MPJ), zona y búsqueda de texto.
- Un niño con dos medidas vigentes en el mismo dispositivo cuenta una vez. Las medidas cerradas no entran. "Sin dispositivo configurado" va siempre al final.

## De dónde salen los datos
De la misma llamada liviana que usa Indicadores (`GET /medidas-all/?include_actividades=false`), que ya trae el dispositivo de la intervención de cada medida. No se pide medida por medida. Los datos se guardan 5 minutos en memoria.

## Archivos
| Archivo | Qué hace |
|---|---|
| `src/app/(runna)/dispositivos/page.tsx` | La página |
| `src/app/(runna)/dispositivos/lib/contar-por-dispositivo.ts` | Cuenta y agrupa (tipo → institución) |
| `src/components/layoutComponents/Navbar.tsx` | Enlace "Dispositivos" |
| `tests/unit/ninos-por-dispositivo.test.ts` | 5 casos |

## Cómo probarlo
Entrar a "Dispositivos" en la barra superior: los totales y la tabla; abrir una fila para ver las instituciones.

## Verificación
Tipos sin errores y tests en verde. Probado en el navegador (admin) con datos reales: 140 niños con medida vigente, 7 tipos de dispositivo en uso, 136 sin dispositivo configurado.

## Pendiente / notas
- Hoy casi todas las medidas vigentes no tienen dispositivo configurado (136 de 140 niños), así que la página va a ser más útil a medida que se cargue.
- El dispositivo se toma de la intervención de la medida. Si la configuración se edita con el botón "Configurar/Editar" de la medida, hay que confirmar que ese dato llega en `medidas-all` (en la prueba con la medida 251 se ve la configuración en la medida y aparece en la página).
- Recomendación para el back (opcional): un endpoint agregado por dispositivo, para no traer todas las medidas al navegador cuando crezcan.
