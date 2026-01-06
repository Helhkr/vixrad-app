"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { fetchTemplatesByExamType, type TemplateOption } from "@/features/templates";
import { useAppState, type ExamType } from "../state";
import { useSnackbar } from "../snackbar";

const examTypes = [
  { code: "CT", label: "Tomografia Computadorizada" },
  { code: "XR", label: "Radiografia" },
  { code: "US", label: "Ultrassonografia" },
  { code: "MR", label: "Ressonância Magnética" },
  { code: "MG", label: "Mamografia" },
  { code: "DXA", label: "Densitometria Óssea" },
  { code: "NM", label: "Medicina Nuclear" },
];

export default function TemplatesPage() {
  const router = useRouter();
  const { accessToken, examType, setExamType, templateId, setTemplateId } = useAppState();
  const { showMessage } = useSnackbar();
  const [options, setOptions] = useState<TemplateOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedExamType, setSelectedExamType] = useState<ExamType | null>(examType);

  useEffect(() => {
    if (!accessToken) {
      router.replace("/");
      return;
    }
  }, [accessToken, router]);

  useEffect(() => {
    if (!examType) {
      setSelectedExamType(null);
      setOptions([]);
      setTemplateId(null);
      return;
    }
    setSelectedExamType(examType);
  }, [examType, setTemplateId]);

  useEffect(() => {
    if (!accessToken) return;
    if (!selectedExamType) return;

    let cancelled = false;
    setLoading(true);

    fetchTemplatesByExamType(selectedExamType, accessToken)
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
  }, [accessToken, selectedExamType, showMessage]);

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

  const selectedExamTypeOption = useMemo(() => {
    return examTypes.find((t) => t.code === selectedExamType) ?? null;
  }, [selectedExamType]);

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        <Stack spacing={2}>
          <IconButton onClick={() => router.back()}>
            <ArrowBackIcon />
          </IconButton>

          <Typography variant="h6" component="h1">
            Seleção de Template
          </Typography>

          <Autocomplete
            options={examTypes}
            value={selectedExamTypeOption}
            getOptionLabel={(opt: { code: string; label: string }) => `${opt.code} — ${opt.label}`}
            isOptionEqualToValue={(a, b) => a.code === b.code}
            onChange={(_, value) => {
              const code = value?.code ?? null;
              setSelectedExamType(code as ExamType | null);
              setExamType(code as ExamType | null);
              setTemplateId(null);
              setOptions([]);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tipo de exame"
                helperText={!selectedExamType ? "Selecione para carregar templates" : undefined}
              />
            )}
          />

          <Autocomplete
            options={options}
            value={selected}
            getOptionLabel={(opt: TemplateOption) => `${opt.examType} — ${opt.label}`}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            onChange={(_, value) => setTemplateId(value?.id ?? null)}
            disabled={!selectedExamType}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Template"
                helperText={
                  !selectedExamType
                    ? "Selecione o tipo de exame primeiro"
                    : loading
                      ? "Carregando..."
                      : undefined
                }
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

      <Box mt={4} textAlign="center">
        <Button variant="text" color="error" onClick={() => router.push("/templates")}>
          INICIAR NOVO LAUDO
        </Button>
      </Box>
    </Container>
  );
}
