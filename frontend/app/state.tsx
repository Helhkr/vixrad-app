"use client";

import type { ReactNode } from "react";
import React, { createContext, useContext, useMemo, useState } from "react";

export type ExamType = "CT" | "XR" | "US" | "MR" | "MG" | "DXA" | "NM";
export type Contrast = "with" | "without";

type AppState = {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;

  examType: ExamType | null;
  setExamType: (examType: ExamType | null) => void;
  templateId: string | null;
  setTemplateId: (templateId: string | null) => void;

  indication: string;
  setIndication: (value: string) => void;

  findings: string;
  setFindings: (value: string) => void;

  contrast: Contrast;
  setContrast: (value: Contrast) => void;

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
  const [findings, setFindings] = useState<string>("");
  const [contrast, setContrast] = useState<Contrast>("without");
  const [reportText, setReportText] = useState<string>("");

  const setAccessToken = (token: string | null) => {
    setAccessTokenState(token);
    if (typeof window === "undefined") return;
    if (token) window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
    else window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  };

  const resetReport = () => {
    setExamType(null);
    setTemplateId(null);
    setIndication("");
    setFindings("");
    setContrast("without");
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
      findings,
      setFindings,
      contrast,
      setContrast,
      reportText,
      setReportText,
      resetReport,
    }),
    [accessToken, examType, templateId, indication, findings, contrast, reportText],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
