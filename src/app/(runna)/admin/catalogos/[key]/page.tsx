"use client"

import React from "react"
import { useParams } from "next/navigation"
import { AdminGuard } from "../components/AdminGuard"
import { CatalogTable } from "../components/CatalogTable"
import { getCatalogByKey } from "../catalogos-registry"
import { Box, Paper, Typography, Button } from "@mui/material"
import { ArrowLeft, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function CatalogDetailPage() {
  const params = useParams()
  const key = Array.isArray(params?.key) ? params.key[0] : (params?.key as string)
  const catalog = getCatalogByKey(key)

  if (!catalog) {
    return (
      <AdminGuard>
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          <Paper elevation={0} className="p-8 text-center rounded-2xl border border-gray-200 bg-white flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <AlertCircle size={30} />
            </div>
            <Typography variant="h6" className="font-bold text-gray-900 mb-1">
              Catálogo no encontrado
            </Typography>
            <Typography variant="body2" className="text-gray-500 mb-6">
              No existe una configuración registrada para la clave &quot;{key}&quot;.
            </Typography>
            <Link href="/admin/catalogos" className="no-underline">
              <Button
                variant="contained"
                startIcon={<ArrowLeft size={16} />}
                sx={{
                  bgcolor: "#00457F",
                  "&:hover": { bgcolor: "#003866" },
                  textTransform: "none",
                  borderRadius: 2,
                }}
              >
                Volver al listado de catálogos
              </Button>
            </Link>
          </Paper>
        </div>
      </AdminGuard>
    )
  }

  return (
    <AdminGuard>
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <CatalogTable catalog={catalog} />
      </div>
    </AdminGuard>
  )
}
