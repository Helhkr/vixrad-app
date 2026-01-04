import type { Template } from "../types";

type Props = {
  templates: Template[];
  value: string;
  onChange: (templateId: string) => void;
};

export function TemplateSelect({ templates, value, onChange }: Props) {
  return (
    <label>
      <div>Template base</div>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Selecione…</option>
        {templates.map((template) => (
          <option key={template.id} value={template.id}>
            {template.label}
          </option>
        ))}
      </select>
    </label>
  );
}
