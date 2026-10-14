"use client"

/**
 * Restyled "Módulos activos" row (Phase 3 of the `medidas_interactivo` redesign).
 *
 * Renders the module set (plan de trabajo / control de legalidad / informes
 * mensuales / historial) as MUI Tabs: un solo módulo visible a la vez, en vez
 * de las pastillas que se podían abrir todas juntas (confundía qué sección
 * estaba "activa" cuando dos quedaban abiertas al mismo tiempo). Cada módulo
 * sigue envolviendo un componente EXISTENTE — esto es solo el chrome.
 *
 * Solo se monta el contenido de la tab activa, así las que no se ven no
 * disparan sus fetches.
 */
import { useState } from "react"
import type React from "react"
import { Box, Paper, Tab, Tabs, Typography } from "@mui/material"
import { MEDIDA_COLORS } from "./medida-theme"

export type ModuloVariant = "blue" | "teal" | "pink"

export interface ModuloDef {
  key: string
  label: string
  /** Short glyph rendered before the label (e.g. "▦", "⊘", "≡"). */
  icon?: string
  variant: ModuloVariant
  /** Optional small note pill after the label (e.g. "incluye etapas"). */
  note?: string
  content: React.ReactNode
}

interface MedidaModulosRowProps {
  modules: ModuloDef[]
  /** Keys de módulos a preferir para la tab inicial (se usa el primero que exista). */
  defaultOpen?: string[]
}

const VARIANT_STYLES: Record<ModuloVariant, { border: string; bg: string; color: string }> = {
  blue: { border: "#93C5FD", bg: "#EFF6FF", color: "#1E40AF" },
  teal: { border: "#99F6E4", bg: "#F0FDFA", color: "#134E4A" },
  pink: { border: "#F9A8D4", bg: "#FDF2F8", color: "#831843" },
}

export const MedidaModulosRow: React.FC<MedidaModulosRowProps> = ({ modules, defaultOpen = [] }) => {
  const initialKey = defaultOpen.find((key) => modules.some((m) => m.key === key)) ?? modules[0]?.key
  const [activeKey, setActiveKey] = useState<string | undefined>(initialKey)

  const activeModule = modules.find((m) => m.key === activeKey) ?? modules[0]

  if (!activeModule) return null

  return (
    <Paper
      elevation={0}
      sx={{ mb: 3, maxWidth: "100%", borderRadius: "12px", border: `1px solid ${MEDIDA_COLORS.border}`, overflow: "hidden" }}
    >
      <Box sx={{ p: { xs: "12px 12px 0", sm: "14px 20px 0" } }}>
        <Typography
          sx={{
            fontSize: 10,
            fontWeight: 600,
            color: MEDIDA_COLORS.text4,
            textTransform: "uppercase",
            letterSpacing: ".07em",
            mb: "10px",
          }}
        >
          Módulos activos
        </Typography>
      </Box>

      <Tabs
        value={activeModule.key}
        onChange={(_, key) => setActiveKey(key)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{
          minHeight: 0,
          px: { xs: "8px", sm: "16px" },
          borderBottom: `1px solid ${MEDIDA_COLORS.border}`,
          "& .MuiTabs-indicator": {
            height: 3,
            borderRadius: "3px 3px 0 0",
            bgcolor: VARIANT_STYLES[activeModule.variant].color,
          },
        }}
      >
        {modules.map((m) => {
          const v = VARIANT_STYLES[m.variant]
          return (
            <Tab
              key={m.key}
              value={m.key}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: "7px" }}>
                  {m.icon && <span style={{ fontSize: 14 }}>{m.icon}</span>}
                  {m.label}
                  {m.note && (
                    <Box
                      component="span"
                      sx={{ fontSize: 9, px: "5px", py: "1px", borderRadius: "4px", bgcolor: "rgba(0,0,0,.07)" }}
                    >
                      {m.note}
                    </Box>
                  )}
                </Box>
              }
              sx={{
                minHeight: 44,
                py: "10px",
                fontSize: 12,
                fontWeight: 500,
                textTransform: "none",
                color: "text.secondary",
                "&.Mui-selected": { color: v.color, fontWeight: 700 },
              }}
            />
          )
        })}
      </Tabs>

      <Box sx={{ p: { xs: "12px", sm: "16px 20px" }, maxWidth: "100%", overflowX: "auto" }}>
        {activeModule.content}
      </Box>
    </Paper>
  )
}
