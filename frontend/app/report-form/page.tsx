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
import type { ArtifactType, Decubitus, DxaPeripheralSite, Incidence, MgType, MrFieldStrength, MrRadio } from "../state";
import { useSnackbar } from "../snackbar";

const INCIDENCES: Incidence[] = ["PA e Perfil", "AP", "PA", "Perfil", "Obliqua", "Ortostática", "Axial"];

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

  useEffect(() => {
    if (!showType) return;
    if (examType !== "MG") return;
    if (mgType) return;
    setMgType("digital");
  }, [showType, examType, mgType, setMgType]);

  const toggleDxaSite = (site: DxaPeripheralSite) => {
    setDxaSites(dxaSites.includes(site) ? dxaSites.filter((s) => s !== site) : [...dxaSites, site]);
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
