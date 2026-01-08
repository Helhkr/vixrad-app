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
