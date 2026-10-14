"use client"

import React, { useState, useEffect, useMemo } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
  Typography,
  CircularProgress,
  IconButton,
  FormHelperText,
} from "@mui/material"
import { Close as CloseIcon, Save as SaveIcon } from "@mui/icons-material"
import { toast } from "react-toastify"
import { useQueryClient } from "@tanstack/react-query"
import { create, update, patch } from "@/app/api/apiService"
import { handleApiError } from "@/app/api/utils/errorHandler"
import { useCatalogData, extractArray } from "@/hooks/useApiQuery"
import type { CatalogConfig, FormFieldConfig } from "../types/catalogos.types"

interface CatalogFormModalProps {
  open: boolean
  onClose: () => void
  catalog: CatalogConfig
  initialData?: Record<string, any> | null
  onSuccess?: () => void
}

/** Componente auxiliar para selects que cargan opciones desde otro catálogo */
const CatalogSelectField: React.FC<{
  field: FormFieldConfig
  value: any
  onChange: (val: any) => void
  error?: boolean
}> = ({ field, value, onChange, error }) => {
  const endpoint = field.catalogEndpoint || ""
  const { data: rawData, isLoading } = useCatalogData<any[]>(endpoint, {
    enabled: !!endpoint,
  })

  const options = useMemo(() => {
    const list = extractArray(rawData)
    const labelKey = field.catalogLabelKey || "nombre"
    const valueKey = field.catalogValueKey || "id"
    return list.map((item: any) => ({
      value: item[valueKey],
      label: item[labelKey] || `Item #${item[valueKey]}`,
    }))
  }, [rawData, field])

  return (
    <FormControl fullWidth size="small" error={error}>
      <InputLabel id={`label-${field.name}`}>{field.label}</InputLabel>
      <Select
        labelId={`label-${field.name}`}
        id={`select-${field.name}`}
        value={value ?? ""}
        label={field.label}
        onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
        disabled={isLoading}
      >
        <MenuItem value="">
          <em>-- Seleccionar --</em>
        </MenuItem>
        {isLoading ? (
          <MenuItem disabled>
            <Box className="flex items-center gap-2 py-1">
              <CircularProgress size={16} />
              <Typography variant="body2">Cargando opciones...</Typography>
            </Box>
          </MenuItem>
        ) : (
          options.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))
        )}
      </Select>
      {field.helperText && <FormHelperText>{field.helperText}</FormHelperText>}
    </FormControl>
  )
}

export const CatalogFormModal: React.FC<CatalogFormModalProps> = ({
  open,
  onClose,
  catalog,
  initialData,
  onSuccess,
}) => {
  const queryClient = useQueryClient()
  const isEditing = Boolean(initialData && initialData.id != null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Inicializar estado del formulario cuando se abre el modal
  useEffect(() => {
    if (!open) {
      setFormData({})
      setErrors({})
      return
    }

    const initial: Record<string, any> = {}
    catalog.formFields?.forEach((f) => {
      if (initialData && initialData[f.name] !== undefined) {
        initial[f.name] = initialData[f.name]
      } else if (f.defaultValue !== undefined) {
        initial[f.name] = f.defaultValue
      } else if (f.type === "boolean") {
        initial[f.name] = false
      } else {
        initial[f.name] = ""
      }
    })
    setFormData(initial)
    setErrors({})
  }, [open, catalog, initialData])

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    catalog.formFields?.forEach((field) => {
      // Si el campo depende de otro y no se cumple la condición, no validar
      if (field.dependsOn && formData[field.dependsOn] !== field.dependsValue) {
        return
      }

      if (field.required) {
        const val = formData[field.name]
        if (val === undefined || val === null || val === "" || (typeof val === "string" && val.trim() === "")) {
          newErrors[field.name] = `${field.label} es obligatorio`
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      toast.warn("Por favor complete los campos obligatorios")
      return
    }

    setIsSubmitting(true)
    try {
      // Construir payload limpio según formFields
      const payload: Record<string, any> = {}
      catalog.formFields?.forEach((field) => {
        // Si no cumple condición de dependencia, omitir o enviar null
        if (field.dependsOn && formData[field.dependsOn] !== field.dependsValue) {
          payload[field.name] = null
          return
        }

        const val = formData[field.name]
        if (field.type === "number") {
          payload[field.name] = val === "" || val === null || isNaN(Number(val)) ? null : Number(val)
        } else if (field.type === "boolean") {
          payload[field.name] = Boolean(val)
        } else if (val === "") {
          payload[field.name] = null
        } else {
          payload[field.name] = val
        }
      })

      if (isEditing && initialData?.id) {
        await update(catalog.endpoint, initialData.id, payload)
        toast.success(`${catalog.singularLabel || "Registro"} actualizado correctamente`)
      } else {
        await create(catalog.endpoint, payload)
        toast.success(`${catalog.singularLabel || "Registro"} creado correctamente`)
      }

      // Invalidar queries del catálogo para actualizar todos los componentes de la app
      queryClient.invalidateQueries({ queryKey: [catalog.endpoint] })
      if (catalog.parentKey) {
        queryClient.invalidateQueries({ queryKey: [catalog.parentKey] })
      }

      onSuccess?.()
      onClose()
    } catch (error: any) {
      handleApiError(error, catalog.endpoint)
      const detail = error?.response?.data?.detail || error?.response?.data?.message || "No se pudo guardar el registro"
      toast.error(typeof detail === "string" ? detail : JSON.stringify(detail))
    } finally {
      setIsSubmitting(false)
    }
  }

  const title = isEditing
    ? `Editar ${catalog.singularLabel || catalog.label}`
    : `Nuevo ${catalog.singularLabel || catalog.label}`

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, overflow: "hidden" },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle
          sx={{
            bgcolor: "#00457F",
            color: "white",
            py: 2,
            px: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6" component="div" className="font-semibold text-white">
            {title}
          </Typography>
          <IconButton
            onClick={onClose}
            disabled={isSubmitting}
            size="small"
            sx={{ color: "white", "&:hover": { bgcolor: "rgba(255,255,255,0.15)" } }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, mt: 1 }}>
          <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {catalog.formFields?.map((field) => {
              // Condición dependsOn
              if (field.dependsOn && formData[field.dependsOn] !== field.dependsValue) {
                return null
              }

              const isFull = field.fullWidth || field.type === "textarea"
              const gridClass = isFull ? "col-span-1 md:col-span-2" : "col-span-1"

              if (field.type === "catalog-select") {
                return (
                  <div key={field.name} className={gridClass}>
                    <CatalogSelectField
                      field={field}
                      value={formData[field.name]}
                      onChange={(val) => handleFieldChange(field.name, val)}
                      error={Boolean(errors[field.name])}
                    />
                  </div>
                )
              }

              if (field.type === "select") {
                return (
                  <div key={field.name} className={gridClass}>
                    <FormControl fullWidth size="small" error={Boolean(errors[field.name])}>
                      <InputLabel id={`label-${field.name}`}>{field.label}</InputLabel>
                      <Select
                        labelId={`label-${field.name}`}
                        id={`select-${field.name}`}
                        value={formData[field.name] ?? ""}
                        label={field.label}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      >
                        {!field.required && (
                          <MenuItem value="">
                            <em>-- Ninguno --</em>
                          </MenuItem>
                        )}
                        {field.options?.map((opt) => (
                          <MenuItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors[field.name] && <FormHelperText>{errors[field.name]}</FormHelperText>}
                    </FormControl>
                  </div>
                )
              }

              if (field.type === "boolean") {
                return (
                  <div key={field.name} className={`${gridClass} flex items-center`}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={Boolean(formData[field.name])}
                          onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                          color="primary"
                        />
                      }
                      label={field.label}
                    />
                  </div>
                )
              }

              return (
                <div key={field.name} className={gridClass}>
                  <TextField
                    fullWidth
                    size="small"
                    label={field.label}
                    type={field.type === "number" ? "number" : "text"}
                    multiline={field.type === "textarea"}
                    rows={field.type === "textarea" ? 3 : 1}
                    value={formData[field.name] ?? ""}
                    placeholder={field.placeholder}
                    required={field.required}
                    error={Boolean(errors[field.name])}
                    helperText={errors[field.name] || field.helperText}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  />
                </div>
              )
            })}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, bgcolor: "#F8FAFC", borderTop: "1px solid #E2E8F0" }}>
          <Button
            onClick={onClose}
            disabled={isSubmitting}
            variant="outlined"
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            variant="contained"
            startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <SaveIcon fontSize="small" />}
            sx={{
              bgcolor: "#00457F",
              "&:hover": { bgcolor: "#003866" },
              textTransform: "none",
              borderRadius: 2,
              px: 3,
            }}
          >
            {isSubmitting ? "Guardando..." : isEditing ? "Actualizar" : "Crear"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
