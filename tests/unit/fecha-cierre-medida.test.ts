import { describe, expect, it } from "vitest"

import { formatDateLocaleAR } from "@/utils/dateUtils"

describe("fechas de la medida sin hora", () => {
  it("la fecha de cierre muestra el mismo día que manda el servidor", () => {
    expect(formatDateLocaleAR("2026-11-03")).toBe("03/11/2026")
    expect(formatDateLocaleAR("2026-12-01")).toBe("01/12/2026")
  })

  it("una fecha con hora sigue mostrando su día", () => {
    expect(formatDateLocaleAR("2026-11-03T15:30:00")).toBe("03/11/2026")
  })
})

describe("fecha a medianoche UTC", () => {
  it("el servidor manda la fecha de cierre como medianoche UTC y se muestra el mismo día", () => {
    expect(formatDateLocaleAR("2026-11-03T00:00:00Z")).toBe("03/11/2026")
    expect(formatDateLocaleAR("2026-11-03T00:00:00.000000Z")).toBe("03/11/2026")
  })

  it("una hora real (no medianoche UTC) no se toca", () => {
    expect(formatDateLocaleAR("2026-11-03T15:56:03.058158Z")).toBe("03/11/2026")
  })
})
