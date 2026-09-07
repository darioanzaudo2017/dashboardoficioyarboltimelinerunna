"use client"

import { Box, CircularProgress, Drawer, IconButton, Modal, Tooltip, Typography } from "@mui/material"
import { ArrowBack, Close as CloseIcon } from "@mui/icons-material"
import { DemandaDetail } from "./DemandaDetailLazy"

/** Panel derecho del modo lista en escritorio. */
export const DemandaDetailPane = ({
  selectedDemandaId,
  onClose,
}: {
  selectedDemandaId: number
  onClose: () => void
}) => (
  <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
    <Box
      sx={{
        px: 3,
        py: 1.5,
        borderBottom: "1px solid #e0e0e0",
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        bgcolor: "#fff",
        position: "sticky",
        top: 0,
        zIndex: 1,
      }}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>
        Demanda #{selectedDemandaId}
      </Typography>
      <Tooltip title="Cerrar">
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
    <Box sx={{ flex: 1, overflowY: "auto", p: { xs: 2, md: 3 } }}>
      <DemandaDetail
        params={{ id: selectedDemandaId.toString() }}
        onClose={onClose}
      />
    </Box>
  </Box>
)

/** Detalle a pantalla completa en mobile (modo lista). */
export const DemandaDetailDrawer = ({
  selectedDemandaId,
  onClose,
}: {
  selectedDemandaId: number | null
  onClose: () => void
}) => (
  <Drawer
    anchor="right"
    open={selectedDemandaId !== null}
    onClose={onClose}
    PaperProps={{ sx: { width: "100%", maxWidth: "100vw" } }}
  >
    <Box
      sx={{
        px: 2,
        py: 1.5,
        borderBottom: "1px solid #e0e0e0",
        display: "flex",
        alignItems: "center",
        gap: 1,
        position: "sticky",
        top: 0,
        bgcolor: "#fff",
        zIndex: 1,
      }}
    >
      <IconButton size="small" onClick={onClose} aria-label="Volver">
        <ArrowBack fontSize="small" />
      </IconButton>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>
        Demanda #{selectedDemandaId}
      </Typography>
    </Box>
    <Box sx={{ p: 2 }}>
      {selectedDemandaId && (
        <DemandaDetail
          params={{ id: selectedDemandaId.toString() }}
          onClose={onClose}
        />
      )}
    </Box>
  </Drawer>
)

/** Detalle en modal, usado únicamente por el modo tabla. */
export const DemandaDetailModal = ({
  open,
  selectedDemandaId,
  onClose,
}: {
  open: boolean
  selectedDemandaId: number | null
  onClose: () => void
}) => (
  <Modal
    open={open}
    aria-labelledby="demanda-detail-modal"
    aria-describedby="demanda-detail-description"
    onClose={(_event, reason) => {
      if (reason !== "backdropClick") {
        onClose()
      }
    }}
  >
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: { xs: "95%", sm: "90%", md: "80%" },
        maxWidth: 900,
        bgcolor: "background.paper",
        boxShadow: 24,
        p: { xs: 2, sm: 4 },
        maxHeight: "90vh",
        overflowY: "auto",
        borderRadius: 2,
      }}
    >
      {selectedDemandaId ? (
        <DemandaDetail params={{ id: selectedDemandaId.toString() }} onClose={onClose} />
      ) : (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  </Modal>
)
