/**
 * Logger centralizado
 *
 * RUNNA maneja datos personales sensibles de menores (legajos, personas,
 * vulneraciones, medidas de protección). Los `console.log` que volcaban
 * payloads completos de request/response quedaban visibles en la consola del
 * navegador de cualquier persona con acceso a DevTools en producción.
 *
 * Este módulo separa los canales de log en dos grupos:
 *
 * - `debug` / `log` / `info` / `group` / `groupEnd`: sólo emiten en desarrollo.
 *   En producción son no-ops. Es el canal para trazas de diagnóstico, que son
 *   las que suelen volcar payloads completos.
 * - `warn` / `error`: emiten siempre, también en producción. Son la información
 *   que necesita soporte para diagnosticar incidentes reales.
 *
 * Consideraciones de uso:
 *
 * - Los argumentos se evalúan siempre, incluso cuando el canal es un no-op.
 *   `logger.log("data:", JSON.stringify(obj))` no imprime nada en producción,
 *   pero igual ejecuta el `JSON.stringify`. Si el costo importa, gatear el
 *   bloque completo.
 * - `warn` y `error` siguen llegando a la consola en producción. No pasarles
 *   estructuras completas con datos personales.
 *
 * @example
 * import { logger } from "@/utils/logger"
 *
 * logger.log("Creando intervención:", data) // sólo en desarrollo
 * logger.error("Falló la creación de la intervención:", error) // siempre
 */

/**
 * Firma compatible con la de los métodos de `console`, sin `any`.
 */
export type LogFn = (...args: unknown[]) => void

/**
 * Métodos de `console` que este logger expone.
 */
type ConsoleMethod = "debug" | "log" | "info" | "warn" | "error" | "group" | "groupEnd"

/**
 * `true` cuando el bundle se compila para producción.
 *
 * Next.js reemplaza `process.env.NODE_ENV` en tiempo de build, así que esta
 * constante se resuelve estáticamente y no depende de `window`: el módulo
 * funciona igual en el servidor (SSR, route handlers) que en el navegador.
 */
const isProduction = process.env.NODE_ENV === "production"

const noop: LogFn = () => {}

/**
 * Devuelve el método nativo de `console` ligado a `console`.
 *
 * Se usa `bind` en lugar de un wrapper para que DevTools siga mostrando el
 * archivo y la línea donde se llamó al logger, y no este módulo.
 *
 * Si `console` no existe o no expone el método (entornos no estándar), se
 * degrada a no-op en vez de romper.
 */
function bindConsole(method: ConsoleMethod): LogFn {
  if (typeof console === "undefined" || typeof console[method] !== "function") {
    return noop
  }
  return console[method].bind(console) as LogFn
}

/**
 * Canal que sólo emite fuera de producción.
 */
function developmentOnly(method: ConsoleMethod): LogFn {
  return isProduction ? noop : bindConsole(method)
}

export const logger = {
  /** Traza de diagnóstico. Sólo en desarrollo. */
  debug: developmentOnly("debug"),
  /** Traza general. Sólo en desarrollo. */
  log: developmentOnly("log"),
  /** Información contextual. Sólo en desarrollo. */
  info: developmentOnly("info"),
  /** Abre un grupo en la consola. Sólo en desarrollo. */
  group: developmentOnly("group"),
  /** Cierra un grupo en la consola. Sólo en desarrollo. */
  groupEnd: developmentOnly("groupEnd"),
  /** Advertencia. Emite también en producción. */
  warn: bindConsole("warn"),
  /** Error. Emite también en producción. */
  error: bindConsole("error"),
} as const

export default logger
