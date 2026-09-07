import {
  Alert,
  Box,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material"
import {
  AssignmentInd as AssignmentIndIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material"
import { formatFecha } from "../utils"
import type { AsignacionesActivas, LegajoData } from "../types"

interface TabLegajoProps {
  legajo: LegajoData | undefined
  urgenciaNombre: string | null | undefined
  asignaciones: AsignacionesActivas
}

export function TabLegajo({ legajo, urgenciaNombre, asignaciones }: TabLegajoProps) {
  return (
    <>
  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
    <Typography variant="h6" sx={{ fontWeight: 600 }}>
      Información del Legajo
    </Typography>
    {/* Legajo info is read-only in this modal - edit from main page */}
  </Box>

  <Grid container spacing={3}>
    <Grid item xs={12} md={6}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Número de Legajo
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {legajo?.numero || "N/A"}
        </Typography>
      </Paper>
    </Grid>

    <Grid item xs={12} md={6}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Estado
        </Typography>
        <Chip
          label={
            typeof legajo?.estado === 'string'
              ? legajo.estado
              : (typeof legajo?.estado === 'object' && legajo.estado && 'estado' in legajo.estado)
                ? legajo.estado.estado
                : "N/A"
          }
          color="primary"
          variant="outlined"
        />
      </Paper>
    </Grid>

    <Grid item xs={12} md={6}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Fecha de Apertura
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          {formatFecha(legajo?.fecha_apertura)}
        </Typography>
      </Paper>
    </Grid>

    <Grid item xs={12} md={6}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Última Actualización
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          {formatFecha(legajo?.ultima_actualizacion)}
        </Typography>
      </Paper>
    </Grid>

    {urgenciaNombre && (
      <Grid item xs={12}>
        <Alert severity={urgenciaNombre === "ALTA" ? "error" : "info"}>
          <Typography variant="subtitle2" gutterBottom>
            Nivel de Urgencia
          </Typography>
          <Chip label={urgenciaNombre} color={urgenciaNombre === "ALTA" ? "error" : "default"} />
        </Alert>
      </Grid>
    )}

    {asignaciones.length > 0 && (
      <Grid item xs={12}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Asignaciones Activas
          </Typography>
          <List dense>
            {asignaciones.map((asig: any, idx: number) => (
              <ListItem key={idx}>
                <ListItemIcon>
                  <AssignmentIndIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={asig.user_responsable?.nombre_completo || "Sin asignar"}
                  secondary={`${asig.zona?.nombre || "Sin zona"} - ${asig.tipo_responsabilidad || ""}`}
                />
                {asig.recibido && <CheckCircleIcon color="success" fontSize="small" />}
              </ListItem>
            ))}
          </List>
        </Paper>
      </Grid>
    )}
  </Grid>
    </>
  )
}
