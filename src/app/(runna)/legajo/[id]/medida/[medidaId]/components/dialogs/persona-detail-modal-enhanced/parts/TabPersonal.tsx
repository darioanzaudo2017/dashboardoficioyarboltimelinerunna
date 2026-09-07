import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material"
import { Save as SaveIcon, Cancel as CancelIcon } from "@mui/icons-material"
import {
  Edit as EditIcon,
  ContentCopy as ContentCopyIcon,
  Warning as WarningIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarTodayIcon,
  Badge as BadgeIcon,
} from "@mui/icons-material"
import { copyToClipboard, formatFecha } from "../utils"
import type { PersonaDisplayData } from "../utils"
import type { PersonaDetailData } from "../hooks/usePersonaDetailData"
import type { PermisosUsuario, PersonaFormState } from "../types"

interface TabPersonalProps {
  readOnly: boolean
  permisos: PermisosUsuario
  isEditing: boolean
  isSaving: boolean
  handleEnterEditMode: () => void
  handleCancelEdit: () => void
  handleSave: () => void
  formData: PersonaFormState
  handleFieldChange: (field: keyof PersonaFormState, value: any) => void
  displayData: PersonaDisplayData
  edad: number | null
  nnyaData: PersonaDetailData["nnyaData"]
}

export function TabPersonal({
  readOnly,
  permisos,
  isEditing,
  isSaving,
  handleEnterEditMode,
  handleCancelEdit,
  handleSave,
  formData,
  handleFieldChange,
  displayData,
  edad,
  nnyaData,
}: TabPersonalProps) {
  return (
    <>
  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
    <Typography variant="h6" sx={{ fontWeight: 600 }}>
      Información Personal
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

  {isEditing ? (
    // Edit mode
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Nombre"
          value={formData.nombre}
          onChange={(e) => handleFieldChange("nombre", e.target.value)}
          size="small"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Apellido"
          value={formData.apellido}
          onChange={(e) => handleFieldChange("apellido", e.target.value)}
          size="small"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Nombre Autopercibido"
          value={formData.nombre_autopercibido}
          onChange={(e) => handleFieldChange("nombre_autopercibido", e.target.value)}
          size="small"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="DNI"
          value={formData.dni}
          onChange={(e) => handleFieldChange("dni", e.target.value)}
          size="small"
          type="number"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Situación DNI"
          value={formData.situacion_dni}
          onChange={(e) => handleFieldChange("situacion_dni", e.target.value)}
          size="small"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Fecha de Nacimiento"
          type="date"
          value={formData.fecha_nacimiento}
          onChange={(e) => handleFieldChange("fecha_nacimiento", e.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Edad Aproximada"
          value={formData.edad_aproximada}
          onChange={(e) => handleFieldChange("edad_aproximada", e.target.value)}
          size="small"
          type="number"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth size="small">
          <InputLabel>Género</InputLabel>
          <Select
            value={formData.genero}
            label="Género"
            onChange={(e) => handleFieldChange("genero", e.target.value)}
          >
            <MenuItem value="">Sin especificar</MenuItem>
            <MenuItem value="MASCULINO">Masculino</MenuItem>
            <MenuItem value="FEMENINO">Femenino</MenuItem>
            <MenuItem value="NO_BINARIO">No Binario</MenuItem>
            <MenuItem value="AUTOPERCIBIDO">Autopercibido</MenuItem>
            <MenuItem value="OTRO">Otro</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Nacionalidad"
          value={formData.nacionalidad}
          onChange={(e) => handleFieldChange("nacionalidad", e.target.value)}
          size="small"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Teléfono"
          value={formData.telefono}
          onChange={(e) => handleFieldChange("telefono", e.target.value)}
          size="small"
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Observaciones"
          value={formData.observaciones}
          onChange={(e) => handleFieldChange("observaciones", e.target.value)}
          size="small"
          multiline
          rows={3}
        />
      </Grid>
    </Grid>
  ) : (
    // View mode
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Nombre Completo
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {displayData.nombre} {displayData.apellido}
            </Typography>
            <IconButton size="small" onClick={() => copyToClipboard(`${displayData.nombre} ${displayData.apellido}`, "Nombre")}>
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Box>
        </Paper>
      </Grid>

      {displayData.nombre_autopercibido && (
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Nombre Autopercibido
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {displayData.nombre_autopercibido}
            </Typography>
          </Paper>
        </Grid>
      )}

      <Grid item xs={12} md={6}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            DNI
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <BadgeIcon color="action" />
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {displayData.dni || "No registrado"}
            </Typography>
            {displayData.dni && (
              <IconButton size="small" onClick={() => copyToClipboard(String(displayData.dni), "DNI")}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
          {displayData.situacion_dni && (
            <Chip label={displayData.situacion_dni} size="small" sx={{ mt: 1 }} variant="outlined" />
          )}
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Fecha de Nacimiento
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CalendarTodayIcon color="action" />
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {formatFecha(displayData.fecha_nacimiento)}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {edad !== null ? `Edad: ${edad} años` : "Edad: dato inválido o no disponible"}
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Género
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {displayData.genero || "No especificado"}
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Nacionalidad
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {displayData.nacionalidad || "No especificada"}
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Teléfono
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PhoneIcon color="action" />
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {displayData.telefono || "No registrado"}
            </Typography>
            {displayData.telefono && (
              <IconButton size="small" onClick={() => copyToClipboard(String(displayData.telefono), "Teléfono")}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Paper>
      </Grid>

      {displayData.observaciones && (
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Observaciones
            </Typography>
            <Typography variant="body1">{displayData.observaciones}</Typography>
          </Paper>
        </Grid>
      )}

      {nnyaData?.fecha_defuncion && (
        <Grid item xs={12}>
          <Alert severity="warning" icon={<WarningIcon />}>
            <Typography variant="subtitle2" gutterBottom>
              Fecha de Defunción
            </Typography>
            <Typography variant="body2">{formatFecha(nnyaData.fecha_defuncion)}</Typography>
          </Alert>
        </Grid>
      )}
    </Grid>
  )}
    </>
  )
}
