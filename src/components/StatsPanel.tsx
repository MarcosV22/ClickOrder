interface StatsPanelProps {
  comparisons: number;
  swaps: number;
}

export default function StatsPanel({ comparisons, swaps }: StatsPanelProps) {
  return (
    <div
      className="flex gap-4"
    >
      <div
        className="flex flex-col items-center px-5 py-3 rounded panel-border bg-[#0d1635]/80 min-w-[110px]"
      >
        <span
          className="text-xs tracking-wider text-slate-300 uppercase mb-1 font-semibold"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          Comparações
        </span>
        <span
          className="text-2xl font-bold text-cyan-300 glow-cyan"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          {comparisons}
        </span>
      </div>

      <div
        className="flex flex-col items-center px-5 py-3 rounded panel-border bg-[#0d1635]/80 min-w-[110px]"
      >
        <span
          className="text-xs tracking-wider text-slate-300 uppercase mb-1 font-semibold"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          Trocas
        </span>
        <span
          className="text-2xl font-bold text-purple-400 glow-purple"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          {swaps}
        </span>
      </div>
    </div>
  );
}
