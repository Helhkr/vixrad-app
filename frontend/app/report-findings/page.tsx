"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
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

import { apiPost, apiPostForm } from "@/features/api";
import { formatReportForCopy, convertMarkdownToHtml, stripMarkdown, type CopyFormat } from "@/features/reportCopyFormat";
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
    indicationFile,
    contrast,
    mgType,
    sex,
    side,
    incidence,
    decubitus,
    ecgGating,
    phases,
    coil,
    sedation,
    artifactSourceEnabled,
    artifactSourceTypes,
    findings,
    setFindings,
    setReportText,
    urgent,
    academic,
    resetReport,
  } = useAppState();

  const { showMessage } = useSnackbar();
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();

  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState<TemplateDetail | null>(null);
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [micSupported, setMicSupported] = useState(false);
  const listeningStateRef = useRef<boolean>(false);

  useEffect(() => {
    if (browserSupportsSpeechRecognition === false) {
      setMicSupported(false);
      showMessage(
        "Seu navegador não suporta reconhecimento de voz. Use Chrome, Edge ou Opera.",
        "warning",
      );
    } else {
      setMicSupported(true);
    }
  }, [browserSupportsSpeechRecognition, showMessage]);

  const options: Array<{ label: string; format: CopyFormat }> = [
    { label: "Formatação padrão", format: "formatted" },
    { label: "Sem formatação", format: "plain" },
    { label: "Copiar como markdown", format: "markdown" },
  ];

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFormat, setSelectedFormat] = useState<CopyFormat>("formatted");

  const urgentNote = urgent ? "Exame realizado em caráter de urgência." : undefined;

  // Detectar quando pára de gravar (transição de listening true -> false)
  useEffect(() => {
    if (listeningStateRef.current && !listening && transcript) {
      // Parou de gravar - adicionar transcript com ponto final
      const trimmedTranscript = transcript.trim();
      const textWithPeriod = trimmedTranscript.endsWith(".") ? trimmedTranscript : `${trimmedTranscript}.`;
      setFindings(`${findings} ${textWithPeriod}`.trim());
      resetTranscript();
    }
    
    if (listening && !listeningStateRef.current) {
      // Começou a gravar - limpar transcript anterior
      resetTranscript();
    }
    
    listeningStateRef.current = listening;
  }, [listening, transcript, findings, setFindings, resetTranscript]);

  // Atalho de teclado: SHIFT + G para ativar/desativar gravação
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === "G") {
        e.preventDefault();
        if (listening) {
          SpeechRecognition.stopListening();
        } else if (micSupported) {
          SpeechRecognition.startListening({ continuous: true, language: "pt-BR" });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [listening, micSupported]);

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
        showMessage(e instanceof Error ? e.message : "Erro ao carregar modelo", "error");
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

  const templateLabel = useMemo(() => {
    if (!templateId) return "-";
    return template?.name ?? templateId;
  }, [template?.name, templateId]);

  const validateTemplateInputs = (opts: { requireFindings: boolean }): boolean => {
    if (!requires) {
      showMessage("Aguarde carregar o template.", "error");
      return false;
    }

    if (requires.type === "required" && !mgType) {
      showMessage("Selecione o tipo de mamografia no formulário.", "error");
      router.push("/report-form");
      return false;
    }

    if (requires.indication === "required" && !indication.trim()) {
      showMessage("Preencha a indicação no formulário.", "error");
      router.push("/report-form");
      return false;
    }

    if (requires.contrast === "required" && !contrast) {
      showMessage("Selecione o contraste no formulário.", "error");
      router.push("/report-form");
      return false;
    }

    if (requires.sex === "required" && !sex) {
      showMessage("Selecione o sexo no formulário.", "error");
      router.push("/report-form");
      return false;
    }

    if (requires.side === "required" && !side) {
      showMessage("Selecione o lado no formulário.", "error");
      router.push("/report-form");
      return false;
    }

    if (requires.incidence === "required" && !incidence) {
      showMessage("Selecione a incidência no formulário.", "error");
      router.push("/report-form");
      return false;
    }

    if (requires.decubitus === "required" && !decubitus) {
      showMessage("Selecione o decúbito no formulário.", "error");
      router.push("/report-form");
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

    const copyHtmlViaExecCommand = async (html: string, plainFallback: string) => {
      try {
        // Create temporary container and render HTML to DOM
        const el = document.createElement("div");
        el.setAttribute("contenteditable", "true");
        el.style.position = "fixed";
        el.style.left = "-9999px";
        el.style.top = "0";
        el.style.whiteSpace = "pre-wrap";
        el.innerHTML = html;
        document.body.appendChild(el);

        // Select the rendered content
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);

        // Copy via execCommand
        const ok = document.execCommand("copy");
        sel?.removeAllRanges();
        document.body.removeChild(el);

        if (!ok) throw new Error("execCommand copy returned false");
        return true;
      } catch {
        try {
          await navigator.clipboard.writeText(plainFallback);
          return true;
        } catch {
          return false;
        }
      }
    };

    setLoading(true);
    try {
      const data = await apiPost<GenerateResponse>(
        "/reports/generate",
        {
          examType,
          templateId,
          type: mgType ?? undefined,
          contrast,
          indication: indication || undefined,
          notes: urgentNote,
            academic,
          sex: sex || undefined,
          side: side || undefined,
          incidence: incidence ?? undefined,
          decubitus: decubitus ?? undefined,
          ecgGating,
          phases,
          coil,
          sedation,
          artifactSourceEnabled,
          artifactSourceTypes,
          findings: null,
        },
        accessToken,
      );

      setReportText(data.reportText);

      if (format === "formatted") {
        const html = convertMarkdownToHtml(data.reportText);
        const plain = stripMarkdown(data.reportText);

        // Prefer DOM selection copy for Word compatibility
        const okDom = await copyHtmlViaExecCommand(html, plain);

        if (!okDom) {
          // Fallback to ClipboardItem (may work on Chromium)
          if ("ClipboardItem" in window) {
            try {
              const item = new ClipboardItem({
                "text/html": new Blob([html], { type: "text/html" }),
                "text/plain": new Blob([plain], { type: "text/plain" }),
              });
              const clipboard = navigator.clipboard as Clipboard & {
                write?: (items: ClipboardItem[]) => Promise<void>;
              };
              if (typeof clipboard.write === "function") {
                await clipboard.write([item]);
              } else {
                await navigator.clipboard.writeText(plain);
              }
            } catch {
              // Last resort: plain text
              await navigator.clipboard.writeText(plain);
            }
          } else {
            // Last resort when neither DOM copy nor ClipboardItem is available
            await navigator.clipboard.writeText(plain);
          }
        }

        showMessage(okDom ? "Laudo normal copiado com formatação." : "Laudo normal copiado.", "success");
      } else {
        const output = formatReportForCopy(data.reportText, format);
        await navigator.clipboard.writeText(output);
        showMessage("Laudo normal copiado!", "success");
      }
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

    const doGenerate = async (): Promise<GenerateResponse> => {
      if (indicationFile) {
        const formData = new FormData();
        formData.append("examType", examType);
        formData.append("templateId", templateId);
        if (mgType) formData.append("type", mgType);
        formData.append("contrast", contrast);
        if (indication) formData.append("indication", indication);
        if (urgentNote) formData.append("notes", urgentNote);
        formData.append("academic", String(academic));
        if (sex) formData.append("sex", sex);
        if (side) formData.append("side", side);
        if (incidence) formData.append("incidence", incidence);
        if (decubitus) formData.append("decubitus", decubitus);
        formData.append("ecgGating", ecgGating);
        formData.append("phases", phases);
        formData.append("coil", coil);
        formData.append("sedation", sedation);
        formData.append("artifactSourceEnabled", String(artifactSourceEnabled));
        for (const t of artifactSourceTypes) formData.append("artifactSourceTypes", t);
        formData.append("findings", trimmedFindings);
        formData.append("indicationFile", indicationFile);
        return await apiPostForm<GenerateResponse>("/reports/generate", formData, accessToken);
      }
      return await apiPost<GenerateResponse>(
        "/reports/generate",
        {
          examType,
          templateId,
          type: mgType ?? undefined,
          contrast,
          indication: indication || undefined,
          notes: urgentNote,
          academic,
          sex: sex || undefined,
          side: side || undefined,
          incidence: incidence ?? undefined,
          decubitus: decubitus ?? undefined,
          ecgGating,
          phases,
          coil,
          sedation,
          artifactSourceEnabled,
          artifactSourceTypes,
          findings: trimmedFindings,
        },
        accessToken,
      );
    };

    setLoading(true);
    try {
      const data = await doGenerate();
      setReportText(data.reportText);
      showMessage("Laudo gerado com sucesso!", "success");
      router.push("/report-result");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao gerar laudo";
      const is429 = typeof msg === "string" && msg.includes("429");
      if (is429) {
        // Cancelar a tentativa atual e orientar usuário a tentar novamente manualmente
        showMessage("Limite de requisições da IA. Tente novamente em ~1 minuto.", "warning");
      } else {
        showMessage(msg, "error");
      }
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
            Modelo: {templateLabel}
          </Typography>

          {loadingTemplate ? (
            <Box display="flex" justifyContent="center" mt={1}>
              <CircularProgress />
            </Box>
          ) : null}

          <Stack spacing={1}>
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <TextField
                label="Achados"
                placeholder="Descreva os achados do exame."
                fullWidth
                multiline
                minRows={6}
                value={findings}
                onChange={(e) => setFindings(e.target.value)}
              />
              <IconButton
                color={listening ? "error" : "primary"}
                onClick={() => {
                  if (listening) {
                    SpeechRecognition.stopListening();
                  } else {
                    SpeechRecognition.startListening({ continuous: true, language: "pt-BR" });
                  }
                }}
                disabled={!micSupported}
                sx={{ mt: 1 }}
                title={
                  !micSupported
                    ? "Seu navegador não suporta reconhecimento de voz"
                    : listening
                      ? "Parar gravação"
                      : "Iniciar gravação de voz"
                }
              >
                {listening ? <MicIcon /> : <MicOffIcon />}
              </IconButton>
            </Stack>
            {!micSupported && (
              <Typography variant="caption" color="error">
                ⚠️ Reconhecimento de voz não suportado neste navegador
              </Typography>
            )}
            {listening && (
              <Typography variant="caption" color="info.main">
                🎤 Escutando... (SHIFT + G para parar)
              </Typography>
            )}
            {!listening && !transcript && micSupported && (
              <Typography variant="caption" color="info.main">
                📱 Pressione SHIFT + G ou clique no 🎤 para gravar
              </Typography>
            )}

          </Stack>

          <Stack direction="row" spacing={2}>
            <ButtonGroup 
              variant="contained" 
              disabled={loading}
              sx={(theme) => ({
                '& .MuiButton-root': {
                  borderColor: theme.palette.mode === 'dark'
                    ? `${theme.palette.grey[900]} !important`
                    : `${theme.palette.grey[100]} !important`,
                }
              })}
            >
              <Button 
                onClick={() => handleCopyNormal(selectedFormat)}
                sx={(theme) => ({
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? theme.palette.grey[300]
                    : theme.palette.grey[700],
                  color: theme.palette.mode === 'dark'
                    ? theme.palette.grey[900]
                    : theme.palette.grey[100],
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark'
                      ? theme.palette.grey[400]
                      : theme.palette.grey[600],
                  }
                })}
              >
                COPIAR LAUDO NORMAL
              </Button>
              <Button 
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={(theme) => ({
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? theme.palette.grey[300]
                    : theme.palette.grey[700],
                  color: theme.palette.mode === 'dark'
                    ? theme.palette.grey[900]
                    : theme.palette.grey[100],
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark'
                      ? theme.palette.grey[400]
                      : theme.palette.grey[600],
                  }
                })}
              >
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
          onClick={() => {
            resetReport();
            router.push("/templates");
          }}
        >
          INICIAR NOVO LAUDO
        </Button>
      </Box>
    </Container>
  );
}
