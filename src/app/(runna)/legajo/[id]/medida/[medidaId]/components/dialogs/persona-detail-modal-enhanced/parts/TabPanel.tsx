import { Box } from "@mui/material"
import type { TabPanelProps } from "../types"

export function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`persona-tabpanel-${index}`}
      aria-labelledby={`persona-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

export function a11yProps(index: number) {
  return {
    id: `persona-tab-${index}`,
    "aria-controls": `persona-tabpanel-${index}`,
  }
}
