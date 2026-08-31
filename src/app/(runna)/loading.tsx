import { Box, Container, Skeleton, Stack } from "@mui/material"

export default function RunnaLoading() {
  return (
    <Container component="main" maxWidth="xl" aria-busy="true" aria-label="Cargando pantalla" sx={{ py: 3 }}>
      <Stack spacing={2.5}>
        <Skeleton variant="text" width="min(55%, 420px)" height={48} />
        <Skeleton variant="rounded" height={112} />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: 2,
          }}
        >
          <Skeleton variant="rounded" height={180} />
          <Skeleton variant="rounded" height={180} />
          <Skeleton variant="rounded" height={180} />
        </Box>
        <Skeleton variant="rounded" height={320} />
      </Stack>
    </Container>
  )
}
