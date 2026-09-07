import { Avatar, Box, Chip, IconButton, Typography } from "@mui/material"
import { Close as CloseIcon } from "@mui/icons-material"
import { getInitials } from "../utils"
import type { PersonaDisplayData } from "../utils"
import type { AsignacionesActivas } from "../types"

interface PersonaDetailHeaderProps {
  avatarColor: string
  displayData: PersonaDisplayData
  edad: number | null
  urgenciaNombre: string | null | undefined
  asignaciones: AsignacionesActivas
  onClose: () => void
}

export function PersonaDetailHeader({
  avatarColor,
  displayData,
  edad,
  urgenciaNombre,
  asignaciones,
  onClose,
}: PersonaDetailHeaderProps) {
  return (
<Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
  <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
    <Avatar
      sx={{
        width: 56,
        height: 56,
        bgcolor: avatarColor,
        fontSize: "1.5rem",
        fontWeight: "bold",
      }}
    >
      {getInitials(displayData.nombre, displayData.apellido)}
    </Avatar>
    <Box>
      <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
        {displayData.nombre} {displayData.apellido}
      </Typography>
      {displayData.nombre_autopercibido && (
        <Typography variant="body2" color="text.secondary">
          &ldquo;{displayData.nombre_autopercibido}&rdquo;
        </Typography>
      )}
      <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
        <Chip label={`DNI: ${displayData.dni || "N/A"}`} size="small" variant="outlined" />
        <Chip
          label={edad !== null ? `${edad} años` : "Edad sin datos válidos"}
          size="small"
          variant="outlined"
          color="primary"
        />
        {urgenciaNombre === "ALTA" && <Chip label="URGENTE" color="error" size="small" />}
        {asignaciones[0]?.zona && (
          <Chip label={asignaciones[0].zona.nombre} size="small" variant="outlined" color="secondary" />
        )}
      </Box>
    </Box>
  </Box>
  <IconButton
    edge="end"
    color="inherit"
    onClick={onClose}
    aria-label="cerrar"
    sx={{ alignSelf: "flex-start" }}
  >
    <CloseIcon />
  </IconButton>
</Box>
  )
}
