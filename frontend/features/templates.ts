import { apiGet } from "./api";

export type TemplateOption = {
  id: string;
  label: string;
};

export type TemplateListItem = {
  id: string;
  name: string;
  examType: string;
};

export async function fetchCtTemplates(accessToken: string): Promise<TemplateOption[]> {
  const items = await apiGet<TemplateListItem[]>("/templates", accessToken);

  return items
    .filter((t) => t.examType === "CT")
    .map((t) => ({ id: t.id, label: t.name }));
}
