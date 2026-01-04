type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function FindingsInput({ value, onChange }: Props) {
  return (
    <label>
      <div>Achados do exame</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={8}
        placeholder="Descreva os achados técnicos do exame."
      />
    </label>
  );
}
