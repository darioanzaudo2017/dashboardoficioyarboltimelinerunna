/**
 * Mensajes de error del endpoint de configuración de dispositivo.
 *
 * `configuracion-mpj-section.tsx` y `configuracion-mpe-section.tsx` declaraban
 * este mismo objeto de siete claves, byte a byte idéntico salvo el valor de
 * `TIPO_MEDIDA_INVALIDO`, que nombra el tipo de medida. Son los mismos códigos
 * de error del mismo endpoint, así que la única diferencia se parametriza.
 */
export const buildConfiguracionErrorMessages = (
  tipoMedida: 'MPJ' | 'MPE'
): Record<string, string> => ({
  TIPO_MEDIDA_INVALIDO: `Esta medida no es de tipo ${tipoMedida}`,
  DATOS_REQUERIDOS: 'Debe proporcionar al menos un campo para actualizar',
  TIPO_DISPOSITIVO_INVALIDO: 'El tipo de dispositivo seleccionado no existe o está inactivo',
  SUBTIPO_DISPOSITIVO_INVALIDO: 'El subtipo de dispositivo seleccionado no existe o está inactivo',
  SUBTIPO_NO_COINCIDE: 'El subtipo no pertenece al tipo de dispositivo seleccionado',
  PERMISO_DENEGADO: 'No tiene permisos para modificar este legajo',
  SIN_INTERVENCION: 'No existe ninguna intervención para esta medida',
})
