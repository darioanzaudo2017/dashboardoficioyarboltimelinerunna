import { beforeEach, describe, expect, it, vi } from "vitest"

// Un solo toast de éxito por acción: los servicios de API no lo muestran,
// lo muestra el hook (o el diálogo) que los llama.

const toastMock = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
}))
const axiosMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}))

vi.mock("react-toastify", () => ({ toast: toastMock }))
vi.mock("@/app/api/utils/axiosInstance", () => ({ default: axiosMock }))
vi.mock("@/utils/analytics", () => ({ track: vi.fn(), AnalyticsEvent: {} }))
vi.mock("@/utils/showErrorToast", () => ({ showErrorToast: vi.fn() }))
vi.mock("@/app/(runna)/legajo/[id]/medida/[medidaId]/hooks/useMedidaDetail", () => ({
  medidaKeys: { detail: (id: number) => ["medidas", "detail", id] },
}))

import { createWorkflowActions } from "@/app/(runna)/legajo/[id]/medida/[medidaId]/hooks/useRegistroIntervencion/actions/createWorkflowActions"
import { createSaveActions } from "@/app/(runna)/legajo/[id]/medida/[medidaId]/hooks/useRegistroIntervencion/actions/createSaveActions"
import {
  crearYEnviarInformeJuridico,
  enviarInformeJuridico,
  enviarInformeJuridicoAJuzgado,
} from "@/app/(runna)/legajo/[id]/medida/[medidaId]/api/informe-juridico-api-service"
import { createRatificacion } from "@/app/(runna)/legajo/[id]/medida/[medidaId]/api/ratificacion-judicial-api-service"

const MEDIDA = 10
const INTERVENCION = 20

const queryClient = {
  refetchQueries: vi.fn().mockResolvedValue(undefined),
  invalidateQueries: vi.fn().mockResolvedValue(undefined),
  setQueryData: vi.fn(),
} as any

const intervencionResponse = { id: INTERVENCION, medida: { id: MEDIDA, etapa_actual: null } }

function workflowActions() {
  return createWorkflowActions({
    medidaId: MEDIDA,
    intervencionId: INTERVENCION,
    queryClient,
    intervencion: null,
    setIntervencion: vi.fn(),
    setIsEnviando: vi.fn(),
    setIsAprobando: vi.fn(),
    setIsRechazando: vi.fn(),
    setError: vi.fn(),
  } as any)
}

const exitos = () => toastMock.success.mock.calls.length + toastMock.info.mock.calls.length

beforeEach(() => {
  vi.clearAllMocks()
  axiosMock.post.mockResolvedValue({ status: 201, data: intervencionResponse })
  axiosMock.patch.mockResolvedValue({ status: 200, data: { intervencion: intervencionResponse } })
})

describe("toasts de las acciones de la intervención", () => {
  it("aprobar muestra un solo toast", async () => {
    expect(await workflowActions().aprobar()).toBe(true)
    expect(exitos()).toBe(1)
    expect(toastMock.success).toHaveBeenCalledWith("Intervención aprobada exitosamente", expect.anything())
  })

  it("enviar muestra un solo toast", async () => {
    expect(await workflowActions().enviar()).toBe(true)
    expect(exitos()).toBe(1)
  })

  it("rechazar muestra un solo toast", async () => {
    expect(await workflowActions().rechazar("falta el informe")).toBe(true)
    expect(exitos()).toBe(1)
  })

  it("el guardado previo a enviar puede ir sin toast; el borrador sigue avisando", async () => {
    axiosMock.patch.mockResolvedValue({ status: 200, data: intervencionResponse })
    const { guardarBorrador } = createSaveActions({
      medidaId: MEDIDA,
      intervencionId: INTERVENCION,
      workflowPhase: undefined,
      queryClient,
      formData: { motivo_id: 1, intervencion_especifica: "x" },
      intervencion: null,
      setIntervencion: vi.fn(),
      setIsSaving: vi.fn(),
      setIsEnviando: vi.fn(),
      setError: vi.fn(),
      setValidationErrors: vi.fn(),
      validateForm: () => ({}),
    } as any)

    await guardarBorrador({ silencioso: true })
    expect(exitos()).toBe(0)

    await guardarBorrador()
    expect(toastMock.success).toHaveBeenCalledTimes(1)
  })
})

describe("los servicios de informe jurídico y ratificación no muestran toast", () => {
  it("enviar y crear-y-enviar el informe jurídico", async () => {
    await enviarInformeJuridico(MEDIDA)
    const pdf = new File(["%PDF"], "ij.pdf", { type: "application/pdf" })
    await crearYEnviarInformeJuridico(MEDIDA, {
      informe_oficial: pdf,
      instituciones_notificadas: "Juzgado",
      fecha_notificaciones: "2026-11-01",
      medio_notificacion: "EMAIL",
      destinatarios: "Juzgado",
    } as any)
    await enviarInformeJuridicoAJuzgado(MEDIDA, [])
    expect(exitos()).toBe(0)
  })

  it("registrar la ratificación", async () => {
    await createRatificacion(MEDIDA, {
      etapa_id: 5,
      decision: "RATIFICADA",
      fecha_resolucion: "2026-11-01",
    } as any)
    expect(exitos()).toBe(0)
  })
})
