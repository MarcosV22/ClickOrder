import React, { useState, useEffect } from "react";
import NumberedBox from "../../components/NumberedBox";
import { formatElapsedTime } from "../../game/session";
import { BUBBLE_SORT_PSEUDOCODE, type PseudocodeLine } from "../../game/replay";
import {
  type BubbleUxTestSession,
  isUxTestQueryParamActive,
  exportUxTestSessionAsJson,
} from "./bubbleUxTest";

export interface BubbleResultScreenV2Props {
  finalArray: readonly number[];
  comparisons: number;
  swaps?: number;
  errors: number;
  hintsUsed: number;
  score?: number;
  bestScore?: number;
  elapsedTimeMs?: number;
  canonicalComparisons?: number;
  hasNextPhase?: boolean;
  onNext: () => void;
  onRepeat: () => void;
  onViewReplay?: () => void;
  onOpenSelector?: () => void;
  isUxTestMode?: boolean;
  uxTestSession?: BubbleUxTestSession;
  onUxTestSessionUpdate?: (session: BubbleUxTestSession) => void;
}

export default function BubbleResultScreenV2({
  finalArray,
  comparisons,
  swaps = 0,
  errors,
  hintsUsed,
  score = 100,
  bestScore,
  elapsedTimeMs = 0,
  canonicalComparisons = 6,
  hasNextPhase = true,
  onNext,
  onRepeat,
  onViewReplay,
  onOpenSelector,
  isUxTestMode,
  uxTestSession,
  onUxTestSessionUpdate,
}: BubbleResultScreenV2Props) {
  const [selectedReflection, setSelectedReflection] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [copiedStatus, setCopiedStatus] = useState<string | null>(null);

  const activeUxTestMode = isUxTestMode ?? isUxTestQueryParamActive();
  const [currentUxSession, setCurrentUxSession] = useState<BubbleUxTestSession | null>(
    () => uxTestSession || null
  );

  useEffect(() => {
    if (activeUxTestMode && currentUxSession && !currentUxSession.resultReachedAt) {
      const updated: BubbleUxTestSession = {
        ...currentUxSession,
        resultReachedAt: Date.now(),
      };
      setCurrentUxSession(updated);
      onUxTestSessionUpdate?.(updated);
    }
  }, [activeUxTestMode, currentUxSession, onUxTestSessionUpdate]);

  const reflectionOptions = [
    {
      id: 0,
      text: "O menor elemento vai diretamente para a primeira posição.",
      correct: false,
      feedback: "Observe a esteira: quem sempre avança e chega à sua posição final a cada passada é o maior elemento.",
    },
    {
      id: 1,
      text: "O maior elemento não ordenado alcança sua posição final definitiva.",
      correct: true,
      feedback: "Exato! A cada passada completa, o maior valor restante sobe como uma bolha até o final da esteira.",
    },
    {
      id: 2,
      text: "Todos os elementos do vetor são invertidos de posição.",
      correct: false,
      feedback: "O algoritmo apenas compara elementos vizinhos e troca quando estão fora de ordem.",
    },
  ];

  const handleSelectReflection = (id: number) => {
    setSelectedReflection(id);
    const isCorrect = reflectionOptions[id].correct;

    if (activeUxTestMode && currentUxSession) {
      const updated: BubbleUxTestSession = {
        ...currentUxSession,
        microReflectionAnswered: true,
        microReflectionCorrect: isCorrect,
      };
      setCurrentUxSession(updated);
      onUxTestSessionUpdate?.(updated);
    }
  };

  const handleViewReplayWrapped = () => {
    if (activeUxTestMode && currentUxSession) {
      const updated: BubbleUxTestSession = {
        ...currentUxSession,
        replayOpened: true,
      };
      setCurrentUxSession(updated);
      onUxTestSessionUpdate?.(updated);
    }
    onViewReplay?.();
  };

  const handleDownloadUxJson = () => {
    if (!currentUxSession) return;
    const jsonStr = exportUxTestSessionAsJson(currentUxSession);
    try {
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ux-session-${currentUxSession.sessionId}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setCopiedStatus("Arquivo JSON baixado!");
      setTimeout(() => setCopiedStatus(null), 3000);
    } catch {
      console.log("[UX Test Session JSON]", jsonStr);
      setCopiedStatus("Logado no console (F12)!");
      setTimeout(() => setCopiedStatus(null), 3000);
    }
  };

  const handleCopyUxJson = () => {
    if (!currentUxSession) return;
    const jsonStr = exportUxTestSessionAsJson(currentUxSession);
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(jsonStr);
        setCopiedStatus("JSON copiado para a área de transferência!");
        setTimeout(() => setCopiedStatus(null), 3000);
      } else {
        console.log("[UX Test Session JSON]", jsonStr);
        setCopiedStatus("Logado no console (F12)!");
        setTimeout(() => setCopiedStatus(null), 3000);
      }
    } catch {
      console.log("[UX Test Session JSON]", jsonStr);
      setCopiedStatus("Logado no console (F12)!");
      setTimeout(() => setCopiedStatus(null), 3000);
    }
  };

  return (
    <div className="w-full min-h-screen overflow-x-clip bg-[#0a0e1a] text-slate-100 flex flex-col items-center justify-start py-6 sm:py-8 pb-16 px-4 sm:px-6">
      <div className="w-full max-w-2xl flex flex-col items-center gap-6">
        {/* Success Header */}
        <div className="text-center flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-2xl font-bold">
            ✓
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Vetor Ordenado com Sucesso!
          </h1>
          <p className="text-sm text-slate-300">
            Você organizou todas as caixas da esteira com Bubble Sort.
          </p>
        </div>

        {/* Sorted Array Display */}
        <div className="w-full bg-[#111827]/80 border border-slate-800 rounded-2xl p-6 flex flex-col items-center gap-4 shadow-xl">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
            Resultado Final da Esteira
          </span>
          <div className="flex items-center justify-center gap-3 sm:gap-4 py-2 flex-wrap">
            {finalArray.map((val, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1">
                <NumberedBox
                  value={val}
                  index={idx}
                  role="sorted"
                  variant="learning"
                  showIndex={false}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Discovery Banner */}
        <div className="w-full bg-blue-950/30 border border-blue-500/30 rounded-2xl p-5 flex flex-col items-center text-center gap-2">
          <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
            Descoberta Desta Prática
          </span>
          <p className="text-sm sm:text-base text-blue-100/90 font-medium leading-relaxed max-w-lg">
            O maior elemento foi avançando a cada comparação até encontrar seu lugar definitivo no final da esteira.
          </p>
        </div>

        {/* Essential Metrics + Canonical Protocol Score */}
        <div className="w-full flex flex-col gap-3">
          <div className="w-full bg-[#111827]/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex flex-col">
              <span className="text-xs font-mono text-blue-400 uppercase font-bold tracking-wider">
                PONTUAÇÃO DO PROTOCOLO
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Erros: -10 | Dicas: -5 | Tempo não afeta a pontuação
              </span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-white font-mono">
                {score} <span className="text-xs text-slate-400">/ 100</span>
              </span>
              {bestScore !== undefined && (
                <span className="text-xs font-mono text-emerald-400 font-semibold">
                  Recorde: {bestScore} / 100
                </span>
              )}
            </div>
          </div>

          <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#111827]/80 border border-slate-800 rounded-xl p-4 flex flex-col items-center text-center gap-1">
              <span className="text-xs font-mono text-slate-400 uppercase">Comparações</span>
              <span className="text-2xl font-bold text-white font-mono">{comparisons}</span>
              <span className="text-[11px] text-slate-400 leading-tight">
                Referência desta variante: {canonicalComparisons} comparações
              </span>
            </div>

            <div className="bg-[#111827]/80 border border-slate-800 rounded-xl p-4 flex flex-col items-center text-center gap-1">
              <span className="text-xs font-mono text-slate-400 uppercase">Trocas</span>
              <span className="text-2xl font-bold text-white font-mono">{swaps}</span>
              <span className="text-[11px] text-slate-400 leading-tight">
                Movimentações efetuadas
              </span>
            </div>

            <div className="bg-[#111827]/80 border border-slate-800 rounded-xl p-4 flex flex-col items-center text-center gap-1">
              <span className="text-xs font-mono text-slate-400 uppercase">Erros</span>
              <span className={`text-2xl font-bold font-mono ${errors > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                {errors}
              </span>
              <span className="text-[11px] text-slate-400 leading-tight">
                {errors === 0 ? "Execução sem erros" : "Tentativas corrigidas"}
              </span>
            </div>

            <div className="bg-[#111827]/80 border border-slate-800 rounded-xl p-4 flex flex-col items-center text-center gap-1">
              <span className="text-xs font-mono text-slate-400 uppercase">Dicas Utilizadas</span>
              <span className={`text-2xl font-bold font-mono ${hintsUsed > 0 ? "text-blue-300" : "text-slate-300"}`}>
                {hintsUsed}
              </span>
              <span className="text-[11px] text-slate-400 leading-tight">
                {hintsUsed === 0 ? "Nenhuma dica pedida" : "Auxílio sob demanda"}
              </span>
            </div>
          </div>
        </div>

        {/* Micro-Reflection Checkpoint */}
        <div className="w-full bg-[#111827]/80 border border-slate-800 rounded-2xl p-6 flex flex-col items-center gap-4 text-center">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            Micro-Reflexão de Compreensão
          </span>
          <p className="text-sm sm:text-base text-slate-200 font-medium max-w-lg">
            Depois de uma passada completa do Bubble Sort, o que acontece com certeza?
          </p>

          <div className="w-full flex flex-col gap-2.5 text-left mt-1">
            {reflectionOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                data-testid={`reflection-option-${opt.id}`}
                onClick={() => handleSelectReflection(opt.id)}
                className={`w-full p-3.5 rounded-xl border text-sm transition-all cursor-pointer ${
                  selectedReflection === opt.id
                    ? opt.correct
                      ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-200"
                      : "bg-amber-950/40 border-amber-500/50 text-amber-200"
                    : "bg-[#0d1527] border-slate-800 text-slate-300 hover:bg-[#162138]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="font-mono text-xs font-bold text-slate-400">
                    {String.fromCharCode(65 + opt.id)})
                  </span>
                  <span className="flex-1 leading-relaxed">{opt.text}</span>
                </div>
              </button>
            ))}
          </div>

          {selectedReflection !== null && (
            <div
              className={`w-full p-3.5 rounded-xl border text-xs sm:text-sm animate-fade-in ${
                reflectionOptions[selectedReflection].correct
                  ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-200"
                  : "bg-amber-950/40 border-amber-500/30 text-amber-200"
              }`}
            >
              <p>{reflectionOptions[selectedReflection].feedback}</p>
            </div>
          )}
        </div>

        {/* On-Demand Drawer: Technical Details & Score Breakdown */}
        <div className="w-full flex flex-col items-center gap-2">
          <button
            type="button"
            data-testid="result-drawer-toggle"
            onClick={() => setShowDetails((prev) => !prev)}
            className="text-xs text-slate-400 hover:text-slate-200 font-mono transition-colors cursor-pointer py-1 px-3 rounded-lg hover:bg-slate-900"
          >
            {showDetails ? "▲ Ocultar detalhes e pontuação" : "▼ Ver detalhes e pontuação"}
          </button>

          {showDetails && (
            <div className="w-full bg-[#0d1527] border border-slate-800 rounded-xl p-5 flex flex-col gap-4 text-xs font-mono text-slate-300 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span>Pontuação do Protocolo:</span>
                <span className="text-sm font-bold text-white">{score} / 100</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span>Tempo Monotônico:</span>
                <span>{formatElapsedTime(elapsedTimeMs)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span>Dicas Utilizadas:</span>
                <span>{hintsUsed} (desconto de -5 pts cada)</span>
              </div>

              {/* Pseudocode snippet */}
              <div className="flex flex-col gap-1 pt-1">
                <span className="font-bold text-slate-400 uppercase">Pseudocódigo:</span>
                <div className="bg-[#080d1a] p-3 rounded-lg border border-slate-800/80 flex flex-col gap-0.5">
                  {BUBBLE_SORT_PSEUDOCODE.map((item: PseudocodeLine) => (
                    <div
                      key={item.id}
                      className="text-[11px] text-slate-400"
                      style={{ paddingLeft: `${item.indent * 12 + 4}px` }}
                    >
                      {item.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action CTAs */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            data-testid="result-next-btn"
            onClick={onNext}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base shadow-lg shadow-blue-600/20 transition-all cursor-pointer text-center"
          >
            {hasNextPhase ? "Próxima Prática ▶" : "Concluir Conjunto"}
          </button>

          {onViewReplay && (
            <button
              type="button"
              data-testid="result-replay-btn"
              onClick={handleViewReplayWrapped}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#1e293b] hover:bg-[#334155] text-slate-200 font-medium text-sm transition-all cursor-pointer text-center"
            >
              Rever Execução (Replay)
            </button>
          )}

          <button
            type="button"
            data-testid="result-repeat-btn"
            onClick={onRepeat}
            className="w-full sm:w-auto px-4 py-3.5 text-xs text-slate-400 hover:text-slate-200 font-mono transition-colors cursor-pointer"
          >
            ↺ Repetir
          </button>
        </div>

        {onOpenSelector && (
          <button
            type="button"
            onClick={onOpenSelector}
            className="text-xs text-slate-400 hover:text-slate-200 font-mono transition-colors cursor-pointer"
          >
            ‹ Voltar para a seleção de práticas
          </button>
        )}

        {/* Painel do Pesquisador (Visível SOMENTE quando modo de teste de UX ativo via ?uxTest=1) */}
        {activeUxTestMode && (
          <div
            data-testid="ux-test-panel"
            className="w-full bg-[#0a1122] border border-blue-500/40 rounded-2xl p-5 mt-4 flex flex-col gap-3 font-mono text-xs text-slate-300 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-blue-500/30 pb-2">
              <span className="font-bold text-blue-400 flex items-center gap-1.5 uppercase tracking-wider">
                <span>🔬</span>
                <span>Modo Teste de UX Ativo (?uxTest=1)</span>
              </span>
              <span className="text-[10px] text-slate-400">
                Sessão: {currentUxSession?.sessionId || "efêmera"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] py-1">
              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Tempo 1ª Ação:</span>
                <span className="font-bold text-white">
                  {currentUxSession?.timeToFirstActionMs !== undefined
                    ? `${currentUxSession.timeToFirstActionMs} ms`
                    : "N/D"}
                </span>
              </div>

              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">1ª Ação Correta:</span>
                <span
                  className={`font-bold ${
                    currentUxSession?.firstActionCorrect === undefined
                      ? "text-slate-400"
                      : currentUxSession.firstActionCorrect
                        ? "text-emerald-400"
                        : "text-amber-400"
                  }`}
                >
                  {currentUxSession?.firstActionCorrect === undefined
                    ? "N/D"
                    : currentUxSession.firstActionCorrect
                      ? "Sim"
                      : "Não"}
                </span>
              </div>

              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Ações Incorretas:</span>
                <span className="font-bold text-white">
                  {currentUxSession?.wrongActionsCount ?? 0}
                </span>
              </div>

              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Dicas Pedidas:</span>
                <span className="font-bold text-white">
                  {currentUxSession?.hintRequestsCount ?? 0}
                </span>
              </div>

              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Gaveta Aberta:</span>
                <span className="font-bold text-white">
                  {currentUxSession?.detailsOpenedCount ?? 0}x
                </span>
              </div>

              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Predição Pré-Ação:</span>
                <span
                  className={`font-bold ${
                    currentUxSession?.predictionCorrect === undefined
                      ? "text-slate-400"
                      : currentUxSession.predictionCorrect
                        ? "text-emerald-400"
                        : "text-amber-400"
                  }`}
                >
                  {currentUxSession?.predictionCorrect === undefined
                    ? "N/D"
                    : currentUxSession.predictionCorrect
                      ? "Correta"
                      : "Incorreta"}
                </span>
              </div>

              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Pós-Passada:</span>
                <span
                  className={`font-bold ${
                    currentUxSession?.passCheckpointCorrect === undefined
                      ? "text-slate-400"
                      : currentUxSession.passCheckpointCorrect
                        ? "text-emerald-400"
                        : "text-amber-400"
                  }`}
                >
                  {currentUxSession?.passCheckpointCorrect === undefined
                    ? "N/D"
                    : currentUxSession.passCheckpointCorrect
                      ? "Correto"
                      : "Incorreto"}
                </span>
              </div>

              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Micro-Reflexão:</span>
                <span
                  className={`font-bold ${
                    currentUxSession?.microReflectionCorrect === undefined
                      ? "text-slate-400"
                      : currentUxSession.microReflectionCorrect
                        ? "text-emerald-400"
                        : "text-amber-400"
                  }`}
                >
                  {currentUxSession?.microReflectionCorrect === undefined
                    ? "Pendente"
                    : currentUxSession.microReflectionCorrect
                      ? "Correta"
                      : "Incorreta"}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
              <span className="text-[10px] text-slate-400">
                Dados armazenados estritamente em memória local (zero rede, zero PII).
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  data-testid="ux-export-btn"
                  onClick={handleDownloadUxJson}
                  className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium text-[11px] transition-colors cursor-pointer"
                >
                  Baixar JSON
                </button>
                <button
                  type="button"
                  data-testid="ux-copy-btn"
                  onClick={handleCopyUxJson}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] transition-colors cursor-pointer border border-slate-700"
                >
                  Copiar JSON
                </button>
              </div>
            </div>

            {copiedStatus && (
              <p className="text-emerald-400 text-[11px] text-center pt-1 animate-fade-in">
                {copiedStatus}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
