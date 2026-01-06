"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { apiPost } from "@/features/api";
import { formatReportForCopy, type CopyFormat } from "@/features/reportCopyFormat";
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
    contrast,
    sex,
    side,
    findings,
    setFindings,
    setReportText,
  } = useAppState();

  const { showMessage } = useSnackbar();

  const [loading, setLoading] = useState(false);

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

  const handleCopyNormal = async (format: CopyFormat) => {
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

    const trimmedFindings = findings.trim();
    if (!trimmedFindings) {
      showMessage("Preencha os achados.", "error");
      return;
    }

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
          <IconButton onClick={() => router.back()}>
            <ArrowBackIcon />
          </IconButton>

          <Typography variant="h6" component="h1">
            Achados
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Template: {templateId ?? "-"}
          </Typography>

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
