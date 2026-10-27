"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Autocomplete,
  TextField,
  Typography,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  type SelectChangeEvent,
} from "@mui/material"
import { toast } from "react-toastify"
import dynamic from "next/dynamic"
import { Cancel as CancelIcon, Person as PersonIcon, Check as CheckIcon } from "@mui/icons-material"
import { create } from "@/app/api/apiService"
import axiosInstance from "@/app/api/utils/axiosInstance"
import { useUser } from "@/utils/auth/userZustand"
import { fetchUsuarios } from "@/app/(runna)/legajo-mesa/api/legajo-asignacion-api-service"
import { normalizeApiText } from "@/components/evaluacion/utils/evaluacion-data-mappers"
import { logger } from "@/utils/logger"

// Dynamic imports para evitar errores SSR con Next.js
const DownloadPDFButton = dynamic(() => import("./pdf/download-pdf-button"), {
  ssr: false,
  loading: () => (
    <Button variant="contained" color="primary" disabled>
      Cargando PDF...
    </Button>
  ),
})

const DownloadDocxButton = dynamic(() => import("./pdf/download-docx-button"), {
  ssr: false,
  loading: () => (
    <Button variant="outlined" color="primary" disabled>
      Cargando Word...
    </Button>
  ),
})

interface ActionButtonsProps {
  data: any
  onPDFGenerated?: (blob: Blob, fileName: string) => void
  // Add these new props
  descripcionSituacion?: string
  valoracionProfesional?: string
  justificacionTecnico?: string
  justificacionDirector?: string
  demandaId?: number | null
  nnyaIds?: (string | number)[]
  adjuntos?: any[]
  fileManagementRef?: React.RefObject<any> // Add ref to get files on demand
  // Nombres de los archivos cargados en la sección ARCHIVOS (los que se van a enviar)
  nombresInformes?: string[]
  // Zona de carga de archivos: se dibuja dentro del panel, justo debajo de los botones del borrador
  archivosSlot?: React.ReactNode
}

interface Confirmacion {
  accion: string
  titulo: string
  texto: string
  boton: string
  color: "primary" | "secondary" | "error"
}

// Encabezado de cada paso del panel de cierre: número (o tilde si está listo) y título.
const PasoTitulo = ({
  n,
  titulo,
  listo,
  etiquetaListo = "Listo",
}: {
  n: number
  titulo: string
  listo: boolean
  etiquetaListo?: string
}) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
    <Box
      sx={{
        width: 28,
        height: 28,
        borderRadius: "50%",
        bgcolor: listo ? "success.main" : "primary.main",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: 14,
      }}
    >
      {listo ? <CheckIcon sx={{ fontSize: 18 }} /> : n}
    </Box>
    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
      {titulo}
    </Typography>
    {listo && <Chip size="small" color="success" variant="outlined" label={etiquetaListo} />}
  </Box>
)

interface ChildOption {
  id: string | number
  name: string
  type: string
  databaseId?: string | number
}

interface Firmante {
  id: number
  nombre: string
  cargo: string
}

// Helper function to derive cargo from user data
const derivarCargo = (usuario: any): string => {
  // Check if user is director
  if (usuario.is_superuser || usuario.is_staff) {
    return "Director/Administrador"
  }

  // Check groups
  if (usuario.groups && usuario.groups.length > 0) {
    const groupName = usuario.groups[0].name
    return groupName
  }

  // Check zonas for director or jefe role
  if (usuario.zonas && usuario.zonas.length > 0) {
    const zona = usuario.zonas[0]
    if (zona.director) {
      return "Director"
    }
    if (zona.jefe) {
      return "Jefe"
    }
  }

  // Default to Técnico
  return "Técnico"
}

export default function ActionButtons({
  data,
  onPDFGenerated,
  descripcionSituacion,
  valoracionProfesional,
  justificacionTecnico,
  justificacionDirector,
  demandaId,
  nnyaIds,
  adjuntos = [],
  fileManagementRef,
  nombresInformes = [],
  archivosSlot = null,
}: ActionButtonsProps) {
  const [borradorGenerado, setBorradorGenerado] = useState(false)
  const [confirmacion, setConfirmacion] = useState<Confirmacion | null>(null)
  const [selectedChildrenIds, setSelectedChildrenIds] = useState<(string | number)[]>([])
  const [firmantes, setFirmantes] = useState<Firmante[]>([])
  const [firmantesDisponibles, setFirmantesDisponibles] = useState<Firmante[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tipoMedidaEvaluado, setTipoMedidaEvaluado] = useState<string>("")
  const user = useUser((state) => state.user)

  // Decision ya registrada por el tecnico (viene de latest_evaluacion)
  const solicitudTecnicoPrevia = normalizeApiText(data?.SolicitudTecnico)
  const tipoMedidaSolicitado = normalizeApiText(data?.TipoMedidaEvaluado)

  // Admin: puede actuar como técnico y como director (ambos flujos)
  const isAdmin = user?.is_superuser === true

  // Check if user is director (superuser, staff, or has Director group, or has director role in zonas)
  const isDirector = isAdmin ||
    user?.is_staff ||
    user?.groups?.some((group: any) => group.name === "Director") ||
    user?.zonas?.some((zona: any) => zona.director === true)

  useEffect(() => {
    if (nnyaIds && Array.isArray(nnyaIds) && nnyaIds.length > 0) {
      setSelectedChildrenIds(nnyaIds);
    }
  }, [nnyaIds]);

  // El tipo de medida que solicito el tecnico ya viene en la evaluacion guardada.
  // Sin esto el selector volvia vacio al reabrir la evaluacion y no quedaba
  // registro visible de que se habia pedido.
  useEffect(() => {
    if (tipoMedidaSolicitado) {
      setTipoMedidaEvaluado(tipoMedidaSolicitado)
    }
  }, [tipoMedidaSolicitado]);

  // Fetch users from API for firmantes filtered by zona
  useEffect(() => {
    const loadUsuarios = async () => {
      try {
        // Get zona ID from demanda data
        const zonaId = data?.relacion_demanda?.demanda_zona?.zona ||
          data?.registrado_por_user_zona?.id ||
          null

        logger.log("Loading usuarios for zona:", zonaId)

        // Fetch all usuarios (API doesn't properly filter by zona)
        const allUsuarios = await fetchUsuarios()

        // Filter usuarios by zona and active status on the client side
        let usuarios = allUsuarios
        if (zonaId) {
          usuarios = allUsuarios.filter((usuario: any) => {
            // Only include active users who belong to the target zona
            return usuario.is_active &&
              usuario.zonas &&
              usuario.zonas.some((userZona: any) => userZona.zona === zonaId)
          })
          logger.log(`Filtered ${usuarios.length} active usuarios for zona ${zonaId}`)
        } else {
          // If no zona specified, still filter by active status
          usuarios = allUsuarios.filter((usuario: any) => usuario.is_active)
        }

        // Transform usuarios to firmantes format
        const firmantesFromAPI: Firmante[] = usuarios.map((usuario: any) => ({
          id: usuario.id,
          nombre: usuario.nombre_completo || `${usuario.first_name} ${usuario.last_name}`.trim() || usuario.username,
          cargo: derivarCargo(usuario) // Use derivarCargo for all users to get proper role
        }))

        // Add current logged-in user if not already in the list
        if (user) {
          const currentUserExists = firmantesFromAPI.some(f => f.id === user.id)
          const currentUserFirmante: Firmante = {
            id: user.id,
            nombre: `${user.first_name} ${user.last_name}`.trim() || user.username,
            cargo: derivarCargo(user)
          }

          if (!currentUserExists) {
            firmantesFromAPI.unshift(currentUserFirmante)
          } else {
            // Update the cargo for the current user with derived cargo
            const index = firmantesFromAPI.findIndex(f => f.id === user.id)
            if (index !== -1) {
              firmantesFromAPI[index].cargo = derivarCargo(user)
            }
          }

          // Auto-select current user as default firmante
          setFirmantes([currentUserFirmante])
        }

        setFirmantesDisponibles(firmantesFromAPI)
      } catch (error) {
        logger.error("Error loading usuarios for firmantes:", error)
        toast.error("Error al cargar lista de usuarios", {
          position: "top-center",
          autoClose: 3000,
        })
      }
    }

    loadUsuarios()
  }, [user, data])

  const handleChildChange = (event: SelectChangeEvent<typeof selectedChildrenIds>) => {
    const {
      target: { value },
    } = event

    // On autofill we get a stringified value.
    setSelectedChildrenIds(typeof value === "string" ? value.split(",") : value)
  }

  // Get children from data with their IDs
  const children: ChildOption[] = [
    ...(data.NNYAConvivientes || []).map((nnya: any) => ({
      id: nnya.persona?.id || nnya.id || nnya.ID || nnya.DNI,
      name: nnya.ApellidoNombre || nnya.apellido_nombre,
      type: "Conviviente",
      databaseId: nnya.persona?.id, // Store the database ID separately
    })),
    ...(data.NNYANoConvivientes || []).map((nnya: any) => ({
      id: nnya.persona?.id || nnya.id || nnya.ID || nnya.DNI,
      name: nnya.ApellidoNombre || nnya.apellido_nombre,
      type: "No Conviviente",
      databaseId: nnya.persona?.id, // Store the database ID separately
    })),
  ]

  const handleAuthorizationAction = async (action: string) => {
    try {
      setIsSubmitting(true)

      if (!demandaId) {
        toast.error("No se pudo procesar: ID de demanda no disponible", {
          position: "top-center",
          autoClose: 3000,
        })
        return
      }

      // Get all adjuntos: existing ones + new files from FileManagement
      const newFiles = fileManagementRef?.current?.getFiles() || []
      const allAdjuntos = [...adjuntos, ...newFiles]

      logger.log("Total adjuntos to send:", allAdjuntos.length)
      logger.log("Existing adjuntos:", adjuntos.length)
      logger.log("New files from FileManagement:", newFiles.length)

      // Get user data for all authorization actions
      const localidad_usuario = normalizeApiText(data?.InformacionGeneral?.Localidad)
      const nombre_usuario =
        [user?.first_name, user?.last_name].map(normalizeApiText).filter(Boolean).join(" ") ||
        normalizeApiText(user?.username) ||
        normalizeApiText(data?.InformacionGeneral?.NombreApellido)
      const rol_usuario = (user ? derivarCargo(user) : "") || normalizeApiText(data?.InformacionGeneral?.CargoFuncion)

      if (!normalizeApiText(descripcionSituacion) || !normalizeApiText(valoracionProfesional)) {
        toast.warning("Completá la descripción de la situación y la valoración profesional antes de continuar", {
          position: "top-center",
          autoClose: 4000,
        })
        return
      }

      if (action === "autorizar tomar medida") {
        if (selectedChildrenIds.length === 0) {
          toast.warning("Por favor seleccione al menos un niño antes de autorizar tomar medida", {
            position: "top-center",
            autoClose: 3000,
          })
          return
        }

        if (!tipoMedidaEvaluado) {
          toast.warning("Por favor seleccione el tipo de medida a tomar", {
            position: "top-center",
            autoClose: 3000,
          })
          return
        }

        // Get the database IDs for the selected children
        const selectedDatabaseIds = selectedChildrenIds.map(selectedId => {
          const child = children.find(c => c.id === selectedId);
          return child?.databaseId || selectedId;
        });

        // Create FormData for multipart/form-data submission
        const formData = new FormData()

        // Append each nnyas_evaluados_id individually (backend expects multiple fields with same name)
        selectedDatabaseIds.forEach((id) => {
          formData.append("nnyas_evaluados_id", String(id))
        })

        // Append all other fields
        formData.append("descripcion_de_la_situacion", normalizeApiText(descripcionSituacion))
        formData.append("valoracion_profesional_final", normalizeApiText(valoracionProfesional))
        formData.append("justificacion_tecnico", normalizeApiText(justificacionTecnico))
        formData.append("solicitud_tecnico", "TOMAR MEDIDA")
        formData.append("tipo_medida_evaluado", tipoMedidaEvaluado)
        formData.append("demanda", String(demandaId))
        formData.append("localidad_usuario", localidad_usuario)
        formData.append("nombre_usuario", nombre_usuario)
        formData.append("rol_usuario", rol_usuario)

        // Append files using the field name "uploaded_files" as specified in API docs
        const newFilesToUpload = allAdjuntos.filter(adjunto => adjunto instanceof File)
        newFilesToUpload.forEach((file) => {
          logger.log("Appending File:", file.name)
          formData.append("uploaded_files", file)
        })

        logger.log("Sending FormData with", newFilesToUpload.length, "files")

        // Send as multipart/form-data - apiService.create() supports FormData
        const response = await create<any>("evaluaciones/", formData, false)
        logger.log("API Response:", response)

        toast.success("Solicitud de tomar medida enviada exitosamente", {
          position: "top-center",
          autoClose: 3000,
        })
      } else if (action === "autorizar archivar") {
        // Include selected NNyA IDs in the archivar request as well
        const selectedDatabaseIds = selectedChildrenIds.map(selectedId => {
          const child = children.find(c => c.id === selectedId);
          return child?.databaseId || selectedId;
        });

        // Create FormData for multipart/form-data submission
        const formData = new FormData()

        // Append each nnyas_evaluados_id individually
        selectedDatabaseIds.forEach((id) => {
          formData.append("nnyas_evaluados_id", String(id))
        })

        // Append all other fields
        formData.append("descripcion_de_la_situacion", normalizeApiText(descripcionSituacion))
        formData.append("valoracion_profesional_final", normalizeApiText(valoracionProfesional))
        formData.append("justificacion_tecnico", normalizeApiText(justificacionTecnico))
        formData.append("solicitud_tecnico", "ARCHIVAR")
        formData.append("demanda", String(demandaId))
        formData.append("localidad_usuario", localidad_usuario)
        formData.append("nombre_usuario", nombre_usuario)
        formData.append("rol_usuario", rol_usuario)

        // Append files using the field name "uploaded_files"
        const newFilesToUpload = allAdjuntos.filter(adjunto => adjunto instanceof File)
        newFilesToUpload.forEach((file) => {
          logger.log("Appending File:", file.name)
          formData.append("uploaded_files", file)
        })

        logger.log("Sending FormData with", newFilesToUpload.length, "files")

        // Send as multipart/form-data - apiService.create() supports FormData
        const response = await create<any>("evaluaciones", formData, false)
        logger.log("API Response:", response)

        toast.success("Solicitud de archivar enviada exitosamente", {
          position: "top-center",
          autoClose: 3000,
        })
      } else if (action === "autorizar" || action === "no autorizar") {
        // Create FormData for multipart/form-data submission
        const formData = new FormData()

        // Append all fields
        formData.append("descripcion_de_la_situacion", normalizeApiText(descripcionSituacion))
        formData.append("valoracion_profesional_final", normalizeApiText(valoracionProfesional))
        formData.append("justificacion_tecnico", normalizeApiText(justificacionTecnico))
        formData.append("justificacion_director", normalizeApiText(justificacionDirector))
        const solicitudTecnico = normalizeApiText(data?.SolicitudTecnico)
        if (solicitudTecnico) {
          formData.append("solicitud_tecnico", solicitudTecnico)
        }
        formData.append("decision_director", action === "autorizar" ? "AUTORIZAR" : "NO AUTORIZAR")
        formData.append("demanda", String(demandaId))
        formData.append("localidad_usuario", localidad_usuario)
        formData.append("nombre_usuario", nombre_usuario)
        formData.append("rol_usuario", rol_usuario)

        if (action === "autorizar") {
          formData.append("decision", "AUTORIZAR_ADMISION")
        }

        // Append files using the field name "uploaded_files"
        const newFilesToUpload = allAdjuntos.filter(adjunto => adjunto instanceof File)
        newFilesToUpload.forEach((file) => {
          logger.log("Appending File:", file.name)
          formData.append("uploaded_files", file)
        })

        logger.log("Sending FormData with", newFilesToUpload.length, "files")

        if (action === "autorizar") {
          // LEG-02: Autorizar admisión y crear legajos automáticamente
          // Use axiosInstance directly because the put() wrapper appends /${id}/ to the URL,
          // but the demandaId is already part of the endpoint path
          const { data: response } = await axiosInstance.put<any>(
            `evaluaciones/${demandaId}/autorizar/?autorizar=true`,
            formData
          )
          logger.log("API Response:", response)

          // Show success message
          const nnyaCount = response.evaluacion_personas?.length || 0
          toast.success(`Admisión autorizada para ${nnyaCount} NNyA`, {
            position: "top-center",
            autoClose: 3000,
          })
        } else {
          // No autorizar - no crea legajos
          const { data: response } = await axiosInstance.put<any>(
            `evaluaciones/${demandaId}/autorizar/?autorizar=false`,
            formData
          )
          logger.log("API Response:", response)

          toast.success("Solicitud no autorizar enviada exitosamente", {
            position: "top-center",
            autoClose: 3000,
          })
        }
      }
    } catch (error) {
      logger.error(`Error in ${action}:`, error)
      toast.error(`Error al procesar la solicitud de ${action}`, {
        position: "top-center",
        autoClose: 3000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }


  // El borrador se descarga pero NO se adjunta solo: hay que revisarlo, firmarlo y subir la versión firmada.
  const handleBorradorGenerado = (blob: Blob, fileName: string) => {
    setBorradorGenerado(true)
    toast.info("Borrador descargado. Revisalo, firmalo y subí la versión firmada en ARCHIVOS", {
      position: "top-center",
      autoClose: 5000,
    })
    if (onPDFGenerated) {
      onPDFGenerated(blob, fileName)
    }
  }

  // Preparar los datos combinados para el PDF
  const combinedData = {
    ...data,
    // Asegurarse de que todos los datos necesarios estén disponibles
    // Esto se puede expandir según sea necesario
    firmantes: firmantes,
  }

  // Resumen de lo que ya pidio el tecnico. Se muestra siempre que exista una
  // solicitud registrada, para que el director no tenga que inferirlo de la
  // documentacion adjunta.
  const TIPO_MEDIDA_LABELS: Record<string, string> = {
    MPI: "Medida de Protección Integral (MPI)",
    MPE: "Medida de Protección Excepcional (MPE)",
    MPJ: "Medida Penal Juvenil (MPJ)",
  }

  const solicitudTecnicoResumen = solicitudTecnicoPrevia ? (
    <Chip
      color="info"
      variant="outlined"
      size="small"
      label={
        tipoMedidaSolicitado
          ? `Solicitud del técnico: ${solicitudTecnicoPrevia} - ${TIPO_MEDIDA_LABELS[tipoMedidaSolicitado] || tipoMedidaSolicitado}`
          : `Solicitud del técnico: ${solicitudTecnicoPrevia}`
      }
      sx={{ maxWidth: "100%" }}
    />
  ) : null

  // Qué falta para poder pedir cada autorización. Se muestra debajo de los botones
  // para que no haya que adivinar por qué están deshabilitados.
  const faltaInforme = nombresInformes.length === 0
  const faltantesArchivo = faltaInforme ? ["subir el informe firmado"] : []
  const faltantesMedida = [
    ...(faltaInforme ? ["subir el informe firmado"] : []),
    ...(selectedChildrenIds.length === 0 ? ["elegir al menos un NNyA"] : []),
    ...(!tipoMedidaEvaluado ? ["elegir el tipo de medida"] : []),
  ]

  const textoInformes = nombresInformes.length > 0 ? ` Se adjunta: ${nombresInformes.join(", ")}.` : ""

  const pedirConfirmacion = (accion: string) => {
    const nombresNnya = selectedChildrenIds
      .map((id) => children.find((c) => c.id === id)?.name)
      .filter(Boolean)
      .join(", ")
    const demanda = demandaId ? ` #${demandaId}` : ""
    switch (accion) {
      case "autorizar archivar":
        setConfirmacion({
          accion,
          titulo: "Solicitar autorización para archivar",
          texto: `Se enviará al Director la solicitud de archivo de la demanda${demanda}.${textoInformes}`,
          boton: "Enviar solicitud",
          color: "secondary",
        })
        break
      case "autorizar tomar medida":
        setConfirmacion({
          accion,
          titulo: "Solicitar autorización de adopción de medida",
          texto: `Se enviará al Director la solicitud de ${tipoMedidaEvaluado ? TIPO_MEDIDA_LABELS[tipoMedidaEvaluado] || tipoMedidaEvaluado : "medida"} para ${nombresNnya || "los NNyA elegidos"} (demanda${demanda}).${textoInformes}`,
          boton: "Enviar solicitud",
          color: "secondary",
        })
        break
      case "autorizar":
        setConfirmacion({
          accion,
          titulo: "Autorizar la solicitud",
          texto: `Vas a AUTORIZAR${solicitudTecnicoPrevia ? ` la solicitud del técnico (${solicitudTecnicoPrevia})` : " la solicitud"} de la demanda${demanda}. ¿Confirmás?`,
          boton: "Autorizar",
          color: "primary",
        })
        break
      case "no autorizar":
        setConfirmacion({
          accion,
          titulo: "No autorizar la solicitud",
          texto: `Vas a NO AUTORIZAR${solicitudTecnicoPrevia ? ` la solicitud del técnico (${solicitudTecnicoPrevia})` : " la solicitud"} de la demanda${demanda}. ¿Confirmás?`,
          boton: "No autorizar",
          color: "error",
        })
        break
    }
  }

  // Selector de firmantes (se usa en el paso 1 y en la vista del Director)
  const firmantesSelector = (
    <Autocomplete
      multiple
      id="firmantes-autocomplete"
      options={firmantesDisponibles}
      value={firmantes}
      onChange={(event, newValue) => {
        setFirmantes(newValue)
      }}
      getOptionLabel={(option) => `${option.nombre} (${option.cargo})`}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      renderInput={(params) => <TextField {...params} label="Firmantes" placeholder="Buscar firmantes..." size="small" />}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            {...getTagProps({ index })}
            key={option.id}
            label={option.nombre}
            size="small"
            icon={<PersonIcon fontSize="small" />}
          />
        ))
      }
      sx={{ minWidth: 300 }}
      size="small"
      limitTags={2}
      filterOptions={(options, state) => {
        const inputValue = state.inputValue.toLowerCase()
        return options.filter(
          (option) =>
            option.nombre.toLowerCase().includes(inputValue) || option.cargo.toLowerCase().includes(inputValue),
        )
      }}
    />
  )

  const nnyaSelect = (
    <FormControl sx={{ minWidth: 250 }}>
      <InputLabel id="select-multiple-children-label">Seleccionar NNyA</InputLabel>
      <Select
        labelId="select-multiple-children-label"
        id="select-multiple-children"
        multiple
        value={selectedChildrenIds}
        onChange={handleChildChange}
        input={<OutlinedInput id="select-multiple-chip" label="Seleccionar NNyA" />}
        renderValue={(selected) => (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {selected.map((value) => {
              const child = children.find((c) => c.id === value)
              return (
                <Chip
                  key={value}
                  label={child ? child.name : value}
                  size="small"
                  deleteIcon={<CancelIcon onMouseDown={(event) => event.stopPropagation()} />}
                  onDelete={() => {
                    setSelectedChildrenIds(selectedChildrenIds.filter((id) => id !== value))
                  }}
                />
              )
            })}
          </Box>
        )}
        size="small"
        MenuProps={{ PaperProps: { style: { maxHeight: 224, width: 250 } } }}
      >
        {children.length > 0 ? (
          children.map((child) => (
            <MenuItem key={child.id} value={child.id}>
              {child.name} ({child.type})
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled value="">
            No hay NNyA registrados
          </MenuItem>
        )}
      </Select>
    </FormControl>
  )

  const tipoMedidaSelect = (
    <FormControl sx={{ minWidth: 250 }}>
      <InputLabel id="select-tipo-medida-label">Tipo de Medida *</InputLabel>
      <Select
        labelId="select-tipo-medida-label"
        id="select-tipo-medida"
        value={tipoMedidaEvaluado}
        onChange={(e) => setTipoMedidaEvaluado(e.target.value)}
        input={<OutlinedInput label="Tipo de Medida *" />}
        size="small"
      >
        <MenuItem value="MPI">Medida de Protección Integral (MPI)</MenuItem>
        <MenuItem value="MPE">Medida de Protección Excepcional (MPE)</MenuItem>
        {/* MPJ ya no se solicita desde acá (entra por el circuito de oficios),
            pero si una evaluación vieja lo tiene guardado hay que poder
            mostrarlo en vez de dejar el selector en un valor fuera de rango. */}
        {tipoMedidaEvaluado === "MPJ" && (
          <MenuItem value="MPJ" disabled>
            Medida Penal Juvenil (MPJ)
          </MenuItem>
        )}
      </Select>
    </FormControl>
  )

  // Panel del Técnico: los tres pasos en el orden en que se hacen.
  const panelTecnico = (
    <Paper variant="outlined" sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: "bold", color: "#0EA5E9" }}>
        CIERRE DE LA EVALUACIÓN
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <PasoTitulo n={1} titulo="Generar el borrador del informe (opcional)" listo={borradorGenerado} etiquetaListo="Descargado" />
        <Typography variant="body2" color="text.secondary">
          Incluye lo cargado en la constatación y lo que escribiste en esta pantalla. Es un borrador: descargalo,
          revisalo, firmalo y subí la versión firmada en el paso 2. Si ya tenés el informe redactado por fuera del
          sistema, saltealo y subilo directamente.
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
          {firmantesSelector}
          <DownloadPDFButton data={combinedData} label="Generar borrador (PDF)" onGenerate={handleBorradorGenerado} />
          <DownloadDocxButton data={combinedData} label="Generar borrador (Word)" onGenerate={handleBorradorGenerado} />
        </Box>
      </Box>

      <Divider />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <PasoTitulo n={2} titulo="Subir el informe firmado (obligatorio)" listo={!faltaInforme} />
        <Typography variant="body2" color="text.secondary">
          {faltaInforme
            ? "Todavía no hay ningún archivo cargado. Arrastralo o seleccionalo acá abajo."
            : `Archivos cargados: ${nombresInformes.join(", ")}.`}
        </Typography>
        {archivosSlot}
      </Box>

      <Divider />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <PasoTitulo n={3} titulo="Pedir la autorización al Director" listo={Boolean(solicitudTecnicoPrevia)} etiquetaListo="Solicitada" />
        {solicitudTecnicoResumen}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          <Paper variant="outlined" sx={{ p: 2, flex: "1 1 420px", display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Adoptar una medida
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {nnyaSelect}
              {tipoMedidaSelect}
            </Box>
            <Box>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => pedirConfirmacion("autorizar tomar medida")}
                disabled={faltantesMedida.length > 0 || isSubmitting}
              >
                Solicitud de autorización de adopción de medida
              </Button>
            </Box>
            {faltantesMedida.length > 0 && (
              <Typography variant="caption" color="warning.dark">
                Falta: {faltantesMedida.join(", ")}.
              </Typography>
            )}
          </Paper>
          <Paper variant="outlined" sx={{ p: 2, flex: "1 1 260px", display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Archivar la demanda
            </Typography>
            <Box>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => pedirConfirmacion("autorizar archivar")}
                disabled={faltantesArchivo.length > 0 || isSubmitting}
              >
                Solicitud de autorización de archivo
              </Button>
            </Box>
            {faltantesArchivo.length > 0 && (
              <Typography variant="caption" color="warning.dark">
                Falta: {faltantesArchivo.join(", ")}.
              </Typography>
            )}
          </Paper>
        </Box>
      </Box>
    </Paper>
  )

  // Panel del Director: ve lo que pidió el técnico y decide.
  // El Director también puede adjuntar archivos; si es solo Director (no admin) la zona de carga va acá.
  const panelDirector = (
    <Paper variant="outlined" sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: "bold", color: "primary.main" }}>
        DECISIÓN DEL DIRECTOR
      </Typography>
      {solicitudTecnicoResumen || (
        <Typography variant="body2" color="text.secondary">
          El técnico todavía no registró una solicitud.
        </Typography>
      )}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
        {firmantesSelector}
        <DownloadPDFButton data={combinedData} label="Generar PDF" onGenerate={handleBorradorGenerado} />
        <DownloadDocxButton data={combinedData} label="Generar Word" onGenerate={handleBorradorGenerado} />
      </Box>
      {!isAdmin && archivosSlot}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        <Button variant="contained" color="primary" onClick={() => pedirConfirmacion("autorizar")} disabled={isSubmitting}>
          Autorizar
        </Button>
        <Button variant="contained" color="error" onClick={() => pedirConfirmacion("no autorizar")} disabled={isSubmitting}>
          No autorizar
        </Button>
      </Box>
    </Paper>
  )

  return (
    <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 3 }}>
      {isAdmin ? (
        // Admin: ve ambos flujos, separados
        <>
          {panelTecnico}
          {panelDirector}
        </>
      ) : isDirector ? (
        panelDirector
      ) : (
        panelTecnico
      )}

      <Dialog open={confirmacion !== null} onClose={() => setConfirmacion(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{confirmacion?.titulo}</DialogTitle>
        <DialogContent>
          <Typography variant="body2">{confirmacion?.texto}</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmacion(null)} sx={{ textTransform: "none" }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color={confirmacion?.color || "primary"}
            onClick={() => {
              const accion = confirmacion?.accion
              setConfirmacion(null)
              if (accion) handleAuthorizationAction(accion)
            }}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            {confirmacion?.boton}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
