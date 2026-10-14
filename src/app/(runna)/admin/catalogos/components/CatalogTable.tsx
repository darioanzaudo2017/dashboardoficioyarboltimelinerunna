"use client"

import React, { useState, useMemo } from "react"
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Chip,
  Breadcrumbs,
} from "@mui/material"
import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
} from "@mui/x-data-grid"
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material"
import Link from "next/link"
import { useCatalogData, extractArray } from "@/hooks/useApiQuery"
import type { CatalogConfig } from "../types/catalogos.types"
import { CatalogFormModal } from "./CatalogFormModal"
import { CatalogDeleteDialog } from "./CatalogDeleteDialog"

interface CatalogTableProps {
  catalog: CatalogConfig
}

export const CatalogTable: React.FC<CatalogTableProps> = ({ catalog }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Record<string, any> | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<Record<string, any> | null>(null)

  const { data: rawData, isLoading, refetch, isFetching } = useCatalogData<any[]>(
    catalog.endpoint
  )

  const rows = useMemo(() => {
    const list = extractArray(rawData)
    // Garantizar que cada fila tenga un id válido para DataGrid
    return list.map((item: any, idx: number) => ({
      ...item,
      id: item.id ?? item.codigo ?? `row-${idx}`,
    }))
  }, [rawData])

  // Filtrado client-side
  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return rows

    const lowerTerm = searchTerm.toLowerCase().trim()
    return rows.filter((row: any) => {
      if (catalog.searchFields && catalog.searchFields.length > 0) {
        return catalog.searchFields.some((field) => {
          const val = row[field]
          return val != null && String(val).toLowerCase().includes(lowerTerm)
        })
      }

      // Si no tiene searchFields específicos, buscar en todas las propiedades
      return Object.values(row).some((val) => {
        if (typeof val === "string" || typeof val === "number") {
          return String(val).toLowerCase().includes(lowerTerm)
        }
        return false
      })
    })
  }, [rows, searchTerm, catalog.searchFields])

  const handleCreate = () => {
    setSelectedItem(null)
    setIsFormOpen(true)
  }

  const handleEdit = (row: Record<string, any>) => {
    setSelectedItem(row)
    setIsFormOpen(true)
  }

  const handleDeletePrompt = (row: Record<string, any>) => {
    setItemToDelete(row)
    setIsDeleteOpen(true)
  }

  // Configuración de columnas con renderers personalizados para booleanos y acciones
  const gridColumns = useMemo<GridColDef[]>(() => {
    const baseCols: GridColDef[] = catalog.columns.map((col) => {
      if (col.type === "boolean" || col.field === "activo" || col.field === "requiere_evidencia") {
        return {
          ...col,
          renderCell: (params: GridRenderCellParams) => {
            const val = Boolean(params.value)
            return (
              <Chip
                size="small"
                icon={val ? <CheckCircleIcon fontSize="small" /> : <CancelIcon fontSize="small" />}
                label={val ? "Activo" : "Inactivo"}
                color={val ? "success" : "default"}
                variant={val ? "filled" : "outlined"}
                sx={{
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  height: "24px",
                }}
              />
            )
          },
        }
      }
      return col
    })

    if (catalog.editable) {
      baseCols.push({
        field: "__actions__",
        headerName: "Acciones",
        width: 110,
        sortable: false,
        filterable: false,
        align: "center",
        headerAlign: "center",
        renderCell: (params: GridRenderCellParams) => (
          <Box className="flex items-center justify-center gap-1 h-full">
            <Tooltip title="Editar">
              <IconButton
                size="small"
                color="primary"
                onClick={() => handleEdit(params.row)}
                sx={{
                  bgcolor: "rgba(0, 69, 127, 0.08)",
                  "&:hover": { bgcolor: "rgba(0, 69, 127, 0.18)" },
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={catalog.softDeleteField ? "Desactivar" : "Eliminar"}>
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDeletePrompt(params.row)}
                sx={{
                  bgcolor: "rgba(211, 47, 47, 0.08)",
                  "&:hover": { bgcolor: "rgba(211, 47, 47, 0.18)" },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      })
    }

    return baseCols
  }, [catalog])

  return (
    <Box className="flex flex-col gap-4">
      {/* Header y Navegación de Migas de Pan */}
      <Box className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <Breadcrumbs aria-label="breadcrumb" className="text-sm text-gray-500 mb-1">
            <Link href="/admin/catalogos" className="hover:underline text-gray-600 font-medium">
              Catálogos
            </Link>
            <Typography color="text.primary" className="font-semibold text-sm">
              {catalog.label}
            </Typography>
          </Breadcrumbs>
          <div className="flex items-center gap-2">
            <Typography variant="h5" className="font-bold text-gray-900">
              {catalog.label}
            </Typography>
            <Chip
              size="small"
              label={catalog.editable ? "CRUD Habilitado" : "Solo Lectura"}
              color={catalog.editable ? "primary" : "default"}
              sx={{
                fontWeight: 600,
                fontSize: "0.72rem",
                bgcolor: catalog.editable ? "#00457F" : "#E2E8F0",
                color: catalog.editable ? "white" : "#475569",
              }}
            />
          </div>
          {catalog.description && (
            <Typography variant="body2" className="text-gray-500 mt-0.5">
              {catalog.description}
            </Typography>
          )}
        </div>

        {/* Botones de acción principales */}
        <Box className="flex items-center gap-2 flex-wrap">
          <Link href="/admin/catalogos" className="no-underline">
            <Button
              variant="outlined"
              size="small"
              startIcon={<ArrowBackIcon />}
              sx={{ textTransform: "none", borderRadius: 2 }}
            >
              Volver
            </Button>
          </Link>
          <Tooltip title="Actualizar datos">
            <IconButton
              onClick={() => refetch()}
              disabled={isFetching}
              size="small"
              sx={{
                bgcolor: "white",
                border: "1px solid #E2E8F0",
                "&:hover": { bgcolor: "#F8FAFC" },
              }}
            >
              <RefreshIcon fontSize="small" className={isFetching ? "animate-spin" : ""} />
            </IconButton>
          </Tooltip>
          {catalog.editable && (
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleCreate}
              sx={{
                bgcolor: "#00457F",
                "&:hover": { bgcolor: "#003866" },
                textTransform: "none",
                borderRadius: 2,
                fontWeight: 600,
                px: 2,
              }}
            >
              Nuevo {catalog.singularLabel || "Registro"}
            </Button>
          )}
        </Box>
      </Box>

      {/* Barra de Búsqueda y Estadísticas */}
      <Paper elevation={0} className="p-3 rounded-xl border border-gray-200 bg-white flex items-center justify-between gap-4">
        <TextField
          size="small"
          placeholder={`Buscar en ${catalog.label.toLowerCase()}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" className="text-gray-400" />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 360, width: "100%" }}
        />
        <Typography variant="caption" className="text-gray-500 font-medium whitespace-nowrap">
          Mostrando {filteredRows.length} de {rows.length} registros
        </Typography>
      </Paper>

      {/* DataGrid */}
      <Paper
        elevation={0}
        className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm"
        sx={{ height: 600, width: "100%" }}
      >
        <DataGrid
          rows={filteredRows}
          columns={gridColumns}
          loading={isLoading}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25, page: 0 } },
          }}
          disableRowSelectionOnClick
          sx={{
            border: "none",
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#F8FAFC",
              borderBottom: "1px solid #E2E8F0",
              fontWeight: 700,
              color: "#1E293B",
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "#F1F5F9",
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid #F1F5F9",
              display: "flex",
              alignItems: "center",
            },
          }}
        />
      </Paper>

      {/* Modales de Alta/Edición y Confirmación de Borrado */}
      {catalog.editable && (
        <>
          <CatalogFormModal
            open={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            catalog={catalog}
            initialData={selectedItem}
            onSuccess={() => refetch()}
          />
          <CatalogDeleteDialog
            open={isDeleteOpen}
            onClose={() => setIsDeleteOpen(false)}
            catalog={catalog}
            itemToDelete={itemToDelete}
            onSuccess={() => refetch()}
          />
        </>
      )}
    </Box>
  )
}
