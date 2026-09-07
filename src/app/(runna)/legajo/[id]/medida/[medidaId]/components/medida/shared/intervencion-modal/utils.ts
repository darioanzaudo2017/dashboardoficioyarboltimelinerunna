// Get display name for workflow phase
export const getWorkflowPhaseDisplayName = (phase?: string): string => {
    const names: Record<string, string> = {
        'apertura': 'Apertura',
        'innovacion': 'Innovación',
        'prorroga': 'Prórroga',
        'cese': 'Cese'
    }
    return phase ? (names[phase] || phase) : ''
}
