export type BoxRole =
  | "target"
  | "min"
  | "target-min"
  | "scan"
  | "scan-min"
  | "sorted"
  | "ordered"
  | "ordered-scan"
  | "pair"
  | "key"
  | "default";

interface NumberedBoxProps {
  value: number;
  index: number;
  elementLabel?: string;
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
  elementLabel,
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
      case "ordered":
        return "ORD";
      case "ordered-scan":
        return "ORD • SCAN";
      case "pair":
        return "PAR";
      case "key":
        return "CHAVE";
      case "default":
      default:
        return "PKG";
    }
  };

  const getRoleClasses = (r: BoxRole) => {
    switch (r) {
      case "key":
        return {
          bg: "bg-amber-950/80 shadow-lg shadow-amber-900/50",
          border: "2px solid #f59e0b",
          text: "text-amber-200",
          badgeColor: "text-amber-300 font-bold",
          pulse: true,
        };
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
      case "ordered-scan":
        return {
          bg: "bg-emerald-950/60 animate-pulse-border shadow-lg shadow-cyan-900/30",
          border: "2px solid #00f5ff",
          text: "text-cyan-200 glow-cyan",
          badgeColor: "text-cyan-300 font-bold",
          pulse: true,
        };
      case "sorted":
        return {
          bg: "bg-emerald-950/90 box-glow-idle",
          border: "1px solid rgba(16,185,129,0.5)",
          text: "text-emerald-300",
          badgeColor: "text-emerald-300 font-bold",
          pulse: false,
        };
      case "ordered":
        return {
          bg: "bg-emerald-950/50",
          border: "1px dashed rgba(16,185,129,0.7)",
          text: "text-emerald-300",
          badgeColor: "text-emerald-300 font-bold",
          pulse: false,
        };
      case "pair":
        return {
          bg: "bg-cyan-950/90 animate-pulse-border",
          border: "2px solid #00f5ff",
          text: "text-cyan-200 glow-cyan",
          badgeColor: "text-cyan-300 font-bold",
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
          badgeColor: "text-slate-400 font-medium",
          pulse: false,
        };
    }
  };

  const getRoleDescription = (r: BoxRole): string => {
    switch (r) {
      case "target-min":
        return "posição alvo e menor número";
      case "target":
        return "posição alvo (i)";
      case "min":
        return "menor número candidato";
      case "scan-min":
        return "posição em análise e menor número";
      case "scan":
        return "posição em análise (j)";
      case "ordered-scan":
        return "número na parte ordenada sob análise (j)";
      case "ordered":
        return "no grupo localmente ordenado";
      case "key":
        return "chave suspensa no trilho aéreo";
      case "sorted":
        return "em sua posição final ordenada";
      case "pair":
        return "em comparação direta";
      case "default":
      default:
        return "não ordenado";
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
        className="text-slate-300 font-mono font-bold"
        style={{ fontFamily: "'Space Mono', monospace", fontSize: "11px" }}
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
          className={`${s.text} font-bold ${roleStyles.text} flex items-baseline justify-center gap-1`}
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          {value}
          {elementLabel && (
            <span
              className="text-[11px] font-mono font-bold text-cyan-200 bg-[#060b1a]/80 px-1 py-0.2 rounded border border-cyan-400/40"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              {elementLabel}
            </span>
          )}
        </span>

        {/* Bottom label */}
        <span
          className={`absolute bottom-1.5 text-[9px] font-mono font-bold tracking-widest ${roleStyles.badgeColor}`}
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          {displayBadge}
        </span>
      </button>
    </div>
  );
}
