"use client"

import React, { useEffect } from "react"
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  IconButton,
  Chip,
  TextField,
  MenuItem,
  Alert,
  Divider,
  useTheme,
  alpha,
} from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import DeleteIcon from "@mui/icons-material/Delete"
import LinkIcon from "@mui/icons-material/Link"
import { useFormContext } from "react-hook-form"
import type { FormData, DropdownData, VinculoFormData } from "../types/formTypes"
import LegajoSearchAutocomplete, {
  type LegajoOption,
} from "@/app/(runna)/demanda/ui/components/LegajoSearchAutocomplete"
import { MIN_CARACTERES_JUSTIFICACION_VINCULO } from "@/app/(runna)/legajo-mesa/types/vinculo-types"
import { revealClasificacionOficio, vinculoFieldErrors } from "../utils/formValidationFeedback"

interface VinculosManagerProps {
  dropdownData: DropdownData
  readOnly?: boolean
  oficioMode?: boolean
  /** Oficio de MPE/MPI vigente: preselecciona el tipo de vínculo y avisa si falta lo que dispara las actividades. */
  guiaOficio?: boolean
}

const JUSTIFICACION_OFICIO_AUTOMATICA = "Vinculación registrada desde la carga de un oficio judicial."

export default function VinculosManager({
  dropdownData,
  readOnly = false,
  oficioMode = false,
  guiaOficio = false,
}: VinculosManagerProps) {
  const theme = useTheme()
  const {
    watch,
    setValue,
    formState: { submitCount },
  } = useFormContext<FormData>()
  const tipoVinculoOptions = Array.isArray(dropdownData.tipos_vinculo) ? dropdownData.tipos_vinculo : []
  const tipoVinculoOficio = tipoVinculoOptions.find((tipo) => tipo.codigo === "OFICIO_JUDICIAL")

  const vinculos = watch("vinculos") || []
  const tipoOficioElegido = watch("tipo_oficio")
  // Los errores aparecen recién al intentar guardar y se van solos a medida que se completa cada campo.
  const mostrarErrores = submitCount > 0

  useEffect(() => {
    if (!oficioMode || !tipoVinculoOficio) return
    const incompletos = vinculos.some((vinculo) => !vinculo.tipo_vinculo || !vinculo.justificacion.trim())
    if (!incompletos) return
    setValue(
      "vinculos",
      vinculos.map((vinculo) => ({
        ...vinculo,
        tipo_vinculo: vinculo.tipo_vinculo || tipoVinculoOficio.id,
        justificacion: vinculo.justificacion.trim()
          ? vinculo.justificacion
          : JUSTIFICACION_OFICIO_AUTOMATICA,
      })),
    )
  }, [oficioMode, setValue, tipoVinculoOficio, vinculos])

  const handleAddVinculo = () => {
    const newVinculo: VinculoFormData = {
      legajo: null,
      medida: null,
      tipo_vinculo: oficioMode || guiaOficio ? (tipoVinculoOficio?.id || null) : null,
      justificacion: oficioMode || guiaOficio ? JUSTIFICACION_OFICIO_AUTOMATICA : "",
    }

    setValue("vinculos", [...vinculos, newVinculo])
  }

  const handleRemoveVinculo = (index: number) => {
    const newVinculos = vinculos.filter((_, i) => i !== index)
    setValue("vinculos", newVinculos)
  }

  const handleUpdateVinculo = (index: number, field: keyof VinculoFormData, value: any) => {
    const newVinculos = [...vinculos]
    newVinculos[index] = {
      ...newVinculos[index],
      [field]: value,
    }
    setValue("vinculos", newVinculos)
  }

  const handleLegajoSelect = (index: number, legajoOption: LegajoOption | null) => {
    const newVinculos = [...vinculos]

    if (legajoOption) {
      newVinculos[index] = {
        ...newVinculos[index],
        legajo: legajoOption.id,
        medida: null, // Reset medida when legajo changes
        legajo_info: {
          id: legajoOption.id,
          numero: legajoOption.numero,
          nnya_nombre: legajoOption.displayText, // Use displayText as name
          medidas_activas: legajoOption.medidas_activas || [],
        },
      }
    } else {
      newVinculos[index] = {
        ...newVinculos[index],
        legajo: null,
        medida: null,
        legajo_info: undefined,
      }
    }

    setValue("vinculos", newVinculos)
  }

  if (readOnly && vinculos.length === 0) {
    return null
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <LinkIcon color="primary" />
          Vínculos con Legajos y Medidas
        </Typography>

        {!readOnly && (
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddVinculo}
            size="small"
          >
            Agregar Vínculo
          </Button>
        )}
      </Box>

      {vinculos.length === 0 && !readOnly && guiaOficio && tipoOficioElegido && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Ya elegiste el Tipo de Oficio. Para que se agreguen las actividades, agregá el vínculo con el legajo y la
            medida vigente.
          </Typography>
        </Alert>
      )}

      {vinculos.length === 0 && !readOnly && !(guiaOficio && tipoOficioElegido) && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Puede agregar vínculos durante el registro de la demanda. Los vínculos permiten relacionar
            esta demanda con legajos y medidas existentes.
          </Typography>
        </Alert>
      )}

      {vinculos.length > 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {vinculos.map((vinculo, index) => {
            const errors = mostrarErrores ? vinculoFieldErrors(vinculo, oficioMode) : {}

            return (
              <Card
                key={index}
                variant="outlined"
                sx={{
                  border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: theme.palette.primary.main,
                    boxShadow: theme.shadows[2],
                  },
                }}
              >
                <CardContent>
                  {/* Header */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Vínculo #{index + 1}
                    </Typography>

                    {!readOnly && (
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveVinculo(index)}
                        sx={{
                          color: theme.palette.error.main,
                          "&:hover": {
                            bgcolor: alpha(theme.palette.error.main, 0.1),
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  {/* Fields */}
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {/* Legajo Search */}
                    <LegajoSearchAutocomplete
                      value={vinculo.legajo_info ? ({
                        id: vinculo.legajo_info.id,
                        numero: vinculo.legajo_info.numero,
                        displayText: vinculo.legajo_info.nnya_nombre,
                        subtitle: `Legajo ${vinculo.legajo_info.numero}`,
                        medidas_activas: vinculo.legajo_info.medidas_activas,
                      } as LegajoOption) : null}
                      onChange={(value) => handleLegajoSelect(index, value)}
                      label="Legajo *"
                      placeholder="Buscar legajo por número o nombre del NNyA..."
                      error={Boolean(errors.legajo)}
                      helperText={errors.legajo}
                      disabled={readOnly}
                    />

                    {/* Medida Selector */}
                    {vinculo.legajo && vinculo.legajo_info && (
                      <TextField
                        select
                        fullWidth
                        label={oficioMode ? "Medida inicial/provisoria asociada" : "Medida (Opcional)"}
                        value={vinculo.medida || ""}
                        onChange={(e) =>
                          handleUpdateVinculo(index, "medida", e.target.value ? Number(e.target.value) : null)
                        }
                        helperText={
                          (vinculo.legajo_info.medidas_activas.length === 0
                            ? "Este legajo no tiene medidas activas"
                            : oficioMode
                              ? "Seleccione la medida o el SAC asociado; si es una apertura MPJ, el sistema puede crearla."
                              : "Seleccione una medida específica (opcional)")
                        }
                        disabled={
                          readOnly ||
                          !vinculo.legajo_info.medidas_activas ||
                          vinculo.legajo_info.medidas_activas.length === 0
                        }
                      >
                        <MenuItem value="">
                          <em>Sin medida específica</em>
                        </MenuItem>
                        {vinculo.legajo_info.medidas_activas.map((medida) => (
                          <MenuItem key={medida.id} value={medida.id}>
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                {medida.numero_medida} - {medida.tipo_medida}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Estado: {medida.estado_vigencia}{medida.nro_sac ? ` · SAC ${medida.nro_sac}` : ""}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </TextField>
                    )}

                    {/* El tipo técnico OFICIO_JUDICIAL se completa automáticamente en la carga de oficios. */}
                    {!oficioMode && <TextField
                      select
                      fullWidth
                      required
                      label="Tipo de Vínculo *"
                      value={vinculo.tipo_vinculo || ""}
                      onChange={(e) =>
                        handleUpdateVinculo(index, "tipo_vinculo", e.target.value ? Number(e.target.value) : null)
                      }
                      error={Boolean(errors.tipo_vinculo)}
                      helperText={
                        errors.tipo_vinculo ||
                        (guiaOficio && vinculo.tipo_vinculo && vinculo.tipo_vinculo === tipoVinculoOficio?.id
                          ? "Para un oficio judicial se elige solo; no hace falta cambiarlo."
                          : undefined)
                      }
                      disabled={readOnly || tipoVinculoOptions.length === 0}
                    >
                      {tipoVinculoOptions.map((tipo) => (
                        <MenuItem key={tipo.id} value={tipo.id}>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {tipo.nombre}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {tipo.descripcion}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </TextField>}

                    {/* Justificación */}
                    {!oficioMode && <Box>
                      <TextField
                        fullWidth
                        required
                        multiline
                        rows={readOnly ? 2 : 4}
                        label="Justificación *"
                        placeholder={`Explique el motivo de esta vinculación (mínimo ${MIN_CARACTERES_JUSTIFICACION_VINCULO} caracteres)...`}
                        value={vinculo.justificacion}
                        onChange={(e) => handleUpdateVinculo(index, "justificacion", e.target.value)}
                        error={Boolean(errors.justificacion)}
                        helperText={errors.justificacion}
                        disabled={readOnly}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            bgcolor: alpha(theme.palette.background.paper, 0.5),
                          },
                        }}
                      />

                      {!readOnly && (
                        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                          <Typography
                            variant="caption"
                            color={
                              vinculo.justificacion.length >= MIN_CARACTERES_JUSTIFICACION_VINCULO
                                ? "success.main"
                                : "text.secondary"
                            }
                          >
                            {vinculo.justificacion.length} / {MIN_CARACTERES_JUSTIFICACION_VINCULO} caracteres
                          </Typography>
                          {vinculo.justificacion.length < MIN_CARACTERES_JUSTIFICACION_VINCULO && (
                            <Typography variant="caption" color="warning.main">
                              Faltan{" "}
                              {Math.max(0, MIN_CARACTERES_JUSTIFICACION_VINCULO - vinculo.justificacion.length)}{" "}
                              caracteres
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Box>}

                    {guiaOficio && !readOnly && vinculo.legajo && !tipoOficioElegido && (
                      <Alert
                        severity="warning"
                        action={
                          <Button color="inherit" size="small" onClick={revealClasificacionOficio}>
                            Elegir tipo
                          </Button>
                        }
                      >
                        Falta el <strong>Tipo de Oficio</strong>: sin él, al guardar no se agregan actividades a la
                        medida. Se elige en &quot;Clasificación del Oficio&quot;, más abajo.
                      </Alert>
                    )}
                    {guiaOficio && !readOnly && vinculo.legajo && tipoOficioElegido && !vinculo.medida && (
                      <Alert severity="info">
                        Elegí también la <strong>medida vigente</strong>: es la que recibe las actividades del oficio.
                      </Alert>
                    )}

                    {oficioMode && (
                      <Alert severity="info">
                        El vínculo se registra automáticamente como oficio judicial. La justificación no requiere carga manual.
                      </Alert>
                    )}

                    {/* Summary chips (read-only mode) */}
                    {readOnly && (
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        {vinculo.legajo_info && (
                          <Chip
                            label={`Legajo: ${vinculo.legajo_info.numero}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        )}
                        {vinculo.medida && (
                          <Chip
                            label={`Medida: ${vinculo.medida}`}
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            )
          })}
        </Box>
      )}

      {/* Global validation warning */}
      {!readOnly && mostrarErrores && vinculos.some((v) => Object.keys(vinculoFieldErrors(v, oficioMode)).length > 0) && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2">
            Por favor, complete todos los campos obligatorios en los vínculos antes de guardar la demanda.
          </Typography>
        </Alert>
      )}
    </Box>
  )
}
