"use client"

import React from "react"
import { AdminGuard } from "./components/AdminGuard"
import { CatalogIndex } from "./components/CatalogIndex"

export default function CatalogosPage() {
  return (
    <AdminGuard>
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <CatalogIndex />
      </div>
    </AdminGuard>
  )
}
