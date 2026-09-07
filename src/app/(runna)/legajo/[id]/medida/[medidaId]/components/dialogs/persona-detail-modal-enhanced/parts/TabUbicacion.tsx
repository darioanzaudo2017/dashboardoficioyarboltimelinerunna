import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material"
import { Save as SaveIcon, Cancel as CancelIcon } from "@mui/icons-material"
import {
  Edit as EditIcon,
  ContentCopy as ContentCopyIcon,
  Home as HomeIcon,
  Phone as PhoneIcon,
} from "@mui/icons-material"
import { copyToClipboard } from "../utils"
import type { PersonaDetailData } from "../hooks/usePersonaDetailData"
import type { PermisosUsuario, PersonaData, PersonaFormState } from "../types"

interface TabUbicacionProps {
  readOnly: boolean
  permisos: PermisosUsuario
  isEditing: boolean
  isSaving: boolean
  handleEnterEditMode: () => void
  handleCancelEdit: () => void
  handleSave: () => void
  formData: PersonaFormState
  handleFieldChange: (field: keyof PersonaFormState, value: any) => void
  loadingLocalizacion: boolean
  loadingDropdowns: boolean
  dropdownData: PersonaDetailData["dropdownData"]
  localizacion: PersonaDetailData["localizacion"]
  fullAddress: string
  persona: PersonaData | undefined
}

export function TabUbicacion({
  readOnly,
  permisos,
  isEditing,
  isSaving,
  handleEnterEditMode,
  handleCancelEdit,
  handleSave,
  formData,
  handleFieldChange,
  loadingLocalizacion,
  loadingDropdowns,
  dropdownData,
  localizacion,
  fullAddress,
  persona,
}: TabUbicacionProps) {
  return (
    <>
  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
    <Typography variant="h6" sx={{ fontWeight: 600 }}>
      Ubicación y Contacto
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

  {loadingLocalizacion ? (
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
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="Calle"
              value={formData.calle}
              onChange={(e) => handleFieldChange("calle", e.target.value)}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Número"
              value={formData.numero}
              onChange={(e) => handleFieldChange("numero", e.target.value)}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Piso"
              value={formData.piso}
              onChange={(e) => handleFieldChange("piso", e.target.value)}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Departamento"
              value={formData.departamento}
              onChange={(e) => handleFieldChange("departamento", e.target.value)}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={dropdownData?.barrio || []}
              getOptionLabel={(option: any) => option.nombre || ""}
              value={
                (dropdownData?.barrio || [])
                  .find((item: any) => item.id === formData.barrio) || null
              }
              onChange={(_, newValue) => handleFieldChange("barrio", newValue?.id || null)}
              renderInput={(params) => (
                <TextField {...params} label="Barrio" size="small" />
              )}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={dropdownData?.localidad || []}
              getOptionLabel={(option: any) => option.nombre || ""}
              value={
                (dropdownData?.localidad || [])
                  .find((item: any) => item.id === formData.localidad) || null
              }
              onChange={(_, newValue) => handleFieldChange("localidad", newValue?.id || null)}
              renderInput={(params) => (
                <TextField {...params} label="Localidad" size="small" />
              )}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={dropdownData?.cpc || []}
              getOptionLabel={(option: any) => option.nombre || ""}
              value={
                (dropdownData?.cpc || [])
                  .find((item: any) => item.id === formData.cpc) || null
              }
              onChange={(_, newValue) => handleFieldChange("cpc", newValue?.id || null)}
              renderInput={(params) => (
                <TextField {...params} label="CPC" size="small" />
              )}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Manzana"
              value={formData.mza}
              onChange={(e) => handleFieldChange("mza", e.target.value)}
              size="small"
              type="number"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Lote"
              value={formData.lote}
              onChange={(e) => handleFieldChange("lote", e.target.value)}
              size="small"
              type="number"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Referencia Geográfica"
              value={formData.referencia_geo}
              onChange={(e) => handleFieldChange("referencia_geo", e.target.value)}
              size="small"
              multiline
              rows={2}
            />
          </Grid>
        </>
      )}
    </Grid>
  ) : localizacion ? (
    // View mode with data
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <HomeIcon color="action" />
            <Typography variant="subtitle2" color="text.secondary">
              Dirección Completa
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {fullAddress}
          </Typography>
        </Paper>
      </Grid>

      {((localizacion as any).barrio_nombre || (localizacion as any).barrio) && (
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Barrio
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {(localizacion as any).barrio_nombre || (localizacion as any).barrio}
            </Typography>
          </Paper>
        </Grid>
      )}

      {((localizacion as any).localidad_nombre || (localizacion as any).localidad?.nombre) && (
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Localidad
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {(localizacion as any).localidad_nombre || (localizacion as any).localidad?.nombre}
            </Typography>
          </Paper>
        </Grid>
      )}

      {((localizacion as any).cpc_nombre || (localizacion as any).cpc) && (
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              CPC
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {(localizacion as any).cpc_nombre || (localizacion as any).cpc}
            </Typography>
          </Paper>
        </Grid>
      )}

      {localizacion.referencia_geo && (
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Referencia Geográfica
            </Typography>
            <Typography variant="body1">{localizacion.referencia_geo}</Typography>
          </Paper>
        </Grid>
      )}

      {localizacion.mza && (
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Manzana
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {localizacion.mza}
            </Typography>
          </Paper>
        </Grid>
      )}

      {localizacion.lote && (
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Lote
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {localizacion.lote}
            </Typography>
          </Paper>
        </Grid>
      )}

      {persona?.telefono && (
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Teléfono de Contacto
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <PhoneIcon color="action" />
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {persona.telefono}
              </Typography>
              <IconButton size="small" onClick={() => copyToClipboard(String(persona.telefono), "Teléfono")}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Box>
          </Paper>
        </Grid>
      )}
    </Grid>
  ) : (
    <Alert severity="info">
      No hay información de ubicación registrada para esta persona.
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
