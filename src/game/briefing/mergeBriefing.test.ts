import { describe, it, expect } from "vitest";
import {
  MERGE_CANONICAL_BRIEFING,
  getBriefingForMode,
  BRIEFING_CATALOG,
} from "./index";

describe("Merge Sort — Briefing Pedagógico Oficial (P3.1-C)", () => {
  it("está registrado no catálogo e acessível via getBriefingForMode('merge-canonical')", () => {
    expect(BRIEFING_CATALOG["merge-canonical"]).toBeDefined();
    const briefing = getBriefingForMode("merge-canonical");
    expect(briefing.id).toBe("merge-canonical");
    expect(briefing.protocolName).toBe("PROTOCOLO: MERGE SORT");
    expect(briefing.modeName).toBe("DIVISÃO E CONFLUÊNCIA");
  });

  it("cobre integralmente os 7 pontos pedagógicos obrigatórios", () => {
    const instructions = MERGE_CANONICAL_BRIEFING.instructions;
    expect(instructions).toHaveLength(7);

    // 1. Divisão não ordena
    const divInst = instructions.find((i) => i.title === "Divisão Estrutural");
    expect(divInst).toBeDefined();
    expect(divInst?.description).toContain("não ordena");

    // 2. Confluência alimenta o buffer
    const mergeInst = instructions.find((i) => i.title === "Confluência de Ramais");
    expect(mergeInst).toBeDefined();
    expect(mergeInst?.description).toContain("buffer auxiliar");

    // 3. Inspeção exclusiva das frentes
    const headsInst = instructions.find(
      (i) => i.title === "Inspeção Exclusiva das Frentes",
    );
    expect(headsInst).toBeDefined();
    expect(headsInst?.description).toContain("frente de cada ramal");

    // 4. Regra mandatória de estabilidade (empate escolhe a esquerda)
    const tieInst = instructions.find(
      (i) => i.title === "Regra Mandatória de Estabilidade",
    );
    expect(tieInst).toBeDefined();
    expect(tieInst?.description).toContain("Ramal Esquerdo");
    expect(tieInst?.description).toContain("estabilidade");

    // 5. Drenagem da cauda sem novas comparações
    const drainInst = instructions.find(
      (i) => i.title === "Drenagem da Cauda Restante",
    );
    expect(drainInst).toBeDefined();
    expect(drainInst?.description).toContain("sem novas comparações");

    // 6. Marcação ORD vs Selo OK
    const ordInst = instructions.find(
      (i) => i.title === "Marcação ORD vs Selo OK",
    );
    expect(ordInst).toBeDefined();
    expect(ordInst?.description).toContain("ORD");
    expect(ordInst?.description).toContain("OK");

    // 7. Escritas físicas no buffer vs comparações lógicas
    const writesInst = instructions.find(
      (i) => i.title === "Escritas Físicas vs Comparações",
    );
    expect(writesInst).toBeDefined();
    expect(writesInst?.description).toContain("distintas da comparação");
    expect(writesInst?.description).toContain("O(n)");
  });

  it("contém os 3 destaques (highlights) com métricas canônicas", () => {
    const highlights = MERGE_CANONICAL_BRIEFING.highlights;
    expect(highlights).toHaveLength(3);

    const method = highlights.find((h) => h.label === "MÉTODO");
    expect(method?.value).toBe("Divisão e Confluência");

    const comps = highlights.find((h) => h.label === "COMPARAÇÕES");
    expect(comps?.value).toContain("Θ(n log n)");

    const mem = highlights.find((h) => h.label === "BUFFER AUXILIAR");
    expect(mem?.value).toContain("O(n)");
  });

  it("não vaza nomes internos da FSM para o texto voltado ao aluno", () => {
    const jsonText = JSON.stringify(MERGE_CANONICAL_BRIEFING);

    expect(jsonText).not.toContain("COMPARE_HEADS");
    expect(jsonText).not.toContain("DRAIN_READY");
    expect(jsonText).not.toContain("COPY_BACK_AUTOMATIC");
    expect(jsonText).not.toContain("DIVIDE_AUTOMATIC");
  });
});
