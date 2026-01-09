"use client";

import type { ReactNode } from "react";
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

export type ExamType = "CT" | "XR" | "US" | "MR" | "MG" | "DXA" | "NM";
export type Contrast = "with" | "without";
export type Sex = "M" | "F";
export type Side = "RIGHT" | "LEFT" | "BILATERAL";
export type Incidence = "AP" | "PA" | "Perfil" | "PA e Perfil" | "Obliqua" | "Ortostática" | "Axial";
export type Decubitus = "ventral" | "dorsal" | "lateral";
export type MrRadio = "omit" | "without" | "with";
export type MrFieldStrength = "omit" | "1.5T" | "3.0T";
export type MgType = "convencional" | "digital" | "3d";
export type DxaPeripheralSite = "punho" | "calcanhar" | "dedos";
export type DxaScoreType = "t-score" | "z-score";
export type DxaLimitation =
  | "escoliose"
  | "fraturas_vertebrais"
  | "protese_quadril"
  | "calcificacoes_aorticas"
  | "artefatos_movimento"
  | "obesidade";
export type ArtifactType =
  | "Movimento"
  | "Beam hardening"
  | "Susceptibilidade magnética"
  | "Aliasing"
  | "Deslocamento químico"
  | "Volume parcial"
  | "Ghosting"
  | "Truncamento"
  | "Zipper"
  | "Ruído"
  | "Interferência de radiofrequência"
  | "Crosstalk";

type AppState = {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  refreshToken: string | null;
  setRefreshToken: (token: string | null) => void;

  examType: ExamType | null;
  setExamType: (examType: ExamType | null) => void;
  templateId: string | null;
  setTemplateId: (templateId: string | null) => void;

  indication: string;
  setIndication: (value: string) => void;

  indicationFile: File | null;
  setIndicationFile: (value: File | null) => void;

  findings: string;
  setFindings: (value: string) => void;

  contrast: Contrast;
  setContrast: (value: Contrast) => void;

  mgType: MgType | null;
  setMgType: (value: MgType | null) => void;

  dxaSites: DxaPeripheralSite[];
  setDxaSites: (value: DxaPeripheralSite[]) => void;

  dxaLumbarBmd: string;
  setDxaLumbarBmd: (value: string) => void;
  dxaLumbarTScore: string;
  setDxaLumbarTScore: (value: string) => void;
  dxaLumbarZScore: string;
  setDxaLumbarZScore: (value: string) => void;

  dxaFemoralNeckBmd: string;
  setDxaFemoralNeckBmd: (value: string) => void;
  dxaFemoralNeckTScore: string;
  setDxaFemoralNeckTScore: (value: string) => void;
  dxaFemoralNeckZScore: string;
  setDxaFemoralNeckZScore: (value: string) => void;

  dxaTotalHipBmd: string;
  setDxaTotalHipBmd: (value: string) => void;
  dxaTotalHipTScore: string;
  setDxaTotalHipTScore: (value: string) => void;
  dxaTotalHipZScore: string;
  setDxaTotalHipZScore: (value: string) => void;

  // DXA Forearm (rádio 33%) - optional
  dxaIncludeForearm: boolean;
  setDxaIncludeForearm: (value: boolean) => void;
  dxaForearmBmd: string;
  setDxaForearmBmd: (value: string) => void;
  dxaForearmTScore: string;
  setDxaForearmTScore: (value: string) => void;
  dxaForearmZScore: string;
  setDxaForearmZScore: (value: string) => void;

  // DXA Previous exam comparison
  dxaHasPreviousExam: boolean;
  setDxaHasPreviousExam: (value: boolean) => void;
  dxaAttachPreviousExam: boolean;
  setDxaAttachPreviousExam: (value: boolean) => void;
  dxaPreviousExamFile: File | null;
  setDxaPreviousExamFile: (value: File | null) => void;
  dxaPreviousExamDate: string;
  setDxaPreviousExamDate: (value: string) => void;
  dxaPreviousLumbarBmd: string;
  setDxaPreviousLumbarBmd: (value: string) => void;
  dxaPreviousFemoralNeckBmd: string;
  setDxaPreviousFemoralNeckBmd: (value: string) => void;
  dxaPreviousTotalHipBmd: string;
  setDxaPreviousTotalHipBmd: (value: string) => void;

  // DXA Limitations
  dxaLimitationsEnabled: boolean;
  setDxaLimitationsEnabled: (value: boolean) => void;
  dxaLimitationTypes: DxaLimitation[];
  setDxaLimitationTypes: (value: DxaLimitation[]) => void;

  // DXA Score type (T-score vs Z-score)
  dxaScoreType: DxaScoreType;
  setDxaScoreType: (value: DxaScoreType) => void;

  sex: Sex | null;
  setSex: (value: Sex | null) => void;

  side: Side | null;
  setSide: (value: Side | null) => void;

  incidence: Incidence | null;
  setIncidence: (value: Incidence | null) => void;

  decubitus: Decubitus | null;
  setDecubitus: (value: Decubitus | null) => void;

  ecgGating: MrRadio;
  setEcgGating: (value: MrRadio) => void;

  phases: MrRadio;
  setPhases: (value: MrRadio) => void;

  coil: MrFieldStrength;
  setCoil: (value: MrFieldStrength) => void;

  sedation: MrRadio;
  setSedation: (value: MrRadio) => void;

  artifactSourceEnabled: boolean;
  setArtifactSourceEnabled: (value: boolean) => void;

  artifactSourceTypes: ArtifactType[];
  setArtifactSourceTypes: (value: ArtifactType[]) => void;

  reportText: string;
  setReportText: (value: string) => void;

  urgent: boolean;
  setUrgent: (value: boolean) => void;

  academic: boolean;
  setAcademic: (value: boolean) => void;

  resetReport: () => void;
};

const AppStateContext = createContext<AppState | null>(null);

const ACCESS_TOKEN_KEY = "vixrad.accessToken";
const REFRESH_TOKEN_KEY = "vixrad.refreshToken";

// Decode JWT exp (seconds since epoch)
function decodeJwtExp(token: string | null): number | null {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json =
      typeof window !== "undefined"
        ? window.atob(base64)
        : Buffer.from(base64, "base64").toString("utf8");
    const payload = JSON.parse(json);
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessTokenState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  });
  const [refreshToken, setRefreshTokenState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  });

  const [examType, setExamType] = useState<ExamType | null>(null);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [indication, setIndication] = useState<string>("");
  const [indicationFile, setIndicationFile] = useState<File | null>(null);
  const [findings, setFindings] = useState<string>("");
  const [contrast, setContrast] = useState<Contrast>("without");
  const [mgType, setMgType] = useState<MgType | null>(null);
  const [dxaSites, setDxaSites] = useState<DxaPeripheralSite[]>([]);
  const [dxaLumbarBmd, setDxaLumbarBmd] = useState<string>("");
  const [dxaLumbarTScore, setDxaLumbarTScore] = useState<string>("");
  const [dxaLumbarZScore, setDxaLumbarZScore] = useState<string>("");
  const [dxaFemoralNeckBmd, setDxaFemoralNeckBmd] = useState<string>("");
  const [dxaFemoralNeckTScore, setDxaFemoralNeckTScore] = useState<string>("");
  const [dxaFemoralNeckZScore, setDxaFemoralNeckZScore] = useState<string>("");
  const [dxaTotalHipBmd, setDxaTotalHipBmd] = useState<string>("");
  const [dxaTotalHipTScore, setDxaTotalHipTScore] = useState<string>("");
  const [dxaTotalHipZScore, setDxaTotalHipZScore] = useState<string>("");
  const [dxaIncludeForearm, setDxaIncludeForearm] = useState<boolean>(false);
  const [dxaForearmBmd, setDxaForearmBmd] = useState<string>("");
  const [dxaForearmTScore, setDxaForearmTScore] = useState<string>("");
  const [dxaForearmZScore, setDxaForearmZScore] = useState<string>("");
  const [dxaHasPreviousExam, setDxaHasPreviousExam] = useState<boolean>(false);
  const [dxaAttachPreviousExam, setDxaAttachPreviousExam] = useState<boolean>(false);
  const [dxaPreviousExamFile, setDxaPreviousExamFile] = useState<File | null>(null);
  const [dxaPreviousExamDate, setDxaPreviousExamDate] = useState<string>("");
  const [dxaPreviousLumbarBmd, setDxaPreviousLumbarBmd] = useState<string>("");
  const [dxaPreviousFemoralNeckBmd, setDxaPreviousFemoralNeckBmd] = useState<string>("");
  const [dxaPreviousTotalHipBmd, setDxaPreviousTotalHipBmd] = useState<string>("");
  const [dxaLimitationsEnabled, setDxaLimitationsEnabled] = useState<boolean>(false);
  const [dxaLimitationTypes, setDxaLimitationTypes] = useState<DxaLimitation[]>([]);
  const [dxaScoreType, setDxaScoreType] = useState<DxaScoreType>("t-score");
  const [sex, setSex] = useState<Sex | null>(null);
  const [side, setSide] = useState<Side | null>(null);
  const [incidence, setIncidence] = useState<Incidence | null>(null);
  const [decubitus, setDecubitus] = useState<Decubitus | null>(null);
  const [ecgGating, setEcgGating] = useState<MrRadio>("omit");
  const [phases, setPhases] = useState<MrRadio>("omit");
  const [coil, setCoil] = useState<MrFieldStrength>("omit");
  const [sedation, setSedation] = useState<MrRadio>("omit");
  const [artifactSourceEnabled, setArtifactSourceEnabled] = useState<boolean>(false);
  const [artifactSourceTypes, setArtifactSourceTypes] = useState<ArtifactType[]>([]);
  const [reportText, setReportText] = useState<string>("");
  const [urgent, setUrgent] = useState<boolean>(false);
  const [academic, setAcademic] = useState<boolean>(false);

  const setAccessToken = useCallback((token: string | null) => {
    setAccessTokenState(token);
    if (typeof window === "undefined") return;
    if (token) window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
    else window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  }, []);
  const setRefreshToken = useCallback((token: string | null) => {
    setRefreshTokenState(token);
    if (typeof window === "undefined") return;
    if (token) window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
    else window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  }, []);

  const performRefresh = useCallback(async (): Promise<void> => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "http://localhost:3002"}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) throw new Error("Refresh failed");
      const data = (await res.json()) as { accessToken: string; refreshToken: string };
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
    } catch {
      // If refresh fails, keep tokens cleared to force re-auth only when user interacts
      setAccessToken(null);
      setRefreshToken(null);
    }
  }, [refreshToken, setAccessToken, setRefreshToken]);

  React.useEffect(() => {
    if (!accessToken || !refreshToken) return;
    const exp = decodeJwtExp(accessToken);
    if (!exp) return;
    const msUntilExpiry = exp * 1000 - Date.now();
    // Refresh 1 minute before expiry, but not negative
    const msUntilRefresh = Math.max(msUntilExpiry - 60_000, 5_000);
    const timer = setTimeout(() => {
      performRefresh();
    }, msUntilRefresh);
    return () => clearTimeout(timer);
  }, [accessToken, refreshToken, performRefresh]);

  const resetReport = useCallback(() => {
    setIndication("");
    setIndicationFile(null);
    setFindings("");
    setContrast("without");
    setMgType(null);
    setDxaSites([]);
    setDxaLumbarBmd("");
    setDxaLumbarTScore("");
    setDxaLumbarZScore("");
    setDxaFemoralNeckBmd("");
    setDxaFemoralNeckTScore("");
    setDxaFemoralNeckZScore("");
    setDxaTotalHipBmd("");
    setDxaTotalHipTScore("");
    setDxaTotalHipZScore("");
    setDxaIncludeForearm(false);
    setDxaForearmBmd("");
    setDxaForearmTScore("");
    setDxaForearmZScore("");
    setDxaHasPreviousExam(false);
    setDxaAttachPreviousExam(false);
    setDxaPreviousExamFile(null);
    setDxaPreviousExamDate("");
    setDxaPreviousLumbarBmd("");
    setDxaPreviousFemoralNeckBmd("");
    setDxaPreviousTotalHipBmd("");
    setDxaLimitationsEnabled(false);
    setDxaLimitationTypes([]);
    setDxaScoreType("t-score");
    setSex(null);
    setSide(null);
    setIncidence(null);
    setDecubitus(null);
    setEcgGating("omit");
    setPhases("omit");
    setCoil("omit");
    setSedation("omit");
    setArtifactSourceEnabled(false);
    setArtifactSourceTypes([]);
    setReportText("");
  }, []);

  const value = useMemo<AppState>(
    () => ({
      accessToken,
      setAccessToken,
      refreshToken,
      setRefreshToken,
      examType,
      setExamType,
      templateId,
      setTemplateId,
      indication,
      setIndication,
      indicationFile,
      setIndicationFile,
      findings,
      setFindings,
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
      reportText,
      setReportText,
      urgent,
      setUrgent,
      academic,
      setAcademic,
      resetReport,
    }),
    [
      accessToken,
      setAccessToken,
      refreshToken,
      setRefreshToken,
      examType,
      templateId,
      indication,
      indicationFile,
      findings,
      contrast,
      mgType,
      dxaSites,
      dxaLumbarBmd,
      dxaLumbarTScore,
      dxaLumbarZScore,
      dxaFemoralNeckBmd,
      dxaFemoralNeckTScore,
      dxaFemoralNeckZScore,
      dxaTotalHipBmd,
      dxaTotalHipTScore,
      dxaTotalHipZScore,
      dxaIncludeForearm,
      dxaForearmBmd,
      dxaForearmTScore,
      dxaForearmZScore,
      dxaHasPreviousExam,
      dxaAttachPreviousExam,
      dxaPreviousExamFile,
      dxaPreviousExamDate,
      dxaPreviousLumbarBmd,
      dxaPreviousFemoralNeckBmd,
      dxaPreviousTotalHipBmd,
      dxaLimitationsEnabled,
      dxaLimitationTypes,
      dxaScoreType,
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
      reportText,
      urgent,
      academic,
      resetReport,
    ],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
