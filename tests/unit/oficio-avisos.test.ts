import { describe, expect, it } from "vitest"

import { esProblemaDelServidor, mensajeErrorDeArchivos } from "@/utils/apiErrorFormatter"
import { dnisRepetidos } from "@/app/(runna)/demanda/ui/components/legajosConMismoDni"

const respuesta = (status: number, data: unknown) => ({ response: { status, data } })

describe("esProblemaDelServidor", () => {
  it("reconoce un error 500", () => {
    expect(esProblemaDelServidor(respuesta(500, "<html>Server Error</html>"))).toBe(true)
  })

  it("reconoce el almacenamiento de archivos sin permiso, aunque llegue como 400", () => {
    expect(
      esProblemaDelServidor(respuesta(400, { error: "An error occurred (403) when calling the HeadObject operation: Forbidden" })),
    ).toBe(true)
  })

  it("no lo confunde con un error de validación que la persona puede corregir", () => {
    expect(esProblemaDelServidor(respuesta(400, { autocaratulado: ["Este campo es obligatorio."] }))).toBe(false)
  })

  it("no lo confunde con un corte de conexión (sin respuesta)", () => {
    expect(esProblemaDelServidor({ message: "Network Error" })).toBe(false)
  })
})

describe("mensajeErrorDeArchivos", () => {
  it("explica que el servidor tuvo un problema y no muestra la página de error", () => {
    const texto = mensajeErrorDeArchivos(respuesta(500, "<!doctype html><title>Server Error (500)</title>"), "Error al subir archivos")
    expect(texto).toContain("El servidor tuvo un problema")
    expect(texto).not.toContain("<")
  })

  it("usa el motivo que manda el servidor cuando es un texto", () => {
    expect(mensajeErrorDeArchivos(respuesta(400, { error: "El archivo supera los 10 MB" }), "Error al subir archivos")).toBe(
      "El archivo supera los 10 MB",
    )
  })

  it("cae al texto por defecto si no hay nada útil", () => {
    expect(mensajeErrorDeArchivos(respuesta(400, {}), "Error al subir archivos")).toBe("Error al subir archivos")
    expect(mensajeErrorDeArchivos(respuesta(400, { error: "<html>raro</html>" }), "Error al subir archivos")).toBe(
      "Error al subir archivos",
    )
  })
})

describe("dnisRepetidos", () => {
  it("marca los DNI que aparecen en más de un legajo", () => {
    const repetidos = dnisRepetidos([{ dni: 31452587 }, { dni: 31452587 }, { dni: 50111222 }])
    expect(repetidos.has("31452587")).toBe(true)
    expect(repetidos.has("50111222")).toBe(false)
  })

  it("ignora los legajos sin DNI", () => {
    expect(dnisRepetidos([{ dni: null }, { dni: undefined }, { dni: "" }]).size).toBe(0)
  })

  it("trata igual un DNI numérico y el mismo como texto", () => {
    expect(dnisRepetidos([{ dni: 31452587 }, { dni: "31452587" }]).has("31452587")).toBe(true)
  })
})
