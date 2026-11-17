import React from "react";

export default function HomeHeader() {
  return (
    <header className="flex flex-col items-center text-center gap-2 max-w-2xl px-2">
      {/* Title */}
      <h1
        className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-wider flex items-center justify-center gap-3 drop-shadow-[0_2px_12px_rgba(0,245,255,0.25)]"
        style={{ fontFamily: "'Orbitron', sans-serif" }}
      >
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-blue-400">
          SORTING STATION
        </span>
      </h1>

      {/* Subtitle - exactly 1 short line */}
      <p
        className="text-sm sm:text-base text-slate-300 font-medium tracking-wide"
        style={{ fontFamily: "'Exo 2', sans-serif" }}
      >
        Aprenda algoritmos de ordenação visualmente.
      </p>
    </header>
  );
}
