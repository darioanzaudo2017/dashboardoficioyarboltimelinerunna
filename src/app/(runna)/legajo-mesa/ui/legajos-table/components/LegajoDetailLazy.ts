"use client"

import dynamic from "next/dynamic"

// Dynamically import LegajoDetail with no SSR to avoid hydration issues
export const LegajoDetail = dynamic(() => import("../../../../legajo/legajo-detail"), { ssr: false })
