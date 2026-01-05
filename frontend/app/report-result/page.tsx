"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { useAppState } from "../state";

export default function ReportResultPage() {
  const router = useRouter();
  const { reportText, resetReport } = useAppState();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!reportText) router.replace("/report-form");
  }, [reportText, router]);

  const copy = async () => {
    setCopied(false);
    await navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const startOver = () => {
    resetReport();
    router.push("/templates");
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Stack spacing={2}>
        <Typography variant="h6" component="h1">
          Laudo
        </Typography>

        <Paper sx={{ p: 2, whiteSpace: "pre-wrap" }}>{reportText}</Paper>

        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={copy}>
            Copiar laudo normal
          </Button>
          <Button variant="contained" onClick={startOver}>
            Novo laudo
          </Button>
        </Stack>

        {copied ? (
          <Typography variant="body2" color="text.secondary">
            Copiado.
          </Typography>
        ) : null}
      </Stack>
    </Container>
  );
}
