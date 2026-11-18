import React from "react";
import { SELECTION_SORT_PSEUDOCODE } from "../../game/replay/selectionReplayPseudocode";

export interface SelectionDetailsProps {
  onOpenDemonstration?: () => void;
}

export default function SelectionDetails({ onOpenDemonstration }: SelectionDetailsProps) {
  return (
    <details
      className="w-full bg-[#0b1224]/80 border border-slate-800 rounded-xl overflow-hidden group transition-all"
      aria-label="Detalhes técnicos e formais do Selection Sort"
    >
      <summary className="px-5 py-3.5 text-xs sm:text-sm font-mono text-slate-400 hover:text-slate-200 cursor-pointer flex items-center justify-between select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400">
        <span className="font-semibold uppercase tracking-wider text-slate-300">
          Aprofundamento Técnico e Pseudocódigo
        </span>
        <span className="text-slate-500 group-open:rotate-180 transition-transform font-mono">
          ▼
        </span>
      </summary>

      <div className="p-5 sm:p-6 border-t border-slate-800/80 flex flex-col gap-5 text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
        {/* Definição Formal */}
        <div className="flex flex-col gap-1.5">
          <h3
            className="font-bold text-purple-300 uppercase font-mono text-xs tracking-wider"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            Definição Formal do Algoritmo
          </h3>
          <p className="text-slate-300">
            O <strong>Selection Sort</strong> divide o vetor em duas regiões: uma partição já ordenada à esquerda (índices <em>0</em> até <em>i - 1</em>) e uma partição desordenada à direita (índices <em>i</em> até <em>n - 1</em>). A cada passada <em>i</em>, o algoritmo varre toda a partição desordenada, seleciona o menor elemento e o coloca na posição alvo <em>i</em>.
          </p>
        </div>

        {/* Posição Alvo (i) e Marcador de Varredura (j) */}
        <div className="flex flex-col gap-1.5">
          <h3
            className="font-bold text-purple-300 uppercase font-mono text-xs tracking-wider"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            Posição Alvo (i) e Scanner de Varredura (j)
          </h3>
          <p className="text-slate-300">
            A variável <strong>i</strong> aponta para a próxima posição que deve receber o menor elemento da rodada. A variável <strong>j</strong> atua como o scanner ou cursor óptico, inspecionando cada elemento subsequente (<em>j = i + 1</em> até <em>n - 1</em>) para comparar seus valores com o menor candidato atual.
          </p>
        </div>

        {/* Menor Candidato (minIndex) */}
        <div className="flex flex-col gap-1.5">
          <h3
            className="font-bold text-amber-300 uppercase font-mono text-xs tracking-wider"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            Menor Candidato (minIndex)
          </h3>
          <p className="text-slate-300">
            No início de cada passada, assumimos provisoriamente que o elemento na posição alvo é o menor (<em>minIndex ← i</em>). Durante a varredura, caso o scanner encontre um elemento estritamente menor (<em>A[j] &lt; A[minIndex]</em>), o índice do menor é atualizado (<em>minIndex ← j</em>).
          </p>
        </div>

        {/* FSM Bimodal: INSPECT vs COMMIT */}
        <div className="flex flex-col gap-1.5">
          <h3
            className="font-bold text-cyan-300 uppercase font-mono text-xs tracking-wider"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            FSM Bimodal: Fase INSPECT vs Fase COMMIT
          </h3>
          <p className="text-slate-300">
            Na plataforma, chamamos a movimentação feita ao final da varredura de <strong>COMMIT</strong>. O algoritmo opera em dois modos mutuamente exclusivos:
          </p>
          <ul className="list-disc list-inside text-slate-400 space-y-1 mt-1">
            <li>
              <strong className="text-slate-200">Fase INSPECT:</strong> O scanner percorre e avalia as caixas. Nenhuma carga se move fisicamente sobre a esteira.
            </li>
            <li>
              <strong className="text-slate-200">Fase COMMIT:</strong> Ao atingir a última caixa da esteira, a menor carga encontrada é transferida para a posição alvo <em>i</em> em uma única operação.
            </li>
          </ul>
        </div>

        {/* Diferença Crítica: Selection vs Bubble */}
        <div className="flex flex-col gap-1.5">
          <h3
            className="font-bold text-slate-200 uppercase font-mono text-xs tracking-wider"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            Diferença Crítica: Selection Sort vs Bubble Sort
          </h3>
          <p className="text-slate-300">
            Enquanto o Bubble Sort troca repetidamente elementos adjacentes durante a passada (podendo realizar até <em>Θ(n²)</em> trocas físicas), o Selection Sort <strong>nunca troca durante a busca</strong>. Ele executa no máximo 1 transferência por passada e no máximo <em>n - 1</em> trocas em toda a ordenação.
          </p>
        </div>

        {/* Pseudocódigo Canônico (13 linhas) */}
        <div className="flex flex-col gap-2">
          <h3
            className="font-bold text-slate-200 uppercase font-mono text-xs tracking-wider"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            Pseudocódigo Canônico (13 linhas)
          </h3>
          <pre
            className="p-3.5 rounded-lg bg-[#060a14] border border-slate-800 text-[11px] sm:text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
{SELECTION_SORT_PSEUDOCODE.map((line) => {
  const indent = "  ".repeat(line.indent);
  const num = line.lineNumber.toString().padStart(2, " ");
  return `${num}: ${indent}${line.text}`;
}).join("\n")}
          </pre>
        </div>

        {/* Complexidade Assintótica e Estabilidade */}
        <div className="flex flex-col gap-1.5">
          <h3
            className="font-bold text-slate-200 uppercase font-mono text-xs tracking-wider"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            Complexidade Assintótica e Estabilidade
          </h3>
          <ul className="list-disc list-inside text-slate-400 space-y-1">
            <li>
              <strong className="text-slate-200">Comparações (todos os casos):</strong> Θ(n²) comparações. O Selection Sort canônico realiza <em>n(n - 1) / 2</em> comparações independentemente da disposição inicial da entrada; portanto, sua contagem de comparações decorre da estrutura fixa de seus laços aninhados.
            </li>
            <li>
              <strong className="text-slate-200">Movimentações / Trocas:</strong> Na variante canônica do Sorting Station (que omite trocas quando <code>minIndex === i</code> e evita auto-trocas), realizam-se 0 trocas físicas no melhor caso (vetor já ordenado) e no máximo <em>n - 1</em> trocas físicas nos casos médio e pior.
            </li>
            <li>
              <strong className="text-slate-200">Espaço Auxiliar:</strong> Θ(1) / O(1) (ordenação estritamente in-place).
            </li>
            <li>
              <strong className="text-slate-200">Estabilidade Formal:</strong> Instável na implementação canônica por troca (permutas de longa distância podem alterar a ordem relativa de chaves iguais).
            </li>
          </ul>
        </div>

        {/* Link subordinado para demonstração livre sob demanda */}
        {onOpenDemonstration && (
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-slate-400 text-xs">Deseja assistir à execução livre?</span>
            <button
              type="button"
              onClick={onOpenDemonstration}
              className="text-xs text-purple-400 hover:text-purple-300 underline underline-offset-2 font-mono cursor-pointer"
            >
              Ver Demonstração Livre ›
            </button>
          </div>
        )}
      </div>
    </details>
  );
}
