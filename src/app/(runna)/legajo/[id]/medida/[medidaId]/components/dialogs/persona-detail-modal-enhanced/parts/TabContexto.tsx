import {
  Box,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material"
import type { DemandasRelacionadas, MedidasActivas, PermisosUsuario } from "../types"

interface TabContextoProps {
  medidasActivas: MedidasActivas
  demandas: DemandasRelacionadas
  permisos: PermisosUsuario
}

export function TabContexto({ medidasActivas, demandas, permisos }: TabContextoProps) {
  return (
    <>
  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
    Contexto Adicional
  </Typography>

  <Grid container spacing={3}>
    <Grid item xs={12} sm={6} md={3}>
      <Paper variant="outlined" sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="h4" color="primary">
          {medidasActivas?.length || 0}
        </Typography>
        <Typography variant="caption">Medidas Activas</Typography>
      </Paper>
    </Grid>

    <Grid item xs={12} sm={6} md={3}>
      <Paper variant="outlined" sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="h4" color="secondary">
          {demandas?.resumen?.total_demandas || 0}
        </Typography>
        <Typography variant="caption">Demandas Relacionadas</Typography>
      </Paper>
    </Grid>

    <Grid item xs={12} sm={6} md={3}>
      <Paper variant="outlined" sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="h4" color="success.main">
          {demandas?.resumen?.con_medidas_creadas || 0}
        </Typography>
        <Typography variant="caption">Con Medidas Creadas</Typography>
      </Paper>
    </Grid>

    <Grid item xs={12} sm={6} md={3}>
      <Paper variant="outlined" sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="h4" color="warning.main">
          {demandas?.resumen?.activas || 0}
        </Typography>
        <Typography variant="caption">Demandas Activas</Typography>
      </Paper>
    </Grid>

    {medidasActivas && medidasActivas.length > 0 && (
      <Grid item xs={12}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Medidas Activas Detalle
          </Typography>
          <List dense>
            {medidasActivas.map((medida: any, idx: number) => {
              // Safely extract string values from potentially nested objects
              const numeroMedida = typeof medida.numero_medida === 'string'
                ? medida.numero_medida
                : (medida.numero || `M-${medida.id}`)

              const tipoMedidaDisplay = typeof medida.tipo_medida_display === 'string'
                ? medida.tipo_medida_display
                : (typeof medida.tipo_medida === 'string' ? medida.tipo_medida : 'N/A')

              const estadoDisplay = typeof medida.estado_vigencia_display === 'string'
                ? medida.estado_vigencia_display
                : (typeof medida.estado_vigencia === 'string'
                  ? medida.estado_vigencia
                  : (typeof medida.estado === 'string' ? medida.estado : 'N/A'))

              const tipoMedida = typeof medida.tipo_medida === 'string'
                ? medida.tipo_medida
                : (typeof medida.tipo === 'string' ? medida.tipo : 'N/A')

              return (
                <ListItem key={idx}>
                  <ListItemText
                    primary={numeroMedida}
                    secondary={`${tipoMedidaDisplay} - ${estadoDisplay}`}
                  />
                  <Chip label={tipoMedida} size="small" variant="outlined" />
                </ListItem>
              )
            })}
          </List>
        </Paper>
      </Grid>
    )}

    {permisos && (
      <Grid item xs={12}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Permisos del Usuario
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
            {permisos.puede_editar && <Chip label="Editar" size="small" color="primary" />}
            {permisos.puede_agregar_documentos && <Chip label="Agregar Documentos" size="small" />}
            {permisos.puede_tomar_medidas && <Chip label="Tomar Medidas" size="small" />}
            {permisos.puede_asignar_zonas && <Chip label="Asignar Zonas" size="small" />}
            {permisos.puede_reasignar && <Chip label="Reasignar" size="small" />}
          </Box>
        </Paper>
      </Grid>
    )}
  </Grid>
    </>
  )
}
