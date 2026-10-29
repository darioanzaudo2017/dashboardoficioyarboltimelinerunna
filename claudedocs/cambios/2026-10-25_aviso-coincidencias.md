# Aviso de posibles coincidencias en el registro de demanda

**Rama:** `mejora-aviso-coincidencias`  **Fecha:** 2026-10-25

## Problema
Mientras se carga una demanda, el sistema busca por su cuenta demandas y legajos que coincidan por nombre y
apellido, DNI, código de demanda, o **calle + localidad**. Cuando encontraba algo mostraba un panel que:

- Aparecía **arriba al centro, encima de la barra de navegación**, y tapaba sus botones.
- **No se cerraba solo** y ocupaba bastante espacio mientras se seguía completando.
- Decía "Coincidencias encontradas" y, en cada resultado, "…; **vinculado a la demanda 323**", cuando en
  realidad no se había vinculado nada (era solo una coincidencia).
- Con "Ver demanda" **sacaba al usuario del formulario** (solo quedaba el borrador).
- Para las demandas no ofrecía ninguna acción ni explicaba por qué.

## Qué cambió
- **Lugar:** notificación compacta **abajo a la derecha**. No tapa la barra ni los botones "Atrás/Siguiente"
  del formulario, y se puede seguir completando.
- **Colapsada al inicio:** muestra una línea ("Posibles coincidencias · 2 resultados · todavía no vinculadas").
  Tocándola se despliega el detalle; la X la cierra.
- **Alerta visual:** borde izquierdo y fondo ámbar suave, ícono de advertencia.
- **Animación breve:** el ícono hace un pulso que se expande y un leve sacudón (3 veces cada uno) y se detiene.
  Se corta al expandir el panel y se desactiva si el sistema del usuario pidió reducir animaciones.
- **Textos:** "Posibles coincidencias"; "…; coincide con la demanda #323" en lugar de "vinculado a…".
- **"Ver demanda" / "Ver legajo"** abren una **pestaña nueva**: el formulario no se pierde.
- **Aclaración:** "Podrás vincularla después de guardar, desde el detalle de la demanda" (al crear todavía no
  existe el id de la nueva demanda, por eso no se puede vincular en ese momento).

## Archivos
| Archivo | Qué hace |
|---|---|
| `src/components/forms/VinculacionNotificacion.tsx` | Nueva ubicación, colapsable, color, animación, enlaces en pestaña nueva |
| `src/components/forms/utils/matchDescription.ts` | Reescribe "vinculado a la demanda N" por "coincide con la demanda #N" |
| `tests/unit/match-description.test.ts` | Tests del helper de texto |

## Cómo probarlo
1. `npm run dev` e iniciar sesión.
2. Ir a **Nuevo Registro** → elegir "Protección Inicial" → Siguiente.
3. Escribir la **calle** y la **localidad** de una demanda que ya exista (por ejemplo `Colon` / `CORDOBA`).
4. Abajo a la derecha aparece el aviso; tocarlo para desplegarlo; probar "Ver demanda" (abre otra pestaña).

## Verificación
- 31 tests unitarios pasan (3 nuevos); sin errores de tipos en los archivos tocados.
- En el navegador, contra el backend real: aparece abajo a la derecha, colapsado; al expandirlo lista las dos
  demandas con el texto nuevo; "Ver demanda" abre pestaña nueva y el formulario sigue intacto.
- La animación se confirmó leyendo los estilos aplicados (pulso 1,6 s y sacudón 1,1 s, 3 repeticiones, y
  `none` al expandir). Una captura no muestra el movimiento: conviene verla en pantalla.

## Pendiente / notas
- El texto "vinculado a la demanda N" **viene del backend**; acá solo se reescribe en pantalla. Conviene
  corregirlo en origen (ver B8 en [OBSERVACIONES_BACKEND_2026-10-23.md](../OBSERVACIONES_BACKEND_2026-10-23.md)).
- Coincidir solo por calle + localidad marca demandas de personas distintas: es ruido de la búsqueda del backend.
- En pantallas muy angostas el aviso ocupa casi todo el ancho; se cierra con la X.
