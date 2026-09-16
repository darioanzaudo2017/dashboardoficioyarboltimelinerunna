"use client"

import React, { useState, useMemo } from "react"
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Button,
  Tabs,
  Tab,
} from "@mui/material"
import {
  Search as SearchIcon,
  Folder as FolderIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  ArrowForward as ArrowForwardIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material"
import Link from "next/link"
import { CATALOGOS_REGISTRY } from "../catalogos-registry"
import type { CatalogConfig } from "../types/catalogos.types"
import { useCatalogData, extractArray } from "@/hooks/useApiQuery"

/** Card individual que muestra datos y conteo de registros del catálogo */
const CatalogCardItem: React.FC<{ catalog: CatalogConfig }> = ({ catalog }) => {
  const { data: rawData, isLoading } = useCatalogData<any[]>(catalog.endpoint, {
    staleTime: 5 * 60 * 1000,
  })

  const count = useMemo(() => {
    if (isLoading || !rawData) return null
    return extractArray(rawData).length
  }, [rawData, isLoading])

  return (
    <Paper
      elevation={0}
      className="p-5 rounded-2xl border border-gray-200 bg-white transition-all duration-200 hover:shadow-md hover:border-blue-300 flex flex-col justify-between group"
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#00457F] flex items-center justify-center font-bold">
            {catalog.editable ? <EditIcon fontSize="small" /> : <FolderIcon fontSize="small" />}
          </div>
          <div className="flex items-center gap-1.5">
            {count !== null && (
              <Chip
                size="small"
                label={`${count} registros`}
                sx={{
                  bgcolor: "#F1F5F9",
                  color: "#475569",
                  fontWeight: 600,
                  fontSize: "0.72rem",
                  height: "22px",
                }}
              />
            )}
            <Chip
              size="small"
              label={catalog.editable ? "CRUD" : "Lectura"}
              sx={{
                bgcolor: catalog.editable ? "#E0F2FE" : "#F8FAFC",
                color: catalog.editable ? "#0369A1" : "#64748B",
                fontWeight: 700,
                fontSize: "0.72rem",
                border: catalog.editable ? "1px solid #BAE6FD" : "1px solid #E2E8F0",
                height: "22px",
              }}
            />
          </div>
        </div>

        <Typography variant="subtitle1" className="font-bold text-gray-900 leading-snug group-hover:text-[#00457F] transition-colors">
          {catalog.label}
        </Typography>

        {catalog.description && (
          <Typography variant="body2" className="text-gray-500 text-xs mt-1.5 line-clamp-2">
            {catalog.description}
          </Typography>
        )}

        <Typography variant="caption" className="font-mono text-[11px] text-gray-400 block mt-2">
          /api/{catalog.endpoint}
        </Typography>
      </div>

      <div className="pt-4 mt-2 border-t border-gray-100 flex justify-end">
        <Link href={`/admin/catalogos/${catalog.key}`} className="no-underline w-full">
          <Button
            fullWidth
            variant="outlined"
            size="small"
            endIcon={<ArrowForwardIcon fontSize="small" />}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              fontWeight: 600,
              fontSize: "0.8rem",
              borderColor: "#E2E8F0",
              color: "#00457F",
              "&:hover": {
                borderColor: "#00457F",
                bgcolor: "rgba(0, 69, 127, 0.04)",
              },
            }}
          >
            {catalog.editable ? "Gestionar Catálogo" : "Ver Registros"}
          </Button>
        </Link>
      </div>
    </Paper>
  )
}

export const CatalogIndex: React.FC = () => {
  const [filterTab, setFilterTab] = useState<"ALL" | "EDITABLE" | "READONLY">("ALL")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredCatalogs = useMemo(() => {
    return CATALOGOS_REGISTRY.filter((cat) => {
      // Filtro por Tab
      if (filterTab === "EDITABLE" && !cat.editable) return false
      if (filterTab === "READONLY" && cat.editable) return false

      // Filtro por búsqueda
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim()
        const matchLabel = cat.label.toLowerCase().includes(query)
        const matchDesc = cat.description?.toLowerCase().includes(query) || false
        const matchEndpoint = cat.endpoint.toLowerCase().includes(query)
        return matchLabel || matchDesc || matchEndpoint
      }

      return true
    })
  }, [filterTab, searchTerm])

  const editableCount = useMemo(
    () => CATALOGOS_REGISTRY.filter((c) => c.editable).length,
    []
  )
  const readonlyCount = useMemo(
    () => CATALOGOS_REGISTRY.filter((c) => !c.editable).length,
    []
  )

  return (
    <Box className="flex flex-col gap-6">
      {/* Header Principal */}
      <Box className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#00457F] text-white flex items-center justify-center">
              <SettingsIcon fontSize="small" />
            </div>
            <Typography variant="h5" className="font-bold text-gray-900">
              Administración de Catálogos
            </Typography>
          </div>
          <Typography variant="body2" className="text-gray-600">
            Gestión centralizada de tablas maestras, dropdowns y catálogos de referencia de RUNNA.
          </Typography>
        </div>
      </Box>

      {/* Controles de Búsqueda y Filtros por Tipo */}
      <Paper elevation={0} className="p-4 rounded-2xl border border-gray-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Tabs
          value={filterTab}
          onChange={(_, val) => setFilterTab(val)}
          sx={{
            minHeight: "40px",
            "& .MuiTab-root": {
              minHeight: "40px",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.85rem",
              borderRadius: "8px",
              px: 2,
              mr: 1,
            },
          }}
        >
          <Tab label={`Todos (${CATALOGOS_REGISTRY.length})`} value="ALL" />
          <Tab label={`Editables (${editableCount})`} value="EDITABLE" />
          <Tab label={`Solo Lectura (${readonlyCount})`} value="READONLY" />
        </Tabs>

        <TextField
          size="small"
          placeholder="Buscar catálogo por nombre o endpoint..."
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
      </Paper>

      {/* Grid de Catálogos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCatalogs.map((catalog) => (
          <CatalogCardItem key={catalog.key} catalog={catalog} />
        ))}
      </div>

      {filteredCatalogs.length === 0 && (
        <Paper elevation={0} className="p-12 text-center rounded-2xl border border-dashed border-gray-300 bg-gray-50">
          <Typography variant="subtitle1" className="font-semibold text-gray-700 mb-1">
            No se encontraron catálogos
          </Typography>
          <Typography variant="body2" className="text-gray-500">
            No hay catálogos que coincidan con la búsqueda &quot;{searchTerm}&quot;.
          </Typography>
        </Paper>
      )}
    </Box>
  )
}
