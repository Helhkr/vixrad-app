"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { apiPost } from "@/features/api";
import { useAppState } from "../state";
import { useSnackbar } from "../snackbar";

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

  const { showMessage } = useSnackbar();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!accessToken) router.replace("/");
  }, [accessToken, router]);

  useEffect(() => {
    if (!examType) router.replace("/templates");
  }, [examType, router]);

  useEffect(() => {
    if (!templateId) router.replace("/templates");
  }, [templateId, router]);

  const submit = async () => {
    if (!accessToken || !examType || !templateId) return;

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

      showMessage("Laudo gerado com sucesso!", "success");
      router.push("/report-result");
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "Erro ao gerar laudo", "error");
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
        </Stack>
      </Paper>
    </Container>
  );
}
