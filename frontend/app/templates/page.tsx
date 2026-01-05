"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { CT_TEMPLATES, type TemplateOption } from "@/features/templates";
import { useAppState } from "../state";

export default function TemplatesPage() {
  const router = useRouter();
  const { templateId, setTemplateId } = useAppState();
  const [error, setError] = useState<string | null>(null);

  const selected = useMemo(() => {
    return CT_TEMPLATES.find((t) => t.id === templateId) ?? null;
  }, [templateId]);

  const next = () => {
    setError(null);
    if (!templateId) {
      setError("Selecione um template.");
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
            options={CT_TEMPLATES}
            value={selected}
            getOptionLabel={(opt: TemplateOption) => opt.label}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            onChange={(_, value) => setTemplateId(value?.id ?? null)}
            renderInput={(params) => <TextField {...params} label="Template" />}
          />

          {error ? (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          ) : null}

          <Button variant="contained" onClick={next}>
            Continuar
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}
