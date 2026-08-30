"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
} from "@mui/material"
import {
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  PersonAdd as PersonAddIcon,
  Description as DescriptionIcon,
  Gavel as GavelIcon,
} from "@mui/icons-material"

interface ActionMenuProps {
  legajoId: number
  demandaId?: number | null // ID de la demanda PI asociada
  tieneMedidas?: boolean
  tieneOficios?: boolean
  tienePlanTrabajo?: boolean
  onViewDetail: (id: number) => void
  onAssign: (id: number) => void
  onEdit?: (id: number) => void
  userPermissions?: {
    canAssign: boolean
    canEdit: boolean
    canSendNotification: boolean
  }
}

const ActionMenu: React.FC<ActionMenuProps> = ({
  legajoId,
  demandaId,
  onViewDetail,
  onAssign,
  onEdit,
  userPermissions = {
    canAssign: true,
    canEdit: true,
    canSendNotification: true,
  },
}) => {
  const router = useRouter()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
  }

  const handleClose = (event?: React.MouseEvent) => {
    event?.stopPropagation()
    setAnchorEl(null)
  }

  const handleAction = (event: React.MouseEvent, action: () => void) => {
    event.stopPropagation()
    action()
    handleClose()
  }

  // Acciones del menú
  const actions = [
    {
      label: "Ver Detalle del Legajo",
      icon: <VisibilityIcon fontSize="small" />,
      action: () => onViewDetail(legajoId),
      show: true,
    },
    {
      label: "Asignar Legajo",
      icon: <PersonAddIcon fontSize="small" />,
      action: () => onAssign(legajoId),
      show: userPermissions.canAssign,
      divider: true,
    },
    {
      label: "Editar Legajo",
      icon: <EditIcon fontSize="small" />,
      action: () => {
        onEdit?.(legajoId)
      },
      show: userPermissions.canEdit && Boolean(onEdit),
    },
    {
      label: "Ir a Demanda (PI)",
      icon: <DescriptionIcon fontSize="small" />,
      action: () => {
        if (demandaId) {
          router.push(`/demanda/${demandaId}`)
        } else {
          console.warn("No hay demanda PI asociada")
        }
      },
      show: !!demandaId,
      divider: true,
    },
    {
      label: "Registrar/Ver Oficio",
      icon: <GavelIcon fontSize="small" />,
      action: () => {
        router.push(`/oficios?legajo=${legajoId}`)
      },
      show: true,
    },
  ]

  const visibleActions = actions.filter((action) => action.show)

  return (
    <>
      <Tooltip title="Más acciones">
        <IconButton
          size="small"
          onClick={handleClick}
          sx={{
            color: "action.active",
            "&:hover": {
              color: "primary.main",
              backgroundColor: "action.hover",
            },
          }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        PaperProps={{
          sx: {
            minWidth: 240,
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
            borderRadius: 2,
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {visibleActions.map((action, index) => (
          <React.Fragment key={index}>
            <MenuItem
              onClick={(e) => handleAction(e, action.action)}
              sx={{
                py: 1.25,
                px: 2,
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>{action.icon}</ListItemIcon>
              <ListItemText
                primary={action.label}
                primaryTypographyProps={{
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              />
            </MenuItem>
            {action.divider && index < visibleActions.length - 1 && <Divider sx={{ my: 0.5 }} />}
          </React.Fragment>
        ))}
      </Menu>
    </>
  )
}

export default ActionMenu
