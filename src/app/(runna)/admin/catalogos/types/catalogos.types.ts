import type { GridColDef } from "@mui/x-data-grid"

export type FormFieldType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "select"
  | "catalog-select"

export interface SelectOption {
  value: string | number
  label: string
}

export interface FormFieldConfig {
  name: string
  label: string
  type: FormFieldType
  required?: boolean
  placeholder?: string
  helperText?: string
  defaultValue?: any
  /** Para tipo 'select' estático */
  options?: SelectOption[]
  /** Para tipo 'catalog-select': endpoint desde donde cargar las opciones (ej: 'tipos-oficio/') */
  catalogEndpoint?: string
  /** Clave de etiqueta a mostrar en el select de catálogo (default: 'nombre') */
  catalogLabelKey?: string
  /** Clave de valor a guardar en el form (default: 'id') */
  catalogValueKey?: string
  /** Dependencia condicional (ej: solo visible si form[dependsOn] === dependsValue) */
  dependsOn?: string
  dependsValue?: any
  /** Si el campo ocupa ancho completo en la grilla del formulario */
  fullWidth?: boolean
}

export interface CatalogConfig {
  key: string
  label: string
  description?: string
  endpoint: string
  editable: boolean
  parentKey?: string
  /** Campos para búsqueda rápida en el cliente */
  searchFields?: string[]
  /** Columnas para el DataGrid */
  columns: GridColDef[]
  /** Configuración de campos para el formulario (si editable: true) */
  formFields?: FormFieldConfig[]
  /** Método de actualización si no soporta PUT (por defecto PATCH via update) */
  updateMethod?: "PATCH" | "PUT"
  /** Nombre singular para textos (ej: 'Tipo de Oficio') */
  singularLabel?: string
  /**
   * Si el catálogo tiene un campo booleano de baja lógica (ej: "activo"), el
   * botón "Eliminar" hace PATCH a `{ [softDeleteField]: false }` en vez de
   * DELETE físico — evita romper actividades/legajos reales que ya referencian
   * el registro por FK. Sin este campo, "Eliminar" hace DELETE real.
   */
  softDeleteField?: string
}
