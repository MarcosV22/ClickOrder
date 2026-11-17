import React from "react";

export default function HomeProcessStrip() {
  return (
    <nav
      aria-label="Processo de Aprendizagem"
      className="flex items-center justify-center gap-2 sm:gap-4 px-4 py-2 rounded-full bg-slate-900/60 border border-slate-700/50 backdrop-blur-sm text-xs text-slate-300 max-w-2xl w-full"
    >
      {/* Passo 1: ESCOLHA */}
      <div className="flex items-center gap-1.5 min-w-0">
        <svg
          className="w-3.5 h-3.5 text-cyan-400 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
        <span className="truncate">
          <strong className="text-white font-semibold">ESCOLHA</strong>{" "}
          <span className="hidden sm:inline text-slate-400">um algoritmo</span>
        </span>
      </div>

      {/* Seta divisória */}
      <svg
        className="w-3 h-3 text-slate-500 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2.5"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>

      {/* Passo 2: APRENDA */}
      <div className="flex items-center gap-1.5 min-w-0">
        <svg
          className="w-3.5 h-3.5 text-purple-400 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
        <span className="truncate">
          <strong className="text-white font-semibold">APRENDA</strong>{" "}
          <span className="hidden sm:inline text-slate-400">como funciona</span>
        </span>
      </div>

      {/* Seta divisória */}
      <svg
        className="w-3 h-3 text-slate-500 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2.5"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>

      {/* Passo 3: PRATIQUE */}
      <div className="flex items-center gap-1.5 min-w-0">
        <svg
          className="w-3.5 h-3.5 text-amber-400 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="truncate">
          <strong className="text-white font-semibold">PRATIQUE</strong>{" "}
          <span className="hidden sm:inline text-slate-400">passo a passo</span>
        </span>
      </div>
    </nav>
  );
}
