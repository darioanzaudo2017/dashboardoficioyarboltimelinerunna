"use client"

import type React from "react"
import { useState } from "react"
import { Box, Button, Link, Popover, Tooltip, Typography, IconButton, Badge } from "@mui/material"
import { AttachFile } from "@mui/icons-material"
import type { Adjunto } from "./types"
import { getFileNameFromUrl } from "./utils"

// Custom component for rendering adjuntos
export const AdjuntosCell = (props: { adjuntos: Adjunto[] }) => {
  const { adjuntos } = props
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  // Vive dentro de la columna "Detalles", al lado de los indicadores de legajo y
  // vinculacion: sin adjuntos se muestra el mismo icono apagado, no un texto.
  if (!adjuntos || !Array.isArray(adjuntos) || adjuntos.length === 0) {
    return (
      <Tooltip title="Sin adjuntos">
        <AttachFile fontSize="small" sx={{ color: "action.disabled" }} />
      </Tooltip>
    )
  }

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
  }

  const handleClose = (event?: React.MouseEvent<HTMLElement> | {}, reason?: "backdropClick" | "escapeKeyDown") => {
    if (event && 'stopPropagation' in event) {
      event.stopPropagation()
    }
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)

  // Show a summary in the cell
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Tooltip title={`Ver ${adjuntos.length} ${adjuntos.length === 1 ? "adjunto" : "adjuntos"}`}>
        <Badge badgeContent={adjuntos.length} color="primary" sx={{ "& .MuiBadge-badge": { fontSize: "0.65rem" } }}>
          <IconButton
            size="small"
            onClick={handleClick}
            sx={{
              color: "primary.main",
              "&:hover": {
                backgroundColor: "rgba(25, 118, 210, 0.04)",
              },
            }}
          >
            <AttachFile fontSize="small" />
          </IconButton>
        </Badge>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        onClick={(e) => e.stopPropagation()}
        sx={{ zIndex: 9999 }}
      >
        <Box
          sx={{
            width: 300,
            p: 2,
            maxHeight: 300,
            overflowY: "auto",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
              Adjuntos ({adjuntos.length})
            </Typography>
            <Button size="small" variant="outlined" onClick={handleClose} sx={{ minWidth: "auto", padding: "2px 8px" }}>
              Cerrar
            </Button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {adjuntos.map((adjunto, index) => {
              if (!adjunto || !adjunto.archivo) {
                return null
              }

              const fileName = getFileNameFromUrl(adjunto.archivo)

              return (
                <Link
                  key={index}
                  href={adjunto.archivo}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    color: "#1976d2",
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    padding: "8px 12px",
                    borderRadius: "4px",
                    transition: "background-color 0.2s",
                  }}
                  sx={{
                    "&:hover": {
                      backgroundColor: "#f0f7ff",
                    },
                  }}
                >
                  <AttachFile style={{ fontSize: "1rem", marginRight: "8px", flexShrink: 0 }} />
                  <span style={{ wordBreak: "break-word" }}>{fileName}</span>
                </Link>
              )
            })}
          </div>
        </Box>
      </Popover>
    </div>
  )
}
