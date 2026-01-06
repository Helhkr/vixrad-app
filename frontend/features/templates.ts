import { apiGet } from "./api";

export type TemplateOption = {
  id: string;
  label: string;
  examType: string;
};

export type TemplateListItem = {
  id: string;
  name: string;
  examType: string;
};

export type TemplateRequires = {
  indication: "required" | "optional" | "none" | "fixed";
  sex: "required" | "optional" | "none" | "fixed";
  contrast: "required" | "optional" | "none" | "fixed";
  side: "required" | "optional" | "none" | "fixed";
  incidence: "required" | "optional" | "none" | "fixed";
  decubitus: "required" | "optional" | "none" | "fixed";
};

export type TemplateDetail = {
  id: string;
  name: string;
  examType: string;
  requires: TemplateRequires;
};

export async function fetchTemplatesByExamType(
  examType: string,
  accessToken: string,
): Promise<TemplateOption[]> {
  const items = await apiGet<TemplateListItem[]>(
    `/templates?examType=${encodeURIComponent(examType)}`,
    accessToken,
  );

  return items.map((t) => ({ id: t.id, label: t.name, examType: t.examType }));
}

export async function fetchTemplateDetail(
  templateId: string,
  accessToken: string,
): Promise<TemplateDetail> {
  return apiGet<TemplateDetail>(`/templates/${encodeURIComponent(templateId)}`, accessToken);
}
