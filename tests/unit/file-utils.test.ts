import { describe, expect, it } from "vitest"

import {
  formatFileSize,
  getFileExtension,
  isAllowedExtension,
  nombreDeArchivoDesdeUrl,
} from "@/utils/fileUtils"

describe("fileUtils", () => {
  it("extrae extensiones en minúscula de rutas y nombres compuestos", () => {
    expect(getFileExtension("/tmp/Informe.Final.PDF")).toBe("pdf")
    expect(getFileExtension("archivo.tar.gz")).toBe("gz")
  })

  it("no interpreta nombres sin extensión ni archivos ocultos como extensiones", () => {
    expect(getFileExtension("sin-extension")).toBe("")
    expect(getFileExtension(".env")).toBe("")
    expect(getFileExtension("archivo.")).toBe("")
  })

  it("valida la extensión final y no una extensión intermedia", () => {
    expect(isAllowedExtension("informe.PDF", ["pdf", "docx"])).toBe(true)
    expect(isAllowedExtension("informe.pdf.exe", ["pdf", "docx"])).toBe(false)
  })

  it("formatea tamaños en unidades legibles", () => {
    expect(formatFileSize(512)).toBe("512 B")
    expect(formatFileSize(1536, 1)).toBe("1.5 KB")
    expect(formatFileSize(1024 * 1024)).toBe("1.00 MB")
  })

  it("toma el nombre de la URL sin los parámetros de la firma", () => {
    const firmada = "https://t3.storageapi.dev/bucket/evaluaciones/prueba.pdf?X-Amz-Algorithm=AWS4&X-Amz-Signature=abc123"
    expect(nombreDeArchivoDesdeUrl(firmada)).toBe("prueba.pdf")
  })

  it("decodifica el nombre y usa uno por defecto si la URL no tiene", () => {
    expect(nombreDeArchivoDesdeUrl("/media/a/informe%20final.pdf")).toBe("informe final.pdf")
    expect(nombreDeArchivoDesdeUrl("/media/a/100%.pdf")).toBe("100%.pdf")
    expect(nombreDeArchivoDesdeUrl("", "archivo_1")).toBe("archivo_1")
  })
})
