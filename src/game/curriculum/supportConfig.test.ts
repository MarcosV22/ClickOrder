import { describe, it, expect } from "vitest";
import {
  getPracticeSupportConfig,
  getSupportProfileColorClasses,
  PRACTICE_SUPPORT_CONFIGS,
} from "./supportConfig";
import type { PracticeSupportProfile } from "./types";

describe("Scaffolding Fading e Modelo de Suporte (LEARNING-R2-B)", () => {
  const profiles: PracticeSupportProfile[] = ["full", "reduced", "minimal"];

  it("retorna configuração determinística para cada perfil canônico", () => {
    for (const profile of profiles) {
      const configA = getPracticeSupportConfig(profile);
      const configB = getPracticeSupportConfig(profile);
      expect(configA).toBe(configB);
      expect(configA.profile).toBe(profile);
    }
  });

  it("possui todos os campos definidos e não nulos em todos os perfis", () => {
    for (const profile of profiles) {
      const config = getPracticeSupportConfig(profile);
      expect(config.label).toBeTruthy();
      expect(config.badgeLabel).toBeTruthy();
      expect(config.description).toBeTruthy();
      expect(config.transitionNotice).toBeTruthy();
      expect(typeof config.showInstructionalPrompt).toBe("boolean");
      expect(typeof config.showRelationalExpression).toBe("boolean");
      expect(typeof config.showDecisionGuidance).toBe("boolean");
      expect(["strong", "standard", "subtle"]).toContain(config.highlightIntensity);
      expect(config.hintAvailable).toBe(true);
    }
  });

  it("invariante: o botão de dica permanece disponível sob demanda em todos os perfis", () => {
    expect(PRACTICE_SUPPORT_CONFIGS.full.hintAvailable).toBe(true);
    expect(PRACTICE_SUPPORT_CONFIGS.reduced.hintAvailable).toBe(true);
    expect(PRACTICE_SUPPORT_CONFIGS.minimal.hintAvailable).toBe(true);
  });

  it("apresenta desvanecimento progressivo real de andaimes pedagógicos entre os perfis", () => {
    const full = getPracticeSupportConfig("full");
    const reduced = getPracticeSupportConfig("reduced");
    const minimal = getPracticeSupportConfig("minimal");

    // Full exibe prompts conceituais, expressões concretas e orientação
    expect(full.showInstructionalPrompt).toBe(true);
    expect(full.showRelationalExpression).toBe(true);
    expect(full.showDecisionGuidance).toBe(true);
    expect(full.highlightIntensity).toBe("strong");

    // Reduced remove instruções conceituais redundantes e orientação antecipada
    expect(reduced.showInstructionalPrompt).toBe(false);
    expect(reduced.showRelationalExpression).toBe(false);
    expect(reduced.showDecisionGuidance).toBe(false);
    expect(reduced.highlightIntensity).toBe("standard");

    // Minimal opera em autonomia máxima com intensidade sutil de realce
    expect(minimal.showInstructionalPrompt).toBe(false);
    expect(minimal.showRelationalExpression).toBe(false);
    expect(minimal.showDecisionGuidance).toBe(false);
    expect(minimal.highlightIntensity).toBe("subtle");
  });

  it("fornece classes de cores Tailwind distintas para cada perfil", () => {
    const fullColor = getSupportProfileColorClasses("full");
    const reducedColor = getSupportProfileColorClasses("reduced");
    const minimalColor = getSupportProfileColorClasses("minimal");

    expect(fullColor).toContain("emerald");
    expect(reducedColor).toContain("amber");
    expect(minimalColor).toContain("indigo");
  });

  it("fornece fallback seguro para 'full' quando o perfil for indefinido ou desconhecido", () => {
    // @ts-expect-error teste de fallback em runtime
    const fallback = getPracticeSupportConfig("unknown");
    expect(fallback).toBe(PRACTICE_SUPPORT_CONFIGS.full);
  });
});
