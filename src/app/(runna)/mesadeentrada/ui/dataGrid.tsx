"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Paper, Box, Typography, Skeleton } from "@mui/material"
import { useUser } from "@/utils/auth/userZustand"

import DemandaTableContent from "./dataGrid/DemandaTableContent"


const DemandaTable: React.FC = () => {
  const user = useUser((state) => state.user)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user has the permission
  const hasViewPermission = user?.all_permissions?.includes('view_tdemanda') ||
    user?.is_superuser ||
    user?.is_staff

  useEffect(() => {
    // Simulate a small delay to show the skeleton
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <Paper sx={{ p: 2, width: '100%' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Skeleton variant="rectangular" height={40} width="30%" />
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Skeleton variant="rectangular" height={36} width={120} />
            <Skeleton variant="rectangular" height={36} width={120} />
            <Skeleton variant="rectangular" height={36} width={120} />
          </Box>
          <Skeleton variant="rectangular" height={400} />
        </Box>
      </Paper>
    )
  }

  if (!hasViewPermission) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          No tiene permisos para ver las demandas
        </Typography>
      </Box>
    )
  }

  return <DemandaTableContent />
}

export default DemandaTable
