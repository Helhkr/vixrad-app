"use client";

import { useMemo, useState } from "react";
import { MOCK_TEMPLATES } from "./mockTemplates";
import { ActionButtons } from "./components/ActionButtons";
import { ExamTypeSelect } from "./components/ExamTypeSelect";
import { FindingsInput } from "./components/FindingsInput";
import { IndicationInput } from "./components/IndicationInput";
import { TemplateSelect } from "./components/TemplateSelect";
import type { ExamType } from "./types";

export function ReportEditor() {
  const [examType, setExamType] = useState<ExamType | "">("");
  const [templateId, setTemplateId] = useState<string>("");
  const [indication, setIndication] = useState<string>("");
  const [findings, setFindings] = useState<string>("");
  const [reportText, setReportText] = useState<string>("");
  const [error, setError] = useState<string>("");

  const selectedTemplate = useMemo(() => {
    return MOCK_TEMPLATES.find((t) => t.id === templateId) ?? null;
  }, [templateId]);

  const canCopyNormal = Boolean(selectedTemplate);

  function handleCopyNormal() {
    setError("");
    if (!selectedTemplate) {
      setError("Selecione um template antes de copiar.");
      return;
    }
    setReportText(selectedTemplate.normalText);
  }

  function handleGenerateAi() {
    setError("Geração por IA ainda não está implementada nesta fase.");
  }

  function handleNewReport() {
    setExamType("");
    setTemplateId("");
    setIndication("");
    setFindings("");
    setReportText("");
    setError("");
  }

  return (
    <section style={{ display: "grid", gap: 12, maxWidth: 900 }}>
      <h2>Editor de Laudos</h2>

      <ExamTypeSelect value={examType} onChange={setExamType} />
      <TemplateSelect templates={MOCK_TEMPLATES} value={templateId} onChange={setTemplateId} />
      <IndicationInput value={indication} onChange={setIndication} />
      <FindingsInput value={findings} onChange={setFindings} />

      <ActionButtons
        canCopyNormal={canCopyNormal}
        onCopyNormal={handleCopyNormal}
        onGenerateAi={handleGenerateAi}
        onNewReport={handleNewReport}
      />

      {error ? (
        <p style={{ color: "crimson" }} role="alert">
          {error}
        </p>
      ) : null}

      <div>
        <div>Laudo</div>
        <textarea value={reportText} readOnly rows={14} style={{ width: "100%" }} />
      </div>
    </section>
  );
}
