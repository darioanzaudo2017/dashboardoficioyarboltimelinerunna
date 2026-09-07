import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material"
import {
  Edit as EditIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material"
import VulnerabilityEditor from "../../vulnerability-editor"
import type { PersonaDetailData } from "../hooks/usePersonaDetailData"
import type { PermisosUsuario, PersonaData } from "../types"

interface TabVulnerabilidadProps {
  readOnly: boolean
  permisos: PermisosUsuario
  isEditingVulnerability: boolean
  setIsEditingVulnerability: (value: boolean) => void
  loadingVulnerabilidad: boolean
  personaId: number | undefined
  persona: PersonaData | undefined
  vulnerabilidadData: PersonaDetailData["vulnerabilidadData"]
  dropdownData: PersonaDetailData["dropdownData"]
  loadingDropdowns: boolean
}

export function TabVulnerabilidad({
  readOnly,
  permisos,
  isEditingVulnerability,
  setIsEditingVulnerability,
  loadingVulnerabilidad,
  personaId,
  persona,
  vulnerabilidadData,
  dropdownData,
  loadingDropdowns,
}: TabVulnerabilidadProps) {
  return (
    <>
  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
    <Typography variant="h6" sx={{ fontWeight: 600 }}>
      Condiciones de Vulnerabilidad
    </Typography>
    {!readOnly && permisos?.puede_editar && !isEditingVulnerability && (
      <Button
        startIcon={<EditIcon />}
        onClick={() => setIsEditingVulnerability(true)}
        size="small"
      >
        Editar
      </Button>
    )}
  </Box>

  {loadingVulnerabilidad ? (
    <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
      <CircularProgress />
    </Box>
  ) : isEditingVulnerability && personaId ? (
    <VulnerabilityEditor
      personaId={personaId}
      isAdulto={!!(persona as any)?.adulto}
      condicionesInitial={(vulnerabilidadData?.condiciones_vulnerabilidad as any) || []}
      vulneracionesInitial={(vulnerabilidadData?.vulneraciones as any) || []}
      dropdownData={dropdownData}
      loadingDropdowns={loadingDropdowns}
      onCancel={() => setIsEditingVulnerability(false)}
      onSaved={() => setIsEditingVulnerability(false)}
    />
  ) : (vulnerabilidadData?.condiciones_vulnerabilidad?.length || vulnerabilidadData?.vulneraciones?.length) ? (
    // View mode with data
    <Grid container spacing={3}>
      {vulnerabilidadData?.condiciones_vulnerabilidad && vulnerabilidadData.condiciones_vulnerabilidad.length > 0 && (
        <>
          <Grid item xs={12}>
            <Alert severity="warning" icon={<WarningIcon />}>
              Se han identificado {vulnerabilidadData.condiciones_vulnerabilidad.length} condiciones de vulnerabilidad
            </Alert>
          </Grid>

          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                Condiciones Identificadas
              </Typography>
              <List dense>
                {vulnerabilidadData.condiciones_vulnerabilidad.map((condicion: any, idx: number) => (
                  <ListItem key={idx} divider={idx < vulnerabilidadData.condiciones_vulnerabilidad.length - 1}>
                    <ListItemIcon>
                      <WarningIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary={condicion.condicion_vulnerabilidad?.nombre || condicion.nombre || "Condición"}
                      secondary={
                        condicion.condicion_vulnerabilidad?.descripcion ||
                        condicion.descripcion ||
                        `Peso: ${condicion.condicion_vulnerabilidad?.peso || condicion.peso || "N/A"}`
                      }
                    />
                    {(condicion.condicion_vulnerabilidad?.peso || condicion.peso) && (
                      <Chip
                        label={`Peso: ${condicion.condicion_vulnerabilidad?.peso || condicion.peso}`}
                        size="small"
                        color="warning"
                        variant="outlined"
                      />
                    )}
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: "warning.light", color: "warning.contrastText" }}>
              <Typography variant="subtitle2" gutterBottom>
                Peso Total de Vulnerabilidad
              </Typography>
              <Typography variant="h4">
                {vulnerabilidadData.condiciones_vulnerabilidad.reduce(
                  (sum: number, c: any) =>
                    sum + (c.condicion_vulnerabilidad?.peso || c.peso || 0),
                  0
                )}
              </Typography>
            </Paper>
          </Grid>
        </>
      )}

      {vulnerabilidadData?.vulneraciones && vulnerabilidadData.vulneraciones.length > 0 && (
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
              Presuntas Vulneraciones de Derechos ({vulnerabilidadData.vulneraciones.length})
            </Typography>
            <Stack spacing={1}>
              {vulnerabilidadData.vulneraciones.map((v: any, idx: number) => (
                <Paper
                  key={v.id ?? idx}
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderLeft: 4,
                    borderLeftColor: v.transcurre_actualidad ? "error.main" : "grey.400",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {v.categoria_motivo_info?.nombre || "Vulneración"}
                      {v.categoria_submotivo_info?.nombre && ` · ${v.categoria_submotivo_info.nombre}`}
                    </Typography>
                    {v.principal_demanda && <Chip label="Principal" size="small" color="error" />}
                    {v.transcurre_actualidad && (
                      <Chip label="En curso" size="small" color="error" variant="outlined" />
                    )}
                  </Box>
                  <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
                    {v.gravedad_vulneracion_info?.nombre && (
                      <Chip
                        label={`Gravedad: ${v.gravedad_vulneracion_info.nombre}`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                    {v.urgencia_vulneracion_info?.nombre && (
                      <Chip
                        label={`Urgencia: ${v.urgencia_vulneracion_info.nombre}`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Paper>
              ))}
            </Stack>
          </Paper>
        </Grid>
      )}
    </Grid>
  ) : (
    <Alert severity="success" icon={<CheckCircleIcon />}>
      No se han identificado condiciones de vulnerabilidad para esta persona.
    </Alert>
  )}
    </>
  )
}
