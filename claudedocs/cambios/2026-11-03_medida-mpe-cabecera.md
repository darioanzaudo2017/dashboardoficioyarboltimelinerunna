# Medida (vista nueva): franja con el NNyA, el equipo y el plazo de 90 días

**Rama:** `mejora-medida-mpe-cabecera`  **Fecha:** 2026-11-03

## Problema
La vista nueva de una medida no decía de quién era: el nombre del NNyA solo estaba en el breadcrumb ("Legajo 176") y no se veía el plazo legal de 90 días
de las medidas MPE, que la vista clásica sí muestra. Había que volver a la clásica para saber esas dos cosas básicas.

## Qué cambió
Una **franja de una sola línea** arriba del resumen de la medida, que ocupa poco lugar:
- Nombre del NNyA y número de legajo.
- Equipo responsable (si hay dato).
- Solo MPE vigente: **Plazo X/90 días**, barra fina y "N días restantes" (verde; naranja con 30 días o menos; rojo con 15 o menos; "Plazo vencido" al pasar los 90).
  Mismos cortes y mismo cálculo que la vista clásica (7/90 y 83 restantes en MED-2026-249 en las dos).
- Si no hay ningún dato para mostrar, la franja no aparece. En celular se acomoda en dos líneas.

## Archivos
| Archivo | Qué hace |
|---|---|
| `.../restyle/medida-ficha.tsx` | Componente de la franja |
| `.../utils/plazo-medida.ts` | Cálculo del plazo (días transcurridos, restantes y estado) |
| `.../medida/medida-detail.tsx` | Muestra la franja en la vista nueva |
| `tests/unit/plazo-medida.test.ts` | 6 casos |

## Cómo probarlo
1. `/legajo/176/medida/249`, vista nueva: la franja muestra "Colapinto Franco · LEG-2026-0176", el equipo y "Plazo 7/90 días · 83 días restantes".
2. Vista clásica: sin cambios, mismos números.

## Verificación
Tipos sin errores y tests en verde. Probado en el navegador con MED-2026-249 (MPE vigente). No se probó con una medida MPI ni MPJ (ahí no se muestra el plazo).

## Pendiente / notas
- Siguen faltando en la vista nueva: botón "Solicitar Cese", ubicación y lugar de resguardo, expediente (SAC), zona de trabajo, origen de la demanda y las pestañas
  Post cese, Documentos Demanda e Historial (ver `2026-11-03_medida-mpe-dispositivo.md`).
- "Equipo responsable" sale de la primera asignación activa del legajo, igual que en la clásica; en la medida de prueba el nombre se repite ("UsuarioTecnicoCosquin1 UsuarioTecnicoCosquin1") porque así viene el dato.
