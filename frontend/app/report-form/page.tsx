"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Paper from "@mui/material/Paper";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { apiPost } from "@/features/api";
import { useAppState } from "../state";

type GenerateResponse = {
  reportText: string;
};

export default function ReportFormPage() {
  const router = useRouter();
  const {
    accessToken,
    examType,
    templateId,
    indication,
    setIndication,
    findings,
    setFindings,
    contrast,
    setContrast,
    setReportText,
  } = useAppState();

  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  useEffect(() => {
    if (!accessToken) router.replace("/");
  }, [accessToken, router]);

  useEffect(() => {
    if (!templateId) router.replace("/templates");
  }, [templateId, router]);

  const submit = async () => {
    if (!accessToken || !templateId) return;

    setSnackbarOpen(false);
    setLoading(true);
    try {
      const data = await apiPost<GenerateResponse>(
        "/reports/generate",
        {
          examType,
          templateId,
          contrast,
          indication: indication || undefined,
          findings: findings || undefined,
        },
        accessToken,
      );

      setReportText(data.reportText);

      setSnackbarMessage("Laudo gerado com sucesso!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setTimeout(() => router.push("/report-result"), 250);
    } catch (e) {
      setSnackbarMessage(e instanceof Error ? e.message : "Erro ao gerar laudo");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6" component="h1">
            Indicação / Achados
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Template: {templateId ?? "-"}
          </Typography>

          <TextField
            label="Indicação"
            fullWidth
            multiline
            minRows={2}
            value={indication}
            onChange={(e) => setIndication(e.target.value)}
          />

          <TextField
            label="Achados"
            fullWidth
            multiline
            minRows={4}
            value={findings}
            onChange={(e) => setFindings(e.target.value)}
          />

          <FormControl>
            <FormLabel>Contraste</FormLabel>
            <RadioGroup
              row
              value={contrast}
              onChange={(e) => setContrast(e.target.value as "with" | "without")}
            >
              <FormControlLabel value="with" control={<Radio />} label="with" />
              <FormControlLabel value="without" control={<Radio />} label="without" />
            </RadioGroup>
          </FormControl>

          <Button variant="contained" disabled={loading} onClick={submit}>
            Gerar
          </Button>

          {loading ? (
            <Box display="flex" justifyContent="center" mt={1}>
              <CircularProgress />
            </Box>
          ) : null}

          <Snackbar
            open={snackbarOpen}
            autoHideDuration={4000}
            onClose={() => setSnackbarOpen(false)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          >
            <Alert severity={snackbarSeverity} onClose={() => setSnackbarOpen(false)}>
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </Stack>
      </Paper>
    </Container>
  );
}
