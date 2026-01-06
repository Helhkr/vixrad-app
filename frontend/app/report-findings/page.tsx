"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { apiPost } from "@/features/api";
import { formatReportForCopy, type CopyFormat } from "@/features/reportCopyFormat";
import { fetchTemplateDetail, type TemplateDetail } from "@/features/templates";
import { useAppState } from "../state";
import { useSnackbar } from "../snackbar";

type GenerateResponse = {
  reportText: string;
};

export default function ReportFindingsPage() {
  const router = useRouter();
  const {
    accessToken,
    examType,
    templateId,
    indication,
    setIndication,
    contrast,
    setContrast,
    sex,
    setSex,
    side,
    setSide,
    findings,
    setFindings,
    setReportText,
  } = useAppState();

  const { showMessage } = useSnackbar();

  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState<TemplateDetail | null>(null);
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  const options: Array<{ label: string; format: CopyFormat }> = [
    { label: "Formatação padrão", format: "formatted" },
    { label: "Sem formatação", format: "plain" },
    { label: "Copiar como markdown", format: "markdown" },
  ];

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFormat, setSelectedFormat] = useState<CopyFormat>("formatted");

  useEffect(() => {
    if (!accessToken) router.replace("/");
  }, [accessToken, router]);

  useEffect(() => {
    if (!examType) router.replace("/templates");
  }, [examType, router]);

  useEffect(() => {
    if (!templateId) router.replace("/templates");
  }, [templateId, router]);

  useEffect(() => {
    if (!accessToken || !templateId) return;

    let cancelled = false;
    setLoadingTemplate(true);

    fetchTemplateDetail(templateId, accessToken)
      .then((t) => {
        if (cancelled) return;
        setTemplate(t);
      })
      .catch((e) => {
        if (cancelled) return;
        showMessage(e instanceof Error ? e.message : "Erro ao carregar template", "error");
        router.replace("/templates");
      })
      .finally(() => {
        if (cancelled) return;
        setLoadingTemplate(false);
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken, router, showMessage, templateId]);

  const requires = template?.requires;

  const showIndication = requires ? requires.indication !== "none" && requires.indication !== "fixed" : true;
  const showContrast = requires ? requires.contrast !== "none" && requires.contrast !== "fixed" : true;
  const showSex = requires ? requires.sex !== "none" && requires.sex !== "fixed" : false;
  const showSide = requires ? requires.side !== "none" && requires.side !== "fixed" : false;

  const templateLabel = useMemo(() => {
    if (!templateId) return "-";
    return template?.name ?? templateId;
  }, [template?.name, templateId]);

  const validateTemplateInputs = (opts: { requireFindings: boolean }): boolean => {
    if (!requires) {
      showMessage("Aguarde carregar o template.", "error");
      return false;
    }

    if (requires.indication === "required" && !indication.trim()) {
      showMessage("Preencha a indicação.", "error");
      return false;
    }

    if (requires.contrast === "required" && !contrast) {
      showMessage("Selecione o contraste.", "error");
      return false;
    }

    if (requires.sex === "required" && !sex) {
      showMessage("Selecione o sexo.", "error");
      return false;
    }

    if (requires.side === "required" && !side) {
      showMessage("Selecione o lado.", "error");
      return false;
    }

    if (opts.requireFindings && !findings.trim()) {
      showMessage("Preencha os achados.", "error");
      return false;
    }

    return true;
  };

  const handleCopyNormal = async (format: CopyFormat) => {
    if (!accessToken || !examType || !templateId) return;
    if (!validateTemplateInputs({ requireFindings: false })) return;

    setLoading(true);
    try {
      const data = await apiPost<GenerateResponse>(
        "/reports/generate",
        {
          examType,
          templateId,
          contrast,
          indication: indication || undefined,
          sex: sex || undefined,
          side: side || undefined,
          findings: null,
        },
        accessToken,
      );

      setReportText(data.reportText);

      const output = formatReportForCopy(data.reportText, format);
      await navigator.clipboard.writeText(output);
      showMessage("Laudo normal copiado!", "success");
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "Erro ao gerar laudo", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateWithAI = async () => {
    if (!accessToken || !examType || !templateId) return;

    if (!validateTemplateInputs({ requireFindings: true })) return;

    const trimmedFindings = findings.trim();

    setLoading(true);
    try {
      const data = await apiPost<GenerateResponse>(
        "/reports/generate",
        {
          examType,
          templateId,
          contrast,
          indication: indication || undefined,
          sex: sex || undefined,
          side: side || undefined,
          findings: trimmedFindings,
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
      <Paper elevation={2} sx={{ p: 4 }}>
        <Stack spacing={2}>
          <IconButton
            onClick={() => router.back()}
            sx={(theme) => ({
              alignSelf: "flex-start",
              color: theme.palette.primary.main,
              "&:hover": {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
              },
            })}
          >
            <ArrowCircleLeftIcon />
          </IconButton>

          <Typography variant="h6" component="h1">
            Achados
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Template: {templateLabel}
          </Typography>

          {loadingTemplate ? (
            <Box display="flex" justifyContent="center" mt={1}>
              <CircularProgress />
            </Box>
          ) : null}

          {showIndication ? (
            <TextField
              label="Indicação"
              fullWidth
              multiline
              minRows={2}
              value={indication}
              onChange={(e) => setIndication(e.target.value)}
            />
          ) : null}

          {showContrast ? (
            <FormControl>
              <FormLabel>Contraste</FormLabel>
              <RadioGroup
                row
                value={contrast}
                onChange={(e) => setContrast(e.target.value as "with" | "without")}
              >
                <FormControlLabel value="with" control={<Radio />} label="COM" />
                <FormControlLabel value="without" control={<Radio />} label="SEM" />
              </RadioGroup>
            </FormControl>
          ) : null}

          {showSex ? (
            <FormControl>
              <FormLabel>Sexo</FormLabel>
              <RadioGroup row value={sex ?? ""} onChange={(e) => setSex(e.target.value as "M" | "F")}>
                <FormControlLabel value="M" control={<Radio />} label="Masculino" />
                <FormControlLabel value="F" control={<Radio />} label="Feminino" />
              </RadioGroup>
            </FormControl>
          ) : null}

          {showSide ? (
            <FormControl>
              <FormLabel>Lado</FormLabel>
              <RadioGroup
                row
                value={side ?? ""}
                onChange={(e) => setSide(e.target.value as "RIGHT" | "LEFT")}
              >
                <FormControlLabel value="RIGHT" control={<Radio />} label="Direito" />
                <FormControlLabel value="LEFT" control={<Radio />} label="Esquerdo" />
              </RadioGroup>
            </FormControl>
          ) : null}

          <TextField
            label="Achados"
            fullWidth
            multiline
            minRows={6}
            value={findings}
            onChange={(e) => setFindings(e.target.value)}
          />

          <Stack direction="row" spacing={2}>
            <ButtonGroup variant="contained" disabled={loading}>
              <Button onClick={() => handleCopyNormal(selectedFormat)}>COPIAR LAUDO NORMAL</Button>
              <Button onClick={(e) => setAnchorEl(e.currentTarget)}>
                <ArrowDropDownIcon />
              </Button>
            </ButtonGroup>

            <Button
              variant="contained"
              color="primary"
              endIcon={<ArrowCircleRightIcon />}
              disabled={loading}
              onClick={handleGenerateWithAI}
            >
              GERAR COM IA
            </Button>
          </Stack>

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            {options.map((opt) => (
              <MenuItem
                key={opt.format}
                onClick={() => {
                  setSelectedFormat(opt.format);
                  setAnchorEl(null);
                  void handleCopyNormal(opt.format);
                }}
              >
                {opt.label}
              </MenuItem>
            ))}
          </Menu>

          {loading ? (
            <Box display="flex" justifyContent="center" mt={1}>
              <CircularProgress />
            </Box>
          ) : null}
        </Stack>
      </Paper>

      <Box mt={4} textAlign="center">
        <Button
          variant="text"
          color="error"
          onClick={() => router.push("/templates")}
        >
          INICIAR NOVO LAUDO
        </Button>
      </Box>
    </Container>
  );
}
