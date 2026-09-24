import { useState, useRef, useEffect } from "react";
import GameButton from "../components/GameButton";
import NumberedBox, { type BoxRole } from "../components/NumberedBox";
import InstructionPanel from "../components/InstructionPanel";
import {
  createMergeTutorialSession,
  executeMergeTutorialStep,
  getMergeTutorialStepInfo,
} from "../game/sorting/merge/mergeTutorialGuide";
import type { MergeDecision } from "../game/sorting/merge/types";

export interface MergeTutorialScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

export default function MergeTutorialScreen({
  onComplete,
  onBack,
}: MergeTutorialScreenProps) {
  const [session, setSession] = useState(() => createMergeTutorialSession());
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [message, setMessage] = useState<{
    text: string;
    type: "info" | "warning" | "success" | "error";
  }>({
    text: "Bem-vindo ao Treinamento do Merge Sort! O lote [4a, 1, 3, 4b] foi introduzido na estação. A metade esquerda foi dividida em subproblemas unitários. Compare as frentes para iniciar a confluência.",
    type: "info",
  });

  const completionRef = useRef<HTMLDivElement>(null);
  const stepInfo = getMergeTutorialStepInfo(session.engineState);
  const engineState = session.engineState;
  const activeInterval = engineState.activeInterval;

  useEffect(() => {
    if (session.completed && completionRef.current) {
      completionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [session.completed]);

  const handleDecision = (decision: MergeDecision) => {
    if (session.completed) return;

    const { session: nextSession, result, feedback } = executeMergeTutorialStep(
      session,
      decision,
    );
    setSession(nextSession);

    if (result.valid) {
      setMessage({ text: feedback, type: "success" });
      setShowHint(false);
    } else if (result.isPedagogicalError) {
      setMessage({ text: feedback, type: "warning" });
    } else {
      setMessage({ text: feedback, type: "error" });
    }
  };

  const handleToggleHint = () => {
    if (!showHint) {
      setHintsUsed((h) => h + 1);
    }
    setShowHint((prev) => !prev);
  };

  const handleRestart = () => {
    setSession(createMergeTutorialSession());
    setShowHint(false);
    setHintsUsed(0);
    setMessage({
      text: "Tutorial reiniciado. Siga as orientações para dominar a intercalação estável com dois ponteiros.",
      type: "info",
    });
  };

  // Determinação dos papéis visuais de cada caixa na esteira principal
  const getBoxRole = (index: number): BoxRole => {
    if (engineState.completed) return "sorted";
    if (!activeInterval) return "default";

    const inActiveRange =
      index >= activeInterval.left && index <= activeInterval.right;
    if (!inActiveRange) return "default";

    if (index === engineState.p1 && engineState.p1 <= activeInterval.mid) {
      return "pair";
    }
    if (index === engineState.p2 && engineState.p2 <= activeInterval.right) {
      return "pair";
    }
    return "ordered";
  };

  return (
    <div
      className="relative w-full h-full min-h-screen overflow-y-auto overflow-x-hidden bg-[#060b1a] bg-grid scanlines flex flex-col items-center justify-start py-6 px-4 text-white select-none"
      role="region"
      aria-label="Tutorial Guiado do Merge Sort"
    >
      {/* Luz ambiente de fundo */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Conteúdo Principal Centralizado */}
      <main className="relative z-10 flex flex-col items-center gap-6 max-w-4xl w-full my-auto">
        {/* Barra Superior / Header */}
        <header className="flex items-center justify-between w-full border-b border-white/10 pb-4">
          <GameButton
            onClick={onBack}
            variant="ghost"
            size="sm"
            icon="←"
            className="text-white/70 hover:text-white"
          >
            VOLTAR
          </GameButton>

          <div className="flex flex-col items-center text-center">
            <span
              className="text-[10px] sm:text-xs font-mono tracking-widest text-blue-400 uppercase font-bold"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              TUTORIAL GUIADO • MERGE SORT
            </span>
            <span
              className="text-xs sm:text-sm text-white/90 font-mono font-semibold"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              {stepInfo.title}
            </span>
          </div>

          <GameButton
            onClick={handleRestart}
            variant="ghost"
            size="sm"
            icon="↺"
            className="text-white/70 hover:text-white"
          >
            REINICIAR
          </GameButton>
        </header>

        {/* Notificação Especial de Estabilidade em Empate */}
        {stepInfo.stabilityNotice && (
          <section
            className="w-full p-4 rounded-xl bg-blue-950/60 border border-blue-400/50 flex items-center gap-3 animate-pulse shadow-lg shadow-blue-950/40"
            role="status"
            aria-live="polite"
          >
            <span className="text-xl">⚖</span>
            <div className="flex flex-col">
              <span className="text-xs font-mono font-bold text-blue-300 uppercase tracking-wider">
                REGRA DE ESTABILIDADE EM EMPATES (≤)
              </span>
              <span className="text-xs font-mono text-white/90">
                {stepInfo.stabilityNotice}
              </span>
            </div>
          </section>
        )}

        {/* Painel da Esteira Principal */}
        <section
          className="w-full p-5 rounded-2xl bg-[#0a1128]/80 border border-blue-500/30 flex flex-col items-center gap-4 shadow-xl backdrop-blur-sm"
          aria-label="Esteira Principal de Cargas"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span
                className="text-xs font-mono tracking-widest text-blue-300 uppercase font-bold"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                ESTEIRA PRINCIPAL (A)
              </span>
            </div>

            {activeInterval && (
              <span className="text-[11px] font-mono text-white/60 bg-blue-950/60 px-2.5 py-1 rounded border border-blue-500/20">
                Intercalando [{activeInterval.left}..{activeInterval.right}] •
                Meio = {activeInterval.mid}
              </span>
            )}
            {engineState.completed && (
              <span className="text-[11px] font-mono text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-500/40 font-bold">
                ✓ LOTE INTEGRALMENTE ORDENADO (OK)
              </span>
            )}
          </div>

          {/* Trilho com as Caixas */}
          <div className="flex flex-wrap items-end justify-center gap-4 py-4 min-h-[110px] w-full">
            {engineState.values.map((elem, idx) => {
              const role = getBoxRole(idx);
              const isP1 = activeInterval && idx === engineState.p1 && engineState.p1 <= activeInterval.mid;
              const isP2 = activeInterval && idx === engineState.p2 && engineState.p2 <= activeInterval.right;

              return (
                <div
                  key={elem.id}
                  className="flex flex-col items-center gap-2 relative"
                >
                  {/* Ponteiros visuais indicativos */}
                  <div className="h-5 flex items-center justify-center">
                    {isP1 && (
                      <span className="text-[10px] font-mono font-bold text-teal-300 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-400 animate-bounce">
                        p1 (E)
                      </span>
                    )}
                    {isP2 && (
                      <span className="text-[10px] font-mono font-bold text-sky-300 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-400 animate-bounce">
                        p2 (D)
                      </span>
                    )}
                  </div>

                  <NumberedBox
                    value={elem.value}
                    elementLabel={elem.label}
                    index={idx}
                    role={role}
                    size="md"
                  />

                  <span className="text-[10px] font-mono text-white/40">
                    #{idx}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Painel da Esteira Coletora / Buffer Auxiliar */}
        <section
          className="w-full p-4 rounded-xl bg-[#070e24]/90 border border-teal-500/30 flex flex-col items-center gap-3 shadow-lg"
          aria-label="Buffer Auxiliar de Intercalação"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-400" />
              <span
                className="text-xs font-mono tracking-widest text-teal-300 uppercase font-bold"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                ESTEIRA COLETORA • BUFFER O(n)
              </span>
            </div>

            <span className="text-[11px] font-mono text-white/60">
              Posição coletora k = {engineState.k}
            </span>
          </div>

          <div className="flex items-center justify-center gap-3 py-2 min-h-[90px] w-full">
            {activeInterval ? (
              Array.from({ length: activeInterval.right - activeInterval.left + 1 }).map(
                (_, bIdx) => {
                  const item = engineState.buffer[bIdx];
                  const isCurrentTarget = bIdx === engineState.k;

                  return (
                    <div
                      key={`buf-slot-${bIdx}`}
                      className="flex flex-col items-center gap-1.5"
                    >
                      <div className="h-4 flex items-center justify-center">
                        {isCurrentTarget && (
                          <span className="text-[9px] font-mono text-amber-300 font-bold">
                            k ↓
                          </span>
                        )}
                      </div>

                      {item ? (
                        <NumberedBox
                          value={item.value}
                          elementLabel={item.label}
                          index={bIdx}
                          role="sorted"
                          size="sm"
                        />
                      ) : (
                        <div
                          className={`w-12 h-14 rounded-lg border-2 border-dashed flex items-center justify-center transition-colors ${
                            isCurrentTarget
                              ? "border-amber-400/80 bg-amber-950/20"
                              : "border-white/10 bg-white/5"
                          }`}
                        >
                          <span className="text-[10px] font-mono text-white/20">
                            vazio
                          </span>
                        </div>
                      )}

                      <span className="text-[9px] font-mono text-white/30">
                        [{bIdx}]
                      </span>
                    </div>
                  );
                },
              )
            ) : (
              <span className="text-xs font-mono text-white/40 italic py-3">
                Buffer inativo fora das fases de intercalação
              </span>
            )}
          </div>
        </section>

        {/* Painel de Instruções e Feedback */}
        <section className="w-full">
          <InstructionPanel message={message.text} type={message.type} />
        </section>

        {/* Dica Pedagógica Expansível */}
        {showHint && (
          <section className="w-full p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 flex flex-col gap-1.5 animate-fade-in">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-mono font-bold">
              <span>? DICA PEDAGÓGICA</span>
            </div>
            <p className="text-xs text-amber-100/90 leading-relaxed font-mono">
              {stepInfo.hint}
            </p>
          </section>
        )}

        {/* Controles de Ação */}
        <section className="w-full flex flex-col items-center gap-3">
          {session.completed ? (
            <div
              ref={completionRef}
              className="flex flex-col items-center gap-4 w-full max-w-md animate-fade-in"
            >
              <div className="text-center p-4 sm:p-5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 w-full shadow-xl">
                <span className="text-emerald-400 text-base sm:text-lg font-bold block mb-1">
                  ✓ TUTORIAL CONCLUÍDO COM SUCESSO!
                </span>
                <p className="text-xs text-white/80 font-mono leading-relaxed mb-2.5">
                  Você dominou o ciclo canônico do Merge Sort:
                </p>
                <ul className="text-left text-xs font-mono text-emerald-200/90 space-y-1 list-disc list-inside">
                  <li>
                    Divisão recursiva até subproblemas unitários ordenados;
                  </li>
                  <li>
                    Intercalação ordenada com dois ponteiros independentes (p1,
                    p2);
                  </li>
                  <li>
                    Resolução de empates estáveis (≤) priorizando sempre o Ramal
                    Esquerdo;
                  </li>
                  <li>
                    Drenagem direta dos ramais remanescentes e cópia de retorno.
                  </li>
                </ul>
              </div>

              <GameButton
                onClick={onComplete}
                variant="primary"
                size="md"
                icon="✓"
                className="w-full shadow-lg shadow-emerald-950/40"
              >
                CONCLUIR TUTORIAL
              </GameButton>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 w-full max-w-md">
              <div className="flex items-center gap-3 w-full">
                <GameButton
                  onClick={() => handleDecision("DISPATCH_LEFT")}
                  variant="primary"
                  size="md"
                  disabled={!stepInfo.canDispatchLeft}
                  icon="⇦"
                  className="flex-1 border-teal-500/50 text-teal-200 hover:border-teal-400 shadow-lg shadow-teal-950/40"
                >
                  DESPACHAR ESQUERDA
                </GameButton>

                <GameButton
                  onClick={() => handleDecision("DISPATCH_RIGHT")}
                  variant="primary"
                  size="md"
                  disabled={!stepInfo.canDispatchRight}
                  icon="⇨"
                  className="flex-1 border-sky-500/50 text-sky-200 hover:border-sky-400 shadow-lg shadow-sky-950/40"
                >
                  DESPACHAR DIREITA
                </GameButton>

                <GameButton
                  onClick={() => handleDecision("DRAIN_REMAINDER")}
                  variant="secondary"
                  size="md"
                  disabled={!stepInfo.canDrain}
                  icon="⇓"
                  className="flex-1 border-indigo-500/50 text-indigo-200 hover:border-indigo-400 shadow-lg shadow-indigo-950/40"
                >
                  DRENAR RESTANTE
                </GameButton>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <GameButton
                  onClick={handleToggleHint}
                  variant="ghost"
                  size="sm"
                  icon={showHint ? "▲" : "?"}
                  className="text-amber-400 hover:text-amber-300"
                >
                  {showHint ? "OCULTAR DICA" : "PRECISA DE UMA DICA?"}
                </GameButton>
                {hintsUsed > 0 && (
                  <span className="text-xs font-mono text-white/40">
                    ({hintsUsed})
                  </span>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
