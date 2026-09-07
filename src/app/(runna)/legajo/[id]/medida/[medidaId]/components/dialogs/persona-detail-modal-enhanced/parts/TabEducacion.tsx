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
import { Edit as EditIcon, School as SchoolIcon } from "@mui/icons-material"
import type { PersonaDetailData } from "../hooks/usePersonaDetailData"
import type { PermisosUsuario, PersonaFormState } from "../types"

interface TabEducacionProps {
  readOnly: boolean
  permisos: PermisosUsuario
  isEditing: boolean
  isSaving: boolean
  handleEnterEditMode: () => void
  handleCancelEdit: () => void
  handleSave: () => void
  formData: PersonaFormState
  handleFieldChange: (field: keyof PersonaFormState, value: any) => void
  loadingEducacion: boolean
  loadingDropdowns: boolean
  dropdownData: PersonaDetailData["dropdownData"]
  educacion: PersonaDetailData["educacion"]
}

export function TabEducacion({
  readOnly,
  permisos,
  isEditing,
  isSaving,
  handleEnterEditMode,
  handleCancelEdit,
  handleSave,
  formData,
  handleFieldChange,
  loadingEducacion,
  loadingDropdowns,
  dropdownData,
  educacion,
}: TabEducacionProps) {
  return (
    <>
  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
    <Typography variant="h6" sx={{ fontWeight: 600 }}>
      Información Educativa
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

  {loadingEducacion ? (
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
              options={dropdownData?.instituciones_educativas || dropdownData?.institucion_educativa || []}
              getOptionLabel={(option: any) => option.nombre || ""}
              value={
                (dropdownData?.instituciones_educativas || dropdownData?.institucion_educativa || [])
                  .find((item: any) => item.id === formData.institucion_educativa) || null
              }
              onChange={(_, newValue) => handleFieldChange("institucion_educativa", newValue?.id || null)}
              renderInput={(params) => (
                <TextField {...params} label="Institución Educativa" size="small" />
              )}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={dropdownData?.nivel_alcanzado_choices || dropdownData?.nivel_educativo_choices || []}
              getOptionLabel={(option: any) => option.value || ""}
              value={
                (dropdownData?.nivel_alcanzado_choices || dropdownData?.nivel_educativo_choices || [])
                  .find((item: any) => item.key === formData.nivel_alcanzado) || null
              }
              onChange={(_, newValue) => handleFieldChange("nivel_alcanzado", newValue?.key || "")}
              renderInput={(params) => (
                <TextField {...params} label="Nivel Alcanzado" size="small" />
              )}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.esta_escolarizado}
                  onChange={(e) => handleFieldChange("esta_escolarizado", e.target.checked)}
                />
              }
              label="Está Escolarizado"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={dropdownData?.ultimo_cursado_choices || []}
              getOptionLabel={(option: any) => option.value || ""}
              value={
                (dropdownData?.ultimo_cursado_choices || [])
                  .find((item: any) => item.key === formData.ultimo_cursado) || null
              }
              onChange={(_, newValue) => handleFieldChange("ultimo_cursado", newValue?.key || "")}
              renderInput={(params) => (
                <TextField {...params} label="Último Cursado" size="small" />
              )}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={dropdownData?.tipo_escuela_choices || []}
              getOptionLabel={(option: any) => option.value || ""}
              value={
                (dropdownData?.tipo_escuela_choices || [])
                  .find((item: any) => item.key === formData.tipo_escuela) || null
              }
              onChange={(_, newValue) => handleFieldChange("tipo_escuela", newValue?.key || "")}
              renderInput={(params) => (
                <TextField {...params} label="Tipo de Escuela" size="small" />
              )}
              size="small"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Comentarios Educativos"
              value={formData.comentarios_educativos}
              onChange={(e) => handleFieldChange("comentarios_educativos", e.target.value)}
              size="small"
              multiline
              rows={3}
            />
          </Grid>
        </>
      )}
    </Grid>
  ) : educacion ? (
    // View mode with data
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <SchoolIcon color="primary" />
            <Typography variant="subtitle2" color="text.secondary">
              Institución Educativa
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {educacion.institucion_educativa?.nombre || "No especificada"}
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Nivel Alcanzado
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {educacion.nivel_alcanzado || "N/A"}
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Estado de Escolarización
          </Typography>
          <Chip
            label={educacion.esta_escolarizado ? "Escolarizado" : "No escolarizado"}
            color={educacion.esta_escolarizado ? "success" : "default"}
            variant="outlined"
          />
        </Paper>
      </Grid>

      {educacion.ultimo_cursado && (
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Último Cursado
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {educacion.ultimo_cursado}
            </Typography>
          </Paper>
        </Grid>
      )}

      {educacion.tipo_escuela && (
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Tipo de Escuela
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {educacion.tipo_escuela}
            </Typography>
          </Paper>
        </Grid>
      )}

      {educacion.comentarios_educativos && (
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Comentarios Educativos
            </Typography>
            <Typography variant="body1">{educacion.comentarios_educativos}</Typography>
          </Paper>
        </Grid>
      )}
    </Grid>
  ) : (
    <Alert severity="info">
      No hay información educativa registrada para esta persona.
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
