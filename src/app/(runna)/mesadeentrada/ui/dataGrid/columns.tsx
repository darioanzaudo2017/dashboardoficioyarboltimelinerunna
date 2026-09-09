"use client"

import { Box, Button, Chip, IconButton, Tooltip, Typography } from "@mui/material"
import type { GridColDef } from "@mui/x-data-grid"
import { TouchApp, Edit, Warning, Visibility, Assignment, Link as LinkIcon } from "@mui/icons-material"
import { AdjuntosCell } from "./AdjuntosCell"
import { StatusChip } from "./StatusChip"
import { DNI_VER_LEGAJO, formatCalificacionValue, formatUnderscoreText } from "./utils"

export interface BuildDemandaColumnsOptions {
  isMobile: boolean
  /** Ya resuelto por el llamador como `user?.id || 0`. */
  userId: number
  hasCalificarPermission: boolean
  hasAssignPermission: boolean | undefined
  hasEvaluatePermission: boolean | undefined
  onCalificacionChange: (demandaId: number, newValue: string) => void
  onOpenModal: (demandaId: number) => void
  onOpenAsignarModal: (demandaId: number) => void
  onRecibirDemanda: (args: { id: number; demandaId: number; userId: number }) => void
}

// Define responsive columns based on screen size.
// Final display order is normalized by DEFAULT_COLUMN_ORDER at the end of buildDemandaColumns.
export const buildDemandaColumns = ({
  isMobile,
  userId,
  hasCalificarPermission,
  hasAssignPermission,
  hasEvaluatePermission,
  onCalificacionChange,
  onOpenModal,
  onOpenAsignarModal,
  onRecibirDemanda,
}: BuildDemandaColumnsOptions): GridColDef[] => {
  const baseColumns: GridColDef[] = [
    // SCORE COLUMN - HIDDEN
    // {
    //   field: "score",
    //   headerName: "Nivel de Riesgo / Score",
    //   width: 80,
    //   renderCell: (params) => (
    //     <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
    //       <Chip
    //         label={params.value}
    //         size="small"
    //         variant="outlined"
    //         color={Number(params.value) > 70 ? "error" : Number(params.value) > 40 ? "warning" : "default"}
    //         sx={{ minWidth: 40, justifyContent: "center" }}
    //       />
    //     </div>
    //   ),
    // },
    {
      field: "id",
      headerName: "ID",
      width: 80,
      renderCell: (params) => (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
          <Typography variant="body2" color="text.secondary">{params.value}</Typography>
        </div>
      ),
    },
    {
      field: "apellido",
      headerName: "Apellido",
      width: 170,
      renderCell: (params) => (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", width: "100%", gap: "4px" }}>
          <Tooltip
            title={params.row.isFromLinkedLegajo
              ? `Legajo vinculado #${params.row.linkedLegajoNumero}`
              : `DNI: ${params.row.dni}`
            }
          >
            <Typography variant="body2" sx={{ fontWeight: params.row.recibido ? "normal" : "bold" }} noWrap>
              {params.value}
            </Typography>
          </Tooltip>
          {/* Legajo y vinculacion se muestran en la columna "Detalles". Aca queda solo
              la urgencia, que es una alerta y no un dato del legajo. */}
          {params.row.calificacion === "URGENTE" && (
            <Tooltip title="Urgente">
              <Warning color="error" fontSize="small" />
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      field: "nombre",
      headerName: "Nombre",
      width: 150,
      renderCell: (params) => (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", width: "100%" }}>
          <Tooltip
            title={params.row.isFromLinkedLegajo
              ? `Legajo vinculado #${params.row.linkedLegajoNumero}`
              : `DNI: ${params.row.dni}`
            }
          >
            <Typography variant="body2" sx={{ fontWeight: params.row.recibido ? "normal" : "bold" }} noWrap>
              {params.value}
            </Typography>
          </Tooltip>
        </div>
      ),
    },
    {
      field: "dni",
      headerName: "DNI",
      width: 110,
      renderCell: (params) => {
        // Sin DNI propio: el valor es el placeholder y el dato util es el nro de legajo.
        const sinDniPropio = params.value === DNI_VER_LEGAJO
        return (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
            <Tooltip
              title={sinDniPropio
                ? `Sin DNI propio · Legajo #${params.row.linkedLegajoNumero ?? params.row.legajoNumero}`
                : `DNI: ${params.value}`
              }
            >
              <Typography variant="body2" color="text.secondary" noWrap>
                {params.value}
              </Typography>
            </Tooltip>
          </div>
        )
      },
    },
    {
      field: "calificacion",
      headerName: "Calificación",
      width: 180,
      renderCell: (params) => (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            "& select": {
              width: "100%",
              padding: "8px",
              border: "1px solid #e0e0e0",
              borderRadius: "4px",
              backgroundColor: "#fff",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              cursor: "pointer",
              outline: "none",
              fontSize: "0.875rem",
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: "#bdbdbd",
                boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
              },
              "&:focus": {
                borderColor: "#2196f3",
                boxShadow: "0 0 0 2px rgba(33,150,243,0.2)",
              },
            },
          }}
        >
          {hasCalificarPermission ? (
            <select
              value={formatCalificacionValue(params.value)}
              onChange={(e) => {
                e.stopPropagation()
                onCalificacionChange(params.row.id, e.target.value)
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {params.value === null && <option value="">Seleccionar</option>}
              {params.row.calificacion_choices && Array.isArray(params.row.calificacion_choices) ? (
                params.row.calificacion_choices.map((choice: any) => (
                  <option key={choice[0]} value={choice[0]}>
                    {choice[1]}
                  </option>
                ))
              ) : (
                <option value="">No hay opciones disponibles</option>
              )}
            </select>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {formatCalificacionValue(params.value)}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: "ultimaActualizacion",
      headerName: "Actualización",
      width: 150,
      renderCell: (params) => (
        <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
          <Typography variant="body2" color="text.secondary">
            {params.value}
          </Typography>
        </div>
      ),
    },
    {
      field: "estado_demanda",
      headerName: "Estado",
      width: 160,
      renderCell: (params) => (
        <StatusChip
          status={params.value}
          onClick={(e) => {
            e.stopPropagation()
            if (params.value === "EVALUACION" || params.value === "PENDIENTE_AUTORIZACION") {
              window.location.href = `/evaluacion?id=${params.row.id}`
            }
          }}
        />
      ),
    },
    {
      field: "detalles",
      headerName: "Detalles",
      width: 140,
      // No mapea a un campo de la fila: agrupa hasLegajo, isFromLinkedLegajo y adjuntos.
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, width: "100%" }}>
          <Tooltip title={params.row.hasLegajo ? `Legajo: ${params.row.legajoNumero}` : "Sin legajo"}>
            <Assignment
              fontSize="small"
              sx={{ color: params.row.hasLegajo ? "success.main" : "action.disabled" }}
            />
          </Tooltip>
          <Tooltip
            title={params.row.isFromLinkedLegajo
              ? `Datos desde legajo #${params.row.linkedLegajoNumero}`
              : "Sin legajo vinculado"
            }
          >
            <LinkIcon
              fontSize="small"
              sx={{ color: params.row.isFromLinkedLegajo ? "info.main" : "action.disabled" }}
            />
          </Tooltip>
          <AdjuntosCell adjuntos={params.row.adjuntos} />
        </Box>
      ),
    },
  ]

  // Add more columns for larger screens
  if (!isMobile) {
    baseColumns.push(
      {
        field: "origen",
        headerName: "Remitente",
        width: 150,
        renderCell: (params) => (
          <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <Typography variant="body2">{params.value}</Typography>
          </div>
        ),
      },
      {
        field: "localidad",
        headerName: "Localidad",
        width: 130,
        renderCell: (params) => (
          <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <Typography variant="body2">{params.value}</Typography>
          </div>
        ),
      },
      {
        field: "zonaEquipo",
        headerName: "Zona/Equipo",
        width: 130,
        renderCell: (params) => (
          <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <Typography variant="body2">{params.value}</Typography>
          </div>
        ),
      },
      {
        field: "envioRespuesta",
        headerName: "Envío Respuesta",
        width: 150,
        renderCell: (params) => {
          const value = params.value as string
          let displayText = value
          let color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" = "default"

          switch (value) {
            case "NO_NECESARIO":
              displayText = "No Necesario"
              color = "default"
              break
            case "PENDIENTE":
              displayText = "Pendiente"
              color = "warning"
              break
            case "ENVIADO":
              displayText = "Enviado"
              color = "success"
              break
            default:
              displayText = "N/A"
              break
          }

          return (
            <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
              <Chip label={displayText} size="small" color={color} variant="outlined" />
            </div>
          )
        },
      },
      {
        field: "objetivoDemanda",
        headerName: "Objetivo",
        width: 150,
        renderCell: (params) => {
          return (
            <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
              <Typography variant="body2">{formatUnderscoreText(params.value)}</Typography>
            </div>
          )
        },
      },
    )
  }

  baseColumns.push({
    field: "actions",
    headerName: "Acciones",
    width: 160,
    sortable: false,
    filterable: false,
    hideable: false,
    renderCell: (params) => (
      <Box sx={{ display: "flex", gap: 1, justifyContent: "center", width: "100%" }}>
        <Tooltip title="Ver detalles">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              if (!params.row.recibido && params.row.demanda_zona_id) {
                onRecibirDemanda({
                  id: params.row.demanda_zona_id,
                  demandaId: params.row.id,
                  userId,
                })
              } else {
                onOpenModal(params.row.id)
              }
            }}
            sx={{ color: "primary.main" }}
          >
            <Visibility fontSize="small" />
          </IconButton>
        </Tooltip>

        {hasAssignPermission && (
          <Tooltip title="Asignar">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                onOpenAsignarModal(params.row.id)
              }}
              sx={{ color: "secondary.main" }}
            >
              <TouchApp fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

        {hasEvaluatePermission && (
          <Tooltip
            title={
              params.row.estado_demanda === "EVALUACION" || params.row.estado_demanda === "PENDIENTE_AUTORIZACION"
                ? "Comenzar Evaluación"
                : "No disponible para evaluación"
            }
          >
            <span>
              {params.row.estado_demanda === "EVALUACION" || params.row.estado_demanda === "PENDIENTE_AUTORIZACION" ? (
                <Button
                  variant="contained"
                  size="small"
                  color="success"
                  startIcon={<Edit fontSize="inherit" />}
                  onClick={(e) => {
                    e.stopPropagation()
                    window.location.href = `/evaluacion?id=${params.row.id}`
                  }}
                  sx={{
                    textTransform: "none",
                    fontWeight: "bold",
                    borderRadius: "16px",
                    px: 1.5,
                    fontSize: "0.75rem",
                    boxShadow: "0 2px 4px rgba(76, 175, 80, 0.3)",
                    "&:hover": {
                      backgroundColor: "#388e3c",
                      boxShadow: "0 4px 8px rgba(76, 175, 80, 0.4)",
                    }
                  }}
                >
                  Evaluar
                </Button>
              ) : (
                <IconButton
                  size="small"
                  disabled
                  sx={{ color: "action.disabled" }}
                >
                  <Edit fontSize="small" />
                </IconButton>
              )}
            </span>
          </Tooltip>
        )}
      </Box>
    ),
  })

  // Default column order: identification → estado → acciones → seguimiento → resto
  const DEFAULT_COLUMN_ORDER = [
    "id",
    "apellido",
    "nombre",
    "dni",
    "estado_demanda",
    "actions",
    "envioRespuesta",
    "calificacion",
    "ultimaActualizacion",
    "detalles",
    "origen",
    "localidad",
    "zonaEquipo",
    "objetivoDemanda",
  ]
  return baseColumns.sort((a, b) => {
    const indexA = DEFAULT_COLUMN_ORDER.indexOf(a.field)
    const indexB = DEFAULT_COLUMN_ORDER.indexOf(b.field)
    return (indexA === -1 ? DEFAULT_COLUMN_ORDER.length : indexA) - (indexB === -1 ? DEFAULT_COLUMN_ORDER.length : indexB)
  })
}
