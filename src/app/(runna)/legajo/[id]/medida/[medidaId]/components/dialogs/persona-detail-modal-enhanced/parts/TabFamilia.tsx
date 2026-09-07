import { PersonasRelacionadasSection } from "../../../personas-relacionadas"
import type { LegajoData, PersonaData } from "../types"

interface TabFamiliaProps {
  legajo: LegajoData | undefined
  persona: PersonaData | undefined
  readOnly: boolean
}

export function TabFamilia({ legajo, persona, readOnly }: TabFamiliaProps) {
  return (
  <PersonasRelacionadasSection
    legajoId={legajo?.id || 0}
    nnyaId={persona?.id || 0}
    readOnly={readOnly}
    canEdit={!readOnly}
  />
  )
}
