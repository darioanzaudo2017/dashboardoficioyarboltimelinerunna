import { alpha } from "@mui/material"
import { gridClasses, type DataGridProps } from "@mui/x-data-grid"

/** Estilos del DataGrid de la bandeja de legajos (cabecera, filas, scrollbar). */
export const legajoGridSx: DataGridProps["sx"] = {
  border: "none",
  borderRadius: 2,
  cursor: "pointer",
  fontSize: "0.8125rem",
  // Header styling
  [`& .${gridClasses.columnHeaders}`]: {
    bgcolor: "#f8fafc",
    borderBottom: "2px solid #e2e8f0",
  },
  [`& .${gridClasses.columnHeader}`]: {
    fontWeight: 600,
    color: "#475569",
    fontSize: "0.8125rem",
    "&:focus, &:focus-within": {
      outline: "none",
    },
  },
  [`& .${gridClasses.columnHeaderTitle}`]: {
    fontWeight: 600,
  },
  // Cell styling
  [`& .${gridClasses.cell}`]: {
    borderColor: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    "&:focus, &:focus-within": {
      outline: "none",
    },
  },
  // Row styling
  [`& .${gridClasses.row}`]: {
    borderBottom: "1px solid #f1f5f9",
    transition: "background-color 0.15s ease",
    "&:hover": {
      bgcolor: "#f8fafc",
    },
    "&.Mui-selected": {
      bgcolor: alpha("#1976d2", 0.08),
      "&:hover": {
        bgcolor: alpha("#1976d2", 0.12),
      },
    },
  },
  // Striped rows
  "& .row-even": {
    bgcolor: "#fafbfc",
  },
  // Highlighted pending rows
  "& .highlight-pending": {
    bgcolor: alpha("#6366f1", 0.06),
    borderLeft: "4px solid #6366f1",
    "&:hover": {
      bgcolor: alpha("#6366f1", 0.1),
    },
    "&.row-even": {
      bgcolor: alpha("#6366f1", 0.08),
    },
    [`& .${gridClasses.cell}`]: {
      color: "#3730a3",
    },
  },
  // Footer and pagination
  [`& .${gridClasses.footerContainer}`]: {
    borderTop: "2px solid #e2e8f0",
    bgcolor: "#f8fafc",
  },
  // Remove cell separator
  [`& .${gridClasses.columnSeparator}`]: {
    color: "#e2e8f0",
  },
  // Scrollbar styling
  "& ::-webkit-scrollbar": {
    width: 8,
    height: 8,
  },
  "& ::-webkit-scrollbar-thumb": {
    bgcolor: "#cbd5e1",
    borderRadius: 4,
    "&:hover": {
      bgcolor: "#94a3b8",
    },
  },
  "& ::-webkit-scrollbar-track": {
    bgcolor: "#f1f5f9",
  },
}
