import { useState, useRef } from "react";
import GameButton from "../components/GameButton";
import NumberedBox from "../components/NumberedBox";
import InstructionPanel from "../components/InstructionPanel";
import {
  createBubbleSortState,
  executeUserStep,
  getExpectedComparison,
  getSortedIndices,
} from "../game/sorting/bubbleSortEngine";
import {
  TUTORIAL_INITIAL_ARRAY,
  getTutorialStepInfo,
} from "../game/tutorial/tutorialGuide";
import type { UserDecision } from "../game/sorting/types";

interface TutorialScreenProps {
  onUnderstood: () => void;
  onBack: () => void;
}

export default function TutorialScreen({ onUnderstood, onBack }: TutorialScreenProps) {
  const [gameState, setGameState] = useState(() =>
    createBubbleSortState(TUTORIAL_INITIAL_ARRAY)
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const [animatingPair, setAnimatingPair] = useState<{ left: number; right: number } | null>(null);
  const [message, setMessage] = useState<{
    text: string;
    type: "info" | "warning" | "success" | "error";
  }>({
    text: "Observe o primeiro par destacado (#1 e #2). Decida se eles devem TROCAR ou MANTER a posição.",
    type: "info",
  });

  const isActionLockedRef = useRef(false);

  const stepInfo = getTutorialStepInfo(gameState);
  const expected = getExpectedComparison(gameState);
  const sortedIndices = getSortedIndices(gameState);

  const handleDecision = (decision: UserDecision) => {
    if (isActionLockedRef.current || isAnimating || gameState.completed) return;

    if (decision === "SWAP") {
      const result = executeUserStep(gameState, "SWAP");
      if (result.valid && expected) {
        isActionLockedRef.current = true;
        setIsAnimating(true);
        setAnimatingPair({ left: expected.leftIndex, right: expected.rightIndex });
        setMessage({ text: result.explanation, type: "success" });

        setTimeout(() => {
          setGameState(result.state);
          setAnimatingPair(null);
          setIsAnimating(false);
          isActionLockedRef.current = false;
        }, 500);
      } else {
        setMessage({
          text: result.explanation,
          type: "warning",
        });
      }
    } else {
      // KEEP
      const result = executeUserStep(gameState, "KEEP");
      if (result.valid) {
        setGameState(result.state);
        setMessage({ text: result.explanation, type: "success" });
      } else {
        setMessage({
          text: result.explanation,
          type: "warning",
        });
      }
    }
  };

  const handleResetTutorial = () => {
    setGameState(createBubbleSortState(TUTORIAL_INITIAL_ARRAY));
    setIsAnimating(false);
    setAnimatingPair(null);
    isActionLockedRef.current = false;
    setMessage({
      text: "Treinamento reiniciado. Observe o par destacado e decida a ação correta.",
      type: "info",
    });
  };

  return (
    <div className="relative w-full h-full min-h-screen overflow-y-auto overflow-x-hidden bg-[#060b1a] bg-grid scanlines flex flex-col items-center justify-start pt-4 sm:pt-6 pb-16 sm:pb-24 px-4 select-none">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-72 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-4 sm:gap-5 max-w-2xl w-full">
        {/* Top bar */}
        <div className="w-full flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors cursor-pointer"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            <span>◀</span>
            <span>VOLTAR</span>
          </button>

          <div className="flex items-center gap-2">
            <span
              className="text-xs px-2.5 py-1 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 tracking-wider"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              TUTORIAL INTERATIVO
            </span>
          </div>

          <button
            onClick={handleResetTutorial}
            className="text-xs text-white/30 hover:text-white/70 transition-colors cursor-pointer"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            ↺ REINICIAR
          </button>
        </div>

        {/* Protocol badge & title */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span
              className="text-[11px] text-cyan-400 tracking-[0.25em] uppercase"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              BUBBLE SORT • COMPARAÇÃO DE PARES VIZINHOS
            </span>
          </div>
          <h2
            className="text-2xl font-black text-white tracking-tight"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            {stepInfo.title}
          </h2>
        </div>

        {/* Step telemetry bar */}
        <div className="w-full flex items-center justify-between px-1 text-xs font-mono">
          <span className="text-cyan-300/80 bg-cyan-950/40 border border-cyan-500/20 px-2 py-0.5 rounded">
            PASSADA {gameState.completed ? 2 : gameState.passIndex + 1}
          </span>
          <span className="text-white/40">
            COMPARAÇÃO {gameState.completed ? 3 : gameState.comparisonIndex + 1}/3
          </span>
        </div>

        {/* Context / Prompt Card */}
        <div className="w-full panel-border bg-[#0d1635]/70 rounded-xl p-4 sm:p-5 text-center">
          <p
            className="text-white/80 text-sm leading-relaxed"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            {stepInfo.prompt}
          </p>
        </div>

        {/* Conveyor belt with boxes */}
        <div className="w-full panel-border bg-[#080f28]/90 rounded-xl p-5 sm:p-6 flex flex-col items-center gap-4">
          <div className="w-full flex justify-between items-center px-2">
            <span
              className="text-[10px] text-cyan-400/60 tracking-widest font-mono"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              ESTEIRA DE TREINAMENTO
            </span>
            <span
              className="text-[10px] text-white/30 tracking-widest font-mono"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              CAPACIDADE: 3 PKG
            </span>
          </div>

          {/* Top rail */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

          {/* Conveyor track */}
          <div className="conveyor-track py-6 px-6 sm:px-12 rounded-xl relative flex items-center justify-center gap-4 sm:gap-8 w-full">
            {/* Corner indicators */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-cyan-500/30 pointer-events-none" />
            <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-cyan-500/30 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-cyan-500/30 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-cyan-500/30 pointer-events-none" />

            {gameState.currentValues.map((val, idx) => {
              const isSelected =
                !gameState.completed &&
                expected !== null &&
                (idx === expected.leftIndex || idx === expected.rightIndex);
              const isSorted = sortedIndices.includes(idx);
              const anim =
                animatingPair?.left === idx
                  ? "right"
                  : animatingPair?.right === idx
                    ? "left"
                    : null;

              return (
                <NumberedBox
                  key={`box-${idx}-${val}`}
                  value={val}
                  index={idx}
                  role={isSelected ? "pair" : isSorted ? "sorted" : "default"}
                  disabled={isAnimating || gameState.completed}
                  animating={anim}
                  size="lg"
                  onClick={() => {}}
                />
              );
            })}
          </div>

          {/* Bottom rail */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

          {/* Active pair callout under conveyor */}
          {!gameState.completed && expected ? (
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-300/80">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span>
                COMPARAÇÃO ATIVA: #{expected.leftIndex + 1} ({expected.leftValue}) vs #{expected.rightIndex + 1} ({expected.rightValue})
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>TODAS AS CARGAS ESTÃO EM ORDEM CRESCENTE</span>
            </div>
          )}

          {/* Semantics role legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 border-t border-white/5 text-[10px] font-mono text-white/50 select-none">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-cyan-500/30 border border-cyan-400" />
              PAR (Vizinhos sob Inspeção)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500/30 border border-emerald-500" />
              OK (Consolidado)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-blue-950 border border-blue-500/30" />
              PKG (Aguardando)
            </span>
          </div>
        </div>

        {/* Pass Notice Callout (Concept of Pass) */}
        {stepInfo.passNotice && !gameState.completed && (
          <div className="w-full panel-border bg-purple-950/25 border-purple-500/30 rounded-xl p-4 flex items-start gap-3 animate-fade-in">
            <span className="text-purple-400 text-lg leading-none mt-0.5">✦</span>
            <div className="flex flex-col gap-1">
              <span
                className="text-xs font-bold text-purple-300 tracking-wider font-mono uppercase"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                {stepInfo.passNotice.title}
              </span>
              <p
                className="text-white/70 text-xs leading-relaxed font-mono"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                {stepInfo.passNotice.description}
              </p>
            </div>
          </div>
        )}

        {/* Operator Decision Controls (TROCAR vs MANTER) */}
        {!gameState.completed && (
          <div className="w-full flex flex-col items-center gap-3">
            <span
              className="text-[10px] text-white/40 tracking-widest font-mono"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              DECISÃO DO OPERADOR
            </span>

            <div className="flex items-center justify-center gap-4 w-full">
              <GameButton
                onClick={() => handleDecision("SWAP")}
                disabled={isAnimating || gameState.completed}
                variant="primary"
                size="md"
                className="min-w-[150px] shadow-[0_0_15px_rgba(0,245,255,0.25)]"
              >
                ⇄ TROCAR
              </GameButton>

              <GameButton
                onClick={() => handleDecision("KEEP")}
                disabled={isAnimating || gameState.completed}
                variant="secondary"
                size="md"
                className="min-w-[150px]"
              >
                = MANTER
              </GameButton>
            </div>
          </div>
        )}

        {/* Instruction feedback panel */}
        <div className="w-full">
          <InstructionPanel message={message.text} type={message.type} />
        </div>

        {/* Completion Panel */}
        {gameState.completed ? (
          <div className="w-full panel-border bg-emerald-950/20 border-emerald-500/40 rounded-xl p-6 flex flex-col items-center gap-5 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-emerald-500/30 bg-emerald-950/40">
              <span
                className="text-[10px] text-emerald-300 font-mono tracking-widest uppercase"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                ✓ TREINAMENTO BÁSICO CONCLUÍDO
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <h3
                className="text-xl sm:text-2xl font-bold text-white tracking-wider"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                VETOR [1, 2, 3] ESTABILIZADO!
              </h3>
              <p
                className="text-white/70 text-xs sm:text-sm font-mono max-w-lg leading-relaxed"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                Você concluiu o treinamento básico e praticou a invariante fundamental do Protocolo Bubble: comparar vizinhos, trocar apenas quando fora de ordem e consolidar elementos ao fim de cada passada.
              </p>
            </div>

            {/* Checklist of practiced concepts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full text-left max-w-lg bg-[#060b1a]/60 p-3 rounded-lg border border-white/5 font-mono text-[11px] text-white/70">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                <span>Comparações adjacentes</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                <span>Troca quando esquerda &gt; direita</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                <span>Manter quando esquerda ≤ direita</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                <span>Conceito de passada e consolidação</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <GameButton
                onClick={onUnderstood}
                variant="primary"
                size="md"
                className="min-w-[200px] shadow-[0_0_20px_rgba(0,245,255,0.4)]"
              >
                <span>INICIAR FASE 1</span>
                <span className="shrink-0" aria-hidden="true">→</span>
              </GameButton>

              <GameButton
                onClick={handleResetTutorial}
                variant="ghost"
                size="md"
                icon="↺"
              >
                REPETIR TREINAMENTO
              </GameButton>
            </div>
          </div>
        ) : (
          /* Rules reference during tutorial */
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="panel-border bg-[#0d1635]/40 rounded-lg p-3.5 flex flex-col gap-1.5">
              <span
                className="text-cyan-400 text-[11px] tracking-widest font-mono font-bold"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                REGRA 01 — TROCAR
              </span>
              <p
                className="text-white/60 text-xs leading-relaxed font-mono"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                Se a carga da <span className="text-yellow-300">esquerda</span> for{" "}
                <span className="text-red-400 font-bold">maior</span> que a da{" "}
                <span className="text-yellow-300">direita</span>, acione{" "}
                <span className="text-cyan-300 font-bold">TROCAR</span>.
              </p>
            </div>

            <div className="panel-border bg-[#0d1635]/40 rounded-lg p-3.5 flex flex-col gap-1.5">
              <span
                className="text-purple-400 text-[11px] tracking-widest font-mono font-bold"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                REGRA 02 — MANTER
              </span>
              <p
                className="text-white/60 text-xs leading-relaxed font-mono"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                Se a carga da <span className="text-yellow-300">esquerda</span> for{" "}
                <span className="text-emerald-400 font-bold">menor ou igual</span>, a ordem relativa está certa: acione{" "}
                <span className="text-purple-300 font-bold">MANTER</span>.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
