import { describe, expect, it } from "vitest"

import {
  formatFileSize,
  getFileExtension,
  isAllowedExtension,
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
})
