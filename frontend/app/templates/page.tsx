"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Alert from "@mui/material/Alert";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { fetchCtTemplates, type TemplateOption } from "@/features/templates";
import { useAppState } from "../state";

export default function TemplatesPage() {
  const router = useRouter();
  const { accessToken, templateId, setTemplateId } = useAppState();
  const [options, setOptions] = useState<TemplateOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  useEffect(() => {
    if (!accessToken) {
      router.replace("/");
      return;
    }

    let cancelled = false;
    setLoading(true);
    setSnackbarOpen(false);

    fetchCtTemplates(accessToken)
      .then((items) => {
        if (cancelled) return;
        setOptions(items);
      })
      .catch((e) => {
        if (cancelled) return;
        setSnackbarMessage(e instanceof Error ? e.message : "Erro ao carregar templates");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken, router]);

  const selected = useMemo(() => {
    return options.find((t) => t.id === templateId) ?? null;
  }, [options, templateId]);

  const next = () => {
    if (!templateId) {
      setSnackbarMessage("Selecione um template.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
    router.push("/report-form");
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6" component="h1">
            Seleção de Template (CT)
          </Typography>

          <Autocomplete
            options={options}
            value={selected}
            getOptionLabel={(opt: TemplateOption) => `${opt.examType} — ${opt.label}`}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            onChange={(_, value) => setTemplateId(value?.id ?? null)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Template"
                helperText={loading ? "Carregando..." : undefined}
              />
            )}
          />

          {loading ? (
            <Box display="flex" justifyContent="center" mt={1}>
              <CircularProgress />
            </Box>
          ) : null}

          <Button variant="contained" disabled={loading} onClick={next}>
            Continuar
          </Button>

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
