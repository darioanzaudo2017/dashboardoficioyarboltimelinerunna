"use client"

import { Box, IconButton, Tooltip } from "@mui/material"
import { ChevronLeft, ChevronRight } from "@mui/icons-material"

interface GridScrollButtonsProps {
  canScrollLeft: boolean
  canScrollRight: boolean
  scrollGridBy: (delta: number) => void
}

/** Degradados de borde + chevrones flotantes que indican scroll horizontal. */
export const GridScrollButtons = ({ canScrollLeft, canScrollRight, scrollGridBy }: GridScrollButtonsProps) => (
  <>
    {canScrollLeft && (
      <>
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            top: 56,
            left: 0,
            bottom: 56,
            width: 48,
            pointerEvents: "none",
            background: "linear-gradient(to right, rgba(255,255,255,0.95), rgba(255,255,255,0))",
            zIndex: 2,
          }}
        />
        <Tooltip title="Desplazar a la izquierda" placement="right">
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); scrollGridBy(-320) }}
            aria-label="Desplazar tabla a la izquierda"
            sx={{
              position: "absolute",
              top: "50%",
              left: 8,
              transform: "translateY(-50%)",
              bgcolor: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              border: "1px solid #e2e8f0",
              zIndex: 3,
              "&:hover": { bgcolor: "#f1f5f9", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" },
            }}
          >
            <ChevronLeft fontSize="small" />
          </IconButton>
        </Tooltip>
      </>
    )}
    {canScrollRight && (
      <>
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            top: 56,
            right: 0,
            bottom: 56,
            width: 48,
            pointerEvents: "none",
            background: "linear-gradient(to left, rgba(255,255,255,0.95), rgba(255,255,255,0))",
            zIndex: 2,
          }}
        />
        <Tooltip title="Desplazar a la derecha — hay más columnas" placement="left">
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); scrollGridBy(320) }}
            aria-label="Desplazar tabla a la derecha"
            sx={{
              position: "absolute",
              top: "50%",
              right: 8,
              transform: "translateY(-50%)",
              bgcolor: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              border: "1px solid #e2e8f0",
              zIndex: 3,
              "&:hover": { bgcolor: "#f1f5f9", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" },
              animation: "scrollHintPulse 2s ease-in-out 1",
              "@keyframes scrollHintPulse": {
                "0%": { transform: "translateY(-50%) translateX(0)" },
                "30%": { transform: "translateY(-50%) translateX(-4px)" },
                "60%": { transform: "translateY(-50%) translateX(0)" },
                "100%": { transform: "translateY(-50%) translateX(0)" },
              },
            }}
          >
            <ChevronRight fontSize="small" />
          </IconButton>
        </Tooltip>
      </>
    )}
  </>
)
