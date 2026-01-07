"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DeleteIcon from "@mui/icons-material/Delete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import { fetchTemplateDetail, type TemplateDetail } from "@/features/templates";
import { useAppState } from "../state";
import type { Incidence, Decubitus } from "../state";
import { useSnackbar } from "../snackbar";

const INCIDENCES: Incidence[] = ["PA e Perfil", "AP", "PA", "Perfil", "Obliqua", "Ortostática", "Axial"];

function isIncidence(value: unknown): value is Incidence {
  return typeof value === "string" && (INCIDENCES as readonly string[]).includes(value);
}

export default function ReportFormPage() {
  const router = useRouter();
  const {
    accessToken,
    examType,
    templateId,
    indication,
    setIndication,
    indicationFile,
    setIndicationFile,
    contrast,
    setContrast,
    sex,
    setSex,
    side,
    setSide,
    incidence,
    setIncidence,
    decubitus,
    setDecubitus,
    resetReport,
  } = useAppState();

  const { showMessage } = useSnackbar();

  const [template, setTemplate] = useState<TemplateDetail | null>(null);
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

  useEffect(() => {
    if (!accessToken || !templateId) return;

    let cancelled = false;
    setLoading(true);

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
        setLoading(false);
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
  const showIncidence = requires ? requires.incidence !== "none" && requires.incidence !== "fixed" : false;
  const showDecubitus = requires ? requires.decubitus !== "none" && requires.decubitus !== "fixed" : false;

  useEffect(() => {
    // When switching templates, don't keep the previous report's incidence in memory.
    // This allows defaults.incidence (and per-template last selection) to be applied correctly.
    setIncidence(null);
  }, [templateId, setIncidence]);

  useEffect(() => {
    if (!showIncidence || incidence) return;

    const defaultFromTemplate = template?.defaults?.incidence;
    const lastFromUser = (() => {
      if (typeof window === "undefined" || !templateId) return null;
      return window.localStorage.getItem(`vixrad.lastIncidence.${templateId}`);
    })();

    const chosen =
      (isIncidence(defaultFromTemplate) ? defaultFromTemplate : null) ??
      (isIncidence(lastFromUser) ? lastFromUser : null) ??
      "PA e Perfil";

    setIncidence(chosen);
  }, [showIncidence, incidence, setIncidence, template?.defaults?.incidence, templateId]);

  useEffect(() => {
    if (!templateId || !incidence) return;
    if (typeof window === "undefined") return;
    window.localStorage.setItem(`vixrad.lastIncidence.${templateId}`, incidence);
  }, [templateId, incidence]);

  useEffect(() => {
    if (showDecubitus && decubitus === null) {
      setDecubitus(null);
    }
  }, [showDecubitus, decubitus, setDecubitus]);

  const templateLabel = useMemo(() => {
    if (!templateId) return "-";
    return template?.name ?? templateId;
  }, [template?.name, templateId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

      if (!validTypes.includes(file.type)) {
        showMessage("Tipo de arquivo inválido. Use PDF ou imagem (JPG/PNG/WebP).", "error");
        return;
      }

      setIndicationFile(file);
      setIndication("Em anexo");
    }
  };

  const handleRemoveFile = () => {
    setIndicationFile(null);
    setIndication("");
  };

  const validateAndContinue = () => {
    if (!requires) {
      showMessage("Aguarde carregar o modelo.", "error");
      return;
    }

    if (requires.indication === "required" && !indication.trim()) {
      showMessage("Preencha a indicação.", "error");
      return;
    }

    if (requires.sex === "required" && !sex) {
      showMessage("Selecione o sexo.", "error");
      return;
    }

    if (requires.side === "required" && !side) {
      showMessage("Selecione o lado.", "error");
      return;
    }

    if (requires.incidence === "required" && !incidence) {
      showMessage("Selecione a incidência.", "error");
      return;
    }

    if (requires.decubitus === "required" && !decubitus) {
      showMessage("Selecione o decúbito.", "error");
      return;
    }

    router.push("/report-findings");
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
            Indicação / Contraste
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Modelo: {templateLabel}
          </Typography>

          {loading ? (
            <Box display="flex" justifyContent="center" mt={1}>
              <CircularProgress />
            </Box>
          ) : null}

          {showIndication ? (
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <TextField
                label="Indicação"
                placeholder={indicationFile ? "Em anexo" : "Qual a indicação do exame? (Opcional)"}
                fullWidth
                multiline
                minRows={2}
                value={indication}
                onChange={(e) => setIndication(e.target.value)}
                disabled={!!indicationFile}
              />
              <input
                type="file"
                accept=".pdf,application/pdf,image/jpeg,image/png,image/webp"
                style={{ display: "none" }}
                id="indication-file-input"
                onChange={handleFileChange}
              />
              <label htmlFor="indication-file-input">
                <Tooltip title="PDF ou imagem (JPG/PNG/WebP) até 25MB">
                  <span>
                    <IconButton component="span" color="primary" disabled={loading}>
                      <AttachFileIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </label>
              {indicationFile && (
                <IconButton color="error" onClick={handleRemoveFile} disabled={loading}>
                  <DeleteIcon />
                </IconButton>
              )}
            </Stack>
          ) : null}
          
          {indicationFile ? (
            <Typography variant="caption" color="text.secondary">
              📎 {indicationFile.name} ({(indicationFile.size / 1024).toFixed(1)} KB)
            </Typography>
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
                onChange={(e) => setSide(e.target.value as "RIGHT" | "LEFT" | "BILATERAL")}
              >
                <FormControlLabel value="RIGHT" control={<Radio />} label="Direito" />
                <FormControlLabel value="LEFT" control={<Radio />} label="Esquerdo" />
                <FormControlLabel value="BILATERAL" control={<Radio />} label="Bilateral" />
              </RadioGroup>
            </FormControl>
          ) : null}

          {showIncidence ? (
            <FormControl>
              <FormLabel>Incidência</FormLabel>
              <RadioGroup
                row
                value={incidence ?? ""}
                onChange={(e) => setIncidence(e.target.value as Incidence)}
              >
                <FormControlLabel value="PA e Perfil" control={<Radio />} label="PA e Perfil" />
                <FormControlLabel value="AP" control={<Radio />} label="AP" />
                <FormControlLabel value="PA" control={<Radio />} label="PA" />
                <FormControlLabel value="Perfil" control={<Radio />} label="Perfil" />
                <FormControlLabel value="Obliqua" control={<Radio />} label="Oblíqua" />
                <FormControlLabel value="Ortostática" control={<Radio />} label="Ortostática" />
                <FormControlLabel value="Axial" control={<Radio />} label="Axial" />
              </RadioGroup>
            </FormControl>
          ) : null}

          {showDecubitus ? (
            <FormControl>
              <FormLabel>Decúbito</FormLabel>
              <RadioGroup
                row
                value={decubitus ?? ""}
                onChange={(e) => setDecubitus(e.target.value === "" ? null : (e.target.value as Decubitus))}
              >
                <FormControlLabel value="" control={<Radio />} label="Não citar" />
                <FormControlLabel value="ventral" control={<Radio />} label="Ventral" />
                <FormControlLabel value="dorsal" control={<Radio />} label="Dorsal" />
                <FormControlLabel value="lateral" control={<Radio />} label="Lateral" />
              </RadioGroup>
            </FormControl>
          ) : null}

          <Button
            variant="contained"
            color="primary"
            disabled={loading || !template}
            onClick={validateAndContinue}
          >
            CONTINUAR
          </Button>
        </Stack>
      </Paper>

      <Box mt={4} textAlign="center">
        <Button variant="text" color="error" onClick={() => {
          resetReport();
          router.push("/templates");
        }}>
          INICIAR NOVO LAUDO
        </Button>
      </Box>
    </Container>
  );
}
