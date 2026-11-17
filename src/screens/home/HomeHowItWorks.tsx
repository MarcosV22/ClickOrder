interface StepItem {
  readonly step: string;
  readonly icon: string;
  readonly title: string;
  readonly description: string;
  readonly tip: string;
}

const STEPS: readonly StepItem[] = [
  {
    step: "01",
    icon: "🔍",
    title: "Escolha o Método",
    description:
      "Selecione um algoritmo no catálogo abaixo. Comece pelo Bubble Sort para dominar comparações e trocas locais entre vizinhos.",
    tip: "Passo a passo visual",
  },
  {
    step: "02",
    icon: "💡",
    title: "Entenda a Lógica",
    description:
      "Assista à demonstração automática ou siga o tutorial guiado para ver a regra do algoritmo em ação antes de praticar.",
    tip: "Aprenda o porquê de cada ação",
  },
  {
    step: "03",
    icon: "⚡",
    title: "Pratique na Esteira",
    description:
      "Coloque a mão na massa: compare números, decida trocar ou manter e receba explicações conceituais a cada tentativa.",
    tip: "Fixação por experimentação",
  },
];

export default function HomeHowItWorks() {
  return (
    <section
      id="como-funciona"
      className="flex flex-col items-center gap-4 max-w-5xl w-full pt-4 sm:pt-6 pb-2"
      aria-labelledby="how-it-works-title"
    >
      {/* Section Header */}
      <div className="text-center flex flex-col items-center gap-1.5">
        <span
          className="text-[10px] sm:text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          METODOLOGIA PRÁTICA
        </span>
        <h2
          id="how-it-works-title"
          className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          Como Funciona o Sorting Station
        </h2>
        <p
          className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed"
          style={{ fontFamily: "'Exo 2', sans-serif" }}
        >
          Três etapas simples para compreender ordenação com autonomia e sem
          decoreba.
        </p>
      </div>

      {/* 3 Step Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-2">
        {STEPS.map((item) => (
          <div
            key={item.step}
            className="flex flex-col justify-between rounded-xl p-5 bg-[#0a1126]/70 border border-white/10 hover:border-cyan-500/40 transition-all duration-300 shadow-md backdrop-blur-sm"
          >
            <div className="flex flex-col gap-3">
              {/* Step indicator & icon */}
              <div className="flex items-center justify-between">
                <span
                  className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300"
                  style={{ fontFamily: "'Space Mono', monospace" }}
                >
                  PASSO {item.step}
                </span>
                <span className="text-2xl" aria-hidden="true">
                  {item.icon}
                </span>
              </div>

              {/* Step Title */}
              <h3
                className="text-base sm:text-lg font-bold text-white tracking-tight mt-1"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                {item.title}
              </h3>

              {/* Step Description */}
              <p
                className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans"
                style={{ fontFamily: "'Exo 2', sans-serif" }}
              >
                {item.description}
              </p>
            </div>

            {/* Bottom Tip Badge */}
            <div className="pt-3 mt-3 border-t border-white/5 flex items-center gap-1.5 text-[11px] font-mono text-cyan-300/80">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>{item.tip}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
