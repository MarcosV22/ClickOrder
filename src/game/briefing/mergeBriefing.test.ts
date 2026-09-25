import { describe, it, expect } from "vitest";
import {
  MERGE_CANONICAL_BRIEFING,
  getBriefingForMode,
  BRIEFING_CATALOG,
} from "./index";

describe("Merge Sort — Briefing Pedagógico Oficial (P3.1-C / Revisão UX)", () => {
  it("está registrado no catálogo e acessível via getBriefingForMode('merge-canonical')", () => {
    expect(BRIEFING_CATALOG["merge-canonical"]).toBeDefined();
    const briefing = getBriefingForMode("merge-canonical");
    expect(briefing.id).toBe("merge-canonical");
    expect(briefing.protocolName).toBe("PROTOCOLO: MERGE SORT");
    expect(briefing.modeName).toBe("DIVISÃO E INTERCALAÇÃO");
  });

  it("estrutura o conteúdo principal em três etapas numeradas progressivas", () => {
    const instructions = MERGE_CANONICAL_BRIEFING.instructions;
    expect(instructions).toHaveLength(3);

    // 1. Divida o vetor
    const step1 = instructions[0];
    expect(step1.title).toBe("Divida o vetor");
    expect(step1.description).toContain("Separe os números em grupos menores");
    expect(step1.description).toContain("Dividir ainda não coloca os números em ordem");

    // 2. Junte os grupos em ordem
    const step2 = instructions[1];
    expect(step2.title).toBe("Junte os grupos em ordem");
    expect(step2.description).toContain("Compare o primeiro número ainda não utilizado");
    expect(step2.description).toContain("Copie o menor para o vetor auxiliar");

    // 3. Repita até ordenar tudo
    const step3 = instructions[2];
    expect(step3.title).toBe("Repita até ordenar tudo");
    expect(step3.description).toContain("Depois de juntar um par de grupos");
    expect(step3.description).toContain("copie o resultado para o vetor principal");
  });

  it("contém as duas regras essenciais curtas e independentes", () => {
    const rules = MERGE_CANONICAL_BRIEFING.particularities;
    expect(rules).toBeDefined();
    expect(rules).toHaveLength(2);

    expect(rules?.[0]).toContain("Números iguais?");
    expect(rules?.[0]).toContain("Escolha o da esquerda para manter a ordem original");

    expect(rules?.[1]).toContain("Um grupo terminou?");
    expect(rules?.[1]).toContain("Copie os números restantes do outro. Eles já estão em ordem");
  });

  it("contém os 3 destaques (highlights) com métricas canônicas", () => {
    const highlights = MERGE_CANONICAL_BRIEFING.highlights;
    expect(highlights).toHaveLength(3);

    const method = highlights.find((h) => h.label === "MÉTODO");
    expect(method?.value).toBe("Divisão e Intercalação");

    const comps = highlights.find((h) => h.label === "COMPARAÇÕES");
    expect(comps?.value).toContain("Θ(n log n)");

    const mem = highlights.find((h) => h.label === "VETOR AUXILIAR");
    expect(mem?.value).toContain("O(n)");
  });

  it("não vaza nomes internos da FSM para o texto voltado ao aluno", () => {
    const jsonText = JSON.stringify(MERGE_CANONICAL_BRIEFING);

    expect(jsonText).not.toContain("COMPARE_HEADS");
    expect(jsonText).not.toContain("DRAIN_READY");
    expect(jsonText).not.toContain("COPY_BACK_AUTOMATIC");
    expect(jsonText).not.toContain("DIVIDE_AUTOMATIC");
    expect(jsonText).not.toContain("FSM");
    expect(jsonText).not.toContain("sensores ópticos");
  });
});
