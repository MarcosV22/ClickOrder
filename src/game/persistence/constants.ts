export const STORAGE_KEY = "sorting_station_save";
export const LEGACY_STORAGE_KEY = "sorting_station_v1_save";
export const CURRENT_SCHEMA_VERSION = 4;
export const DEFAULT_MAX_PHASES = 3;
export const SELECTION_MAX_PHASES = 3;
export const INSERTION_TOTAL_PRACTICES = 3;

/**
 * Identificadores canônicos e imutáveis de ExerciseSets suportados pela plataforma.
 */
export const BUBBLE_EXERCISE_SETS = Object.freeze({
  BASIC: "bubble.practice.basic",
  INTERMEDIATE: "bubble.practice.intermediate",
  ADVANCED: "bubble.practice.advanced",
  CHALLENGE_EARLY_EXIT: "bubble.challenge.early-exit",
} as const);

export const SELECTION_EXERCISE_SETS = Object.freeze({
  BASIC: "selection.practice.basic",
  INTERMEDIATE: "selection.practice.intermediate",
  ADVANCED: "selection.practice.advanced",
} as const);

export const INSERTION_EXERCISE_SETS = Object.freeze({
  BASIC: "insertion.practice.basic",
  INTERMEDIATE: "insertion.practice.intermediate",
  ADVANCED: "insertion.practice.advanced",
} as const);
