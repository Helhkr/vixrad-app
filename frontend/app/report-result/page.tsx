"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { useAppState } from "../state";

export default function ReportResultPage() {
  const router = useRouter();
  const { reportText } = useAppState();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    setCopied(false);
    await navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  if (!reportText) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Stack spacing={2}>
          <IconButton onClick={() => router.back()}>
            <ArrowBackIcon />
          </IconButton>

          <Alert severity="error">Nenhum laudo disponível. Gere um laudo novamente.</Alert>
          <Button variant="contained" onClick={() => router.replace("/report-form")}
          >
            Voltar
          </Button>

          <Box mt={4} textAlign="center">
            <Button variant="text" color="error" onClick={() => router.push("/templates")}>
              INICIAR NOVO LAUDO
            </Button>
          </Box>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Stack spacing={2}>
        <IconButton onClick={() => router.back()}>
          <ArrowBackIcon />
        </IconButton>

        <Typography variant="h6" component="h1">
          Laudo
        </Typography>

        <Paper sx={{ p: 2, whiteSpace: "pre-wrap" }}>{reportText}</Paper>

        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={copy}>
            Copiar laudo normal
          </Button>
        </Stack>

        {copied ? (
          <Typography variant="body2" color="text.secondary">
            Copiado.
          </Typography>
        ) : null}

        <Box mt={4} textAlign="center">
          <Button variant="text" color="error" onClick={() => router.push("/templates")}>
            INICIAR NOVO LAUDO
          </Button>
        </Box>
      </Stack>
    </Container>
  );
}
