import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControlLabel,
  Grid,
  Paper,
  Switch,
  TextField,
  Typography,
} from "@mui/material"
import { Save as SaveIcon, Cancel as CancelIcon } from "@mui/icons-material"
import { Edit as EditIcon, LocalHospital as LocalHospitalIcon } from "@mui/icons-material"
import type { PersonaDetailData } from "../hooks/usePersonaDetailData"
import type { PermisosUsuario, PersonaFormState } from "../types"

interface TabSaludProps {
  readOnly: boolean
  permisos: PermisosUsuario
  isEditing: boolean
  isSaving: boolean
  handleEnterEditMode: () => void
  handleCancelEdit: () => void
  handleSave: () => void
  formData: PersonaFormState
  handleFieldChange: (field: keyof PersonaFormState, value: any) => void
  loadingSalud: boolean
  loadingDropdowns: boolean
  dropdownData: PersonaDetailData["dropdownData"]
  saludData: PersonaDetailData["saludData"]
}

export function TabSalud({
  readOnly,
  permisos,
  isEditing,
  isSaving,
  handleEnterEditMode,
  handleCancelEdit,
  handleSave,
  formData,
  handleFieldChange,
  loadingSalud,
  loadingDropdowns,
  dropdownData,
  saludData,
}: TabSaludProps) {
  return (
    <>
  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
    <Typography variant="h6" sx={{ fontWeight: 600 }}>
      Información de Salud
    </Typography>
    {!readOnly && permisos?.puede_editar && !isEditing && (
      <Button
        startIcon={<EditIcon />}
        onClick={handleEnterEditMode}
        size="small"
      >
        Editar
      </Button>
    )}
    {isEditing && (
      <Box sx={{ display: "flex", gap: 1 }}>
        <Button
          startIcon={<CancelIcon />}
          onClick={handleCancelEdit}
          size="small"
          color="inherit"
          disabled={isSaving}
        >
          Cancelar
        </Button>
        <Button
          startIcon={isSaving ? <CircularProgress size={16} /> : <SaveIcon />}
          onClick={handleSave}
          size="small"
          variant="contained"
          disabled={isSaving}
        >
          Guardar
        </Button>
      </Box>
    )}
  </Box>

  {loadingSalud ? (
    <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
      <CircularProgress />
    </Box>
  ) : isEditing ? (
    // Edit mode
    <Grid container spacing={2}>
      {loadingDropdowns ? (
        <Grid item xs={12}>
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        </Grid>
      ) : (
        <>
          <Grid item xs={12}>
            <Autocomplete
              options={dropdownData?.instituciones_sanitarias || dropdownData?.institucion_sanitaria || []}
              getOptionLabel={(option: any) => option.nombre || ""}
              value={
                (dropdownData?.instituciones_sanitarias || dropdownData?.institucion_sanitaria || [])
                  .find((item: any) => item.id === formData.institucion_sanitaria) || null
              }
              onChange={(_, newValue) => handleFieldChange("institucion_sanitaria", newValue?.id || null)}
              renderInput={(params) => (
                <TextField {...params} label="Institución Sanitaria" size="small" />
              )}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={dropdownData?.obra_social_choices || []}
              getOptionLabel={(option: any) => option.value || ""}
              value={
                (dropdownData?.obra_social_choices || [])
                  .find((item: any) => item.key === formData.obra_social) || null
              }
              onChange={(_, newValue) => handleFieldChange("obra_social", newValue?.key || "")}
              renderInput={(params) => (
                <TextField {...params} label="Obra Social" size="small" />
              )}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={dropdownData?.intervencion_choices || []}
              getOptionLabel={(option: any) => option.value || ""}
              value={
                (dropdownData?.intervencion_choices || [])
                  .find((item: any) => item.key === formData.intervencion) || null
              }
              onChange={(_, newValue) => handleFieldChange("intervencion", newValue?.key || "")}
              renderInput={(params) => (
                <TextField {...params} label="Tipo de Intervención" size="small" />
              )}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.auh}
                  onChange={(e) => handleFieldChange("auh", e.target.checked)}
                />
              }
              label="Asignación Universal por Hijo (AUH)"
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Médico de Cabecera
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Nombre del Médico"
              value={formData.medico_nombre}
              onChange={(e) => handleFieldChange("medico_nombre", e.target.value)}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Email del Médico"
              value={formData.medico_mail}
              onChange={(e) => handleFieldChange("medico_mail", e.target.value)}
              size="small"
              type="email"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Teléfono del Médico"
              value={formData.medico_telefono}
              onChange={(e) => handleFieldChange("medico_telefono", e.target.value)}
              size="small"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Observaciones Médicas"
              value={formData.observaciones_medicas}
              onChange={(e) => handleFieldChange("observaciones_medicas", e.target.value)}
              size="small"
              multiline
              rows={3}
            />
          </Grid>
        </>
      )}
    </Grid>
  ) : saludData?.cobertura_medica ? (
    // View mode with data
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <LocalHospitalIcon color="primary" />
            <Typography variant="subtitle2" color="text.secondary">
              Institución Sanitaria
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {saludData.cobertura_medica.institucion_sanitaria?.nombre || "No especificada"}
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Obra Social
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {saludData.cobertura_medica.obra_social || "N/A"}
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Tipo de Intervención
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {saludData.cobertura_medica.intervencion || "N/A"}
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Asignación Universal por Hijo (AUH)
          </Typography>
          <Chip
            label={saludData.cobertura_medica.auh ? "Sí" : "No"}
            color={saludData.cobertura_medica.auh ? "success" : "default"}
            variant="outlined"
          />
        </Paper>
      </Grid>

      {saludData.cobertura_medica.medico_cabecera && (
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
              Médico de Cabecera
            </Typography>
            <Grid container spacing={2}>
              {saludData.cobertura_medica.medico_cabecera.nombre && (
                <Grid item xs={12} md={4}>
                  <Typography variant="caption" color="text.secondary">
                    Nombre
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {saludData.cobertura_medica.medico_cabecera.nombre}
                  </Typography>
                </Grid>
              )}
              {saludData.cobertura_medica.medico_cabecera.mail && (
                <Grid item xs={12} md={4}>
                  <Typography variant="caption" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {saludData.cobertura_medica.medico_cabecera.mail}
                  </Typography>
                </Grid>
              )}
              {saludData.cobertura_medica.medico_cabecera.telefono && (
                <Grid item xs={12} md={4}>
                  <Typography variant="caption" color="text.secondary">
                    Teléfono
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {saludData.cobertura_medica.medico_cabecera.telefono}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>
      )}

      {saludData.cobertura_medica.observaciones && (
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Observaciones Médicas
            </Typography>
            <Typography variant="body1">{saludData.cobertura_medica.observaciones}</Typography>
          </Paper>
        </Grid>
      )}

      {saludData.persona_enfermedades && saludData.persona_enfermedades.length > 0 && (
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Enfermedades Registradas
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
              {saludData.persona_enfermedades.map((enfermedad: any, idx: number) => (
                <Chip
                  key={idx}
                  label={enfermedad.enfermedad?.nombre || enfermedad.nombre || "Enfermedad"}
                  variant="outlined"
                  color="warning"
                  size="small"
                />
              ))}
            </Box>
          </Paper>
        </Grid>
      )}
    </Grid>
  ) : (
    <Alert severity="info">
      No hay información de salud registrada para esta persona.
      {!readOnly && permisos?.puede_editar && (
        <Button
          size="small"
          onClick={handleEnterEditMode}
          sx={{ ml: 2 }}
        >
          Agregar información
        </Button>
      )}
    </Alert>
  )}
    </>
  )
}
