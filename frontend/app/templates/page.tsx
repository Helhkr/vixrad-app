"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { fetchCtTemplates, type TemplateOption } from "@/features/templates";
import { useAppState } from "../state";
import { useSnackbar } from "../snackbar";

export default function TemplatesPage() {
  const router = useRouter();
  const { accessToken, templateId, setTemplateId } = useAppState();
  const { showMessage } = useSnackbar();
  const [options, setOptions] = useState<TemplateOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!accessToken) {
      router.replace("/");
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetchCtTemplates(accessToken)
      .then((items) => {
        if (cancelled) return;
        setOptions(items);
      })
      .catch((e) => {
        if (cancelled) return;
        showMessage(e instanceof Error ? e.message : "Erro ao carregar templates", "error");
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
      showMessage("Selecione um template.", "error");
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
        </Stack>
      </Paper>
    </Container>
  );
}
