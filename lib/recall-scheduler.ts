/**
 * Active Recall v2 scheduler: an explainable subset of the FSRS model.
 *
 * Memory state per learner x card: stability S (days until R = 90%),
 * difficulty D (1..10), retrievability R(t) = probability of recall now.
 * Forgetting curve is FSRS v4's single-parameter curve, R(S) = 0.9.
 *
 * Sources: open-spaced-repetition FSRS wiki (v4/v7 algorithm notes);
 * Karpicke & Roediger 2007 (spacing); Pyc & Rawson 2009 (retrieval effort).
 * All constants are fixed and versioned here, never fitted per learner.
 */

export const RECALL_CONFIG = {
  /** R(t) = (1 + t/(9S))^(-1) => R is 0.9 when t = S. */
  factor: 9,
  targetRetrievability: 0.9,
  /** Initial stability in days by first grade: Again, Hard, Good, Easy. */
  initialStability: [0.4, 1.0, 2.4, 5.8] as const,
  initialDifficulty: 5,
  minStability: 0.4,
  minDifficulty: 1,
  maxDifficulty: 10,
  // Success update (simplified FSRS v4, fixed constants).
  successGain: 1.3,
  difficultyDecay: 0.5,
  effortGain: 0.1,
  easeMultipliers: [1, 0.8, 1, 1.4] as const, // Again, Hard, Good, Easy
  // Lapse update: stability falls, difficulty rises slightly.
  lapseFactor: 0.5,
  lapseEffort: 0.2,
  lapseDifficultyGain: 0.6,
  minIntervalDays: 1,
  maxIntervalDays: 30,
} as const

export type Grade = 1 | 2 | 3 | 4

/** Probability of recall after t days given stability S (days at R=90%). */
export function retrievability(stability: number, daysElapsed: number): number {
  const s = Math.max(RECALL_CONFIG.minStability, stability)
  const t = Math.max(0, daysElapsed)
  const f = RECALL_CONFIG.factor
  return Math.pow(1 + t / (f * s), -1)
}

export interface ReviewState {
  stability: number
  difficulty: number
  reps: number
  lapses: number
  lastReviewAt: string
}

/** Next interval in whole days, clamped to [1, maxIntervalDays]. */
export function intervalDays(stability: number): number {
  const r = RECALL_CONFIG.targetRetrievability
  const raw = RECALL_CONFIG.factor * stability * (1 / r - 1)
  return Math.max(RECALL_CONFIG.minIntervalDays, Math.min(RECALL_CONFIG.maxIntervalDays, Math.ceil(raw)))
}

export interface ReviewOutcome {
  stability: number
  difficulty: number
  reps: number
  lapses: number
  nextDueAt: string
  grade: Grade
}

/**
 * Apply one review. `daysElapsed` is time since last review; grade 1 is a
 * lapse, 2..4 are successes. Stability never decreases on success; a lapse
 * can reduce it but never below minStability. Interval is computed from the
 * updated stability, not from the old one.
 */
export function applyReview(state: ReviewState, grade: Grade, now = new Date()): ReviewOutcome {
  const t = (now.getTime() - new Date(state.lastReviewAt).getTime()) / 86400000
  const r = retrievability(state.stability, t)
  const s = Math.max(RECALL_CONFIG.minStability, state.stability)
  const d = Math.max(RECALL_CONFIG.minDifficulty, Math.min(RECALL_CONFIG.maxDifficulty, state.difficulty))

  let nextS: number
  let nextD: number
  let lapses = state.lapses

  if (grade === 1) {
    nextS = Math.max(RECALL_CONFIG.minStability, s * RECALL_CONFIG.lapseFactor * Math.exp(RECALL_CONFIG.lapseEffort * (1 - r)))
    nextD = Math.min(RECALL_CONFIG.maxDifficulty, d + RECALL_CONFIG.lapseDifficultyGain)
    lapses += 1
  } else {
    const ease = RECALL_CONFIG.easeMultipliers[grade - 1] ?? 1
    const gain = 1 + RECALL_CONFIG.successGain * (11 - d) * Math.pow(s, -0.5) *
      (Math.exp(RECALL_CONFIG.effortGain * (1 - r)) - 1) * ease
    nextS = s * Math.max(1, gain)
    nextD = Math.max(RECALL_CONFIG.minDifficulty, Math.min(RECALL_CONFIG.maxDifficulty,
      d - RECALL_CONFIG.difficultyDecay * (grade - 3) - RECALL_CONFIG.effortGain * (1 - r)))
  }

  const days = intervalDays(nextS)
  return {
    stability: nextS,
    difficulty: nextD,
    reps: state.reps + 1,
    lapses,
    nextDueAt: new Date(now.getTime() + days * 86400000).toISOString(),
    grade,
  }
}

/** Default state for a card seen for the first time with the given grade. */
export function initialState(grade: Grade, now = new Date()): ReviewOutcome {
  const stability = RECALL_CONFIG.initialStability[grade - 1] ?? RECALL_CONFIG.initialStability[2]
  const days = intervalDays(stability)
  return {
    stability,
    difficulty: RECALL_CONFIG.initialDifficulty,
    reps: 1,
    lapses: grade === 1 ? 1 : 0,
    nextDueAt: new Date(now.getTime() + days * 86400000).toISOString(),
    grade,
  }
}
