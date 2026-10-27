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

  it("nombra los campos de la evaluación en lugar de mostrar el nombre técnico", () => {
    const { message } = describeApiError(
      apiError(400, { justificacion_tecnico: ["Este campo no puede estar en blanco."] }),
      "No se pudo enviar la solicitud:",
    )

    expect(message).toBe("No se pudo enviar la solicitud:\n• Justificación del técnico: Este campo no puede estar en blanco.")
  })

  it("muestra el detalle de un error simple del servidor", () => {
    const { message } = describeApiError(apiError(400, { detail: "El campo justificacion_director es obligatorio." }))

    expect(message).toContain("• El campo justificacion_director es obligatorio.")
  })

  it("no vuelca la página HTML de un error 500 al usuario", () => {
    const html = "\n<!doctype html>\n<html><head><title>Server Error (500)</title></head></html>"

    const { message } = describeApiError(apiError(500, html), "No se pudo enviar la solicitud:")

    expect(message).toBe("Error interno del servidor. Por favor, inténtalo más tarde.")
    expect(message).not.toContain("<")
  })

  it("avisa de un problema de conexión cuando no hubo respuesta", () => {
    expect(describeApiError(new Error("Network Error")).message).toContain("No se pudo conectar")
  })
})
