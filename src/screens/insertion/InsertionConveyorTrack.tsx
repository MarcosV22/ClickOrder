import React from "react";
import NumberedBox from "../../components/NumberedBox";
import InsertionHoleSlot from "../../components/InsertionHoleSlot";
import type { InsertionSortState } from "../../game/sorting/insertion";

export interface InsertionConveyorTrackProps {
  gameState: InsertionSortState;
  animatingShiftIndex?: number | null;
  animatingInsert?: boolean;
  showIndex?: boolean;
  boxSize?: "sm" | "md" | "lg";
  progressPercent?: number;
}

export default function InsertionConveyorTrack({
  gameState,
  animatingShiftIndex = null,
  animatingInsert = false,
  showIndex = false,
  boxSize = "lg",
  progressPercent,
}: InsertionConveyorTrackProps) {
  const currentPass = Math.min(gameState.i, Math.max(1, gameState.arrayLength - 1));
  const totalPasses = Math.max(1, gameState.arrayLength - 1);
  const isCompare = gameState.phase === "COMPARE_AND_SHIFT";
  const isInsertReady = gameState.phase === "INSERT_READY";
  const railHeightClass =
    boxSize === "sm" ? "h-16" : boxSize === "md" ? "h-20" : "h-24 sm:h-28";

  // Texto descritivo para leitores de tela e acessibilidade cognitiva
  const getAccessibleStatus = () => {
    if (gameState.completed) {
      return "Lote de cargas completamente organizado em ordem crescente.";
    }
    if (isInsertReady) {
      return `Chave ${gameState.key} suspensa no trilho aéreo. A cabeceira da esteira foi alcançada. Existe uma vaga física aberta na posição 1. A chave está pronta para ser encaixada.`;
    }
    if (isCompare && gameState.j >= 0) {
      const comparedVal = gameState.currentValues[gameState.j];
      const holePos = (gameState.holeIndex ?? 0) + 1;
      return `Chave ${gameState.key} suspensa no trilho aéreo. Vaga física aberta na posição ${holePos}. Inspecionando carga ${comparedVal} na posição ${gameState.j + 1}.`;
    }
    return "Esteira de triagem do Insertion Sort.";
  };

  return (
    <div
      role="region"
      aria-label="Área Operacional do Trilho Aéreo e Esteira do Insertion Sort"
      className="w-full bg-[#0d1635]/90 border border-amber-500/20 rounded-2xl p-4 sm:p-5 flex flex-col items-center gap-3 shadow-2xl relative overflow-hidden"
    >
      {/* Ambient Glow sutil */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-24 bg-amber-500/10 blur-[80px] pointer-events-none" />

      {/* Subheader com status pedagógico claro e discreto (sem índices técnicos na camada básica) */}
      <div className="w-full flex justify-between items-center px-1 text-xs font-mono">
        <span className="text-amber-300 font-medium">
          {gameState.completed ? (
            <span className="text-emerald-400">✓ Lote completamente ordenado</span>
          ) : isInsertReady ? (
            <span className="text-amber-300">
              Passada {currentPass} de {totalPasses} • Espaço aberto (Pronto para encaixar a chave)
            </span>
          ) : (
            <span>
              Passada {currentPass} de {totalPasses} • Comparando com elemento anterior
            </span>
          )}
        </span>

        {progressPercent !== undefined && (
          <span className="text-[11px] text-slate-400 font-bold">
            {progressPercent}%
          </span>
        )}
      </div>

      {/* Região A: Trilho Aéreo de Suspensão */}
      <div className="w-full flex flex-col items-center gap-1.5 pb-2.5 border-b border-dashed border-white/10">
        <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-amber-400/80 uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span>TRILHO AÉREO DE SUSPENSÃO</span>
          <span className="text-amber-500/50">•</span>
          <span>CHAVE SUSPENSA</span>
        </div>

        <div className={`${railHeightClass} flex items-center justify-center`}>
          {gameState.key !== null && !gameState.completed ? (
            <div
              className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                animatingInsert ? "translate-y-10 opacity-80 scale-95" : ""
              }`}
              aria-label={`Chave ativa no trilho aéreo: valor ${gameState.key}`}
            >
              <NumberedBox
                value={gameState.key}
                index={-1}
                role="key"
                badge="CHAVE"
                size={boxSize}
                showIndex={false}
              />
            </div>
          ) : (
            <div className="px-5 py-2.5 rounded-lg border border-dashed border-white/10 bg-white/[0.02] text-xs font-mono text-white/30 tracking-wider select-none">
              TRILHO LIVRE
            </div>
          )}
        </div>
      </div>

      {/* Região B: Esteira de Triagem com Cargas e Vaga Física */}
      <div className="w-full flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-cyan-400/80 uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span>ESTEIRA DE TRIAGEM</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 py-1">
          {gameState.currentValues.map((val, idx) => {
            // Caso VAGA FÍSICA: espaço livre para onde uma carga desliza ou a chave encaixa
            // Invariante: a vaga nunca é verde, nunca é ORD, nunca é OK
            if (val === null || idx === gameState.holeIndex) {
              return (
                <div key={`hole-${idx}`} className="relative">
                  <InsertionHoleSlot index={idx} size={boxSize} showIndex={showIndex} />
                </div>
              );
            }

            // Elemento sob inspeção ativa (scanner j)
            const isObserved = !gameState.completed && isCompare && idx === gameState.j;
            const isShiftAnimating = animatingShiftIndex === idx;

            // Invariante Semântica UX-PRACTICE-R2.1:
            // - Em execução (!completed): ORD LOCAL NÃO É OK DEFINITIVO.
            //   Elementos do prefixo [0..orderedBoundary] podem deslizar novamente;
            //   portanto, não recebem acabamento verde/esmeralda nem badge OK/ORD na camada primária.
            // - Apenas quando completed === true todo o lote recebe acabamento 'sorted' (esmeralda / OK).
            const boxRole = gameState.completed ? "sorted" : isObserved ? "scan" : "default";

            return (
              <div key={`box-${idx}-${val}`} className="relative flex flex-col items-center gap-1">
                <NumberedBox
                  value={val}
                  index={idx}
                  role={boxRole}
                  badge={gameState.completed ? undefined : ""}
                  size={boxSize}
                  animating={isShiftAnimating ? "right" : null}
                  showIndex={showIndex}
                />

                {/* Rótulo textual limpo sob a caixa: apenas para o elemento observado */}
                <div className="h-5 flex items-center justify-center">
                  {isObserved ? (
                    <span className="text-[11px] font-mono font-bold text-cyan-300 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-400/50 uppercase tracking-wider">
                      OBSERVANDO
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

      {/* Região Acessível Invisível para Leitores de Tela */}
      <div className="sr-only" aria-live="polite">
        {getAccessibleStatus()}
      </div>
    </div>
  );
}
