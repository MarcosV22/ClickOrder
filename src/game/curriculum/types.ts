import type { ModuleId } from "../persistence/types";

export type PracticeLevel = "basic" | "intermediate" | "advanced";

export type PracticeStatus = "available" | "locked" | "completed";

export interface PracticeDefinition {
  readonly id: string;
  readonly moduleId: ModuleId;
  readonly level: PracticeLevel;
  readonly title: string;
  readonly shortTitle: string;
  readonly description: string;
  readonly size: number;
  readonly pedagogicalObjective: string;
}

export interface PracticeProgressState {
  readonly definition: PracticeDefinition;
  readonly status: PracticeStatus;
  readonly completed: boolean;
  readonly bestScore?: number;
  readonly bestErrors?: number;
  readonly bestHints?: number;
  readonly bestTimeMs?: number;
}
