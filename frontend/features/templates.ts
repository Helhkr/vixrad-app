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
