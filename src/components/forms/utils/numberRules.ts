/**
 * Reglas de validación para campos numéricos (teléfono, DNI).
 * El backend los guarda como entero de 64 bits; el tope es el mayor entero que
 * JavaScript representa sin perder precisión, así el valor llega intacto.
 */
export const MAX_ENTERO_BACKEND = Number.MAX_SAFE_INTEGER

export const integerFieldRules = (tooBigHint: string) => ({
  validate: (value: unknown) => {
    if (value === "" || value === null || value === undefined) return true
    const parsed = Number(value)
    if (!Number.isInteger(parsed) || parsed < 0) {
      return "Ingresá solo números, sin puntos, espacios ni guiones."
    }
    if (parsed > MAX_ENTERO_BACKEND) {
      return `El número es demasiado largo. ${tooBigHint}`
    }
    return true
  },
})

export const phoneFieldRules = integerFieldRules("Revisá que el teléfono no tenga dígitos de más.")

export const dniFieldRules = integerFieldRules("Revisá que el DNI no tenga dígitos de más.")
