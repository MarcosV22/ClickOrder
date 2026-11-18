import React from "react";
import { INSERTION_SORT_PSEUDOCODE } from "../../game/sorting/insertion/insertionPseudocode";

export interface InsertionDetailsProps {
  onOpenDemonstration?: () => void;
}

export default function InsertionDetails({ onOpenDemonstration }: InsertionDetailsProps) {
  return (
    <details
      className="w-full bg-[#0b1224]/80 border border-slate-800 rounded-xl overflow-hidden group transition-all"
      aria-label="Detalhes técnicos e formais do Insertion Sort"
    >
      <summary
        className="px-5 py-3.5 text-xs sm:text-sm font-mono text-slate-400 hover:text-slate-200 cursor-pointer flex items-center justify-between select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
      >
        <span className="font-semibold uppercase tracking-wider text-slate-300">
          Ver mais detalhes técnicos
        </span>
        <span className="text-slate-500 group-open:rotate-180 transition-transform font-mono">
          ▼
        </span>
      </summary>

      <div className="p-5 sm:p-6 border-t border-slate-800/80 flex flex-col gap-5 text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
        {/* Definição Formal */}
        <div className="flex flex-col gap-1.5">
          <h3
            className="font-bold text-amber-300 uppercase font-mono text-xs tracking-wider"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            Definição Formal do Algoritmo
          </h3>
          <p className="text-slate-300">
            O <strong>Insertion Sort</strong> constrói progressivamente uma partição ordenada à esquerda da esteira. A cada passada <em>i</em> (de 1 até <em>n - 1</em>), seleciona a carga naquela posição como <strong>chave</strong>, abre uma <strong>vaga</strong> e compara regressivamente com os elementos anteriores.
          </p>
        </div>

        {/* Chave e Vaga Aberta */}
        <div className="flex flex-col gap-1.5">
          <h3
            className="font-bold text-amber-300 uppercase font-mono text-xs tracking-wider"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            Chave e Vaga Aberta
          </h3>
          <p className="text-slate-300">
            A <strong>chave</strong> é o valor temporariamente suspenso para inspeção (<em>K = A[i]</em>). A <strong>vaga aberta</strong> é o espaço desocupado na esteira. Conforme elementos maiores deslizam para a direita, a vaga desloca-se para a esquerda até que o local correto da chave seja alcançado.
          </p>
        </div>

        {/* Deslocamento vs Troca */}
        <div className="flex flex-col gap-1.5">
          <h3
            className="font-bold text-cyan-300 uppercase font-mono text-xs tracking-wider"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            Deslocamento (Shift) vs Troca (Swap)
          </h3>
          <p className="text-slate-300">
            Diferente do Bubble Sort e do Selection Sort, que executam permutas bilaterais entre dois elementos (<em>swap</em>), o Insertion Sort realiza <strong>deslocamentos unilaterais</strong> (<em>shift</em>). O elemento maior apenas copia seu valor para a vaga adjacente à direita (<em>A[j + 1] = A[j]</em>), sem trocar diretamente com a chave.
          </p>
        </div>

        {/* ORD Local vs Posição Definitiva */}
        <div className="flex flex-col gap-1.5">
          <h3
            className="font-bold text-slate-200 uppercase font-mono text-xs tracking-wider"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            Região Ordenada Local (ORD) vs Posição Definitiva (OK)
          </h3>
          <p className="text-slate-300">
            A partição à esquerda está ordenada apenas entre seus próprios membros (rotulada tecnicamente como <code>ORD</code>). O conceito foi adiado para esta seção de aprofundamento para reduzir a carga conceitual inicial da introdução. Elementos futuros ainda desordenados podem forçar novos deslocamentos. Por isso, nenhuma carga recebe o selo de posição definitiva (<code>OK</code>) até que todas as passadas do algoritmo sejam concluídas.
          </p>
        </div>

        {/* Pseudocódigo Canônico (11 linhas) */}
        <div className="flex flex-col gap-2">
          <h3
            className="font-bold text-slate-200 uppercase font-mono text-xs tracking-wider"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            Pseudocódigo Canônico (11 linhas)
          </h3>
          <pre
            className="p-3.5 rounded-lg bg-[#060a14] border border-slate-800 text-[11px] sm:text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
{INSERTION_SORT_PSEUDOCODE.map((line) => {
  const indent = "  ".repeat(line.indent);
  const num = line.lineNumber.toString().padStart(2, " ");
  return `${num}: ${indent}${line.text}`;
}).join("\n")}
          </pre>
        </div>

        {/* Complexidade Assintótica */}
        <div className="flex flex-col gap-1.5">
          <h3
            className="font-bold text-slate-200 uppercase font-mono text-xs tracking-wider"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            Complexidade Assintótica
          </h3>
          <ul className="list-disc list-inside text-slate-400 space-y-1">
            <li>
              <strong className="text-slate-200">Melhor Caso (já ordenado):</strong> Θ(n) comparações, 0 deslocamentos.
            </li>
            <li>
              <strong className="text-slate-200">Caso Médio:</strong> Θ(n²) comparações e deslocamentos.
            </li>
            <li>
              <strong className="text-slate-200">Pior Caso (ordem inversa):</strong> Θ(n²) comparações e deslocamentos.
            </li>
            <li>
              <strong className="text-slate-200">Espaço Auxiliar:</strong> Θ(1) / O(1) (ordenação estritamente in-place).
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
              className="text-xs text-amber-400 hover:text-amber-300 underline underline-offset-2 font-mono cursor-pointer"
            >
              Ver Demonstração Livre ›
            </button>
          </div>
        )}
      </div>
    </details>
  );
}
