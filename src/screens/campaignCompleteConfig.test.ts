import { describe, it, expect } from "vitest";
import {
  CAMPAIGN_COMPLETE_CONFIG,
  getCampaignCompleteConfig,
} from "./campaignCompleteConfig";

describe("Campaign Complete Config (Data-Driven)", () => {
  it("provides valid and complete configuration for bubble sort", () => {
    const config = getCampaignCompleteConfig("bubble");
    expect(config.protocol).toBe("bubble");
    expect(config.ariaLabel).toContain("Bubble");
    expect(config.topBadge.text).toContain("BUBBLE");
    expect(config.hero.titleLine1).toBe("TREINAMENTO");
    expect(config.metricCards.phaseColor).toContain("emerald");
    expect(config.phaseCard.badgeText).toContain("emerald");
    expect(config.footerNote).toContain("BUBBLE SORT");
  });

  it("provides valid and complete configuration for selection sort", () => {
    const config = getCampaignCompleteConfig("selection");
    expect(config.protocol).toBe("selection");
    expect(config.ariaLabel).toContain("Selection");
    expect(config.topBadge.text).toContain("SELECTION");
    expect(config.hero.titleLine1).toContain("SELECTION");
    expect(config.metricCards.phaseColor).toContain("purple");
    expect(config.phaseCard.badgeText).toContain("purple");
    expect(config.pedagogicalNote).toBeDefined();
    expect(config.pedagogicalNote?.title).toContain("Selection Sort");
    expect(config.footerNote).toContain("SELECTION SORT");
  });

  it("falls back to bubble config for unrecognized protocols", () => {
    // @ts-expect-error - testing defensive fallback
    const config = getCampaignCompleteConfig("unknown");
    expect(config.protocol).toBe("bubble");
  });
});
