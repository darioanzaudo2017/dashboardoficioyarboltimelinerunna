"use client"

import { useParams } from "next/navigation"
import { MedidaArbolView } from "../components/medida/arbol/medida-arbol-view"

export default function MedidaArbolPage() {
  const params = useParams()
  const id = params.id as string
  const medidaId = params.medidaId as string

  return <MedidaArbolView legajoId={id} medidaId={medidaId} />
}
