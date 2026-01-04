import type { ExamType } from "../types";

type Props = {
  value: ExamType | "";
  onChange: (value: ExamType | "") => void;
};

export function ExamTypeSelect({ value, onChange }: Props) {
  return (
    <label>
      <div>Tipo de exame</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as ExamType | "")}
      >
        <option value="">Selecione…</option>
        <option value="CT">Tomografia Computadorizada (TC)</option>
      </select>
    </label>
  );
}
