/**
 * Reglas de validación para campos numéricos que el backend guarda como entero de 32 bits.
 * Si el valor lo supera, el servidor rechaza todo el registro, por eso se valida en el campo.
 */
export const MAX_ENTERO_BACKEND = 2147483647

const formatMax = () => MAX_ENTERO_BACKEND.toLocaleString("es-AR")

export const integerFieldRules = (tooBigHint: string) => ({
  validate: (value: unknown) => {
    if (value === "" || value === null || value === undefined) return true
    const parsed = Number(value)
    if (!Number.isInteger(parsed) || parsed < 0) {
      return "Ingresá solo números, sin puntos, espacios ni guiones."
    }
    if (parsed > MAX_ENTERO_BACKEND) {
      return `El sistema admite números de hasta ${formatMax()}. ${tooBigHint}`
    }
    return true
  },
})

export const phoneFieldRules = integerFieldRules("Ingresá el número sin código de área.")

export const dniFieldRules = integerFieldRules("Revisá que el DNI no tenga dígitos de más.")
