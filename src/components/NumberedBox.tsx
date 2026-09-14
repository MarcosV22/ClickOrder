export type BoxRole =
  | "target"
  | "min"
  | "target-min"
  | "scan"
  | "scan-min"
  | "sorted"
  | "pair"
  | "default";

interface NumberedBoxProps {
  value: number;
  index: number;
  selected?: boolean;
  disabled?: boolean;
  sorted?: boolean;
  role?: BoxRole;
  badge?: string;
  onClick?: (index: number) => void;
  animating?: "left" | "right" | null;
  swapDistance?: number;
  size?: "sm" | "md" | "lg";
}

export default function NumberedBox({
  value,
  index,
  selected = false,
  disabled = false,
  sorted = false,
  role,
  badge,
  onClick,
  animating = null,
  swapDistance,
  size = "lg",
}: NumberedBoxProps) {
  const sizeMap = {
    sm: { box: "w-16 h-16", text: "text-2xl", label: "text-xs" },
    md: { box: "w-20 h-20", text: "text-3xl", label: "text-xs" },
    lg: { box: "w-28 h-28", text: "text-4xl", label: "text-xs" },
  };

  const s = sizeMap[size];

  const animClass =
    animating === "left"
      ? "animate-swap-left"
      : animating === "right"
        ? "animate-swap-right"
        : "";

  // Resolução da semântica visual por role ou legado (selected/sorted)
  const resolvedRole: BoxRole =
    role ?? (selected ? "pair" : sorted ? "sorted" : "default");

  const getRoleBadge = (r: BoxRole): string => {
    switch (r) {
      case "target":
        return "ALVO";
      case "min":
        return "MÍN";
      case "target-min":
        return "ALVO • MÍN";
      case "scan":
        return "SCAN";
      case "scan-min":
        return "MÍN • SCAN";
      case "sorted":
        return "OK";
      case "pair":
        return "PAR";
      case "default":
      default:
        return "PKG";
    }
  };

  const getRoleClasses = (r: BoxRole) => {
    switch (r) {
      case "target-min":
        return {
          bg: "bg-amber-950/70 shadow-lg shadow-amber-900/30",
          border: "2px solid #f59e0b",
          text: "text-amber-200",
          badgeColor: "text-amber-300 font-bold",
          pulse: false,
        };
      case "target":
        return {
          bg: "bg-amber-950/50",
          border: "2px solid #f59e0b",
          text: "text-amber-300",
          badgeColor: "text-amber-400",
          pulse: false,
        };
      case "min":
        return {
          bg: "bg-purple-950/60 shadow-lg shadow-purple-900/30",
          border: "2px solid #a855f7",
          text: "text-purple-300 glow-purple",
          badgeColor: "text-purple-300 font-bold",
          pulse: false,
        };
      case "scan-min":
        return {
          bg: "bg-purple-950/70 animate-pulse-border",
          border: "2px solid #00f5ff",
          text: "text-cyan-200 glow-cyan",
          badgeColor: "text-cyan-300 font-bold",
          pulse: true,
        };
      case "scan":
        return {
          bg: "bg-cyan-950/60 animate-pulse-border",
          border: "2px solid #00f5ff",
          text: "text-cyan-300 glow-cyan",
          badgeColor: "text-cyan-400 font-bold",
          pulse: true,
        };
      case "sorted":
        return {
          bg: "bg-emerald-950 box-glow-idle",
          border: "1px solid rgba(16,185,129,0.3)",
          text: "text-emerald-400",
          badgeColor: "text-emerald-500/70",
          pulse: false,
        };
      case "pair":
        return {
          bg: "bg-cyan-950 animate-pulse-border",
          border: "2px solid #00f5ff",
          text: "text-cyan-300 glow-cyan",
          badgeColor: "text-cyan-400",
          pulse: true,
        };
      case "default":
      default:
        return {
          bg: disabled
            ? "bg-slate-900/50 box-glow-disabled cursor-not-allowed opacity-50"
            : "bg-[#0f1e4a] box-glow-idle hover:bg-[#162460] hover:scale-105",
          border: "1px solid rgba(42,74,158,0.8)",
          text: "text-white",
          badgeColor: "text-white/20",
          pulse: false,
        };
    }
  };

  const getRoleDescription = (r: BoxRole): string => {
    switch (r) {
      case "target-min":
        return "posição alvo e candidato mínimo";
      case "target":
        return "posição alvo (i)";
      case "min":
        return "candidato mínimo";
      case "scan-min":
        return "scanner ativo e candidato mínimo";
      case "scan":
        return "scanner ativo de inspeção (j)";
      case "sorted":
        return "consolidada na posição correta";
      case "pair":
        return "em comparação adjacente";
      case "default":
      default:
        return "não consolidada";
    }
  };

  const roleStyles = getRoleClasses(resolvedRole);
  const displayBadge = badge ?? getRoleBadge(resolvedRole);
  const roleDescription = getRoleDescription(resolvedRole);

  return (
    <div
      className={`relative flex flex-col items-center gap-1 ${animClass} ${animClass ? "z-30" : "z-10"}`}
      style={
        swapDistance !== undefined && swapDistance > 1
          ? ({ "--swap-distance": swapDistance } as React.CSSProperties)
          : undefined
      }
    >
      {/* Box number label above */}
      <span
        className="text-white/30 font-mono"
        style={{ fontFamily: "'Space Mono', monospace", fontSize: "10px" }}
      >
        #{index + 1}
      </span>

      <button
        onClick={() => !disabled && onClick?.(index)}
        disabled={disabled || !onClick}
        aria-label={`Caixa #${index + 1}, valor ${value}, papel: ${roleDescription}, estado ${displayBadge}`}
        className={`
          relative ${s.box} rounded-lg flex flex-col items-center justify-center
          transition-all duration-200 cursor-pointer select-none
          focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#060b1a]
          ${roleStyles.bg}
        `}
        style={{
          border: roleStyles.border,
        }}
      >
        {/* Inner highlight */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-t-lg" />

        {/* Value */}
        <span
          className={`${s.text} font-bold ${roleStyles.text}`}
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          {value}
        </span>

        {/* Bottom label */}
        <span
          className={`absolute bottom-1.5 text-[9px] font-mono tracking-widest ${roleStyles.badgeColor}`}
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          {displayBadge}
        </span>
      </button>
    </div>
  );
}
