"use client"

import { Box, CircularProgress, Drawer, IconButton, Modal, Tooltip, Typography } from "@mui/material"
import { ArrowBack, Close as CloseIcon } from "@mui/icons-material"
import { LegajoDetail } from "./LegajoDetailLazy"

/** Panel derecho del modo lista en escritorio. */
export const LegajoDetailPane = ({
  selectedLegajoId,
  handleCloseModal,
}: {
  selectedLegajoId: number
  handleCloseModal: () => void
}) => (
  <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
    <Box
      sx={{
        px: 3,
        py: 1.5,
        borderBottom: "1px solid #e2e8f0",
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
        Legajo #{selectedLegajoId}
      </Typography>
      <Tooltip title="Cerrar">
        <IconButton size="small" onClick={handleCloseModal}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
    <Box sx={{ flex: 1, overflowY: "auto", p: { xs: 2, md: 3 } }}>
      <LegajoDetail
        params={{ id: selectedLegajoId.toString() }}
        onClose={handleCloseModal}
      />
    </Box>
  </Box>
)

/** Detalle a pantalla completa en mobile (modo lista). */
export const LegajoDetailDrawer = ({
  selectedLegajoId,
  handleCloseModal,
}: {
  selectedLegajoId: number | null
  handleCloseModal: () => void
}) => (
  <Drawer
    anchor="right"
    open={selectedLegajoId !== null}
    onClose={handleCloseModal}
    PaperProps={{ sx: { width: "100%", maxWidth: "100vw" } }}
  >
    <Box
      sx={{
        px: 2,
        py: 1.5,
        borderBottom: "1px solid #e2e8f0",
        display: "flex",
        alignItems: "center",
        gap: 1,
        position: "sticky",
        top: 0,
        bgcolor: "#fff",
        zIndex: 1,
      }}
    >
      <IconButton size="small" onClick={handleCloseModal} aria-label="Volver">
        <ArrowBack fontSize="small" />
      </IconButton>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>
        Legajo #{selectedLegajoId}
      </Typography>
    </Box>
    <Box sx={{ p: 2 }}>
      {selectedLegajoId && (
        <LegajoDetail
          params={{ id: selectedLegajoId.toString() }}
          onClose={handleCloseModal}
        />
      )}
    </Box>
  </Drawer>
)

/** Detalle en modal, usado únicamente por el modo tabla. */
export const LegajoDetailModal = ({
  open,
  selectedLegajoId,
  handleCloseModal,
}: {
  open: boolean
  selectedLegajoId: number | null
  handleCloseModal: () => void
}) => (
  <Modal open={open} onClose={handleCloseModal}>
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: { xs: "95%", md: "85%" },
        maxWidth: 1000,
        bgcolor: "#ffffff",
        p: { xs: 2, md: 4 },
        maxHeight: "90vh",
        overflowY: "auto",
        borderRadius: 3,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        border: "1px solid #e2e8f0",
      }}
    >
      {selectedLegajoId ? (
        <LegajoDetail params={{ id: selectedLegajoId.toString() }} onClose={handleCloseModal} />
      ) : (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  </Modal>
)
