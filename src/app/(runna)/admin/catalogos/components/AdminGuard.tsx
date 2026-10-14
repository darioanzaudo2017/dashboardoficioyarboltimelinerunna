"use client"

import React from "react"
import { useUserPermissions } from "@/app/(runna)/legajo-mesa/hooks/useUserPermissions"
import { useUser } from "@/utils/auth/userZustand"
import { Box, Typography, Button, Paper, CircularProgress } from "@mui/material"
import { ShieldAlert, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface AdminGuardProps {
  children: React.ReactNode
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { user } = useUser()
  const permissions = useUserPermissions()

  // Si el usuario aún no cargó
  if (user === undefined) {
    return (
      <Box className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <CircularProgress size={40} sx={{ color: "#00457F" }} />
        <Typography variant="body2" color="text.secondary">
          Verificando permisos de administración...
        </Typography>
      </Box>
    )
  }

  // Si no tiene permisos de administrador
  if (!permissions.isAdmin) {
    return (
      <Box className="max-w-xl mx-auto my-12 p-4">
        <Paper
          elevation={0}
          className="p-8 text-center rounded-2xl border border-red-100 bg-red-50/40 flex flex-col items-center"
        >
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4">
            <ShieldAlert size={36} />
          </div>
          <Typography variant="h5" className="font-bold text-gray-900 mb-2">
            Acceso Restringido
          </Typography>
          <Typography variant="body2" className="text-gray-600 mb-6 max-w-md">
            El módulo de administración de catálogos está reservado exclusivamente para
            usuarios con rol de Administrador.
          </Typography>
          <Link href="/mesadeentrada" className="no-underline">
            <Button
              variant="contained"
              startIcon={<ArrowLeft size={18} />}
              sx={{
                bgcolor: "#00457F",
                "&:hover": { bgcolor: "#003866" },
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                px: 3,
                py: 1,
              }}
            >
              Volver a Mesa de Entradas
            </Button>
          </Link>
        </Paper>
      </Box>
    )
  }

  return <>{children}</>
}
