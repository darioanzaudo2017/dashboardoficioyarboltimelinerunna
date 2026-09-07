"use client"

import { Box, Chip, Tooltip, Typography, alpha } from "@mui/material"
import type { GridColDef } from "@mui/x-data-grid"
import { PriorityHigh } from "@mui/icons-material"
import {
  ChipDemandaPI,
  ChipsOficios,
  AndarielMedidas,
  ContadoresPT,
} from "../../components/indicadores-chips"
import { useUserPermissions } from "../../hooks/useUserPermissions"
import { MedidasHoverChip } from "./MedidasHoverChip"
import { AlertasCell } from "./cells/AlertasCell"
import { PrioridadCell } from "./cells/PrioridadCell"
import { LegajoRowActions } from "./cells/LegajoRowActions"

export interface BuildLegajoColumnsOptions {
  isMobile: boolean
  permissions: ReturnType<typeof useUserPermissions>
  handlePrioridadChange: (legajoId: number, newValue: string) => void
  handleOpenModal: (legajoId: number) => void
  handleOpenAsignarModal: (legajoId: number) => void
}

export const buildLegajoColumns = ({
  isMobile,
  permissions,
  handlePrioridadChange,
  handleOpenModal,
  handleOpenAsignarModal,
}: BuildLegajoColumnsOptions): GridColDef[] => {
  const baseColumns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID",
      width: 80,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: "#334155", fontSize: "0.8125rem" }}>
            {params.value}
          </Typography>
          {params.row.prioridad === "ALTA" && (
            <Tooltip title="Alta Prioridad" arrow>
              <PriorityHigh sx={{ fontSize: 16, color: "#dc2626" }} />
            </Tooltip>
          )}
        </Box>
      )
    },
    {
      field: "indicadores_alertas",
      headerName: "Alertas",
      width: 90,
      align: "center",
      headerAlign: "center",
      sortable: true,
      renderCell: (params) => <AlertasCell params={params} permissions={permissions} />,
    },
    {
      field: "numero_legajo",
      headerName: "Nº Legajo",
      width: 110,
      align: "left",
      headerAlign: "left",
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 500, color: "#1e40af", fontSize: "0.8125rem" }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: "apellido",
      headerName: "Apellido",
      width: 140,
      align: "left",
      headerAlign: "left",
      renderCell: (params) => (
        <Tooltip title={`DNI: ${params.row.dni}`} arrow placement="top">
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              color: "#1e293b",
              fontSize: "0.8125rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {params.value}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: "nombre",
      headerName: "Nombre",
      width: 140,
      align: "left",
      headerAlign: "left",
      renderCell: (params) => (
        <Tooltip title={`DNI: ${params.row.dni}`} arrow placement="top">
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              color: "#1e293b",
              fontSize: "0.8125rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {params.value}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: "prioridad",
      headerName: "Prioridad",
      width: 130,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => <PrioridadCell params={params} handlePrioridadChange={handlePrioridadChange} />,
    },
    {
      field: "edad",
      headerName: "Edad",
      width: 70,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: "#475569", fontSize: "0.8125rem" }}>
          {params.value == null ? "-" : `${params.value} años`}
        </Typography>
      ),
    },
    {
      field: "ultimaActualizacion",
      headerName: "Actualización",
      width: 140,
      align: "left",
      headerAlign: "left",
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.75rem" }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: "medidas_activas_count",
      headerName: "Cant. Medidas",
      width: 110,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <MedidasHoverChip
          count={params.value || 0}
          medidas={params.row.medidas_activas || []}
          legajoId={params.row.id}
        />
      ),
    },
    {
      field: "tipo_medida_actual",
      headerName: "Tipo medida",
      width: 105,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Chip
          label={params.value || "Sin medida"}
          size="small"
          variant="outlined"
          color={params.value ? "primary" : "default"}
        />
      ),
    },
    {
      field: "estado_medida_actual",
      headerName: "Estado medida",
      width: 125,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: "#475569", fontSize: "0.75rem", fontWeight: 600 }}>
          {params.value ? String(params.value).replaceAll("_", " ") : "-"}
        </Typography>
      ),
    },
    {
      field: "actividades_activas_count",
      headerName: "Actividades",
      width: 95,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        const count = params.value || 0
        return (
          <Chip
            label={count}
            size="small"
            sx={{
              minWidth: 32,
              height: 24,
              fontSize: "0.75rem",
              fontWeight: 600,
              bgcolor: count > 0 ? alpha("#8b5cf6", 0.1) : "#f1f5f9",
              color: count > 0 ? "#7c3aed" : "#94a3b8",
              border: count > 0 ? "1px solid #c4b5fd" : "1px solid #e2e8f0",
            }}
          />
        )
      },
    },
    {
      field: "oficios_count",
      headerName: "Oficios",
      width: 80,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        const count = params.value || 0
        return (
          <Chip
            label={count}
            size="small"
            sx={{
              minWidth: 32,
              height: 24,
              fontSize: "0.75rem",
              fontWeight: 600,
              bgcolor: count > 0 ? alpha("#0ea5e9", 0.1) : "#f1f5f9",
              color: count > 0 ? "#0284c7" : "#94a3b8",
              border: count > 0 ? "1px solid #7dd3fc" : "1px solid #e2e8f0",
            }}
          />
        )
      },
    },
    {
      field: "indicadores_pi",
      headerName: "PI",
      width: 70,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: (params) => <ChipDemandaPI count={params.row.indicadores?.demanda_pi_count || 0} />,
    },
    {
      field: "indicadores_oficios_semaforo",
      headerName: "Oficios",
      width: 130,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: (params) => <ChipsOficios oficios={params.row.oficios || []} />,
    },
    {
      field: "indicadores_medidas",
      headerName: "Medidas",
      width: 150,
      align: "left",
      headerAlign: "left",
      sortable: false,
      renderCell: (params) => (
        <AndarielMedidas
          estado={params.row.indicadores?.medida_andarivel || null}
          medidasActivas={params.row.medidas_activas || []}
        />
      ),
    },
    {
      field: "indicadores_pt",
      headerName: "Plan Trabajo",
      width: 170,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: (params) => (
        <ContadoresPT
          actividades={params.row.indicadores?.pt_actividades || { pendientes: 0, en_progreso: 0, vencidas: 0, realizadas: 0 }}
        />
      ),
    },

    {
      field: "actions",
      headerName: "Acciones",
      width: 150,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <LegajoRowActions
          params={params}
          permissions={permissions}
          handleOpenModal={handleOpenModal}
          handleOpenAsignarModal={handleOpenAsignarModal}
        />
      ),
    },
  ]

  if (!isMobile) {
    const additionalColumns: GridColDef[] = [
      {
        field: "zona",
        headerName: "Zona",
        width: 120,
        align: "left",
        headerAlign: "left",
        renderCell: (params) => (
          <Typography variant="body2" sx={{ fontSize: "0.8125rem", color: "#475569" }}>
            {params.value || "-"}
          </Typography>
        ),
      },
      {
        field: "equipo_trabajo",
        headerName: "Equipo",
        width: 140,
        align: "left",
        headerAlign: "left",
        renderCell: (params) => (
          <Typography variant="body2" sx={{ fontSize: "0.8125rem", color: "#475569", overflow: "hidden", textOverflow: "ellipsis" }}>
            {params.value || "-"}
          </Typography>
        ),
      },
      {
        field: "profesional_asignado",
        headerName: "Profesional",
        width: 140,
        align: "left",
        headerAlign: "left",
        renderCell: (params) => (
          <Typography variant="body2" sx={{ fontSize: "0.8125rem", color: "#475569", overflow: "hidden", textOverflow: "ellipsis" }}>
            {params.value || "-"}
          </Typography>
        ),
      },
      {
        field: "fecha_apertura",
        headerName: "F. Apertura",
        width: 110,
        align: "left",
        headerAlign: "left",
        renderCell: (params) => (
          <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "#64748b" }}>
            {params.value ? new Date(params.value).toLocaleDateString("es-AR") : "-"}
          </Typography>
        ),
      },
    ]
    if (permissions.canViewJudicialData) {
      additionalColumns.push({
        field: "jefe_zonal",
        headerName: "Jefe Zonal",
        width: 140,
        align: "left",
        headerAlign: "left",
        renderCell: (params) => (
          <Typography variant="body2" sx={{ fontSize: "0.8125rem", color: "#475569", overflow: "hidden", textOverflow: "ellipsis" }}>
            {params.value || "-"}
          </Typography>
        ),
      })
    }
    baseColumns.push(...additionalColumns)
  }
  return baseColumns
}
