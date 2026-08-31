"use client"

import Link from "next/link"
import { Alert, AlertTitle, Box, Button, Container } from "@mui/material"

interface RunnaErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function RunnaError({ error, reset }: RunnaErrorProps) {
  return (
    <Container component="main" maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
      <Alert severity="error" role="alert">
        <AlertTitle>No se pudo cargar esta pantalla</AlertTitle>
        Ocurrió un problema al consultar la información. Puede reintentar sin perder la sesión.
        {error.digest && (
          <Box component="span" sx={{ display: "block", mt: 1, color: "text.secondary" }}>
            Referencia: {error.digest}
          </Box>
        )}
      </Alert>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mt: 3 }}>
        <Button variant="contained" onClick={reset}>
          Reintentar
        </Button>
        <Button component={Link} href="/mesadeentrada" variant="outlined">
          Ir a Mesa de Entradas
        </Button>
      </Box>
    </Container>
  )
}
