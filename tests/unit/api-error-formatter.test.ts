import { describe, expect, it } from "vitest"

import { describeApiError } from "@/utils/apiErrorFormatter"

const apiError = (status: number, data: unknown) => ({ response: { status, data } })

describe("describeApiError", () => {
  it("indica persona y campo cuando el backend rechaza un teléfono demasiado largo", () => {
    const error = apiError(400, {
      personas: [{}, { persona: { telefono: ["Asegúrese de que este valor es menor o igual a 2147483647."] } }],
    })

    const { message, details } = describeApiError(error, "No se pudo enviar el formulario")

    expect(message).toContain("No se pudo enviar el formulario")
    expect(message).toContain("Persona 2 › Teléfono")
    expect(message).toContain("2.147.483.647")
    expect(details).toContain("Código de error: 400")
  })

  it("traduce el rechazo del almacenamiento de archivos a un mensaje sobre adjuntos", () => {
    const error = apiError(400, { error: "An error occurred (403) when calling the HeadObject operation: Forbidden" })

    expect(describeApiError(error).message).toContain("archivos adjuntos")
  })

  it("limita la cantidad de líneas y avisa cuántas quedan fuera", () => {
    const error = apiError(400, {
      calle: ["Este campo es requerido."],
      localidad: ["Este campo es requerido."],
      zona: ["Este campo es requerido."],
      dni: ["Este campo es requerido."],
      nombre: ["Este campo es requerido."],
    })

    const { message } = describeApiError(error)

    expect(message).toContain("• Calle: Este campo es requerido.")
    expect(message).toContain("• y 1 más (ver detalles)")
  })

  it("usa el mensaje por código HTTP cuando la respuesta no trae detalle", () => {
    expect(describeApiError(apiError(500, {})).message).toBe("Error interno del servidor. Por favor, inténtalo más tarde.")
  })

  it("avisa de un problema de conexión cuando no hubo respuesta", () => {
    expect(describeApiError(new Error("Network Error")).message).toContain("No se pudo conectar")
  })
})
