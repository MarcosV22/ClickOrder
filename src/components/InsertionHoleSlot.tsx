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
}

export default function InsertionHoleSlot({
  index,
  size = "lg",
}: InsertionHoleSlotProps) {
  const sizeMap = {
    sm: { box: "w-16 h-16", icon: "text-lg", label: "text-[10px]" },
    md: { box: "w-20 h-20", icon: "text-xl", label: "text-xs" },
    lg: { box: "w-28 h-28", icon: "text-2xl", label: "text-xs" },
  };

  const s = sizeMap[size];

  return (
    <div
      role="status"
      aria-label={`Vaga física aberta na esteira, posição ${index + 1}`}
      className={`relative ${s.box} rounded-xl border-2 border-dashed border-amber-400/50 bg-amber-950/20 flex flex-col items-center justify-between p-2 select-none transition-all duration-300 shadow-inner shadow-amber-900/30 animate-pulse`}
      style={{
        boxShadow: "inset 0 0 15px rgba(245, 158, 11, 0.15)",
      }}
    >
      {/* Top Badge: Sempre VAGA (nunca ORD) */}
      <span
        className={`${s.label} text-amber-400 font-mono tracking-widest font-black uppercase`}
        style={{ fontFamily: "'Space Mono', monospace" }}
      >
        VAGA
      </span>

      {/* Central Icon indicando abertura / recepção */}
      <div className="flex flex-col items-center justify-center">
        <span className={`${s.icon} text-amber-400/60 leading-none`}>⇣</span>
        <span className="text-[9px] font-mono text-amber-300/40 tracking-wider">
          ABERTA
        </span>
      </div>

      {/* Bottom Index Label */}
      <span
        className={`${s.label} text-white/40 font-mono`}
        style={{ fontFamily: "'Space Mono', monospace" }}
      >
        #{index + 1}
      </span>
    </div>
  );
}
