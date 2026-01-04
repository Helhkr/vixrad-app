type Props = {
  canCopyNormal: boolean;
  onCopyNormal: () => void;
  onNewReport: () => void;
  onGenerateAi: () => void;
};

export function ActionButtons({
  canCopyNormal,
  onCopyNormal,
  onNewReport,
  onGenerateAi
}: Props) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <button type="button" disabled={!canCopyNormal} onClick={onCopyNormal}>
        Copiar Laudo Normal
      </button>
      <button type="button" onClick={onGenerateAi}>
        Gerar Laudo (IA)
      </button>
      <button type="button" onClick={onNewReport}>
        Novo Laudo
      </button>
    </div>
  );
}
