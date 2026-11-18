import React from "react";
import { BUBBLE_SORT_PSEUDOCODE } from "../../game/replay/replayPseudocode";

export interface BubbleDetailsProps {
  onOpenDemonstration?: () => void;
}

export default function BubbleDetails({ onOpenDemonstration }: BubbleDetailsProps) {
  return (
    <details
      className="w-full bg-[#0b1224]/80 border border-slate-800 rounded-xl overflow-hidden group transition-all"
      aria-label="Detalhes técnicos e formais do Bubble Sort"
    >
      <summary className="px-5 py-3.5 text-xs sm:text-sm font-mono text-slate-400 hover:text-slate-200 cursor-pointer flex items-center justify-between select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
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
            className="font-bold text-blue-300 uppercase font-mono text-xs tracking-wider"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            Definição Formal do Algoritmo
          </h3>
          <p className="text-slate-300">
            O <strong>Bubble Sort</strong> percorre iterativamente o vetor comparando pares de elementos adjacentes (<em>A[j]</em> e <em>A[j + 1]</em>) da esquerda para a direita. Sempre que um elemento à esquerda for estritamente maior que seu vizinho imediato, eles realizam uma <strong>troca bilateral</strong> (<em>swap</em>). Ao término de cada passada, o maior elemento da região não ordenada atinge sua posição definitiva no final do vetor (efeito de flutuação).
          </p>
        </div>

        {/* Troca Bilateral Adjacente vs Outros Algoritmos */}
        <div className="flex flex-col gap-1.5">
          <h3
            className="font-bold text-cyan-300 uppercase font-mono text-xs tracking-wider"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            Troca Bilateral Adjacente vs Outros Algoritmos
          </h3>
          <p className="text-slate-300">
            Diferente do Selection Sort (que varre todos os elementos antes de realizar uma única troca por rodada) e do Insertion Sort (que desloca elementos unilateralmente para abrir espaço a uma chave suspensa), o Bubble Sort realiza <strong>trocas bilaterais sucessivas exclusivamente entre vizinhos imediatos</strong>. Um elemento pode sofrer múltiplas trocas dentro de uma mesma passada.
          </p>
        </div>

        {/* Invariante e Partição Consolidada */}
        <div className="flex flex-col gap-1.5">
          <h3
            className="font-bold text-emerald-300 uppercase font-mono text-xs tracking-wider"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            Invariante e Partição Consolidada
          </h3>
          <p className="text-slate-300">
            Após <em>i</em> passadas completas, os <em>i</em> maiores elementos estão garantidamente alocados em suas posições finais no sufixo do vetor (índices <em>n - i</em> até <em>n - 1</em>). Por isso, as passadas seguintes só precisam inspecionar até o índice <em>n - 2 - i</em>.
          </p>
        </div>

        {/* Pseudocódigo Canônico (9 linhas) */}
        <div className="flex flex-col gap-2">
          <h3
            className="font-bold text-slate-200 uppercase font-mono text-xs tracking-wider"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            Pseudocódigo Canônico (9 linhas)
          </h3>
          <pre
            className="p-3.5 rounded-lg bg-[#060a14] border border-slate-800 text-[11px] sm:text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
{BUBBLE_SORT_PSEUDOCODE.map((line) => {
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
              <strong className="text-slate-200">Comparações (todos os casos):</strong> Θ(n²) comparações. A variante canônica padrão da didática da Sorting Station realiza rigorosamente <em>n(n - 1) / 2</em> comparações independentemente da ordem inicial dos dados, garantindo previsibilidade estrutural e ausência de parada precoce implícita (sem flag de parada prematura por padrão).
            </li>
            <li>
              <strong className="text-slate-200">Movimentações / Trocas:</strong> 0 trocas físicas no melhor caso (vetor já perfeitamente ordenado); Θ(n²) nos casos médio e pior, atingindo até <em>n(n - 1) / 2</em> trocas quando o vetor está em ordem estritamente inversa.
            </li>
            <li>
              <strong className="text-slate-200">Espaço Auxiliar:</strong> Θ(1) / O(1) (ordenação estritamente in-place).
            </li>
            <li>
              <strong className="text-slate-200">Estabilidade Formal:</strong> Estável (a condição estrita <code>A[j] &gt; A[j + 1]</code> preserva a ordem relativa de elementos com chaves idênticas).
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
              className="text-xs text-blue-400 hover:text-blue-300 underline underline-offset-2 font-mono cursor-pointer"
            >
              Ver Demonstração Livre ›
            </button>
          </div>
        )}
      </div>
    </details>
  );
}
