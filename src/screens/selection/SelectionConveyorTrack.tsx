import React from "react";
import NumberedBox from "../../components/NumberedBox";
import type { SelectionSortState } from "../../game/sorting/selection";

export interface SelectionConveyorTrackProps {
  gameState: SelectionSortState;
  sortedIndices: readonly number[];
  animatingPair: { target: number; min: number; distance?: number } | null;
  isAnimating: boolean;
  showTechnicalDetails?: boolean;
}

export default function SelectionConveyorTrack({
  gameState,
  sortedIndices,
  animatingPair,
  isAnimating,
  showTechnicalDetails = false,
}: SelectionConveyorTrackProps) {
  const currentPass = Math.min(gameState.i + 1, Math.max(1, gameState.arrayLength - 1));
  const totalPasses = Math.max(1, gameState.arrayLength - 1);

  return (
    <div
      className="w-full bg-[#0d1635]/90 border border-purple-500/20 rounded-2xl p-4 sm:p-5 flex flex-col items-center gap-3 shadow-xl"
      role="region"
      aria-label="Esteira de triagem do Selection Sort"
    >
      {/* Subheader com status pedagógico */}
      <div className="w-full flex justify-between items-center px-1 text-xs font-mono">
        <span className="text-purple-300 font-medium">
          {gameState.completed ? (
            <span className="text-emerald-400">✓ Vetor completamente ordenado</span>
          ) : gameState.phase === "COMMIT" ? (
            <span className="text-amber-300">
              Passada {currentPass} de {totalPasses} • Varredura concluída (Posicionar menor na próxima posição)
            </span>
          ) : (
            <span>
              Passada {currentPass} de {totalPasses} • Varrendo elementos sem mover as caixas
            </span>
          )}
        </span>

        {sortedIndices.length > 0 && (
          <span className="text-emerald-400 font-medium">
            {sortedIndices.length}{" "}
            {sortedIndices.length === 1 ? "posição ordenada" : "posições ordenadas"} ✓
          </span>
        )}
      </div>

      {/* Esteira com caixas e rótulos contextuais: uma informação visual principal por papel */}
      <div className="w-full overflow-x-auto py-1">
        <div className="flex items-center justify-center gap-3 sm:gap-6 min-w-max mx-auto px-2">
        {gameState.currentValues.map((val, idx) => {
          const isSorted = sortedIndices.includes(idx);
          const isTarget = !gameState.completed && idx === gameState.i;
          const isMin = !gameState.completed && idx === gameState.minIndex;
          const isScan =
            !gameState.completed &&
            gameState.phase === "INSPECT" &&
            idx === gameState.j;

          let role:
            | "sorted"
            | "target-min"
            | "target"
            | "min"
            | "scan"
            | "scan-min"
            | "default" = "default";

          if (isSorted) {
            role = "sorted";
          } else if (isTarget && isMin) {
            role = "target-min";
          } else if (isMin && isScan) {
            role = "scan-min";
          } else if (isTarget) {
            role = "target";
          } else if (isMin) {
            role = "min";
          } else if (isScan) {
            role = "scan";
          }

          let animatingDir: "left" | "right" | null = null;
          if (animatingPair) {
            if (idx === animatingPair.target) animatingDir = "right";
            if (idx === animatingPair.min) animatingDir = "left";
          }

          return (
            <div key={idx} className="flex flex-col items-center gap-2 select-none">
              {/* Indicador discreto da próxima posição a preencher (acima da caixa) */}
              <div className="h-5 flex items-center justify-center">
                {isTarget ? (
                  <span className="text-[10px] sm:text-[11px] font-mono font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/40 uppercase tracking-wider">
                    próxima posição
                  </span>
                ) : (
                  <span className="text-[10px] sm:text-[11px] font-mono opacity-0 select-none" aria-hidden="true">
                    espaço
                  </span>
                )}
              </div>

              {/* Caixa com outline/ring do scanner quando observada */}
              <div
                className={`transition-all rounded-xl ${
                  isScan
                    ? "ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#0d1635]"
                    : ""
                }`}
              >
                <NumberedBox
                  value={val}
                  index={idx}
                  role={role}
                  variant="learning"
                  showIndex={showTechnicalDetails}
                  animating={animatingDir}
                  disabled={isAnimating}
                />
              </div>

              {/* Rótulo textual único sob a caixa: apenas para menor atual ou elemento sob varredura */}
              <div className="h-6 flex items-center justify-center">
                {isMin ? (
                  <span className="text-xs font-mono font-bold text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/40">
                    menor atual
                  </span>
                ) : isScan ? (
                  <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-400/50 animate-pulse">
                    observando
                  </span>
                ) : (
                  <span className="text-[11px] font-mono opacity-0 select-none" aria-hidden="true">
                    —
                  </span>
                )}
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}
