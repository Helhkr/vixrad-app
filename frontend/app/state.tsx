"use client";

import type { ReactNode } from "react";
import React, { createContext, useContext, useMemo, useState } from "react";

export type ExamType = "CT" | "XR" | "US" | "MR" | "MG" | "DXA" | "NM";
export type Contrast = "with" | "without";
export type Sex = "M" | "F";
export type Side = "RIGHT" | "LEFT";
export type Incidence = "AP" | "PA" | "Perfil" | "PA e Perfil" | "Obliqua" | "Ortostática";
export type Decubitus = "ventral" | "dorsal" | "lateral";

type AppState = {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;

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

  sex: Sex | null;
  setSex: (value: Sex | null) => void;

  side: Side | null;
  setSide: (value: Side | null) => void;

  incidence: Incidence | null;
  setIncidence: (value: Incidence | null) => void;

  decubitus: Decubitus | null;
  setDecubitus: (value: Decubitus | null) => void;

  reportText: string;
  setReportText: (value: string) => void;

  resetReport: () => void;
};

const AppStateContext = createContext<AppState | null>(null);

const ACCESS_TOKEN_KEY = "vixrad.accessToken";

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessTokenState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  });

  const [examType, setExamType] = useState<ExamType | null>(null);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [indication, setIndication] = useState<string>("");
  const [indicationFile, setIndicationFile] = useState<File | null>(null);
  const [findings, setFindings] = useState<string>("");
  const [contrast, setContrast] = useState<Contrast>("without");
  const [sex, setSex] = useState<Sex | null>(null);
  const [side, setSide] = useState<Side | null>(null);
  const [incidence, setIncidence] = useState<Incidence | null>(null);
  const [decubitus, setDecubitus] = useState<Decubitus | null>(null);
  const [reportText, setReportText] = useState<string>("");

  const setAccessToken = (token: string | null) => {
    setAccessTokenState(token);
    if (typeof window === "undefined") return;
    if (token) window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
    else window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  };

  const resetReport = () => {
    setIndication("");
    setIndicationFile(null);
    setFindings("");
    setContrast("without");
    setSex(null);
    setSide(null);
    setIncidence(null);
    setDecubitus(null);
    setReportText("");
  };

  const value = useMemo<AppState>(
    () => ({
      accessToken,
      setAccessToken,
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
      sex,
      setSex,
      side,
      setSide,
      incidence,
      setIncidence,
      decubitus,
      setDecubitus,
      reportText,
      setReportText,
      resetReport,
    }),
    [accessToken, examType, templateId, indication, indicationFile, findings, contrast, sex, side, incidence, decubitus, reportText],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
