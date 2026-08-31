import Link from "next/link"
import { Box, Button, Container, Typography } from "@mui/material"

export default function NotFound() {
  return (
    <Container component="main" maxWidth="sm" sx={{ py: { xs: 6, md: 12 }, textAlign: "center" }}>
      <Typography component="h1" variant="h3" gutterBottom>
        Página no encontrada
      </Typography>
      <Typography color="text.secondary">
        La dirección no existe o el registro solicitado ya no está disponible.
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Button component={Link} href="/mesadeentrada" variant="contained">
          Volver a Mesa de Entradas
        </Button>
      </Box>
    </Container>
  )
}
