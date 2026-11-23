/**
 * Componente visual que representa a vaga física (holeIndex) na esteira do Insertion Sort.
 *
 * Invariante arquitetural e semântica:
 * - A VAGA NUNCA recebe o badge "ORD" nem o role "ordered";
 * - Não passa null nem valores fictícios (como 0) para NumberedBox;
 * - Representa de forma límpida o espaço vago aguardando deslocamento ou inserção de chave.
 */

interface InsertionHoleSlotProps {
  index: number;
  size?: "sm" | "md" | "lg";
  showIndex?: boolean;
}

export default function InsertionHoleSlot({
  index,
  size = "lg",
  showIndex = false,
}: InsertionHoleSlotProps) {
  const sizeMap = {
    sm: { box: "w-16 h-16", text: "text-xs" },
    md: { box: "w-20 h-20", text: "text-sm" },
    lg: { box: "w-28 h-28", text: "text-sm" },
  };

  const s = sizeMap[size];

  return (
    <div
      role="status"
      aria-label={`Vaga física aberta na esteira, posição ${index + 1}`}
      className="relative flex flex-col items-center gap-1 select-none"
    >
      {/* Rótulo de índice da posição acima da vaga (alinhado com NumberedBox) */}
      {showIndex && (
        <span
          className="text-slate-400 font-mono font-bold"
          style={{ fontFamily: "'Space Mono', monospace", fontSize: "11px" }}
        >
          #{index + 1}
        </span>
      )}

      {/* Vaga física: fenda vazia limpa com borda tracejada e rótulo único VAGA */}
      <div
        className={`relative ${s.box} rounded-lg border-2 border-dashed border-amber-400/50 bg-amber-950/20 flex flex-col items-center justify-center transition-all duration-200`}
      >
        <span
          className={`${s.text} text-amber-400 font-mono font-bold tracking-widest uppercase`}
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          VAGA
        </span>
      </div>

      {/* Espaçador inferior para manter alinhamento com caixas com rótulo sob a esteira */}
      <div className="h-5" aria-hidden="true" />
    </div>
  );
}
