"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DeleteIcon from "@mui/icons-material/Delete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import FormLabel from "@mui/material/FormLabel";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import { fetchTemplateDetail, type TemplateDetail } from "@/features/templates";
import { useAppState } from "../state";
import type { ArtifactType, Decubitus, DxaLimitation, DxaPeripheralSite, Incidence, MgType, MrFieldStrength, MrRadio } from "../state";
import { useSnackbar } from "../snackbar";

const INCIDENCES: Incidence[] = ["PA e Perfil", "AP", "PA", "Perfil", "Obliqua", "Ortostática", "Axial"];

const DXA_LIMITATION_OPTIONS: { value: DxaLimitation; label: string }[] = [
  { value: "escoliose", label: "Escoliose" },
  { value: "fraturas_vertebrais", label: "Fraturas vertebrais" },
  { value: "protese_quadril", label: "Prótese de quadril" },
  { value: "calcificacoes_aorticas", label: "Calcificações aórticas" },
  { value: "artefatos_movimento", label: "Artefatos de movimento" },
  { value: "obesidade", label: "Obesidade" },
];

const CT_ARTIFACT_TYPES: ArtifactType[] = ["Movimento", "Beam hardening"];

const MR_ARTIFACT_TYPES: ArtifactType[] = [
  "Movimento",
  "Susceptibilidade magnética",
  "Aliasing",
  "Deslocamento químico",
  "Volume parcial",
  "Ghosting",
  "Truncamento",
  "Zipper",
  "Ruído",
  "Interferência de radiofrequência",
  "Crosstalk",
];

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
    mgType,
    setMgType,
    dxaSites,
    setDxaSites,
    dxaLumbarBmd,
    setDxaLumbarBmd,
    dxaLumbarTScore,
    setDxaLumbarTScore,
    dxaLumbarZScore,
    setDxaLumbarZScore,
    dxaFemoralNeckBmd,
    setDxaFemoralNeckBmd,
    dxaFemoralNeckTScore,
    setDxaFemoralNeckTScore,
    dxaFemoralNeckZScore,
    setDxaFemoralNeckZScore,
    dxaTotalHipBmd,
    setDxaTotalHipBmd,
    dxaTotalHipTScore,
    setDxaTotalHipTScore,
    dxaTotalHipZScore,
    setDxaTotalHipZScore,
    dxaIncludeForearm,
    setDxaIncludeForearm,
    dxaForearmBmd,
    setDxaForearmBmd,
    dxaForearmTScore,
    setDxaForearmTScore,
    dxaForearmZScore,
    setDxaForearmZScore,
    dxaHasPreviousExam,
    setDxaHasPreviousExam,
    dxaAttachPreviousExam,
    setDxaAttachPreviousExam,
    dxaPreviousExamFile,
    setDxaPreviousExamFile,
    dxaPreviousExamDate,
    setDxaPreviousExamDate,
    dxaPreviousLumbarBmd,
    setDxaPreviousLumbarBmd,
    dxaPreviousFemoralNeckBmd,
    setDxaPreviousFemoralNeckBmd,
    dxaPreviousTotalHipBmd,
    setDxaPreviousTotalHipBmd,
    dxaLimitationsEnabled,
    setDxaLimitationsEnabled,
    dxaLimitationTypes,
    setDxaLimitationTypes,
    dxaScoreType,
    setDxaScoreType,
    sex,
    setSex,
    side,
    setSide,
    incidence,
    setIncidence,
    decubitus,
    setDecubitus,
    ecgGating,
    setEcgGating,
    phases,
    setPhases,
    coil,
    setCoil,
    sedation,
    setSedation,
    artifactSourceEnabled,
    setArtifactSourceEnabled,
    artifactSourceTypes,
    setArtifactSourceTypes,
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

  const artifactTypeOptions = useMemo<ArtifactType[]>(() => {
    if (examType === "CT") return CT_ARTIFACT_TYPES;
    if (examType === "MR") return MR_ARTIFACT_TYPES;
    return [];
  }, [examType]);

  const showIndication = requires ? requires.indication !== "none" && requires.indication !== "fixed" : true;
  const showContrast = requires ? requires.contrast !== "none" && requires.contrast !== "fixed" : true;
  const showType = requires ? requires.type !== "none" && requires.type !== "fixed" : false;
  const showSex = requires ? requires.sex !== "none" && requires.sex !== "fixed" : false;
  const showSide = requires ? requires.side !== "none" && requires.side !== "fixed" : false;
  const showIncidence = requires ? requires.incidence !== "none" && requires.incidence !== "fixed" : false;
  const showDecubitus = requires ? requires.decubitus !== "none" && requires.decubitus !== "fixed" : false;
  const showEcgGating = requires ? requires.ecg_gating !== "none" && requires.ecg_gating !== "fixed" : false;
  const showPhases = requires ? requires.phases !== "none" && requires.phases !== "fixed" : false;
  const showCoil = requires ? requires.coil !== "none" && requires.coil !== "fixed" : false;
  const showSedation = requires ? requires.sedation !== "none" && requires.sedation !== "fixed" : false;
  const showArtifactSource = requires
    ? requires.artifact_source !== "none" && requires.artifact_source !== "fixed"
    : false;

  const effectiveContrast = requires?.contrast === "fixed" ? "with" : contrast;

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

  useEffect(() => {
    // Keep contrast consistent for templates that force it.
    if (requires?.contrast === "fixed" && contrast !== "with") {
      setContrast("with");
    }
  }, [requires?.contrast, contrast, setContrast]);

  useEffect(() => {
    // Phases only makes sense when contrast is used.
    if (!showPhases || effectiveContrast !== "with") {
      if (phases !== "omit") setPhases("omit");
      return;
    }

    // When phases becomes applicable, default to "Não" (without) instead of omitting.
    if (phases === "omit") {
      setPhases("without");
    }
  }, [showPhases, effectiveContrast, phases, setPhases]);

  const templateLabel = useMemo(() => {
    if (!templateId) return "-";
    return template?.name ?? templateId;
  }, [template?.name, templateId]);

  const isDxaDexaTemplate = examType === "DXA" && templateId === "dxa-dexa-normal-v1";

  useEffect(() => {
    if (!showType) return;
    if (examType !== "MG") return;
    if (mgType) return;
    setMgType("digital");
  }, [showType, examType, mgType, setMgType]);

  const toggleDxaSite = (site: DxaPeripheralSite) => {
    setDxaSites(dxaSites.includes(site) ? dxaSites.filter((s) => s !== site) : [...dxaSites, site]);
  };

  const toggleDxaLimitation = (lim: DxaLimitation) => {
    setDxaLimitationTypes(
      dxaLimitationTypes.includes(lim)
        ? dxaLimitationTypes.filter((l) => l !== lim)
        : [...dxaLimitationTypes, lim],
    );
  };

  const handleDxaPreviousFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        showMessage("Tipo de arquivo inválido. Use PDF ou imagem (JPG/PNG/WebP).", "error");
        return;
      }
      setDxaPreviousExamFile(file);
    }
  };

  const handleRemoveDxaPreviousFile = () => {
    setDxaPreviousExamFile(null);
  };

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

  const handleMgTypeChange = (_: React.ChangeEvent<HTMLInputElement>, value: string) => {
    if (value === "convencional" || value === "digital" || value === "3d") {
      setMgType(value as MgType);
    }
  };

  const handleRemoveFile = () => {
    setIndicationFile(null);
    setIndication("");
  };

  const toggleArtifactType = (t: ArtifactType) => {
    setArtifactSourceTypes(
      artifactSourceTypes.includes(t)
        ? artifactSourceTypes.filter((x) => x !== t)
        : [...artifactSourceTypes, t],
    );
  };

  const validateAndContinue = () => {
    if (!requires) {
      showMessage("Aguarde carregar o modelo.", "error");
      return;
    }

    if (requires.type === "required") {
      if (examType === "MG" && !mgType) {
        showMessage("Selecione o tipo de mamografia.", "error");
        return;
      }

      if (examType === "DXA" && dxaSites.length === 0) {
        showMessage("Selecione a(s) região(ões) (punho/calcanhar/dedos).", "error");
        return;
      }
    }

    if (isDxaDexaTemplate) {
      const missing =
        !dxaLumbarBmd.trim() ||
        !dxaLumbarTScore.trim() ||
        !dxaLumbarZScore.trim() ||
        !dxaFemoralNeckBmd.trim() ||
        !dxaFemoralNeckTScore.trim() ||
        !dxaFemoralNeckZScore.trim() ||
        !dxaTotalHipBmd.trim() ||
        !dxaTotalHipTScore.trim() ||
        !dxaTotalHipZScore.trim();
      if (missing) {
        showMessage("Preencha DMO, T-score e Z-score para coluna, colo femoral e quadril total.", "error");
        return;
      }

      if (dxaIncludeForearm) {
        const forearmMissing =
          !dxaForearmBmd.trim() || !dxaForearmTScore.trim() || !dxaForearmZScore.trim();
        if (forearmMissing) {
          showMessage("Preencha DMO, T-score e Z-score para rádio 33%.", "error");
          return;
        }
      }

      if (dxaHasPreviousExam && !dxaAttachPreviousExam) {
        const prevMissing =
          !dxaPreviousExamDate.trim() ||
          !dxaPreviousLumbarBmd.trim() ||
          !dxaPreviousFemoralNeckBmd.trim() ||
          !dxaPreviousTotalHipBmd.trim();
        if (prevMissing) {
          showMessage("Preencha os dados do exame anterior (data e DMOs).", "error");
          return;
        }
      }

      if (dxaLimitationsEnabled && dxaLimitationTypes.length === 0) {
        showMessage("Selecione pelo menos uma limitação técnica.", "error");
        return;
      }
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
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2">Sem</Typography>
                <Switch
                  checked={contrast === "with"}
                  onChange={(e) => setContrast(e.target.checked ? "with" : "without")}
                />
                <Typography variant="body2">Com</Typography>
              </Stack>
            </FormControl>
          ) : null}

          {showType && examType === "MG" ? (
            <FormControl>
              <FormLabel>Tipo de mamografia</FormLabel>
              <RadioGroup row value={mgType ?? ""} onChange={handleMgTypeChange}>
                <FormControlLabel value="convencional" control={<Radio />} label="Convencional" />
                <FormControlLabel value="digital" control={<Radio />} label="Digital" />
                <FormControlLabel value="3d" control={<Radio />} label="3D" />
              </RadioGroup>
            </FormControl>
          ) : null}

          {showType && examType === "DXA" ? (
            <FormControl>
              <FormLabel>Região(ões)</FormLabel>
              <FormGroup row>
                <FormControlLabel
                  control={<Checkbox checked={dxaSites.includes("punho")} onChange={() => toggleDxaSite("punho")} />}
                  label="Punho"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={dxaSites.includes("calcanhar")}
                      onChange={() => toggleDxaSite("calcanhar")}
                    />
                  }
                  label="Calcanhar"
                />
                <FormControlLabel
                  control={<Checkbox checked={dxaSites.includes("dedos")} onChange={() => toggleDxaSite("dedos")} />}
                  label="Dedos"
                />
              </FormGroup>
            </FormControl>
          ) : null}

          {isDxaDexaTemplate ? (
            <Stack spacing={2}>
              <Typography variant="subtitle2" color="text.secondary">
                Valores do exame (DEXA)
              </Typography>

              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Coluna lombar (L1-L4)
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                  <TextField
                    label="DMO (g/cm²)"
                    value={dxaLumbarBmd}
                    onChange={(e) => setDxaLumbarBmd(e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="T-score"
                    value={dxaLumbarTScore}
                    onChange={(e) => setDxaLumbarTScore(e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Z-score"
                    value={dxaLumbarZScore}
                    onChange={(e) => setDxaLumbarZScore(e.target.value)}
                    fullWidth
                  />
                </Stack>
              </Stack>

              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Colo femoral
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                  <TextField
                    label="DMO (g/cm²)"
                    value={dxaFemoralNeckBmd}
                    onChange={(e) => setDxaFemoralNeckBmd(e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="T-score"
                    value={dxaFemoralNeckTScore}
                    onChange={(e) => setDxaFemoralNeckTScore(e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Z-score"
                    value={dxaFemoralNeckZScore}
                    onChange={(e) => setDxaFemoralNeckZScore(e.target.value)}
                    fullWidth
                  />
                </Stack>
              </Stack>

              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Quadril total
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                  <TextField
                    label="DMO (g/cm²)"
                    value={dxaTotalHipBmd}
                    onChange={(e) => setDxaTotalHipBmd(e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="T-score"
                    value={dxaTotalHipTScore}
                    onChange={(e) => setDxaTotalHipTScore(e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Z-score"
                    value={dxaTotalHipZScore}
                    onChange={(e) => setDxaTotalHipZScore(e.target.value)}
                    fullWidth
                  />
                </Stack>
              </Stack>

              {/* Rádio 33% (forearm) */}
              <FormControl>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2">Incluir rádio 33% (antebraço)?</Typography>
                  <Switch
                    checked={dxaIncludeForearm}
                    onChange={(e) => setDxaIncludeForearm(e.target.checked)}
                  />
                </Stack>
              </FormControl>

              {dxaIncludeForearm ? (
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Rádio 33% (terço distal)
                  </Typography>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                    <TextField
                      label="DMO (g/cm²)"
                      value={dxaForearmBmd}
                      onChange={(e) => setDxaForearmBmd(e.target.value)}
                      fullWidth
                    />
                    <TextField
                      label="T-score"
                      value={dxaForearmTScore}
                      onChange={(e) => setDxaForearmTScore(e.target.value)}
                      fullWidth
                    />
                    <TextField
                      label="Z-score"
                      value={dxaForearmZScore}
                      onChange={(e) => setDxaForearmZScore(e.target.value)}
                      fullWidth
                    />
                  </Stack>
                </Stack>
              ) : null}

              {/* Exame anterior */}
              <FormControl>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2">Exame anterior?</Typography>
                  <Switch
                    checked={dxaHasPreviousExam}
                    onChange={(e) => {
                      setDxaHasPreviousExam(e.target.checked);
                      if (!e.target.checked) {
                        setDxaAttachPreviousExam(false);
                        setDxaPreviousExamFile(null);
                        setDxaPreviousExamDate("");
                        setDxaPreviousLumbarBmd("");
                        setDxaPreviousFemoralNeckBmd("");
                        setDxaPreviousTotalHipBmd("");
                      }
                    }}
                  />
                </Stack>
              </FormControl>

              {dxaHasPreviousExam ? (
                <Stack spacing={2} sx={{ pl: 2, borderLeft: "2px solid", borderColor: "divider" }}>
                  <FormControl>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2">Anexar exame anterior?</Typography>
                      <Switch
                        checked={dxaAttachPreviousExam}
                        onChange={(e) => {
                          setDxaAttachPreviousExam(e.target.checked);
                          if (e.target.checked) {
                            setDxaPreviousExamDate("");
                            setDxaPreviousLumbarBmd("");
                            setDxaPreviousFemoralNeckBmd("");
                            setDxaPreviousTotalHipBmd("");
                          } else {
                            setDxaPreviousExamFile(null);
                          }
                        }}
                      />
                    </Stack>
                  </FormControl>

                  {dxaAttachPreviousExam ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <input
                        type="file"
                        accept=".pdf,application/pdf,image/jpeg,image/png,image/webp"
                        style={{ display: "none" }}
                        id="dxa-previous-file-input"
                        onChange={handleDxaPreviousFileChange}
                      />
                      <label htmlFor="dxa-previous-file-input">
                        <Tooltip title="PDF ou imagem (JPG/PNG/WebP) até 25MB">
                          <span>
                            <IconButton component="span" color="primary">
                              <AttachFileIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </label>
                      {dxaPreviousExamFile ? (
                        <>
                          <Typography variant="caption" color="text.secondary">
                            📎 {dxaPreviousExamFile.name} ({(dxaPreviousExamFile.size / 1024).toFixed(1)} KB)
                          </Typography>
                          <IconButton color="error" onClick={handleRemoveDxaPreviousFile} size="small">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Anexe o laudo do exame anterior
                        </Typography>
                      )}
                    </Stack>
                  ) : (
                    <Stack spacing={1}>
                      <TextField
                        label="Data do exame anterior"
                        placeholder="DD/MM/AAAA"
                        value={dxaPreviousExamDate}
                        onChange={(e) => setDxaPreviousExamDate(e.target.value)}
                        fullWidth
                      />
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                        <TextField
                          label="DMO coluna (g/cm²)"
                          value={dxaPreviousLumbarBmd}
                          onChange={(e) => setDxaPreviousLumbarBmd(e.target.value)}
                          fullWidth
                        />
                        <TextField
                          label="DMO colo femoral (g/cm²)"
                          value={dxaPreviousFemoralNeckBmd}
                          onChange={(e) => setDxaPreviousFemoralNeckBmd(e.target.value)}
                          fullWidth
                        />
                        <TextField
                          label="DMO quadril total (g/cm²)"
                          value={dxaPreviousTotalHipBmd}
                          onChange={(e) => setDxaPreviousTotalHipBmd(e.target.value)}
                          fullWidth
                        />
                      </Stack>
                    </Stack>
                  )}
                </Stack>
              ) : null}

              {/* Limitações técnicas */}
              <FormControl>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2">Limitações técnicas?</Typography>
                  <Switch
                    checked={dxaLimitationsEnabled}
                    onChange={(e) => {
                      setDxaLimitationsEnabled(e.target.checked);
                      if (!e.target.checked) setDxaLimitationTypes([]);
                    }}
                  />
                </Stack>
              </FormControl>

              {dxaLimitationsEnabled ? (
                <FormGroup>
                  {DXA_LIMITATION_OPTIONS.map((opt) => (
                    <FormControlLabel
                      key={opt.value}
                      control={
                        <Checkbox
                          checked={dxaLimitationTypes.includes(opt.value)}
                          onChange={() => toggleDxaLimitation(opt.value)}
                        />
                      }
                      label={opt.label}
                    />
                  ))}
                </FormGroup>
              ) : null}

              {/* Critério de score (T-score vs Z-score) */}
              <FormControl>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2">Critério de classificação:</Typography>
                  <Typography variant="body2" color={dxaScoreType === "t-score" ? "primary" : "text.secondary"}>
                    T-score
                  </Typography>
                  <Switch
                    checked={dxaScoreType === "z-score"}
                    onChange={(e) => setDxaScoreType(e.target.checked ? "z-score" : "t-score")}
                  />
                  <Typography variant="body2" color={dxaScoreType === "z-score" ? "primary" : "text.secondary"}>
                    Z-score
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  T-score: pós-menopausa / homens ≥50 anos. Z-score: pré-menopausa / homens &lt;50 anos.
                </Typography>
              </FormControl>
            </Stack>
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

          {showEcgGating ? (
            <FormControl>
              <FormLabel>Sincronização ECG (gating)</FormLabel>
              <RadioGroup
                row
                value={ecgGating}
                onChange={(e) => setEcgGating(e.target.value as MrRadio)}
              >
                <FormControlLabel value="omit" control={<Radio />} label="Não citar" />
                <FormControlLabel value="without" control={<Radio />} label="Sem" />
                <FormControlLabel value="with" control={<Radio />} label="Com" />
              </RadioGroup>
            </FormControl>
          ) : null}

          {showPhases && effectiveContrast === "with" ? (
            <FormControl>
              <FormLabel>Aquisição dinâmica pós contraste?</FormLabel>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2">Não</Typography>
                <Switch
                  checked={phases === "with"}
                  onChange={(e) => setPhases(e.target.checked ? "with" : "without")}
                />
                <Typography variant="body2">Sim</Typography>
              </Stack>
            </FormControl>
          ) : null}

          {showCoil ? (
            <FormControl>
              <FormLabel>Bobina</FormLabel>
              <RadioGroup row value={coil} onChange={(e) => setCoil(e.target.value as MrFieldStrength)}>
                <FormControlLabel value="omit" control={<Radio />} label="Não citar" />
                <FormControlLabel value="1.5T" control={<Radio />} label="1,5T" />
                <FormControlLabel value="3.0T" control={<Radio />} label="3,0T" />
              </RadioGroup>
            </FormControl>
          ) : null}

          {showSedation ? (
            <FormControl>
              <FormLabel>Sedação</FormLabel>
              <RadioGroup row value={sedation} onChange={(e) => setSedation(e.target.value as MrRadio)}>
                <FormControlLabel value="omit" control={<Radio />} label="Não citar" />
                <FormControlLabel value="without" control={<Radio />} label="Sem" />
                <FormControlLabel value="with" control={<Radio />} label="Com" />
              </RadioGroup>
            </FormControl>
          ) : null}

          {showArtifactSource ? (
            <FormControl>
              <FormLabel>Artefatos de aquisição</FormLabel>
              <FormControlLabel
                control={
                  <Switch
                    checked={artifactSourceEnabled}
                    onChange={(e) => {
                      const enabled = e.target.checked;
                      setArtifactSourceEnabled(enabled);
                      if (!enabled) setArtifactSourceTypes([]);
                    }}
                  />
                }
                label={artifactSourceEnabled ? "Com" : "Sem"}
              />

              {artifactSourceEnabled ? (
                <FormGroup>
                  {artifactTypeOptions.map((t) => (
                    <FormControlLabel
                      key={t}
                      control={<Checkbox checked={artifactSourceTypes.includes(t)} onChange={() => toggleArtifactType(t)} />}
                      label={t}
                    />
                  ))}
                </FormGroup>
              ) : null}
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
