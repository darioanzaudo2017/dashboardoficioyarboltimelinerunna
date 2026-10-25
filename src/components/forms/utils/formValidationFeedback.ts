/**
 * Ayudas para decirle a quien carga el formulario QUÉ falta y llevarlo hasta ahí.
 * La parte de mensajes es pura (testeable); la del DOM sólo se usa desde el navegador.
 */

export const MIN_JUSTIFICACION_VINCULO = 20
const MAX_VISIBLE_ITEMS = 5

interface VinculoLike {
  legajo?: unknown
  tipo_vinculo?: unknown
  justificacion?: string | null
}

const bulletList = (items: string[]): string => {
  const visible = items.slice(0, MAX_VISIBLE_ITEMS).map((item) => `• ${item}`)
  if (items.length > MAX_VISIBLE_ITEMS) visible.push(`• y ${items.length - MAX_VISIBLE_ITEMS} más`)
  return visible.join("\n")
}

/** Lista legible de los campos con error, ej. "Faltan completar o corregir 2 campos: • Nombre • DNI". */
export const buildInvalidFieldsMessage = (labels: string[]): string => {
  if (labels.length === 0) return "Hay campos sin completar o con errores. Revisá los marcados en rojo."
  const title =
    labels.length === 1
      ? "Falta completar o corregir 1 campo:"
      : `Faltan completar o corregir ${labels.length} campos:`
  return `${title}\n${bulletList(labels)}`
}

/** Qué le falta a cada vínculo, ej. "Vínculo 2: elegir el legajo, justificación de al menos 20 caracteres (tiene 5)". */
export const describeVinculoProblems = (vinculos: VinculoLike[]): string[] =>
  vinculos.flatMap((vinculo, index) => {
    const problems: string[] = []
    if (!vinculo.legajo) problems.push("elegir el legajo")
    if (!vinculo.tipo_vinculo) problems.push("elegir el tipo de vínculo")
    const length = (vinculo.justificacion ?? "").trim().length
    if (length < MIN_JUSTIFICACION_VINCULO) {
      problems.push(`justificación de al menos ${MIN_JUSTIFICACION_VINCULO} caracteres (tiene ${length})`)
    }
    return problems.length ? [`Vínculo ${index + 1}: ${problems.join(", ")}`] : []
  })

export const buildVinculoProblemsMessage = (problems: string[]): string =>
  `Revisá los vínculos con legajos antes de guardar:\n${bulletList(problems)}`

// ---------------------------------------------------------------------------
// DOM
// ---------------------------------------------------------------------------

const cleanLabel = (text: string): string => text.replace(/[\s*]+$/, "").trim()

const labelOf = (node: HTMLElement): string => {
  const byFor = node.id ? document.querySelector<HTMLLabelElement>(`label[for="${CSS.escape(node.id)}"]`) : null
  return cleanLabel(byFor?.textContent ?? node.getAttribute("aria-label") ?? "")
}

const invalidNodes = (root: ParentNode): HTMLElement[] =>
  Array.from(root.querySelectorAll<HTMLElement>('[aria-invalid="true"]')).filter((node) => node.offsetParent !== null)

/** Etiquetas de los campos visibles con error; si se repiten (ej. "Nombre" en varias personas) se agrupan. */
export const collectInvalidFieldLabels = (root: ParentNode = document): string[] => {
  const counts = new Map<string, number>()
  invalidNodes(root).forEach((node) => {
    const label = labelOf(node) || "Campo sin nombre"
    counts.set(label, (counts.get(label) ?? 0) + 1)
  })
  return Array.from(counts.entries()).map(([label, count]) => (count > 1 ? `${label} (${count} veces)` : label))
}

/** Lleva la pantalla al primer campo con error y lo enfoca. */
export const focusFirstInvalidField = (root: ParentNode = document): void => {
  const first = invalidNodes(root)[0]
  if (!first) return
  first.scrollIntoView({ behavior: "smooth", block: "center" })
  first.focus({ preventScroll: true })
}

/** Abre (si estaba plegada) la sección de vínculos y la lleva a pantalla. */
export const revealVinculosSection = (): void => {
  const section = document.querySelector<HTMLElement>('[data-section="vinculos"]')
  if (!section) return
  const collapsedHeader = section.querySelector<HTMLElement>('[aria-expanded="false"]')
  collapsedHeader?.click()
  section.scrollIntoView({ behavior: "smooth", block: "start" })
}
