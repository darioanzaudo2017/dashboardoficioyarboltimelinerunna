/**
 * RUNNA Notification & Highlight Utils
 * Centralized logic for row highlighting and notification bell alerts.
 */

/**
 * Normalizes a string for robust keyword matching (removes accents, uppercase, trim)
 */
export const normalizeState = (str: any): string =>
    String(str || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .trim()

export interface UserPermissions {
    isDirector: boolean
    isLegales: boolean
    isEquipoTecnico: boolean
    isJefeZonal: boolean
    isAdmin: boolean
    userId?: number
}

/** Alerta "virtual": no viene del backend, se deriva del estado de la medida. */
export interface AlertaVirtual {
    tipo: string
    severidad: "baja" | "media" | "alta"
    mensaje: string
}

/**
 * Estados de etapa que habilitan cada alerta virtual.
 *
 * Se comparan de forma EXACTA. Antes se hacia match por substring sobre una
 * bolsa que mezclaba estados, nombres de etapa e historicos, y por eso el
 * legajo 158 (medida MPE vigente en PENDIENTE_REGISTRO_INTERVENCION, sin nota
 * de aval) mostraba "Pendiente Nota de Aval".
 */
export const ESTADOS_ETAPA_NOTA_AVAL: string[] = ["PENDIENTE_NOTA_AVAL"]
export const ESTADOS_ETAPA_LEGALES: string[] = [
    "PENDIENTE_INFORME_JURIDICO",
    "PENDIENTE_RATIFICACION_JUDICIAL",
]

/**
 * Devuelve el estado de la etapa ACTUAL de cada medida vigente del legajo.
 *
 * Deliberadamente NO incluye nombres de etapa ni etapas historicas: lo unico
 * que habilita una alerta de pendiente es donde esta parada hoy la medida.
 */
export const getEstadosEtapaActual = (legajo: any): string[] => {
    const estados = new Set<string>()

    const medidas = Array.isArray(legajo?.medidas_activas) ? legajo.medidas_activas : []
    medidas.forEach((medida: any) => {
        // Una medida cerrada o archivada no deja pendientes. Si el backend no
        // manda la vigencia se toma como activa (ya viene de medidas_activas).
        const vigencia = normalizeState(medida?.estado_vigencia)
        if (vigencia && vigencia !== "VIGENTE") return

        // El listado manda etapa_actual__estado; el detalle, etapa_actual.estado.
        const estadoEtapa =
            medida?.etapa_actual__estado ?? medida?.etapa_actual?.estado ?? medida?.etapa_estado
        if (estadoEtapa) estados.add(normalizeState(estadoEtapa))
    })

    // Fallback para filas sin medidas_activas: el andarivel ya expone la etapa actual.
    if (estados.size === 0) {
        const andarivel = legajo?.indicadores?.medida_andarivel
        if (andarivel && typeof andarivel === "object" && andarivel.etapa_estado) {
            estados.add(normalizeState(andarivel.etapa_estado))
        }
    }

    return Array.from(estados)
}

/**
 * Alertas virtuales por rol, calculadas sobre el estado actual de la etapa
 * actual de las medidas vigentes. Fuente unica para el chip de alertas y para
 * el resaltado de filas, que antes tenian copias divergentes de esta logica.
 */
export const buildAlertasVirtuales = (
    legajo: any,
    permissions: UserPermissions
): AlertaVirtual[] => {
    const estados = getEstadosEtapaActual(legajo)
    const alertas: AlertaVirtual[] = []

    if (
        (permissions.isDirector || permissions.isAdmin) &&
        estados.some((estado) => ESTADOS_ETAPA_NOTA_AVAL.includes(estado))
    ) {
        alertas.push({ tipo: "URGENTE", severidad: "alta", mensaje: "Pendiente Nota de Aval" })
    }

    if (
        (permissions.isLegales || permissions.isAdmin) &&
        estados.some((estado) => ESTADOS_ETAPA_LEGALES.includes(estado))
    ) {
        alertas.push({ tipo: "URGENTE", severidad: "alta", mensaje: "Pendiente Informe Jurídico" })
    }

    return alertas
}

/**
 * Checks if a Legajo should be highlighted in the table
 */
export const shouldHighlightLegajo = (
    legajo: any,
    permissions: UserPermissions
): boolean => buildAlertasVirtuales(legajo, permissions).length > 0

/**
 * Determines if an activity should trigger a notification in the Navbar
 */
export const shouldNotifyActivity = (
    actividad: any,
    permissions: UserPermissions
): boolean => {
    const estado = actividad.estado
    const isAssigned =
        actividad.responsable_principal === permissions.userId ||
        actividad.responsables_secundarios?.includes(permissions.userId as number)

    // 1. Técnico: Assigned and pending
    if (isAssigned && (estado === "PENDIENTE" || estado === "EN_PROGRESO")) {
        return true
    }

    // 2. Jefe Zonal: Pending JZ approval
    if (permissions.isJefeZonal && estado === "PENDIENTE_VISADO_JZ") {
        return true
    }

    // 3. Director: Also sees JZ pending tasks (as requested: "Actividades en PENDIENTE_VISADO_JZ")
    if (permissions.isDirector && estado === "PENDIENTE_VISADO_JZ") {
        return true
    }

    // 4. Legal: Pending Legal approval (visado)
    if (permissions.isLegales && estado === "PENDIENTE_VISADO") {
        return true
    }

    return false
}

/**
 * Determines if a Measure (medida) should trigger a notification in the Navbar
 * (These are "Virtual Activities" because they aren't in the activity list from backend)
 */
export const shouldNotifyMedida = (
    medida: any,
    permissions: UserPermissions
): boolean => {
    const estadoEtapa = medida.etapa_actual?.estado || ""

    // For measures, we usually check the etapa_actual state
    if (permissions.isLegales || permissions.isAdmin) {
        if (estadoEtapa === "PENDIENTE_INFORME_JURIDICO" || estadoEtapa === "PENDIENTE_RATIFICACION_JUDICIAL") {
            return true
        }
    }

    if (permissions.isDirector || permissions.isAdmin) {
        if (estadoEtapa === "PENDIENTE_NOTA_AVAL") {
            return true
        }
    }

    return false
}
