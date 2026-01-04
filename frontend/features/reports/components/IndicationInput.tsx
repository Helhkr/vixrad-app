type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function IndicationInput({ value, onChange }: Props) {
  return (
    <label>
      <div>Indicação clínica (opcional)</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder="Ex.: cefaleia, trauma, etc."
      />
    </label>
  );
}
