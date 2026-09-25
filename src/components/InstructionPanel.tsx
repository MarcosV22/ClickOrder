interface InstructionPanelProps {
  message: string;
  type?: "info" | "warning" | "success" | "error";
}

const typeConfig = {
  info: {
    border: "border-cyan-500/40",
    bg: "bg-[#0b1739]/90",
    icon: "◈",
    iconColor: "text-cyan-400",
    tag: "INSTRUÇÃO",
    tagBg: "bg-cyan-950/80 text-cyan-300 border-cyan-500/30",
    textColor: "text-cyan-100",
  },
  warning: {
    border: "border-amber-500/40",
    bg: "bg-[#1f1708]/90",
    icon: "⚠",
    iconColor: "text-amber-400",
    tag: "ATENÇÃO",
    tagBg: "bg-amber-950/80 text-amber-300 border-amber-500/30",
    textColor: "text-amber-100",
  },
  success: {
    border: "border-emerald-500/40",
    bg: "bg-[#081f14]/90",
    icon: "✓",
    iconColor: "text-emerald-400",
    tag: "CORRETO",
    tagBg: "bg-emerald-950/80 text-emerald-300 border-emerald-500/30",
    textColor: "text-emerald-100",
  },
  error: {
    border: "border-rose-500/40",
    bg: "bg-[#210910]/90",
    icon: "✕",
    iconColor: "text-rose-400",
    tag: "ERRO",
    tagBg: "bg-rose-950/80 text-rose-300 border-rose-500/30",
    textColor: "text-rose-100",
  },
};

export default function InstructionPanel({ message, type = "info" }: InstructionPanelProps) {
  const cfg = typeConfig[type];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-start sm:items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${cfg.border} ${cfg.bg}`}
    >
      <span className={`text-lg ${cfg.iconColor} flex-shrink-0 mt-0.5 sm:mt-0`} aria-hidden="true">
        {cfg.icon}
      </span>
      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 flex-1 min-w-0">
        <span
          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase border flex-shrink-0 w-fit ${cfg.tagBg}`}
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          {cfg.tag}
        </span>
        <p
          className={`text-sm sm:text-base leading-relaxed font-medium ${cfg.textColor}`}
          style={{ fontFamily: "'Exo 2', sans-serif" }}
        >
          {message}
        </p>
      </div>
    </div>
  );
}
