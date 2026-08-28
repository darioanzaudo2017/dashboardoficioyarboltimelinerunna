"use client"

import { useParams } from "next/navigation"
import { LegajoArbolView } from "../legajo-arbol-view"

export default function LegajoArbolPage() {
  const params = useParams()
  const id = params.id as string

  return <LegajoArbolView legajoId={id} />
}
