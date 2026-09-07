import { Tab, Tabs } from "@mui/material"
import {
  Person as PersonIcon,
  LocationOn as LocationOnIcon,
  School as SchoolIcon,
  MedicalServices as MedicalIcon,
  Warning as WarningIcon,
  People as PeopleIcon,
  FolderOpen as FolderOpenIcon,
  Info as InfoIcon,
} from "@mui/icons-material"
import { a11yProps } from "./TabPanel"

interface PersonaDetailTabsProps {
  activeTab: number
  handleTabChange: (event: React.SyntheticEvent, newValue: number) => void
  fullScreen: boolean
}

export function PersonaDetailTabs({ activeTab, handleTabChange, fullScreen }: PersonaDetailTabsProps) {
  return (
<Tabs
  value={activeTab}
  onChange={handleTabChange}
  variant={fullScreen ? "scrollable" : "scrollable"}
  scrollButtons="auto"
  sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}
>
  <Tab icon={<PersonIcon />} iconPosition="start" label="Personal" {...a11yProps(0)} />
  <Tab icon={<LocationOnIcon />} iconPosition="start" label="Ubicación" {...a11yProps(1)} />
  <Tab icon={<SchoolIcon />} iconPosition="start" label="Educación" {...a11yProps(2)} />
  <Tab icon={<MedicalIcon />} iconPosition="start" label="Salud" {...a11yProps(3)} />
  <Tab icon={<WarningIcon />} iconPosition="start" label="Vulnerabilidad" {...a11yProps(4)} />
  <Tab icon={<PeopleIcon />} iconPosition="start" label="Familia" {...a11yProps(5)} />
  <Tab icon={<FolderOpenIcon />} iconPosition="start" label="Legajo" {...a11yProps(6)} />
  <Tab icon={<InfoIcon />} iconPosition="start" label="Contexto" {...a11yProps(7)} />
</Tabs>
  )
}
