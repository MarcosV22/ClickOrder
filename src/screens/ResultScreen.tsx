import NumberedBox from "../components/NumberedBox";
import GameButton from "../components/GameButton";
import type { BubbleSortVariant } from "../game/sorting";
import {
  BUBBLE_SORT_PSEUDOCODE,
  BUBBLE_SORT_EARLY_EXIT_PSEUDOCODE,
  SELECTION_SORT_PSEUDOCODE,
} from "../game/replay";
import { formatElapsedTime } from "../game/session";

interface ResultScreenProps {
  finalArray: readonly number[];
  comparisons: number;
  swaps: number;
  errors: number;
  hintsUsed: number;
  score?: number;
  elapsedTimeMs?: number;
  phase: number;
  hasNextPhase?: boolean;
  protocol?: "bubble" | "selection";
  variant?: BubbleSortVariant;
  earlyExitTriggered?: boolean;
  terminationPass?: number;
  canonicalComparisons?: number;
  comparisonsAvoided?: number;
  onNext: () => void;
  onRepeat: () => void;
  onViewReplay?: () => void;
}

export default function ResultScreen({
  finalArray,
  comparisons,
  swaps,
  errors,
  hintsUsed,
  score,
  elapsedTimeMs,
  phase,
  hasNextPhase = true,
  protocol = "bubble",
  variant = "CANONICAL",
  earlyExitTriggered = false,
  terminationPass,
  canonicalComparisons = 10,
  comparisonsAvoided,
  onNext,
  onRepeat,
  onViewReplay,
}: ResultScreenProps) {
  const isSelection = protocol === "selection";
  const isEarlyExit = variant === "EARLY_EXIT" && !isSelection;
  const effectiveAvoided =
    comparisonsAvoided ?? Math.max(0, canonicalComparisons - comparisons);
  const pseudocodeLines: readonly {
    readonly id: string;
    readonly lineNumber: number;
    readonly indent: number;
    readonly text: string;
  }[] = isSelection
    ? SELECTION_SORT_PSEUDOCODE
    : isEarlyExit
      ? BUBBLE_SORT_EARLY_EXIT_PSEUDOCODE
      : BUBBLE_SORT_PSEUDOCODE;

  return (
    <div className="relative w-full h-full min-h-full overflow-y-auto bg-[#060b1a] bg-grid scanlines flex flex-col items-center justify-start pt-6 sm:pt-8 pb-16 sm:pb-24 px-4 sm:px-8">
      {/* Glow effects */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-5 sm:gap-6 max-w-3xl w-full px-4 sm:px-8 my-0">

        {/* Success badge */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-emerald-400/10 animate-ping" style={{ animationDuration: "2s" }} />
            <div className="relative w-16 h-16 rounded-full border-2 border-emerald-500/60 bg-emerald-950/50 flex items-center justify-center">
              <span className="text-2xl text-emerald-400">✓</span>
            </div>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-emerald-500/20 bg-emerald-950/20 mb-3">
              <span className="text-[10px] text-emerald-400 tracking-widest"
                style={{ fontFamily: "'Space Mono', monospace" }}>
                {isSelection
                  ? `PROTOCOLO SELECTION — FASE ${phase} CONCLUÍDA`
                  : isEarlyExit
                    ? `MODO DESAFIO — CENÁRIO ${phase} CONCLUÍDO`
                    : `FASE ${phase} CONCLUÍDA`}
              </span>
            </div>
            <h2
              className="text-4xl font-black text-white tracking-tight"
              style={{
                fontFamily: "'Orbitron', sans-serif",
                textShadow: "0 0 30px rgba(52,211,153,0.4)",
              }}
            >
              {isEarlyExit && earlyExitTriggered ? (
                <>
                  TÉRMINO
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-400">
                    ANTECIPADO!
                  </span>
                </>
              ) : (
                <>
                  ORDENAÇÃO
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-400">
                    CONCLUÍDA!
                  </span>
                </>
              )}
            </h2>
          </div>
        </div>

        {/* Final array */}
        <div className="w-full panel-border bg-[#080f28]/80 rounded-xl px-4 sm:px-8 py-5">
          <p
            className="text-center text-[10px] text-white/30 tracking-widest mb-4 uppercase"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            VETOR RESULTANTE CONSOLIDADO
          </p>
          <div className="w-full overflow-x-auto py-1">
            <div className="flex items-center justify-center gap-2.5 sm:gap-4 min-w-max mx-auto px-2">
              {finalArray.map((value, index) => (
                <NumberedBox
                  key={index}
                  value={value}
                  index={index}
                  selected={false}
                  disabled={false}
                  sorted={true}
                  onClick={() => {}}
                  size="md"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Stats + Pseudocode */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Stats */}
          <div className="panel-border bg-[#0d1635]/60 rounded-xl p-5 flex flex-col gap-4">
            {/* Bloco de Destaque: PONTUAÇÃO DO PROTOCOLO */}
            <div className="flex flex-col gap-1 pb-3 border-b border-white/10">
              <span
                className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                PONTUAÇÃO DO PROTOCOLO
              </span>
              <div className="flex items-baseline gap-2">
                <span
                  className="text-3xl font-black text-cyan-300"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}
                >
                  {score ?? 100}
                </span>
                <span
                  className="text-xs text-white/40"
                  style={{ fontFamily: "'Space Mono', monospace" }}
                >
                  / 100
                </span>
              </div>
              <span
                className="text-[9px] text-white/40 leading-normal"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                Erros: -10 | Dicas: -5 | Otimizações e tempo não afetam a pontuação
              </span>
            </div>

            <span
              className="text-[10px] text-white/30 tracking-widest uppercase"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              MÉTRICAS DA OPERAÇÃO
            </span>

            <div className="flex flex-col gap-3">
              {[
                ...(isEarlyExit
                  ? [
                      {
                        label: "Comparações Executadas",
                        value: String(comparisons),
                        color: "text-cyan-300",
                      },
                      {
                        label: "Máximo Canônico (n(n-1)/2)",
                        value: String(canonicalComparisons),
                        color: "text-white/40",
                      },
                      {
                        label: "Comparações Evitadas",
                        value: String(effectiveAvoided),
                        color: effectiveAvoided > 0 ? "text-emerald-300" : "text-white/40",
                      },
                      {
                        label: "Early Exit Disparado",
                        value: earlyExitTriggered
                          ? `SIM (Passada ${terminationPass ?? 1})`
                          : "NÃO",
                        color: earlyExitTriggered ? "text-emerald-400" : "text-amber-400",
                      },
                    ]
                  : [
                      {
                        label: "Comparações",
                        value: String(comparisons),
                        color: "text-cyan-300",
                      },
                    ]),
                { label: "Trocas", value: String(swaps), color: "text-purple-400" },
                {
                  label: "Decisões Incorretas",
                  value: String(errors),
                  color: errors > 0 ? "text-amber-400" : "text-white/60",
                },
                {
                  label: "Dicas Utilizadas",
                  value: String(hintsUsed),
                  color: hintsUsed > 0 ? "text-cyan-400" : "text-white/60",
                },
                {
                  label: "Tempo de Operação",
                  value: formatElapsedTime(elapsedTimeMs ?? 0),
                  color: "text-emerald-300",
                },
              ].map((stat) => (
                <div key={stat.label} className="flex justify-between items-center">
                  <span
                    className="text-xs text-white/40"
                    style={{ fontFamily: "'Space Mono', monospace" }}
                  >
                    {stat.label}
                  </span>
                  <span
                    className={`text-lg font-bold ${stat.color}`}
                    style={{ fontFamily: "'Orbitron', sans-serif" }}
                  >
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>

            {isEarlyExit && (
              <div className="mt-1 p-2.5 rounded-lg border border-cyan-500/20 bg-cyan-950/30 text-[10px] text-cyan-200/90 leading-relaxed font-mono">
                <span className="font-bold text-cyan-300 uppercase block mb-1">
                  Nota Pedagógica da Otimização:
                </span>
                {earlyExitTriggered
                  ? "Passada concluída sem trocas. O protocolo detectou que a esteira já está ordenada e encerrou a execução antecipadamente."
                  : "O elemento menor no final exigiu trocas em todas as passadas. O Early Exit não trouxe economia neste cenário (pior caso)."}
              </div>
            )}

            {isSelection && (
              <div className="mt-1 p-2.5 rounded-lg border border-purple-500/30 bg-purple-950/30 text-[11px] text-purple-200/90 leading-relaxed font-mono">
                <span className="font-bold text-purple-300 uppercase block mb-1">
                  Nota Pedagógica (Selection Sort):
                </span>
                Selection Sort realiza a varredura completa antes de efetuar no máximo uma troca por passada.
              </div>
            )}
          </div>

          {/* Pseudocode & Principle Panel */}
          <div className="panel-border bg-[#080f28]/80 rounded-xl p-5 flex flex-col gap-3">
            <span
              className="text-[10px] text-white/30 tracking-widest uppercase"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              {isSelection
                ? "PSEUDOCÓDIGO — SELECTION SORT"
                : isEarlyExit
                  ? "PSEUDOCÓDIGO — EARLY EXIT"
                  : "PSEUDOCÓDIGO — BUBBLE SORT"}
            </span>
            <div className="flex flex-col gap-0.5">
              {pseudocodeLines.map((item) => (
                <div
                  key={item.id}
                  className={`px-2 py-0.5 rounded text-[10px] leading-relaxed ${
                    item.id === "SWAP_STATEMENT" ||
                    item.id === "BREAK_STATEMENT" ||
                    item.id === "UPDATE_MIN"
                      ? isSelection
                        ? "bg-purple-950/40 text-purple-300"
                        : "bg-cyan-950/40 text-cyan-300"
                      : "text-white/40"
                  }`}
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    paddingLeft: `${Math.max(8, item.indent * 12 + 8)}px`,
                  }}
                >
                  {item.text}
                </div>
              ))}
            </div>

            {isSelection && (
              <div className="p-3.5 rounded-lg bg-purple-950/30 border border-purple-500/20 flex flex-col gap-2 mt-1">
                <p className="text-xs text-purple-200/90 leading-relaxed font-mono font-bold">
                  Selection Sort realiza a varredura completa antes de efetuar no máximo uma troca por passada.
                </p>
                <p className="text-[11px] text-white/60 leading-relaxed font-mono">
                  O algoritmo particiona a esteira: a sublista ordenada à esquerda e a desordenada à direita. O scanner inspeciona cada carga para localizar o menor item e, apenas no final da varredura, uma transferência pontual consolida a posição definitiva com o selo OK.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 w-full pt-2 pb-4">
          {onViewReplay && (
            <GameButton onClick={onViewReplay} variant="secondary" size="md">
              ▶ VER EXECUÇÃO
            </GameButton>
          )}
          <GameButton onClick={onRepeat} variant="secondary" size="md">
            {isEarlyExit ? "↺ REPETIR CENÁRIO" : "↺ REPETIR FASE"}
          </GameButton>
          <GameButton onClick={onNext} variant="primary" size="lg">
            {hasNextPhase
              ? isEarlyExit
                ? "PRÓXIMO CENÁRIO →"
                : "PRÓXIMA FASE →"
              : isEarlyExit
                ? "CONCLUIR DESAFIOS →"
                : "CONCLUIR PROTOCOLO →"}
          </GameButton>
        </div>
      </div>
    </div>
  );
}
