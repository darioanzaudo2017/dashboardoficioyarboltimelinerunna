/**
 * Paso al que se vuelve al retomar un borrador. El paso guardado puede ser inválido (borrador viejo,
 * otro tipo de formulario con menos pasos), así que se acota a un paso que exista.
 *
 * @param saved       paso guardado (0-based, sin contar el de objetivo) o null si no hay
 * @param totalSteps  cantidad de pasos de contenido del formulario
 */
export const resolveResumeStep = (saved: number | null, totalSteps: number): number => {
  if (saved === null || !Number.isInteger(saved) || saved < 0) return 0
  return Math.min(saved, Math.max(totalSteps - 1, 0))
}
