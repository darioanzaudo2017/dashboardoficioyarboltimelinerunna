import type { DataGridProps } from "@mui/x-data-grid"
import { institutionalColors } from "@/theme/colors"

/** Traducciones al español del DataGrid de la Mesa de Entradas. */
export const demandaGridLocaleText: DataGridProps["localeText"] = {
  // Toolbar
  toolbarFilters: 'Filtro de Demandas',
  toolbarFiltersLabel: 'Mostrar filtro de demandas',
  toolbarExport: 'Exportar',
  toolbarColumns: 'Columnas',
  toolbarDensity: 'Densidad',

  // Filters
  filterPanelAddFilter: 'Agregar filtro',
  filterPanelRemoveAll: 'Eliminar todos',
  filterPanelDeleteIconLabel: 'Eliminar',
  filterPanelOperator: 'Operador',
  filterPanelOperatorAnd: 'Y',
  filterPanelOperatorOr: 'O',
  filterPanelColumns: 'Columnas',
  filterPanelInputLabel: 'Valor',
  filterPanelInputPlaceholder: 'Filtrar valor',

  // Filter operators
  filterOperatorContains: 'contiene',
  filterOperatorEquals: 'es igual',
  filterOperatorStartsWith: 'comienza con',
  filterOperatorEndsWith: 'termina con',
  filterOperatorIs: 'es',
  filterOperatorNot: 'no es',
  filterOperatorAfter: 'es posterior',
  filterOperatorOnOrAfter: 'es en o posterior',
  filterOperatorBefore: 'es anterior',
  filterOperatorOnOrBefore: 'es en o anterior',
  filterOperatorIsEmpty: 'está vacío',
  filterOperatorIsNotEmpty: 'no está vacío',
  filterOperatorIsAnyOf: 'es cualquiera de',

  // Pagination
  MuiTablePagination: {
    labelRowsPerPage: 'Filas por página:',
    labelDisplayedRows: ({ from, to, count }) => `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`,
  },

  // Column menu
  columnMenuLabel: 'Menú',
  columnMenuShowColumns: 'Mostrar columnas',
  columnMenuFilter: 'Filtro',
  columnMenuHideColumn: 'Ocultar',
  columnMenuUnsort: 'Desordenar',
  columnMenuSortAsc: 'Ordenar ASC',
  columnMenuSortDesc: 'Ordenar DESC',

  // Column header
  columnHeaderFiltersTooltipActive: (count) => count !== 1 ? `${count} filtros activos` : `${count} filtro activo`,
  columnHeaderFiltersLabel: 'Mostrar filtros',
  columnHeaderSortIconLabel: 'Ordenar',

  // Rows
  noRowsLabel: 'Sin filas',
  noResultsOverlayLabel: 'No se encontraron resultados.',

  // Footer
  footerRowSelected: (count) => count !== 1
    ? `${count.toLocaleString()} filas seleccionadas`
    : `${count.toLocaleString()} fila seleccionada`,
  footerTotalRows: 'Filas Totales:',
  footerTotalVisibleRows: (visibleCount, totalCount) =>
    `${visibleCount.toLocaleString()} de ${totalCount.toLocaleString()}`,
}

/** Estilos del DataGrid: cabecera, celdas y barra de color por estado_demanda. */
export const demandaGridSx: DataGridProps["sx"] = {
  cursor: "pointer",
  "& .MuiDataGrid-columnHeaders": {
    backgroundColor: "#f5f5f5",
    borderBottom: "2px solid #e0e0e0",
  },
  "& .MuiDataGrid-cell": {
    padding: "8px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  "& .MuiDataGrid-row": {
    position: "relative",
    transition: "background-color 0.2s",
    "&:hover": {
      backgroundColor: "rgba(25, 118, 210, 0.04)",
    },
    "&::before": {
      content: '""',
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: "7px",
    },
  },
  // Add specific styles for each estado_demanda
  "& .row-sin-asignar::before": {
    backgroundColor: "#e0e0e0",
  },
  "& .row-constatacion::before": {
    backgroundColor: "#4caf50",
  },
  "& .row-evaluacion::before": {
    backgroundColor: "#2196f3",
  },
  "& .row-pendiente-autorizacion::before": {
    backgroundColor: "#ff9800",
  },
  "& .row-archivada::before": {
    backgroundColor: "#9e9e9e",
  },
  "& .row-admitida::before": {
    backgroundColor: "#673ab7",
  },
  "& .row-respuesta-sin-enviar::before": {
    backgroundColor: "#f44336",
  },
  "& .row-informe-sin-enviar::before": {
    backgroundColor: "#ecff0c",
  },
  "& .row-repuesta-enviada::before": {
    backgroundColor: "#8bc34a",
  },
  "& .row-informe-enviado::before": {
    backgroundColor: institutionalColors.azulClaro,
  },
  // Add style for non-received rows
  "& .row-not-received": {
    fontWeight: "500",
  },
  // Add a new style for received rows
  "& .row-received": {
    color: "#666666",
  },
}
