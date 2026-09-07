"use client"

import dynamic from "next/dynamic"

// Dynamically import DemandaDetail with no SSR to avoid hydration issues
export const DemandaDetail = dynamic(() => import("../../../../demanda/DemandaDetail"), { ssr: false })
