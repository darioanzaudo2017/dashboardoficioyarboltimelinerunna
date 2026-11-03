# Barra superior: el ícono del manual abre el tutorial publicado

**Rama:** `mejora-link-tutorial`  **Fecha:** 2026-11-03

## Problema
El ícono del libro en la barra superior (y el ítem "Manual de capacitación" del menú compacto) abrían una versión del tutorial en Vercel, con la dirección escrita a mano en dos lugares.

## Qué cambió
- Los dos accesos abren ahora `https://darioanzaudo2017.github.io/capacitacion_tutorial_runna/` en una pestaña nueva.
- La dirección está en una sola constante (`TUTORIAL_URL`) y se puede cambiar sin tocar el código con la variable `NEXT_PUBLIC_TUTORIAL_URL`.

## Archivos
| Archivo | Qué hace |
|---|---|
| `src/components/layoutComponents/Navbar.tsx` | Constante `TUTORIAL_URL` usada en el ícono y en el menú compacto |

## Cómo probarlo
Iniciar sesión y hacer clic en el ícono del libro (arriba a la derecha): abre el tutorial en una pestaña nueva.

## Verificación
Tipos sin errores. En el navegador, el enlace del ícono apunta a la dirección nueva y abre en pestaña nueva.

## Pendiente / notas
- Si el tutorial se publica en otra dirección, basta con definir `NEXT_PUBLIC_TUTORIAL_URL` en el despliegue.
