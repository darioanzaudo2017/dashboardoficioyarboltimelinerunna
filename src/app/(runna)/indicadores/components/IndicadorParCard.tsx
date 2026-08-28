"use client"

/**
 * La planilla define pares de indicadores casi idénticos: "cantidad de
 * MEDIDAS según X" y "cantidad de NNyA con esas medidas según X, género y
 * edad" (ej. IP10/IP11, IP12/IP13, IP14/IP15, IP16/IP17). En vez de duplicar
 * la tarjeta, se combinan en una: el desglose principal ya muestra medidas +
 * NNyA lado a lado, y debajo van los mini-desgloses de género/edad de esa
 * misma población de NNyA.
 */
import type React from "react"
import { Grid } from "@mui/material"
import { IndicadorCard } from "./IndicadorCard"
import { DesgloseBarras } from "./DesgloseBarras"
import { DesglosePie } from "./DesglosePie"
import { contarPor, contarUnicos, porNnyaUnico } from "../lib/agrupar"
import { ORDEN_GRUPOS_ETARIOS } from "../lib/edad"
import { ORDEN_GENERO } from "../lib/constantes"
import type { MedidaEnriquecida } from "../lib/enriquecer"

interface IndicadorParCardProps {
  codigo: string
  titulo: string
  lista: MedidaEnriquecida[]
  dimensionTitulo: string
  dimensionSelector: (m: MedidaEnriquecida) => string | null | undefined
  dimensionOrden?: string[]
  incluirGeneroYEdad?: boolean
}

export const IndicadorParCard: React.FC<IndicadorParCardProps> = ({
  codigo,
  titulo,
  lista,
  dimensionTitulo,
  dimensionSelector,
  dimensionOrden,
  incluirGeneroYEdad = true,
}) => {
  const porDimension = contarPor(lista, dimensionSelector, dimensionOrden)

  const nnyaPorDimension = new Map<string, number>()
  for (const item of porDimension) {
    const sub = lista.filter((m) => (dimensionSelector(m) || "Sin dato") === item.label)
    nnyaPorDimension.set(item.label, contarUnicos(sub, (m) => m.nnyaId))
  }

  const nnyaUnicos = porNnyaUnico(lista)

  return (
    <IndicadorCard
      codigo={codigo}
      titulo={titulo}
      total={lista.length}
      totalLabel={`medidas · ${nnyaUnicos.length} NNyA`}
    >
      <DesgloseBarras
        titulo={dimensionTitulo}
        data={porDimension}
        secundario={(label) => nnyaPorDimension.get(label)}
        secundarioLabel="NNyA"
      />
      {incluirGeneroYEdad && (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <DesglosePie
              titulo="Por género (NNyA)"
              data={contarPor(nnyaUnicos, (m) => m.genero, ORDEN_GENERO)}
              ordenColor={ORDEN_GENERO}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DesgloseBarras
              titulo="Por grupo etario (NNyA)"
              data={contarPor(nnyaUnicos, (m) => m.grupoEtario, ORDEN_GRUPOS_ETARIOS)}
              ordenColor={ORDEN_GRUPOS_ETARIOS}
            />
          </Grid>
        </Grid>
      )}
    </IndicadorCard>
  )
}
